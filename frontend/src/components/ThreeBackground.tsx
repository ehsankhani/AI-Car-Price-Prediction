import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

// NOTE: OBJLoader is in examples; import path below uses module aliasing provided by three package
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { RGBELoader } from 'three-stdlib';

type ThreeBackgroundProps = {
  modelUrl?: string; // can be .obj or .glb
  modelScale?: number; // target max dimension
  colorHex?: string; // hex color for mesh material
  enableHover?: boolean;
  initialRotationY?: number;
  onIntroComplete?: () => void;
};

const ThreeBackground: React.FC<ThreeBackgroundProps> = ({
  modelUrl = '/assets/uploads_files_3239060_COBRA.obj',
  modelScale = 5,
  colorHex = '#e5e7eb',
  enableHover = true,
  initialRotationY = 0,
  onIntroComplete,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const carModelRef = useRef<THREE.Object3D | null>(null);
  const raycasterRef = useRef<THREE.Raycaster | null>(null);
  const mouseRef = useRef<THREE.Vector2 | null>(null);
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const targetRotationRef = useRef({ x: 0, y: 0 });
  const currentRotationRef = useRef({ x: 0, y: 0 });
  const baseRotationRef = useRef({ x: 0, y: Math.PI });
  const [isHovering, setIsHovering] = useState(false);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const isAutoRotatingRef = useRef(false);
  // Intro spiral/orbit state
  const isIntroRef = useRef(true);
  const introStartRef = useRef<number | null>(null);
  const introDurationMsRef = useRef(2500);
  const introFromRef = useRef({ radius: 20, y: 10, theta: -Math.PI / 2 });
  // Precompute the ending theta so the last intro frame matches final camera exactly (no snap)
  const endThetaRef = useRef<number | null>(null);
  const firedIntroCbRef = useRef(false);
  const [showSpinUi, setShowSpinUi] = useState(false);
  const mouseUnlockAtRef = useRef<number | null>(null);
  // Auto-controls removed: using constant slow rotation instead

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    const scene = new THREE.Scene();
    scene.background = null; // Keep transparent, overlay handled by parent

    const camera = new THREE.PerspectiveCamera(
      20,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    // Camera angle guide:
    // - Distance (z): smaller = closer, larger = farther. Example: camera.position.set(0, 3, 3)
    // - Height   (y): larger = view from above; smaller/negative = from below. Example: camera.position.set(0, 6, 4)
    // - Side     (x): positive = from right; negative = from left. Example: camera.position.set(2, 4, 6)
    // - FOV (first arg of PerspectiveCamera): larger = wider view (e.g., 45 or 60). Example: new THREE.PerspectiveCamera(45, aspect, 0.1, 1000)
    // Keep camera.lookAt(0, 0, 0) so it points at model center after adjusting position/FOV.
    const finalCamPos = new THREE.Vector3(10, 5, 6);
    const finalCamLook = new THREE.Vector3(1, 3, 0);
    // Angle around look target that corresponds to final camera position
    endThetaRef.current = Math.atan2(
      finalCamPos.z - finalCamLook.z,
      finalCamPos.x - finalCamLook.x
    ) + Math.PI * 2; // + one full turn for a complete orbit
    camera.position.copy(finalCamPos);
    camera.lookAt(finalCamLook); // Always point to the model center

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // Initialize raycaster and mouse
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    raycasterRef.current = raycaster;
    mouseRef.current = mouse;

    // Keep original materials - no override

    // HDR Environment loading (optional - skip if file doesn't exist)
    const rgbeLoader = new RGBELoader();
    rgbeLoader.load('/assets/garage.hdr', function(texture) {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      scene.environment = texture;
      // Don't set background to keep transparency
    }, undefined, () => {
      // Fallback if HDR fails to load - this is normal
      console.log('HDR environment not found, using default lighting');
    });

    // Enhanced Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambient);
    
    const dir = new THREE.DirectionalLight(0xffffff, 0.9);
    dir.position.set(5, 10, 7);
    dir.castShadow = true;
    dir.shadow.mapSize.width = 2048;
    dir.shadow.mapSize.height = 2048;
    scene.add(dir);

    // Rim light to highlight edges and show more details
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.6);
    rimLight.position.set(-6, 3, -5);
    scene.add(rimLight);

    // Spot light for dramatic effect
    const spotLight = new THREE.SpotLight(0xffffff, 1.2);
    spotLight.position.set(5, 9, 5);
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    scene.add(spotLight);

    // Model group container (kept neutral); car object will handle its own rotation
    const modelGroup = new THREE.Group();
    // Set base orientation so the front of the car faces the camera at load
    // If the car still shows the back, adjust this by +/- Math.PI/2
    baseRotationRef.current = { x: 0, y: - Math.PI/2 };
    scene.add(modelGroup);
    modelGroupRef.current = modelGroup;

    // Load model (GLB preferred, fallback to OBJ)
    const isGlb = modelUrl.toLowerCase().endsWith('.glb') || modelUrl.toLowerCase().endsWith('.gltf');
    const onModelLoaded = (object3d: THREE.Object3D) => {
        // Normalize model size
        const box = new THREE.Box3().setFromObject(object3d);
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        const scale = modelScale / maxDim; // scale model
        object3d.scale.setScalar(scale);

        // Center model
        const center = new THREE.Vector3();
        box.getCenter(center);
        object3d.position.sub(center.multiplyScalar(scale));

        // Apply shadows only, keep original materials
        object3d.traverse(child => {
          const mesh = child as THREE.Mesh;
          if ((mesh as THREE.Mesh).isMesh) {
            (mesh as THREE.Mesh).castShadow = true;
            (mesh as THREE.Mesh).receiveShadow = true;
          }
        });

        // CAR MATERIAL OVERRIDE GUIDE:
        // To force a custom paint on the car, uncomment below and adjust color/metalness/roughness.
        // This will override original GLB materials.
        // object3d.traverse(child => {
        //   const m = child as THREE.Mesh;
        //   if ((m as THREE.Mesh).isMesh) {
        //     m.material = new THREE.MeshPhysicalMaterial({
        //       color: new THREE.Color('#ff2a2a'), // car color
        //       metalness: 0.9,
        //       roughness: 0.3,
        //       clearcoat: 1.0,
        //       clearcoatRoughness: 0.05
        //     });
        //   }
        // });

        modelGroup.add(object3d);
        carModelRef.current = object3d;
        // Ensure default orientation at load and set rotation order to avoid gimbal issues
        carModelRef.current.rotation.order = 'YXZ';
        carModelRef.current.rotation.y = baseRotationRef.current.y;
    };

    if (isGlb) {
      const gltfLoader = new GLTFLoader();
      gltfLoader.load(
        modelUrl,
        (gltf: any) => {
          const root = gltf.scene || gltf.scenes?.[0];
          if (root) onModelLoaded(root);
        },
        undefined,
        () => {
          // If GLB fails, do nothing (or we could fallback to OBJ)
        }
      );
    } else {
      const objLoader = new OBJLoader();
      objLoader.load(
        modelUrl,
        (obj: THREE.Object3D) => onModelLoaded(obj),
        undefined,
        () => {
          // Loading error: nothing to do, keep background empty
        }
      );
    }

    // Mouse interaction: simple left/right rotation only (no up/down flipping)
    const lastNormRef = { nx: 0, ny: 0 } as { nx: number; ny: number };
    const onMouseMove = (event: MouseEvent) => {
      if (isIntroRef.current) return; // disable mouse during intro
      if (mouseUnlockAtRef.current && performance.now() < mouseUnlockAtRef.current) return; // small post-intro delay
      if (!container) return;

      // Relative deltas (work like touchpad movement)
      const dx = (event.movementX ?? 0);

      // Sensitivity for left/right rotation only
      const yawSensitivity = 0.004;   // left/right

      // Accumulate target rotation from deltas (only yaw, no pitch)
      targetRotationRef.current.y += dx * yawSensitivity;      // infinite yaw only
      targetRotationRef.current.x = 0; // Always keep pitch at 0 (no flipping)

      // Keep hover feedback using raycaster
      const rect = container.getBoundingClientRect();
      const nx = (event.clientX - rect.left) / rect.width * 2 - 1;
      const ny = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      lastNormRef.nx = nx;
      lastNormRef.ny = ny;
      mouse.x = nx;
      mouse.y = ny;
      raycaster.setFromCamera(mouse, camera);
      if (carModelRef.current) {
        const intersects = raycaster.intersectObject(carModelRef.current, true);
        setIsHovering(intersects.length > 0);
      }
    };

    // Mouse wheel zoom
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      if (isIntroRef.current) return; // disable during intro
      if (mouseUnlockAtRef.current && performance.now() < mouseUnlockAtRef.current) return; // small post-intro delay
      const zoomSpeed = 0.1;
      const zoomDirection = event.deltaY > 0 ? 1 : -1;
      
      // Adjust camera distance based on scroll
      const currentDistance = camera.position.length();
      const newDistance = Math.max(2, Math.min(15, currentDistance + zoomDirection * zoomSpeed));
      
      // Maintain camera direction while changing distance
      const direction = camera.position.clone().normalize();
      camera.position.copy(direction.multiplyScalar(newDistance));
    };

    // Add a ground plane to receive shadows (makes the model pop)
    // GROUND GUIDE: change color/roughness/metalness here
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 200),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#111111'), // ground color
        roughness: 0.9,
        metalness: 0.0
      })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    ground.receiveShadow = true;
    scene.add(ground);

    // Handle resize
    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    
    // Sync auto-rotate ref with current state
    isAutoRotatingRef.current = isAutoRotating;

    // Add event listeners to window for global mouse tracking
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('resize', onResize);
    
    // Debug: Check if container is properly set up
    console.log('Container setup:', { 
      container: !!container, 
      clientWidth: container.clientWidth, 
      clientHeight: container.clientHeight 
    });

    const animate = () => {
      // Smooth rotation interpolation
      const lerpFactor = 0.1; // Smoothness factor (0.01 = very smooth, 0.1 = snappy)
      
      const target = carModelRef.current ?? modelGroup; // Prefer moving the car object itself

      // Intro spiral/orbit: circle while moving inward, then end exactly at finalCamPos/finalCamLook
      if (isIntroRef.current) {
        if (introStartRef.current === null) introStartRef.current = performance.now();
        const now = performance.now();
        const elapsed = now - (introStartRef.current || now);
        const t = Math.min(1, elapsed / introDurationMsRef.current);
        const ease = t * t * (3 - 2 * t); // smoothstep
        const from = introFromRef.current;
        const toRadius = Math.hypot(finalCamPos.x - finalCamLook.x, finalCamPos.z - finalCamLook.z);
        const radius = from.radius + (toRadius - from.radius) * ease;
        const targetEndTheta = endThetaRef.current ?? Math.atan2(
          finalCamPos.z - finalCamLook.z,
          finalCamPos.x - finalCamLook.x
        );
        const theta = from.theta + (targetEndTheta - from.theta) * ease; // finish exactly aligned
        const y = from.y + (finalCamPos.y - from.y) * ease;
        const x = finalCamLook.x + radius * Math.cos(theta);
        const z = finalCamLook.z + radius * Math.sin(theta);
        camera.position.set(x, y, z);
        camera.lookAt(finalCamLook);
        if (t >= 1) {
          // End intro without any snap (camera already equals final pose)
          isIntroRef.current = false;
          // Add a small delay before enabling mouse and showing UI for better feel
          const delayMs = 600;
          mouseUnlockAtRef.current = performance.now() + delayMs;
          setTimeout(() => setShowSpinUi(true), delayMs);
          if (!firedIntroCbRef.current) {
            firedIntroCbRef.current = true;
            onIntroComplete && onIntroComplete();
          }
        }
      }

      // Auto-spin toggled by button
      if (isAutoRotatingRef.current) {
        target.rotation.y += 0.01; // fixed cool speed
      }

      if (enableHover && !isAutoRotatingRef.current) {
        // Manual mouse control - smooth interpolation for yaw only (no pitch)
        currentRotationRef.current.y += (targetRotationRef.current.y - currentRotationRef.current.y) * lerpFactor;
        
        // Only apply yaw rotation (left/right), keep pitch at 0 (no flipping)
        target.rotation.x = baseRotationRef.current.x; // Always 0 (no up/down rotation)
        target.rotation.y = baseRotationRef.current.y + currentRotationRef.current.y;

        // Edge scrolling (infinite left/right movement near screen edges)
        const edgeThreshold = 0.9; // near edges of the canvas
        const edgeYawSpeed = 0.02;
        if (Math.abs((lastNormRef as any).nx) > edgeThreshold) {
          targetRotationRef.current.y += ((lastNormRef as any).nx > 0 ? 1 : -1) * edgeYawSpeed;
        }
      }

      // Scale effect on hover
      const hoverScale = isHovering && enableHover ? 1.06 : 1.0;
      target.scale.lerp(new THREE.Vector3(hoverScale, hoverScale, hoverScale), 0.08);
      
      renderer.render(scene, camera);
      animationFrameIdRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', onResize);
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      // Remove canvas
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <div
        ref={containerRef}
        className="absolute inset-0 z-0"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      />
      
      {/* Toggle Auto-Spin Button (hidden during intro and brief post-intro delay) */}
      {showSpinUi && (
        <div className="absolute bottom-6 left-6 z-20">
          <button
            onClick={() => {
              const next = !isAutoRotatingRef.current;
              isAutoRotatingRef.current = next;
              setIsAutoRotating(next);
            }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold shadow-lg transition-all backdrop-blur-sm border
              ${isAutoRotating ? 'bg-purple-600/90 hover:bg-purple-600 text-white border-white/20' : 'bg-white/15 hover:bg-white/25 text-white border-white/30'}`}
          >
            {isAutoRotating ? 'Stop Spin' : 'Start Spin'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ThreeBackground;


