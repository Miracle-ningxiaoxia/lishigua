# 「迹 | Footprints」快速启动指南

## 🎉 已完成的工作

### ✅ 安装的依赖
- `@react-three/postprocessing` - 后处理效果库

### ✅ 创建的文件
```
src/
├── app/footprints/
│   └── page.tsx                    # 页面入口
└── components/footprints/
    ├── Earth.tsx                   # 完整版地球（需要贴图）
    ├── EarthSimple.tsx             # 简化版地球（无需贴图）
    ├── EarthAuto.tsx               # 智能切换版本
    ├── FootprintsScene.tsx         # 3D 场景配置
    └── README.md                   # 模块文档

public/textures/
└── README.md                       # 贴图资源说明
```

## 🚀 立即测试

### 步骤 1：启动开发服务器

```bash
npm run dev
```

### 步骤 2：访问页面

在浏览器中打开：
```
http://localhost:3000/footprints
```

### 步骤 3：查看效果

由于暂时没有贴图文件，系统会自动使用**简化版地球**（蓝色球体 + 大气层）。

**你应该能看到：**
- ✅ 一个缓慢旋转的蓝色地球
- ✅ 半透明的大气层效果
- ✅ 背景星空
- ✅ 可以拖动旋转地球
- ✅ 可以滚轮缩放
- ✅ 平滑的阻尼效果

## 🎨 添加完整版地球（可选）

如果你想看到日夜贴图切换和城市灯光效果：

### 步骤 1：下载贴图

访问以下任一网站下载高清地球贴图：

1. **Solar System Scope**（推荐）
   - 网址：https://www.solarsystemscope.com/textures/
   - 下载：
     - `2k_earth_daymap.jpg` → 重命名为 `earth-day.jpg`
     - `2k_earth_nightmap.jpg` → 重命名为 `earth-night.jpg`
     - `2k_earth_normal_map.jpg` → 重命名为 `earth-normal.jpg`
     - `2k_earth_specular_map.jpg` → 重命名为 `earth-specular.jpg`

2. **NASA Visible Earth**
   - 网址：https://visibleearth.nasa.gov/
   - 搜索 "Blue Marble" 系列

### 步骤 2：放置贴图

将下载的贴图文件放到：
```
public/textures/
├── earth-day.jpg       ← 日景贴图
├── earth-night.jpg     ← 夜景灯光
├── earth-normal.jpg    ← 法线贴图
└── earth-specular.jpg  ← 高光贴图
```

### 步骤 3：刷新页面

保存文件后刷新浏览器，系统会自动切换到完整版地球。

## 🎮 交互说明

- **旋转**：按住鼠标左键拖动
- **缩放**：滚动鼠标滚轮
- **自动旋转**：地球会缓慢自转
- **限制**：已禁用平移，防止地球飞出视野

## 🔧 自定义配置

### 修改地球大小

编辑 `Earth.tsx` 或 `EarthSimple.tsx`：
```typescript
<sphereGeometry args={[2, 128, 128]} />
//                     ↑ 修改这个数字（半径）
```

### 修改自转速度

编辑 `Earth.tsx` 或 `EarthSimple.tsx`：
```typescript
earthRef.current.rotation.y += delta * 0.05;
//                                      ↑ 数值越大越快
```

### 修改相机位置

编辑 `FootprintsScene.tsx`：
```typescript
<PerspectiveCamera makeDefault position={[0, 0, 8]} fov={45} />
//                                             ↑ Z 轴距离
```

### 修改缩放范围

编辑 `FootprintsScene.tsx`：
```typescript
<OrbitControls
  minDistance={4}   // 最近距离
  maxDistance={15}  // 最远距离
/>
```

## 📊 性能优化

### 当前优化配置

- ✅ 设备像素比：`dpr={[1, 2]}`（移动端降低性能消耗）
- ✅ 抗锯齿：开启
- ✅ 模板缓冲：关闭（性能优化）
- ✅ 深度测试：开启
- ✅ 阴影：暂时关闭

### 如果性能不佳

1. **降低球体精度**
   ```typescript
   <sphereGeometry args={[2, 64, 64]} />
   //                      ↑   ↑  减少分段数
   ```

2. **使用更小的贴图**
   - 将 4K 贴图压缩到 2K (2048x1024)
   - 使用 JPG 格式并适当压缩

3. **关闭抗锯齿**
   ```typescript
   gl={{ antialias: false }}
   ```

## 🎭 添加后处理效果（预留）

系统已预留 PostProcessing 接口，可以轻松添加辉光等效果：

编辑 `FootprintsScene.tsx`：
```typescript
import { Bloom } from '@react-three/postprocessing';

<EffectComposer>
  <Bloom 
    intensity={0.5} 
    luminanceThreshold={0.9} 
    luminanceSmoothing={0.9}
  />
</EffectComposer>
```

## 🐛 常见问题

### Q: 页面一片黑？
**A:** 打开浏览器控制台（F12）查看错误信息。可能是：
- Three.js 加载失败
- 浏览器不支持 WebGL

### Q: 地球不旋转？
**A:** 检查：
1. 控制台是否有 JavaScript 错误
2. 浏览器是否支持 WebGL
3. 显卡驱动是否正常

### Q: 贴图加载失败？
**A:** 确保：
1. 文件名完全匹配（区分大小写）
2. 文件格式为 JPG
3. 文件放在 `public/textures/` 目录下

### Q: 性能很差？
**A:** 尝试：
1. 使用简化版地球（`EarthSimple`）
2. 降低球体精度
3. 使用更小的贴图
4. 关闭抗锯齿

## 📱 浏览器兼容性

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ❌ IE 11（不支持 WebGL 2.0）

## 📞 技术支持

如遇到问题，请检查：
1. Node.js 版本 >= 18
2. 浏览器支持 WebGL
3. 控制台错误信息

## 🎯 下一步计划

### 第二阶段：标记点系统
- 在地球上添加位置标记
- 点击标记显示详情
- 标记点之间的路径连线

### 第三阶段：后处理效果
- Bloom（辉光）效果
- 景深效果
- 色调映射

### 第四阶段：高级交互
- 自动飞行到指定位置
- 标记点搜索
- 时间轴回放

## 🎊 开始体验吧！

运行 `npm run dev`，然后访问 `/footprints`，享受你的 3D 地球之旅！
