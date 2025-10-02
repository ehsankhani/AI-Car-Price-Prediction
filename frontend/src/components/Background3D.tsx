import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Box, Torus } from '@react-three/drei';
import * as THREE from 'three';

const FloatingGeometry: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.5;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial
        color="#3b82f6"
        transparent
        opacity={0.3}
        roughness={0.1}
        metalness={0.8}
      />
    </mesh>
  );
};

const CarModel: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Car Body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[3, 0.8, 1.2]} />
        <meshStandardMaterial
          color="#dc2626"
          roughness={0.2}
          metalness={0.8}
          emissive="#ff0000"
          emissiveIntensity={0.1}
        />
      </mesh>
      
      {/* Car Roof */}
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[2.5, 0.6, 1]} />
        <meshStandardMaterial
          color="#1f2937"
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>
      
      {/* Wheels */}
      {[-1, 1].map((side, index) => (
        <group key={index}>
          <mesh position={[1.2, -0.4, side * 0.8]}>
            <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
            <meshStandardMaterial
              color="#374151"
              roughness={0.8}
              metalness={0.2}
            />
          </mesh>
          <mesh position={[-1.2, -0.4, side * 0.8]}>
            <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
            <meshStandardMaterial
              color="#374151"
              roughness={0.8}
              metalness={0.2}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
};

const Background3D: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 75 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.8} color="#3b82f6" />
        <spotLight position={[0, 10, 5]} intensity={1} angle={0.3} penumbra={0.5} />
        
        {/* Floating Geometries */}
        <FloatingGeometry position={[-8, 2, -5]} />
        <FloatingGeometry position={[8, -2, -3]} />
        <FloatingGeometry position={[-5, -3, -8]} />
        <FloatingGeometry position={[6, 4, -6]} />
        
        {/* Main Car Model */}
        <CarModel />
        
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
};

export default Background3D;
