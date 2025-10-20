import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

// NOTE: OBJLoader is in examples; import path below uses module aliasing provided by three package
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

type ThreeBackgroundProps = {
  modelUrl?: string;
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
  const [isHovering, setIsHovering] = useState(false);

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
    camera.position.set(0, 2, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(5, 10, 7);
    scene.add(dir);

    // Model group for rotation
    const modelGroup = new THREE.Group();
    modelGroup.rotation.y = initialRotationY;
    scene.add(modelGroup);
    modelGroupRef.current = modelGroup;

    // Load OBJ
    const loader = new OBJLoader();
    loader.load(
      modelUrl,
      (obj: THREE.Object3D) => {
        // Normalize model size
        const box = new THREE.Box3().setFromObject(obj);
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        const scale = modelScale / maxDim; // scale model
        obj.scale.setScalar(scale);

        // Center model
        const center = new THREE.Vector3();
        box.getCenter(center);
        obj.position.sub(center.multiplyScalar(scale));

        // Basic material override if no materials present
        const desiredColor = new THREE.Color(colorHex);
        obj.traverse(child => {
          const mesh = child as THREE.Mesh;
          if ((mesh as THREE.Mesh).isMesh) {
            (mesh as THREE.Mesh).material = new THREE.MeshStandardMaterial({
              color: desiredColor,
              metalness: 0.3,
              roughness: 0.5,
            });
            (mesh as THREE.Mesh).castShadow = false;
            (mesh as THREE.Mesh).receiveShadow = false;
          }
        });

        modelGroup.add(obj);
      },
      undefined,
      () => {
        // Loading error: nothing to do, keep background empty
      }
    );

    // Handle resize
    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', onResize);

    const animate = () => {
      // Subtle rotation + hover acceleration and slight scale pop
      const baseSpeed = 0.004;
      const hoverBoost = isHovering && enableHover ? 0.01 : 0;
      modelGroup.rotation.y += baseSpeed + hoverBoost;

      const targetScale = isHovering && enableHover ? 1.06 : 1.0;
      modelGroup.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.08);
      renderer.render(scene, camera);
      animationFrameIdRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
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
    <div
      ref={containerRef}
      className="absolute inset-0 z-0"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    />
  );
};

export default ThreeBackground;


