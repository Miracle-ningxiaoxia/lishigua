'use client';

import { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader, ShaderMaterial, Vector3, Mesh } from 'three';
import * as THREE from 'three';

/**
 * 基础版地球组件
 * 只需要日景和夜景贴图，无需法线和高光贴图
 */
export function EarthBasic() {
  const earthRef = useRef<Mesh>(null);
  
  // 只加载基础贴图
  const [dayMap, nightMap] = useLoader(TextureLoader, [
    '/textures/earth-day.jpg',      // 日景贴图
    '/textures/earth-night.jpg',    // 夜景灯光贴图
  ]);

  // 简化版 Shader 材质（无法线和高光）
  const earthMaterial = useMemo(() => {
    return new ShaderMaterial({
      uniforms: {
        dayTexture: { value: dayMap },
        nightTexture: { value: nightMap },
        sunDirection: { value: new Vector3(5, 0, 0).normalize() },
        atmosphereColor: { value: new THREE.Color(0.3, 0.6, 1.0) },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D dayTexture;
        uniform sampler2D nightTexture;
        uniform vec3 sunDirection;
        uniform vec3 atmosphereColor;
        
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          // 采样贴图
          vec4 dayColor = texture2D(dayTexture, vUv);
          vec4 nightColor = texture2D(nightTexture, vUv);
          
          // 计算光照方向
          vec3 normalizedNormal = normalize(vNormal);
          float intensity = dot(normalizedNormal, sunDirection);
          
          // 平滑过渡阈值
          float dayMix = smoothstep(-0.1, 0.2, intensity);
          
          // 混合日夜贴图
          vec3 color = mix(nightColor.rgb * 1.5, dayColor.rgb, dayMix);
          
          // 边缘大气层效果
          vec3 viewDir = normalize(vPosition);
          float rim = 1.0 - max(0.0, dot(normalizedNormal, -viewDir));
          rim = pow(rim, 3.0);
          color += atmosphereColor * rim * 0.3;
          
          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });
  }, [dayMap, nightMap]);

  // 地球自转动画
  useFrame((state, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.05; // 慢速自转
    }
  });

  return (
    <mesh ref={earthRef} castShadow receiveShadow>
      {/* 地球主体 */}
      <sphereGeometry args={[2, 128, 128]} />
      <primitive object={earthMaterial} attach="material" />
    </mesh>
  );
}

/**
 * 大气层组件（可选）
 */
export function Atmosphere() {
  const atmosphereRef = useRef<Mesh>(null);
  const atmosphereMaterial = useMemo(() => {
    return new ShaderMaterial({
      uniforms: {
        sunDirection: { value: new Vector3(-4.5, 1.8, -3.5).normalize() },
        dayColor: { value: new THREE.Color(0.45, 0.7, 1.0) },
        nightColor: { value: new THREE.Color(0.45, 0.7, 1.0) },
        fresnelBias: { value: 0.02 },
        fresnelScale: { value: 0.9 },
        fresnelPower: { value: 3.4 },
        intensity: { value: 0.65 },
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        varying vec3 vWorldNormal;

        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          vWorldNormal = normalize(mat3(modelMatrix) * normal);
          gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 sunDirection;
        uniform vec3 dayColor;
        uniform vec3 nightColor;
        uniform float fresnelBias;
        uniform float fresnelScale;
        uniform float fresnelPower;
        uniform float intensity;

        varying vec3 vWorldPosition;
        varying vec3 vWorldNormal;

        void main() {
          vec3 viewDir = normalize(cameraPosition - vWorldPosition);
          vec3 normalDir = normalize(vWorldNormal);
          vec3 lightDir = normalize(sunDirection);
          float viewDot = dot(viewDir, normalDir);
          float fresnel = pow(fresnelBias + fresnelScale * (1.0 + viewDot), fresnelPower);
          float sunFacing = clamp(dot(normalDir, lightDir), 0.0, 1.0);
          float rayleigh = pow(1.0 - clamp(viewDot, 0.0, 1.0), 2.0) * (0.35 + 0.65 * sunFacing);
          float dayMix = smoothstep(-0.1, 0.2, dot(normalDir, lightDir));
          vec3 atmosColor = mix(nightColor, dayColor, dayMix);
          float alpha = (fresnel + rayleigh) * intensity;
          alpha = smoothstep(0.0, 0.9, alpha);

          gl_FragColor = vec4(atmosColor * alpha, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      depthTest: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      toneMapped: false,
    });
  }, []);

  useFrame((state) => {
    if (atmosphereRef.current) {
      // 大气层轻微旋转
      atmosphereRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <mesh
      ref={atmosphereRef}
      scale={1.025}
      raycast={() => null}
    >
      <sphereGeometry args={[2, 64, 64]} />
      <primitive object={atmosphereMaterial} attach="material" />
    </mesh>
  );
}
