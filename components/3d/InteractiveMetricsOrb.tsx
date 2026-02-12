'use client';

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface OrbProps {
  config: {
    color: string;
    emissive: string;
    particleCount?: number;
  };
}

export const InteractiveMetricsOrb: React.FC<OrbProps> = ({ config }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      // Smooth rotation
      meshRef.current.rotation.y += delta * 0.5;
      meshRef.current.rotation.x += delta * 0.2;
      
      // Breathing effect
      const scale = 1 + Math.sin(state.clock.elapsedTime) * 0.05;
      
      // Hover effect
      const targetScale = hovered ? 1.2 : 1.0;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale * scale, targetScale * scale, targetScale * scale), 0.1);
    }
  });
  
  return (
    <mesh
      ref={meshRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial
        color={config.color}
        transparent
        opacity={0.6}
        roughness={0.2}
        metalness={0.8}
        emissive={config.emissive}
        emissiveIntensity={hovered ? 2 : 1}
      />
    </mesh>
  );
};
