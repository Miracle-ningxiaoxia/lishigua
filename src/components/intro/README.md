# 入场序列重构文档

## 概述

全新的交互式入场序列，采用"交互触发 + 线性叙事"模式，让用户主动参与到网站的开场中。

## 技术栈

- **GSAP** - 高性能动画库
- **ScrollTrigger** - GSAP 插件，实现横向滚动
- **canvas-confetti** - 粒子爆炸效果
- **Framer Motion** - 平滑过渡动画

## 流程设计

### 1. 初始状态 - 记忆气泡

**组件**: `src/components/intro/MemoryBubble.tsx`

**特性**:
- 全黑背景，中心显示毛玻璃气泡
- GSAP 实现呼吸缩放（`scale: 1 → 1.05`）
- GSAP 实现上下浮动（`y: 0 → -10`）
- 中心图标旋转动画
- 外围脉冲光环
- 底部提示文字："点亮记忆"

**交互**:
- 鼠标悬停：气泡发光增强
- 点击：触发爆炸序列

### 2. 爆炸转场

**特效**:
1. **音效**: 播放 `pop.mp3`
2. **视觉**: canvas-confetti 粒子爆炸（白色/灰色粒子）
3. **气泡**: GSAP 动画 - `scale: 2, opacity: 0`
4. **音乐**: 启动背景音乐播放器（2秒淡入）
5. **切换**: 进入成员介绍阶段

### 3. 成员介绍横向滚动

**组件**: `src/components/intro/MemberShowcase.tsx`

**GSAP ScrollTrigger 实现**:
```typescript
gsap.to(cards, {
  x: -(totalWidth - viewportWidth),
  scrollTrigger: {
    trigger: container,
    pin: true,  // 钉住容器
    scrub: 1,   // 平滑跟随
    end: `+=${totalWidth}`,
  },
})
```

**内容结构**:
- 4 个成员卡片 + 1 个结束卡片
- 每个成员: 艺术照 + 昵称 + 电影台词式介绍
- 背景: 成员代号大字（模糊视差效果）
- 底部: 进度指示器

**响应式设计**:
- 桌面端: 左右排列（图片 + 信息）
- 移动端: 上下排列

### 4. 过渡到主页面

**触发条件**: 横向滚动完成后

**效果**:
```typescript
exit={{ opacity: 0, y: -100 }}
transition={{ duration: 0.8 }}
```

**结果**:
- 成员介绍向上推出视口
- Hero Section 优雅露出
- Iris Wipe 和视频背景正常工作

## 架构设计

### IntroOrchestrator (编排器)

**路径**: `src/components/intro/IntroOrchestrator.tsx`

**职责**:
- 管理三个阶段: `bubble` → `showcase` → `complete`
- 协调气泡爆炸 → 音乐启动
- 协调成员展示 → 主页面显示

**状态机**:
```
bubble (初始气泡)
  ↓ 点击
showcase (成员展示)
  ↓ 滚动完成
complete (完成，销毁)
```

### AppWrapper (应用包装器)

**路径**: `src/components/AppWrapper.tsx`

**职责**:
- 持有 MusicPlayer 引用
- 管理 IntroOrchestrator 的生命周期
- 控制主内容的显示/隐藏

**关键逻辑**:
```typescript
const handleMusicStart = async () => {
  await musicPlayerRef.current?.startMusic()
}

const handleIntroComplete = () => {
  setIntroComplete(true) // 显示主内容
}
```

## 组件改动

### Hero.tsx
- ✅ 移除 `LoadingScreen` 组件
- ✅ 移除 `isLoading` 状态
- ✅ 简化入场动画（从 1.2 缩放到 1）

### MusicPlayer.tsx
- ✅ 改为 `forwardRef` 组件
- ✅ 移除自动播放逻辑
- ✅ 暴露 `startMusic()` 方法
- ✅ 使用 `useImperativeHandle`

### layout.tsx
- ✅ 移除直接的 `<MusicPlayer />`
- ✅ 集成 `<AppWrapper />`
- ✅ 将 children 包裹在 AppWrapper 中

## 数据配置

### 成员数据

**文件**: `src/components/intro/MemberShowcase.tsx`

**结构**:
```typescript
{
  id: 'member-1',
  name: 'Alex',
  nickname: 'The Visionary',
  quote: '生活不只是活着，而是创造值得被铭记的瞬间。',
  code: 'ALEX',  // 背景显示的代号
  imagePlaceholder: '...'  // 占位符描述
}
```

**如何添加真实照片**:
1. 准备 4 张成员照片（3:4 比例）
2. 放入 `public/images/crew/intro/`
3. 在组件中取消注释 Image 部分

## 性能优化

### GSAP
- ✅ 仅在客户端注册插件
- ✅ 组件卸载时清理 ScrollTrigger
- ✅ 使用 `scrub` 实现平滑跟随

### 音效
- ✅ `preload="auto"` 预加载
- ✅ 异常捕获，静默失败

### 动画
- ✅ `will-change: transform`
- ✅ GPU 加速（transform, opacity）
- ✅ AnimatePresence 优化过渡

## 用户体验细节

### 1. 视觉引导
- "点亮记忆" 提示文字
- 气泡呼吸动画吸引注意
- "滚动查看更多" 提示

### 2. 反馈及时
- 点击即刻响应（音效 + 动画）
- 滚动平滑跟随（scrub: 1）
- 进度指示器实时更新

### 3. 容错处理
- 音频播放失败：静默处理
- 浏览器不支持：降级体验
- 移动端：触摸友好

## 调试建议

### 跳过入场序列（开发时）

在 `AppWrapper.tsx` 中：
```typescript
const [introComplete, setIntroComplete] = useState(true) // 改为 true
```

### 测试单个组件

单独导入测试：
```typescript
import MemoryBubble from '@/components/intro/MemoryBubble'
// or
import MemberShowcase from '@/components/intro/MemberShowcase'
```

### GSAP 调试

```typescript
// 在浏览器控制台
ScrollTrigger.getAll() // 查看所有触发器
```

## 未来扩展

### 可选功能
1. **跳过按钮**: 允许用户直接进入主页面
2. **进度保存**: LocalStorage 记住是否已看过
3. **多语言**: 英文/中文切换
4. **主题色**: 根据成员分配不同配色

### 替代方案
- Three.js 3D 场景替代平面气泡
- 视频背景替代静态成员照片
- 音频旁白自动播放介绍

## 常见问题

### Q: 横向滚动不流畅？
A: 检查 `scrub` 值（建议 0.5-2）和容器宽度计算

### Q: 音乐没有自动启动？
A: 浏览器自动播放策略，用户交互后才能播放

### Q: 移动端体验不佳？
A: 考虑针对移动端设计垂直滚动版本

### Q: 想要禁用入场序列？
A: 在 AppWrapper 中设置 `introComplete` 初始值为 `true`

## 总结

这套入场序列将用户从被动观看者转变为主动参与者：
- 点击气泡 → 激活记忆
- 横向滚动 → 探索成员
- 完整体验 → 进入主页

每一步都充满仪式感和参与感，为整个网站定下了情感基调。
