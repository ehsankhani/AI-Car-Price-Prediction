import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

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
  const isIntroRef = useRef(true);
  const introStartRef = useRef<number | null>(null);
  const introDurationMsRef = useRef(2500);
  const introFromRef = useRef({ radius: 20, y: 10, theta: -Math.PI / 2 });
  const endThetaRef = useRef<number | null>(null);
  const firedIntroCbRef = useRef(false);
  const [showSpinUi, setShowSpinUi] = useState(false);
  const mouseUnlockAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(
      20,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    const finalCamPos = new THREE.Vector3(10, 5, 6);
    const finalCamLook = new THREE.Vector3(1, 3.3, 0);
    endThetaRef.current = Math.atan2(
      finalCamPos.z - finalCamLook.z,
      finalCamPos.x - finalCamLook.x
    ) + Math.PI * 2;
    camera.position.copy(finalCamPos);
    camera.lookAt(finalCamLook);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    raycasterRef.current = raycaster;
    mouseRef.current = mouse;
    const rgbeLoader = new RGBELoader();
    rgbeLoader.load('/assets/garage.hdr', function(texture) {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      scene.environment = texture;
    }, undefined, () => {
    });

    const ambient = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambient);
    
    const dir = new THREE.DirectionalLight(0xffffff, 0.9);
    dir.position.set(5, 10, 7);
    dir.castShadow = true;
    dir.shadow.mapSize.width = 2048;
    dir.shadow.mapSize.height = 2048;
    scene.add(dir);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.6);
    rimLight.position.set(-6, 3, -5);
    scene.add(rimLight);

    const spotLight = new THREE.SpotLight(0xffffff, 1.2);
    spotLight.position.set(5, 9, 5);
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    scene.add(spotLight);

    const modelGroup = new THREE.Group();
    baseRotationRef.current = { x: 0, y: - Math.PI/2 };
    scene.add(modelGroup);
    modelGroupRef.current = modelGroup;
    const isGlb = modelUrl.toLowerCase().endsWith('.glb') || modelUrl.toLowerCase().endsWith('.gltf');
    const onModelLoaded = (object3d: THREE.Object3D) => {
        const box = new THREE.Box3().setFromObject(object3d);
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        const scale = modelScale / maxDim;
        object3d.scale.setScalar(scale);

        const center = new THREE.Vector3();
        box.getCenter(center);
        object3d.position.sub(center.multiplyScalar(scale));

        object3d.traverse(child => {
          const mesh = child as THREE.Mesh;
          if ((mesh as THREE.Mesh).isMesh) {
            (mesh as THREE.Mesh).castShadow = true;
            (mesh as THREE.Mesh).receiveShadow = true;
          }
        });

        modelGroup.add(object3d);
        carModelRef.current = object3d;
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
        }
      );
    } else {
      const objLoader = new OBJLoader();
      objLoader.load(
        modelUrl,
        (obj: THREE.Object3D) => onModelLoaded(obj),
        undefined,
        () => {
        }
      );
    }

    const lastNormRef = { nx: 0, ny: 0 } as { nx: number; ny: number };
    const onMouseMove = (event: MouseEvent) => {
      if (isIntroRef.current) return;
      if (mouseUnlockAtRef.current && performance.now() < mouseUnlockAtRef.current) return;
      if (!container) return;

      const dx = (event.movementX ?? 0);
      const yawSensitivity = 0.004;
      targetRotationRef.current.y += dx * yawSensitivity;
      targetRotationRef.current.x = 0;

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

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      if (isIntroRef.current) return;
      if (mouseUnlockAtRef.current && performance.now() < mouseUnlockAtRef.current) return;
      const zoomSpeed = 0.1;
      const zoomDirection = event.deltaY > 0 ? 1 : -1;
      const currentDistance = camera.position.length();
      const newDistance = Math.max(2, Math.min(15, currentDistance + zoomDirection * zoomSpeed));
      const direction = camera.position.clone().normalize();
      camera.position.copy(direction.multiplyScalar(newDistance));
    };
    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    isAutoRotatingRef.current = isAutoRotating;
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('resize', onResize);

    const animate = () => {
      const lerpFactor = 0.1;
      const target = carModelRef.current ?? modelGroup;
      if (isIntroRef.current) {
        if (introStartRef.current === null) introStartRef.current = performance.now();
        const now = performance.now();
        const elapsed = now - (introStartRef.current || now);
        const t = Math.min(1, elapsed / introDurationMsRef.current);
        const ease = t * t * (3 - 2 * t);
        const from = introFromRef.current;
        const toRadius = Math.hypot(finalCamPos.x - finalCamLook.x, finalCamPos.z - finalCamLook.z);
        const radius = from.radius + (toRadius - from.radius) * ease;
        const targetEndTheta = endThetaRef.current ?? Math.atan2(
          finalCamPos.z - finalCamLook.z,
          finalCamPos.x - finalCamLook.x
        );
        const theta = from.theta + (targetEndTheta - from.theta) * ease;
        const y = from.y + (finalCamPos.y - from.y) * ease;
        const x = finalCamLook.x + radius * Math.cos(theta);
        const z = finalCamLook.z + radius * Math.sin(theta);
        camera.position.set(x, y, z);
        camera.lookAt(finalCamLook);
        if (t >= 1) {
          isIntroRef.current = false;
          const delayMs = 600;
          mouseUnlockAtRef.current = performance.now() + delayMs;
          setTimeout(() => setShowSpinUi(true), delayMs);
          if (!firedIntroCbRef.current) {
            firedIntroCbRef.current = true;
            onIntroComplete && onIntroComplete();
          }
        }
      }

      if (isAutoRotatingRef.current) {
        target.rotation.y += 0.01;
      }

      if (enableHover && !isAutoRotatingRef.current) {
        currentRotationRef.current.y += (targetRotationRef.current.y - currentRotationRef.current.y) * lerpFactor;
        target.rotation.x = baseRotationRef.current.x;
        target.rotation.y = baseRotationRef.current.y + currentRotationRef.current.y;

        const edgeThreshold = 0.9;
        const edgeYawSpeed = 0.02;
        if (Math.abs((lastNormRef as any).nx) > edgeThreshold) {
          targetRotationRef.current.y += ((lastNormRef as any).nx > 0 ? 1 : -1) * edgeYawSpeed;
        }
      }

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


