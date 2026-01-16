# Anecdotes Media

轶事模块的媒体素材存放位置。

## 目录结构

```
public/
├── videos/anecdotes/     # 视频文件
└── images/anecdotes/     # 图片文件
```

## 视频规格

**推荐格式**：MP4 (H.264 编码)
**建议尺寸**：1080x1920 (竖屏) 或 1920x1080 (横屏)
**时长**：5-15 秒（循环播放）
**文件大小**：< 5MB
**帧率**：30fps

**示例文件名**：
- `drinking-1.mp4` - 喝酒场景1
- `drinking-2.mp4` - 喝酒场景2
- 根据 `Anecdotes.tsx` 中的 `src` 路径命名

## 图片规格

**推荐格式**：JPEG 或 PNG
**建议尺寸**：1200x1600 (竖图) 或 1600x1200 (横图)
**文件大小**：< 500KB
**质量**：85-90%

**示例文件名**：
- `mahjong-1.jpg` - 打麻将场景1
- `travel-1.jpg` - 旅行场景1
- 根据 `Anecdotes.tsx` 中的 `src` 路径命名

## 分类说明

### 杯中物 (Drinking)
聚会、喝酒、干杯等场景

### 方城战 (Mahjong)
打麻将、打牌等游戏场景

### 路途中 (Travel)
旅行、自驾、探险等出行场景

## Bento Grid 布局

在 `Anecdotes.tsx` 中，每个项目可以设置不同的 `span` 类：

- `col-span-1` - 占1列
- `col-span-2` - 占2列
- `row-span-1` - 占1行
- `row-span-2` - 占2行

示例：
```typescript
span: 'col-span-2 row-span-2' // 占2列2行，成为大格子
```

## 添加新轶事

在 `src/components/anecdotes/Anecdotes.tsx` 中的 `anecdotesData` 数组添加：

```typescript
{
  id: 'anec-7',
  type: 'video', // or 'image'
  category: 'drinking', // 'drinking', 'mahjong', 'travel'
  src: '/videos/anecdotes/your-video.mp4',
  caption: '你的搞笑描述',
  joke: '悬停时显示的梗', // 可选
  participants: ['Alex', 'Jordan'], // 参与者名字
  span: 'col-span-1 row-span-1' // 网格大小
}
```

## 特色功能

### 1. 视频灰度效果
- 默认：黑白滤镜 (`grayscale(1)`)
- 悬停：彩色 + 放大

### 2. 内部梗显示
- 悬停时显示 `joke` 字段
- 手写体大字显示

### 3. 参与者标签
- 点击 `@Name` 可跳转到 Crew 模块对应成员
- 实现内部锚点链接

### 4. 标签过滤
- 顶部分类标签
- 点击切换，网格平滑重排

## 优化建议

- 视频使用 FFmpeg 压缩
- 图片使用 TinyPNG 等工具压缩
- 确保素材符合隐私和版权要求
