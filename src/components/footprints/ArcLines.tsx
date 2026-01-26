'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { calcPos } from '@/lib/geo';
import { footprintsData } from '@/data/footprints';

const RADIUS = 2;
const LON_OFFSET = -90;

interface ArcConfig {
  id: string;
  fromId: number;
  toId: number;
  height: number;
  speed: number;
}

const ARC_CONFIGS: ArcConfig[] = [
  { id: 'shanghai-nagano', fromId: 1, toId: 2, height: 0.7, speed: 0.22 },
];

export function ArcLines() {
  const arcs = useMemo(() => {
    return ARC_CONFIGS.map((config, index) => {
      const from = footprintsData.find((item) => item.id === config.fromId);
      const to = footprintsData.find((item) => item.id === config.toId);
      if (!from || !to) return null;

      const start = calcPos(from.lat, from.lng, RADIUS, LON_OFFSET);
      const end = calcPos(to.lat, to.lng, RADIUS, LON_OFFSET);
      const mid = start
        .clone()
        .add(end)
        .multiplyScalar(0.5)
        .normalize()
        .multiplyScalar(RADIUS + config.height);

      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      const points = curve.getPoints(64);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);

      return {
        id: config.id,
        curve,
        geometry,
        speed: config.speed,
        offset: index * 0.35,
      };
    }).filter(Boolean) as Array<{
      id: string;
      curve: THREE.QuadraticBezierCurve3;
      geometry: THREE.BufferGeometry;
      speed: number;
      offset: number;
    }>;
  }, []);

  return (
    <>
      {arcs.map((arc) => (
        <Arc key={arc.id} {...arc} />
      ))}
    </>
  );
}

function Arc({
  curve,
  geometry,
  speed,
  offset,
}: {
  curve: THREE.QuadraticBezierCurve3;
  geometry: THREE.BufferGeometry;
  speed: number;
  offset: number;
}) {
  const glowRef = useRef<THREE.Mesh>(null);
  
  const lineObject = useMemo(() => {
    const material = new THREE.LineBasicMaterial({
      color: '#7ec3ff',
      transparent: true,
      opacity: 0.28,
      toneMapped: false,
    });
    return new THREE.Line(geometry, material);
  }, [geometry]);

  useFrame(({ clock }) => {
    const t = (clock.getElapsedTime() * speed + offset) % 1;
    const point = curve.getPointAt(t);
    if (glowRef.current) {
      glowRef.current.position.copy(point);
    }
  });

  return (
    <group>
      <primitive object={lineObject} />
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshBasicMaterial color="#bfe5ff" toneMapped={false} />
      </mesh>
    </group>
  );
}
