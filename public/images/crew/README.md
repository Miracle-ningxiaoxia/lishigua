# Crew Avatar Images

请为每位成员准备头像图片：

## 图片命名规范

- `alex.jpg` - The Visionary (氛围担当)
- `jordan.jpg` - The Architect (技术顾问)
- `sam.jpg` - The Storyteller (灵魂写手)
- `taylor.jpg` - The Dreamer (创意策划)

## 推荐规格

**尺寸**：500x500px（1:1 正方形）
**格式**：JPEG 或 PNG
**质量**：85-90%
**文件大小**：< 150KB
**风格建议**：
- 人像居中
- 背景虚化或纯色
- 光线明亮
- 表情自然
- 可以是真人照片或艺术化处理

## 色彩主题

每位成员都有独特的代表色，建议头像的服装或背景色调与之呼应：

- **Alex** - Rose (#f43f5e) - 温暖、热情
- **Jordan** - Sky Blue (#0ea5e9) - 冷静、理性
- **Sam** - Violet (#8b5cf6) - 神秘、创意
- **Taylor** - Amber (#f59e0b) - 活力、梦想

## 如何启用真实头像

在 `src/components/crew/CrewCard.tsx` 中取消注释 Image 组件部分即可。

## 如何添加更多成员

在 `src/components/crew/Crew.tsx` 的 `crewData` 数组中添加新成员即可，记得分配独特的颜色。
