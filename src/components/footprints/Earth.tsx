'use client';

import { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader, ShaderMaterial, Vector3, Mesh } from 'three';
import * as THREE from 'three';

/**
 * 地球组件
 * 实现日夜贴图切换效果，背光面显示城市灯光
 */
export function Earth() {
  const earthRef = useRef<Mesh>(null);
  
  // 加载地球贴图
  // 注意：你需要在 public/textures/ 目录下放置这些贴图文件
  // 可以从 https://www.solarsystemscope.com/textures/ 下载高清地球贴图
  const [dayMap, nightMap, normalMap, specularMap] = useLoader(TextureLoader, [
    '/textures/earth-day.jpg',      // 日景贴图
    '/textures/earth-night.jpg',    // 夜景灯光贴图
    '/textures/earth-normal.jpg',   // 法线贴图（增强细节）
    '/textures/earth-specular.jpg', // 高光贴图（海洋反光）
  ]);

  // 自定义 Shader 材质
  const earthMaterial = useMemo(() => {
    return new ShaderMaterial({
      uniforms: {
        dayTexture: { value: dayMap },
        nightTexture: { value: nightMap },
        normalMap: { value: normalMap },
        specularMap: { value: specularMap },
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
        uniform sampler2D normalMap;
        uniform sampler2D specularMap;
        uniform vec3 sunDirection;
        uniform vec3 atmosphereColor;
        
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          // 采样贴图
          vec4 dayColor = texture2D(dayTexture, vUv);
          vec4 nightColor = texture2D(nightTexture, vUv);
          vec3 normal = texture2D(normalMap, vUv).rgb * 2.0 - 1.0;
          float specular = texture2D(specularMap, vUv).r;
          
          // 计算光照方向
          vec3 normalizedNormal = normalize(vNormal + normal * 0.3);
          float intensity = dot(normalizedNormal, sunDirection);
          
          // 平滑过渡阈值
          float dayMix = smoothstep(-0.1, 0.2, intensity);
          
          // 混合日夜贴图
          vec3 color = mix(nightColor.rgb * 1.5, dayColor.rgb, dayMix);
          
          // 添加高光（海洋反光）
          if (dayMix > 0.5 && specular > 0.1) {
            vec3 viewDir = normalize(-vPosition);
            vec3 reflectDir = reflect(-sunDirection, normalizedNormal);
            float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
            color += spec * specular * vec3(1.0, 1.0, 1.0) * 0.5;
          }
          
          // 边缘大气层效果
          vec3 viewDir = normalize(vPosition);
          float rim = 1.0 - max(0.0, dot(normalizedNormal, -viewDir));
          rim = pow(rim, 3.0);
          color += atmosphereColor * rim * 0.3;
          
          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });
  }, [dayMap, nightMap, normalMap, specularMap]);

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
 * 在地球外围添加一层半透明的大气层效果
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
