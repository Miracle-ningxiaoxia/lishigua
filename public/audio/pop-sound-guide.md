# Pop Sound Effect

气泡爆炸音效文件。

## 文件位置

`public/audio/pop.mp3`

## 规格要求

- **格式**: MP3
- **时长**: 0.5-1.5 秒
- **音量**: 适中（不要太响）
- **特点**: 清脆、轻快的爆裂声

## 推荐音效类型

- 气泡爆破
- 轻柔的爆竹声
- Pop/bubble sound effect

## 如何获取

### 免费音效网站
1. **Freesound** - https://freesound.org/
2. **Zapsplat** - https://www.zapsplat.com/
3. **Mixkit** - https://mixkit.co/free-sound-effects/

### 搜索关键词
- "pop sound effect"
- "bubble pop"
- "light explosion"
- "click pop"

## 测试

确保音效文件：
- 不会过响（避免惊吓用户）
- 与气泡动画时长匹配
- 浏览器兼容性良好

## 使用位置

在 `src/components/intro/MemoryBubble.tsx` 中：
```typescript
<audio ref={audioRef} preload="auto">
  <source src="/audio/pop.mp3" type="audio/mpeg" />
</audio>
```

点击气泡时会触发播放。
