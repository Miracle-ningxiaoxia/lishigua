'use client';

import { Component, ReactNode } from 'react';
import { Earth, Atmosphere } from './Earth';
import { EarthBasic, Atmosphere as AtmosphereBasic } from './EarthBasic';
import { EarthSimple } from './EarthSimple';

/**
 * 错误边界组件
 * 用于捕获贴图加载错误并降级到备用版本
 */
class TextureErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.warn('⚠️ 贴图加载失败，切换到备用版本:', error.message);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

/**
 * 带降级方案的地球组件
 * 尝试加载完整版，失败则降级到基础版，再失败则使用简化版
 */
export function EarthWithFallback() {
  return (
    <TextureErrorBoundary
      fallback={
        <TextureErrorBoundary fallback={<EarthSimple />}>
          <>
            <EarthBasic />
            <AtmosphereBasic />
          </>
        </TextureErrorBoundary>
      }
    >
      <>
        <Earth />
        <Atmosphere />
      </>
    </TextureErrorBoundary>
  );
}
