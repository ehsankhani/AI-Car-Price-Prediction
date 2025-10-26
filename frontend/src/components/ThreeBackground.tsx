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
};

const ThreeBackground: React.FC<ThreeBackgroundProps> = ({
  modelUrl = '/assets/uploads_files_3239060_COBRA.obj',
  modelScale = 5,
  colorHex = '#e5e7eb',
  enableHover = true,
  initialRotationY = 0,
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
  const [isHovering, setIsHovering] = useState(false);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [autoRotationSpeed, setAutoRotationSpeed] = useState(0.01);
  const isAutoRotatingRef = useRef(false);
  const autoRotationSpeedRef = useRef(0.01);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    const scene = new THREE.Scene();
    scene.background = null; // Keep transparent, overlay handled by parent

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1.5, 6);
    camera.lookAt(0, 0, 0); // Look at the center of the model

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
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);
    
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(5, 10, 7);
    dir.castShadow = true;
    dir.shadow.mapSize.width = 2048;
    dir.shadow.mapSize.height = 2048;
    scene.add(dir);

    // Spot light for dramatic effect
    const spotLight = new THREE.SpotLight(0xffffff, 1.5);
    spotLight.position.set(5, 10, 5);
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    scene.add(spotLight);

    // Model group for rotation - start with front facing the camera
    const modelGroup = new THREE.Group();
    modelGroup.rotation.y = initialRotationY + Math.PI; // Rotate 180 degrees to show front
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

        modelGroup.add(object3d);
        carModelRef.current = object3d;
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

    // Mouse interaction for rotation and hover effects
    const onMouseMove = (event: MouseEvent) => {
      if (!container) return;
      
      // Get container bounds for relative positioning
      const rect = container.getBoundingClientRect();
      const relativeX = event.clientX - rect.left;
      const relativeY = event.clientY - rect.top;
      
      // Calculate normalized mouse position (-1 to 1) relative to container
      const x = (relativeX / rect.width) * 2 - 1;
      const y = -(relativeY / rect.height) * 2 + 1;
      
      // Update ref for immediate access in animation loop
      mousePositionRef.current = { x, y };
      
      // Set target rotation based on mouse position (smoother control)
      const rotationSensitivity = 1.5;
      targetRotationRef.current = {
        x: y * rotationSensitivity * 0.6, // More vertical rotation
        y: x * rotationSensitivity
      };
      
      mouse.x = x;
      mouse.y = y;

      raycaster.setFromCamera(mouse, camera);
      
      if (carModelRef.current) {
        const intersects = raycaster.intersectObject(carModelRef.current, true);

        if (intersects.length > 0) {
          setIsHovering(true);
        } else {
          setIsHovering(false);
        }
      }
    };

    // Mouse wheel zoom
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const zoomSpeed = 0.1;
      const zoomDirection = event.deltaY > 0 ? 1 : -1;
      
      // Adjust camera distance based on scroll
      const currentDistance = camera.position.length();
      const newDistance = Math.max(2, Math.min(15, currentDistance + zoomDirection * zoomSpeed));
      
      // Maintain camera direction while changing distance
      const direction = camera.position.clone().normalize();
      camera.position.copy(direction.multiplyScalar(newDistance));
    };

    // Handle resize
    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    
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
      
      if (isAutoRotatingRef.current) {
        // Auto rotation mode - continuous rotation
        modelGroup.rotation.y += autoRotationSpeedRef.current;
        // Reset manual rotation when auto starts
        currentRotationRef.current = { x: 0, y: 0 };
        targetRotationRef.current = { x: 0, y: 0 };
        
        // Debug auto rotation
        if (Math.random() < 0.01) { // Log 1% of the time
          console.log('Auto rotating, speed:', autoRotationSpeedRef.current, 'rotation.y:', modelGroup.rotation.y);
        }
      } else if (enableHover) {
        // Manual mouse control with smooth interpolation
        currentRotationRef.current.x += (targetRotationRef.current.x - currentRotationRef.current.x) * lerpFactor;
        currentRotationRef.current.y += (targetRotationRef.current.y - currentRotationRef.current.y) * lerpFactor;
        
        modelGroup.rotation.x = currentRotationRef.current.x;
        modelGroup.rotation.y = currentRotationRef.current.y;
        
        // Debug manual rotation
        if (Math.random() < 0.01) { // Log 1% of the time
          console.log('Manual control, target:', targetRotationRef.current, 'current:', currentRotationRef.current);
        }
      }

      // Scale effect on hover
      const targetScale = isHovering && enableHover ? 1.06 : 1.0;
      modelGroup.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.08);
      
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
      
      {/* Control Panel */}
      <div className="absolute top-4 right-4 z-10 bg-black/20 backdrop-blur-sm rounded-lg p-3 border border-white/20">
        <div className="flex flex-col gap-2">
          <button
            onClick={() => {
              const newState = !isAutoRotatingRef.current;
              isAutoRotatingRef.current = newState;
              setIsAutoRotating(newState);
              console.log('Button clicked, new state:', newState);
            }}
            className={`px-3 py-2 rounded text-sm font-medium transition-all ${
              isAutoRotating 
                ? 'bg-red-500/80 hover:bg-red-600/80 text-white' 
                : 'bg-green-500/80 hover:bg-green-600/80 text-white'
            }`}
          >
            {isAutoRotating ? 'Stop Auto' : 'Start Auto'}
          </button>
          
          <div className="flex items-center gap-2">
            <label className="text-white text-xs">Speed:</label>
            <input
              type="range"
              min="0.005"
              max="0.05"
              step="0.005"
              value={autoRotationSpeed}
              onChange={(e) => {
                const newSpeed = parseFloat(e.target.value);
                autoRotationSpeedRef.current = newSpeed;
                setAutoRotationSpeed(newSpeed);
                console.log('Speed changed to:', newSpeed);
              }}
              className="w-16"
            />
            <span className="text-white text-xs">{autoRotationSpeed.toFixed(3)}</span>
          </div>
          
          <div className="text-white text-xs">
            <div>Mouse: Move to rotate</div>
            <div>Scroll: Zoom in/out</div>
            <div>Auto: Continuous rotation</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreeBackground;


