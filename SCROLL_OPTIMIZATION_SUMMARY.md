# 滚动转场优化总结

## 优化目标
解决"成员介绍"到"拾光纪首页"的滚动转场卡顿和位置偏移（Over-scrolling）问题。

## 核心问题分析
1. **位置偏移**：ScrollTrigger end 触发点计算不精确
2. **滚动惯性泄露**：从 `position: fixed` 过渡回常规流时，浏览器滚动惯性导致错位
3. **Lenis 同步问题**：Lenis 平滑滚动未与 ScrollTrigger 正确同步
4. **视口对齐**：首页视频背景未完美填充视口

## 实施的优化

### 1. MemberShowcase.tsx - 成员展示组件

#### 1.1 注册 ScrollToPlugin
```typescript
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)
```

#### 1.2 精确的 End 触发点计算
```typescript
const scrollDistance = totalWidth - viewportWidth
end: () => `+=${scrollDistance + viewportWidth * 0.5}`
```
- 绑定到实际需要的滚动距离
- 添加 0.5 倍视口宽度缓冲，确保平滑过渡

#### 1.3 强制吸附（Snap）配置
```typescript
snap: {
  snapTo: [0, 0.2, 0.4, 0.6, 0.8, 1],
  duration: { min: 0.2, max: 0.4 },
  delay: 0,
  ease: 'power1.inOut'
}
```
- 在关键位置（每个成员卡片）设置吸附点
- 确保用户停止滚动时，页面自动对齐到最近的卡片

#### 1.4 强制滚动归位逻辑
```typescript
onLeave: () => {
  setIsTransitioning(true)
  
  gsap.to(window, {
    scrollTo: { y: 0, autoKill: false },
    duration: 0.6,
    ease: 'power2.inOut',
    onComplete: () => {
      setTimeout(() => {
        setIsTransitioning(false)
        onComplete()
      }, 300)
    }
  })
}
```
- 使用 ScrollToPlugin 强制滚动到页面顶部
- 确保首页视频从 top: 0 开始显示
- 添加 300ms 延迟确保完美对齐

#### 1.5 滚动状态锁定
```typescript
// 视觉锁定层
{isTransitioning && (
  <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm pointer-events-auto" 
       style={{ touchAction: 'none' }} />
)}

// CSS 锁定
useEffect(() => {
  if (isTransitioning) {
    document.body.style.overflow = 'hidden'
    document.body.style.height = '100vh'
  }
}, [isTransitioning])
```
- 双重锁定：视觉 overlay + CSS overflow 控制
- 防止转场动画进行中的过度滚动
- 避免用户操作干扰转场过程

#### 1.6 优化 ScrollTrigger 配置
```typescript
pin: true,
pinSpacing: true,
scrub: 1,
anticipatePin: 1
```
- `pinSpacing: true`：保留 pin 空间，防止布局跳动
- `anticipatePin: 1`：提前准备 pin 动画，减少延迟
- `scrub: 1`：平滑的滚动同步

### 2. SmoothScroll.tsx - Lenis 同步

#### 2.1 ScrollTrigger 同步
```typescript
lenis.on('scroll', () => {
  ScrollTrigger.update()
})
```
- 每次 Lenis 滚动时更新 ScrollTrigger
- 确保两个系统的滚动位置完全同步

#### 2.2 响应式处理
```typescript
const handleResize = () => {
  ScrollTrigger.refresh()
}
window.addEventListener('resize', handleResize)
```
- 窗口大小改变时刷新所有 ScrollTrigger
- 防止响应式场景下的位置错乱

#### 2.3 移动端优化
```typescript
smoothTouch: false
```
- 禁用移动端的平滑触摸，提升性能
- 避免与原生滚动冲突

### 3. IntroOrchestrator.tsx - 转场协调优化

#### 3.1 减少延迟
```typescript
setTimeout(() => {
  onComplete()
}, 400) // 从 800ms 减少到 400ms
```
- MemberShowcase 现在自己处理滚动对齐
- 减少不必要的等待时间

#### 3.2 简化退出动画
```typescript
exit={{ opacity: 0 }}
transition={{ duration: 0.5, ease: 'easeInOut' }}
```
- 移除 `y: -100` 垂直移动，避免与滚动归位冲突
- 简化为淡出效果，更流畅

### 4. Hero.tsx - 首页视频优化

#### 3.1 容器优化
```typescript
<section 
  id="home-section"
  className="relative min-h-[100vh] h-screen w-full overflow-hidden bg-black"
  style={{ marginTop: 0, paddingTop: 0 }}
>
```
- 添加 `id="home-section"` 供 scrollTo 定位
- `min-h-[100vh]` 确保最小高度
- 移除所有 margin 和 padding，确保从顶部开始

#### 3.2 视频完美填充
```typescript
<video 
  className="absolute top-0 left-0 h-[100vh] w-full object-cover"
  style={{ minHeight: '100vh', minWidth: '100vw' }}
>
```
- `object-cover`：保持视频比例同时填满容器
- `h-[100vh]` + `minHeight: '100vh'`：双重保证高度
- `absolute top-0 left-0`：精确定位到容器顶部

#### 3.3 防止内容溢出
```typescript
<motion.div className="absolute inset-0 z-0 overflow-hidden">
```
- 在背景层添加 `overflow-hidden`
- 防止微小的滚动偏移导致视口外内容被渲染

## 技术亮点

### 像素级精确对齐
- ScrollToPlugin 强制归位
- snap 吸附机制
- 双重滚动锁定

### 平滑的性能表现
- Lenis 与 ScrollTrigger 完美同步
- anticipatePin 减少延迟
- 移动端优化配置

### 防御性编程
- onEnterBack 重置状态
- 多层滚动锁定
- 清理函数完整

## 预期效果

1. **零偏移**：从成员介绍最后一帧到首页第一帧，像素级对接
2. **零卡顿**：Lenis 同步确保平滑滚动
3. **零干扰**：转场期间完全锁定用户输入
4. **完美填充**：首页视频背景从 top: 0 开始，完美铺满整个视口

## 测试建议

1. **基础转场测试**：滚动完成员介绍，观察是否平滑过渡到首页顶部
2. **快速滚动测试**：快速滚动查看 snap 是否正确吸附
3. **中断测试**：转场过程中尝试反向滚动，确保状态正确重置
4. **响应式测试**：不同屏幕尺寸下验证对齐精度
5. **移动端测试**：触摸滚动是否流畅

## 关键代码位置

- `src/components/intro/MemberShowcase.tsx` - 第 146-209 行（ScrollTrigger 配置）
- `src/components/SmoothScroll.tsx` - 第 17-19 行（Lenis 同步）
- `src/components/intro/IntroOrchestrator.tsx` - 第 26-32、45-55 行（转场协调）
- `src/components/hero/Hero.tsx` - 第 24-52 行（视频容器）

## 修改的文件列表

1. ✅ `src/components/intro/MemberShowcase.tsx` - 核心滚动逻辑优化
2. ✅ `src/components/SmoothScroll.tsx` - Lenis 同步优化
3. ✅ `src/components/intro/IntroOrchestrator.tsx` - 转场时间优化
4. ✅ `src/components/hero/Hero.tsx` - 视频填充优化
5. ✅ `SCROLL_OPTIMIZATION_SUMMARY.md` - 新增文档

---

**优化完成时间**：2026-01-20  
**优化者**：AI Assistant  
**版本**：1.0
