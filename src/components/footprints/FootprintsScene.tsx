'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars } from '@react-three/drei';
import { Suspense, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { EarthBasic, Atmosphere } from './EarthBasic';
import { FootprintMarkers } from './FootprintMarkers';
import { ArcLines } from './ArcLines';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

/**
 * 3D 场景组件
 * 配置 Canvas、相机、控制器和光照
 */
export function FootprintsScene() {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const focusRef = useRef<{ target: THREE.Vector3 | null; distance?: number }>({
    target: null,
  });
  const [activeMemory, setActiveMemory] = useState<{
    id: number;
    name: string;
    description: string;
    date?: string;
  } | null>(null);

  return (
    <div className="relative w-full h-screen bg-black">
      {/* 页面标题 */}
      <motion.div
        className="absolute top-20 md:top-32 left-0 right-0 z-10 text-center pointer-events-none"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-3">
          迹
        </h2>
        <p className="font-mono text-xs md:text-sm text-neutral-500 uppercase tracking-[0.3em]">
          Footprints We Left Behind
        </p>
      </motion.div>

      <Canvas
        // 渲染配置优化
        dpr={[1, 2]} // 设备像素比，移动端降低性能消耗
        gl={{
          antialias: true,   // 抗锯齿
          stencil: false,    // 关闭模板缓冲（性能优化）
          depth: true,       // 深度测试
          alpha: false,      // 关闭透明度（性能优化）
          powerPreference: 'high-performance', // 高性能模式
        }}
        shadows={false} // 暂时关闭阴影以提升性能
      >
        {/* 相机配置 */}
        <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={45} />

        {/* 场景内容 */}
        <Suspense fallback={null}>
          <SceneContent
            onFocus={(target, distance) => {
              focusRef.current.target = target.clone();
              focusRef.current.distance = distance;
            }}
            onSelect={(payload) => setActiveMemory(payload)}
          />
          <CameraRig
            controlsRef={controlsRef}
            focusRef={focusRef}
          />
        </Suspense>

        {/* 交互控制 */}
        <OrbitControls
          ref={controlsRef}
          enablePan={false}        // 禁用平移
          enableZoom={true}        // 启用缩放
          minDistance={4}          // 最小距离（防止穿模）
          maxDistance={15}         // 最大距离
          zoomSpeed={0.8}          // 缩放速度
          rotateSpeed={0.5}        // 旋转速度
          enableDamping={true}     // 启用阻尼（更平滑）
          dampingFactor={0.05}     // 阻尼系数
        />

        {/* PostProcessing：辉光效果 */}
        <EffectComposer multisampling={8}>
          <Bloom
            intensity={0.45}
            luminanceThreshold={0.75}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>

      <AnimatePresence>
        {activeMemory && (
          <motion.div
            className="absolute left-1/2 top-1/2 z-30 w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/20 bg-white/10 p-5 text-white shadow-2xl backdrop-blur-xl"
            initial={{ opacity: 0, scale: 0.85, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold tracking-wide">
                  {activeMemory.name}
                </h3>
                <p className="mt-1 text-xs text-white/70">
                  {activeMemory.description}
                </p>
              </div>
              <button
                className="rounded-full border border-white/20 px-2 py-1 text-xs text-white/60 hover:text-white"
                onClick={() => setActiveMemory(null)}
              >
                关闭
              </button>
            </div>

            <div className="mt-4 text-xs text-white/50">
              日期：{activeMemory.date ?? '待补充'}
            </div>

            <div className="mt-4">
              <div className="text-xs text-white/50">参与成员</div>
              <div className="mt-2 grid grid-cols-7 gap-2">
                {Array.from({ length: 14 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-8 w-8 rounded-full border border-white/20 bg-white/10"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * 场景内容组件
 * 包含地球、大气层、光照等元素
 */
function SceneContent({
  onFocus,
  onSelect,
}: {
  onFocus: (target: THREE.Vector3, distance?: number) => void;
  onSelect: (payload: {
    id: number;
    name: string;
    description: string;
    date?: string;
  }) => void;
}) {
  return (
    <>
      {/* 环境光 */}
      <ambientLight intensity={0.18} />

      {/* 主光源（模拟太阳光） */}
      <directionalLight
        position={[-6.5, 2.0, -5.5]}
        intensity={2.5}
        color="#ffffff"
      />

      {/* 背景星空 */}
      <Stars
        radius={100}
        depth={50}
        count={2000}
        factor={2.0}
        saturation={0}
        fade
        speed={0.2}
      />

      {/* 地球（基础版：只需 day + night 贴图） */}
      <EarthBasic />
      
      {/* 大气层 */}
      <Atmosphere />

      {/* 足迹点 */}
      <FootprintMarkers onFocus={onFocus} onSelect={onSelect} />

      {/* 流光连线 */}
      <ArcLines />
    </>
  );
}

function CameraRig({
  controlsRef,
  focusRef,
}: {
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  focusRef: React.MutableRefObject<{ target: THREE.Vector3 | null; distance?: number }>;
}) {
  const { camera } = useThree();

  useFrame((_, delta) => {
    const focus = focusRef.current.target;
    const controls = controlsRef.current;
    if (!focus || !controls) return;

    const distance = focusRef.current.distance ?? camera.position.length();
    const desiredPos = focus.clone().normalize().multiplyScalar(distance);

    const ease = 1 - Math.exp(-delta * 4);
    controls.target.lerp(focus, ease);
    camera.position.lerp(desiredPos, ease);
    controls.update();

    if (controls.target.distanceTo(focus) < 0.001) {
      focusRef.current.target = null;
    }
  });

  return null;
}

