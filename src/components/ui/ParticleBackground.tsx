'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function ParticleField() {
  const particlesRef = useRef<THREE.Points>(null)
  const mouseRef = useRef({ x: 0, y: 0 })

  // Generate particle positions
  const particles = useMemo(() => {
    const count = 2000
    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count * 3)
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      // Create particles in a large sphere
      positions[i3] = (Math.random() - 0.5) * 100
      positions[i3 + 1] = (Math.random() - 0.5) * 100
      positions[i3 + 2] = (Math.random() - 0.5) * 50
      
      // Small random velocities for organic movement
      velocities[i3] = (Math.random() - 0.5) * 0.02
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.02
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.01
    }
    
    return { positions, velocities }
  }, [])

  // Mouse movement listener
  useFrame(({ mouse }) => {
    if (!particlesRef.current) return
    
    // Smooth mouse tracking
    mouseRef.current.x += (mouse.x * 5 - mouseRef.current.x) * 0.02
    mouseRef.current.y += (mouse.y * 5 - mouseRef.current.y) * 0.02
    
    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array
    
    // Animate particles with subtle drift and mouse influence
    for (let i = 0; i < positions.length; i += 3) {
      // Add velocity drift
      positions[i] += particles.velocities[i]
      positions[i + 1] += particles.velocities[i + 1]
      positions[i + 2] += particles.velocities[i + 2]
      
      // Mouse influence (subtle pull towards mouse)
      const dx = mouseRef.current.x - positions[i]
      const dy = mouseRef.current.y - positions[i + 1]
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      if (distance < 10) {
        positions[i] += dx * 0.001
        positions[i + 1] += dy * 0.001
      }
      
      // Boundary wrapping
      if (Math.abs(positions[i]) > 50) positions[i] *= -0.98
      if (Math.abs(positions[i + 1]) > 50) positions[i + 1] *= -0.98
      if (Math.abs(positions[i + 2]) > 25) positions[i + 2] *= -0.98
    }
    
    particlesRef.current.geometry.attributes.position.needsUpdate = true
    
    // Slow rotation
    particlesRef.current.rotation.y += 0.0002
  })

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.positions.length / 3}
          array={particles.positions}
          itemSize={3}
          args={[particles.positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color="#ffffff"
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

export default function ParticleBackground() {
  return (
    <div className="fixed inset-0 -z-10 bg-black">
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-60" />
      
      <Canvas
        camera={{ position: [0, 0, 30], fov: 75 }}
        gl={{ antialias: true, alpha: true }}
      >
        <fog attach="fog" args={['#000000', 30, 80]} />
        <ParticleField />
      </Canvas>
      
      {/* Vignette effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] pointer-events-none" />
    </div>
  )
}
