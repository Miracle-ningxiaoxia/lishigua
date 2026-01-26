'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import * as THREE from 'three';

/**
 * 简化版地球组件（不需要贴图）
 * 用于在没有贴图资源时进行测试
 */
export function EarthSimple() {
  const earthRef = useRef<Mesh>(null);
  const atmosphereRef = useRef<Mesh>(null);

  // 地球自转动画
  useFrame((state, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.05;
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <group>
      {/* 地球主体 */}
      <mesh ref={earthRef} castShadow>
        <sphereGeometry args={[2, 128, 128]} />
        <meshStandardMaterial
          color="#1e40af"
          roughness={0.7}
          metalness={0.1}
          emissive="#0a1628"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* 大气层 */}
      <mesh ref={atmosphereRef} scale={1.05}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshBasicMaterial
          color="#4a9eff"
          transparent
          opacity={0.15}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
