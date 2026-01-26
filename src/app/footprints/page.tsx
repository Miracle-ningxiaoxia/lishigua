'use client';

import { FootprintsScene } from '@/components/footprints/FootprintsScene';
import { Suspense } from 'react';

/**
 * 「迹 | Footprints」页面
 * 展示交互式 3D 地球
 */
export default function FootprintsPage() {
  return (
    <main className="relative w-full h-screen overflow-hidden">
      {/* 3D 场景 */}
      <Suspense
        fallback={
          <div className="w-full h-screen bg-black flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white/60 font-mono text-sm uppercase tracking-wider">
                Loading Earth...
              </p>
            </div>
          </div>
        }
      >
        <FootprintsScene />
      </Suspense>
    </main>
  );
}
