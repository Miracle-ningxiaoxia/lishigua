'use client';

import { useMemo, useRef, useState } from 'react';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { calcPos } from '@/lib/geo';
import { footprintsData } from '@/data/footprints';

const RADIUS = 2;
const LON_OFFSET = -90;
const SUN_DIR = new THREE.Vector3(-6.5, 2.0, -5.5).normalize();

type FocusHandler = (target: THREE.Vector3, distance?: number) => void;
type SelectHandler = (payload: {
  id: number;
  name: string;
  description: string;
  date?: string;
}) => void;

interface FootprintMarkersProps {
  onFocus: FocusHandler;
  onSelect: SelectHandler;
}

function Marker({
  id,
  name,
  lat,
  lng,
  description,
  date,
  onFocus,
  onSelect,
}: {
  id: number;
  name: string;
  lat: number;
  lng: number;
  description: string;
  date?: string;
  onFocus: FocusHandler;
  onSelect: SelectHandler;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const orbRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const beamRef = useRef<THREE.Mesh>(null);
  const [isHovered, setIsHovered] = useState(false);

  const { position, normal, quaternion } = useMemo(() => {
    const pos = calcPos(lat, lng, RADIUS, LON_OFFSET);
    const n = pos.clone().normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), n);
    return { position: pos, normal: n, quaternion: q };
  }, [lat, lng]);

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();
    const nightFactor = normal.dot(SUN_DIR) < 0.1 ? 1 : 0.35;
    const pulse = 0.7 + 0.3 * Math.sin(t * 3 + id);
    const intensity = nightFactor * pulse;
    const breathe = 1 + 0.06 * Math.sin(t * 2 + id);
    const hoverScale = isHovered ? 1.18 : 1;
    const targetScale = hoverScale * breathe;

    if (orbRef.current?.material) {
      const mat = orbRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = isHovered ? 2.2 : 1.4 * intensity;
    }
    if (ringRef.current?.material) {
      const mat = ringRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = isHovered ? 2.0 : 1.2 * intensity;
    }
    if (beamRef.current?.material) {
      const mat = beamRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = isHovered ? 0.75 : 0.28 * intensity;
    }

    if (groupRef.current) {
      const ease = 1 - Math.exp(-delta * 10);
      groupRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        ease
      );
    }
  });

  return (
    <group ref={groupRef} position={position} quaternion={quaternion}>
      <mesh
        ref={orbRef}
        onPointerOver={(e) => {
          e.stopPropagation();
          setIsHovered(true);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setIsHovered(false);
        }}
        onClick={(e) => {
          e.stopPropagation();
          onFocus(position, 5.2);
          onSelect({ id, name, description, date });
        }}
      >
        <sphereGeometry args={[0.035, 16, 16]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#7cc7ff"
          emissiveIntensity={1.2}
          toneMapped={false}
        />
      </mesh>

      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.05, 0.075, 32]} />
        <meshStandardMaterial
          color="#6bb7ff"
          emissive="#8fd4ff"
          emissiveIntensity={1.1}
          toneMapped={false}
        />
      </mesh>

      <mesh ref={beamRef} position={[0, 0.28, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.56, 16, 1, true]} />
        <meshBasicMaterial
          color="#86c7ff"
          transparent
          opacity={0.25}
          depthWrite={false}
        />
      </mesh>

      {isHovered && (
        <Html position={[0, 0.4, 0]} center>
          <div className="px-3 py-1 rounded-full bg-black/70 text-white text-xs font-mono whitespace-nowrap border border-white/10">
            {name} · {description}
          </div>
        </Html>
      )}
    </group>
  );
}

export function FootprintMarkers({ onFocus, onSelect }: FootprintMarkersProps) {
  return (
    <>
      {footprintsData.map((item) => (
        <Marker key={item.id} {...item} onFocus={onFocus} onSelect={onSelect} />
      ))}
    </>
  );
}
