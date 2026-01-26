'use client';

import { useState, useEffect } from 'react';
import { Earth, Atmosphere } from './Earth';
import { EarthBasic, Atmosphere as AtmosphereBasic } from './EarthBasic';
import { EarthSimple } from './EarthSimple';

/**
 * 自动检测贴图并选择合适的地球组件
 */
export function EarthAuto() {
  const [earthVersion, setEarthVersion] = useState<'full' | 'basic' | 'simple'>('simple');
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // 检查贴图是否存在
    const checkTextures = async () => {
      try {
        // 检查所有 4 个贴图
        const [dayRes, nightRes, normalRes, specularRes] = await Promise.all([
          fetch('/textures/earth-day.jpg', { method: 'HEAD' }),
          fetch('/textures/earth-night.jpg', { method: 'HEAD' }),
          fetch('/textures/earth-normal.jpg', { method: 'HEAD' }),
          fetch('/textures/earth-specular.jpg', { method: 'HEAD' }),
        ]);

        const hasDay = dayRes.ok;
        const hasNight = nightRes.ok;
        const hasNormal = normalRes.ok;
        const hasSpecular = specularRes.ok;

        // 根据可用贴图选择版本
        if (hasDay && hasNight && hasNormal && hasSpecular) {
          setEarthVersion('full');
        } else if (hasDay && hasNight) {
          setEarthVersion('basic');
        } else {
          setEarthVersion('simple');
        }
      } catch {
        setEarthVersion('simple');
      } finally {
        setIsChecking(false);
      }
    };

    checkTextures();
  }, []);

  if (isChecking) {
    return null; // 检查期间不渲染任何内容
  }

  if (earthVersion === 'simple') {
    console.log('🌍 使用简化版地球（未找到贴图文件）');
    return <EarthSimple />;
  }

  if (earthVersion === 'basic') {
    console.log('🌍 使用基础版地球（含日夜贴图）');
    return (
      <>
        <EarthBasic />
        <AtmosphereBasic />
      </>
    );
  }

  console.log('🌍 使用完整版地球（含所有贴图效果）');
  return (
    <>
      <Earth />
      <Atmosphere />
    </>
  );
}
