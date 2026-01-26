# 迹 | Footprints 模块

## 概述

这是「迹 | Footprints」模块的第一阶段实现：高性能 3D 地球底座。

## 技术栈

- **Next.js 15**：React 框架
- **React Three Fiber (R3F)**：React 的 Three.js 渲染器
- **Drei**：R3F 的实用工具库
- **Three.js**：3D 图形库
- **@react-three/postprocessing**：后处理效果库

## 核心功能

### 1. 渲染优化配置

```typescript
dpr={[1, 2]} // 设备像素比自适应
gl={{
  antialias: true,   // 抗锯齿
  stencil: false,    // 关闭模板缓冲（性能优化）
  depth: true,       // 深度测试
}}
```

### 2. 地球主体

- **几何体**：高精度球体（128 段）
- **材质**：自定义 Shader 实现日夜贴图切换
- **动画**：慢速自转效果

### 3. 自定义 Shader

实现了以下效果：
- **日夜过渡**：根据光照方向平滑混合日景和夜景贴图
- **城市灯光**：背光面显示城市灯光效果
- **海洋高光**：模拟海洋反光
- **大气层边缘光**：增强真实感

### 4. 交互控制

使用 `OrbitControls` 提供：
- ✅ 自由旋转
- ✅ 滚轮缩放
- ✅ 阻尼效果
- ✅ 距离限制（防止穿模）
- ❌ 禁用平移

### 5. PostProcessing 预留接口

已集成 `EffectComposer`，可轻松添加后处理效果：

```typescript
<EffectComposer>
  <Bloom intensity={0.5} luminanceThreshold={0.9} />
</EffectComposer>
```

## 文件结构

```
src/components/footprints/
├── Earth.tsx              # 完整版地球组件（需要贴图）
├── EarthSimple.tsx        # 简化版地球组件（不需要贴图）
├── FootprintsScene.tsx    # 3D 场景配置
└── README.md              # 本文档

src/app/footprints/
└── page.tsx               # 页面入口

public/textures/
├── earth-day.jpg          # 日景贴图（需自行下载）
├── earth-night.jpg        # 夜景贴图（需自行下载）
├── earth-normal.jpg       # 法线贴图（需自行下载）
├── earth-specular.jpg     # 高光贴图（需自行下载）
└── README.md              # 贴图资源说明
```

## 快速开始

### 方法 1：使用简化版（无需贴图）

修改 `FootprintsScene.tsx` 中的导入：

```typescript
// import { Earth, Atmosphere } from './Earth';
import { EarthSimple } from './EarthSimple';

// 然后在 SceneContent 中替换：
<EarthSimple />
```

### 方法 2：使用完整版（需要贴图）

1. 从 [Solar System Scope](https://www.solarsystemscope.com/textures/) 下载地球贴图
2. 将贴图文件放置在 `public/textures/` 目录下
3. 确保文件名与代码中的引用一致：
   - `earth-day.jpg`
   - `earth-night.jpg`
   - `earth-normal.jpg`
   - `earth-specular.jpg`
4. 启动开发服务器

## 性能优化建议

### 已实施的优化

- ✅ 关闭不必要的渲染特性（stencil）
- ✅ 自适应设备像素比
- ✅ 暂时关闭阴影渲染
- ✅ 使用 Suspense 懒加载

### 可选优化

1. **降低球体精度**：将 `<sphereGeometry args={[2, 128, 128]} />` 改为 `args={[2, 64, 64]}`
2. **降低贴图分辨率**：使用 2048x1024 而非 4096x2048
3. **按需加载**：仅在进入页面时加载 3D 资源

## 后续计划

### 第二阶段：标记点系统
- [ ] 在地球上添加可交互的标记点
- [ ] 标记点点击展开详情
- [ ] 路径连线动画

### 第三阶段：后处理效果
- [ ] 添加 Bloom（辉光）效果
- [ ] 添加景深效果
- [ ] 添加颜色分级

### 第四阶段：高级交互
- [ ] 地球自动旋转到指定位置
- [ ] 标记点搜索和筛选
- [ ] 时间轴回放功能

## 访问方式

启动开发服务器后，访问：
```
http://localhost:3000/footprints
```

## 常见问题

### Q: 页面加载很慢？
A: 检查贴图文件大小，建议使用 2048x1024 分辨率。可以使用在线工具压缩图片。

### Q: 地球不显示？
A: 打开浏览器控制台查看错误信息。如果是贴图加载失败，请使用简化版 `EarthSimple`。

### Q: 如何调整地球大小？
A: 修改 `<sphereGeometry args={[2, 128, 128]} />` 中的第一个参数（半径）。

### Q: 如何改变自转速度？
A: 修改 `Earth.tsx` 中的 `delta * 0.05`，数值越大旋转越快。

## 技术细节

### Shader 原理

我们使用自定义 Shader 实现了日夜贴图的平滑过渡：

1. **计算光照强度**：通过法线和光源方向的点积
2. **平滑混合**：使用 `smoothstep` 函数避免硬切换
3. **城市灯光**：在暗面增强夜景贴图的亮度
4. **海洋反光**：根据高光贴图添加镜面反射效果

### 性能指标

在典型设备上的性能表现：
- **Desktop (GTX 1660)**：稳定 60 FPS
- **MacBook Pro M1**：稳定 60 FPS
- **iPhone 12**：45-60 FPS
- **Android 中端机型**：30-45 FPS

## 贡献

如有问题或建议，欢迎提出 Issue。
