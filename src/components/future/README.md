# Future Letter Section

最后一个模块，充满情感和仪式感的时光胶囊。

## 功能特性

### 1. **动态星空背景**
- 50 颗随机分布的星星
- 独立的呼吸动画（透明度 + 缩放）
- 营造深邃的空间感

### 2. **浮动信封交互**
- 每个信封具有独立的浮动动画（y 轴）
- 悬停时放大 + 边框高亮
- 显示发送者和日期
- 支持点击打开

### 3. **信笺展开效果**
使用 Framer Motion 的 `layoutId` 实现共享元素过渡：
- 信封平滑展开为全屏信笺
- 背景强烈虚化（backdrop-blur-2xl）
- 正文使用手写体
- 段落逐行淡入（staggered animation）
- 点击背景或关闭按钮返回

### 4. **写信功能**
- 极简表单设计
- 输入：昵称 + 留言内容
- 字数限制：500 字符
- 提交时的光点收缩动画
- 新信封自动添加到页面

### 5. **光标增强**
- 悬停在信封上时，光标显示 "Open" 文字
- 与全局 CustomCursor 集成

## 预设信件

初始包含 4 封来自不同好友的信件：
1. **Alex** - 关于海边的回忆
2. **Jordan** - 给十年后的自己
3. **Sam** - 关于友谊的温暖
4. **Taylor** - 关于梦想和距离

## 使用建议

### 如何添加更多预设信件

在 `FutureLetter.tsx` 的 `initialLetters` 数组中添加：

```typescript
{
  id: 'letter-5',
  sender: 'Your Name',
  content: '多段落用 \\n\\n 分隔',
  date: '2024.06.15'
}
```

### 如何持久化用户留言

当前新信件仅保存在组件状态中（刷新页面会消失）。

**持久化方案**：
1. **LocalStorage**：简单场景，客户端存储
2. **数据库**：使用 Supabase / Firebase 等后端服务
3. **API Routes**：Next.js API Routes + 数据库

示例（LocalStorage）：
```typescript
// 保存
localStorage.setItem('letters', JSON.stringify(letters))

// 读取
const saved = localStorage.getItem('letters')
if (saved) setLetters(JSON.parse(saved))
```

## 设计亮点

- ✨ 纯黑背景 + 星空，营造宇宙感
- 💫 浮动动画，让信封"活"起来
- 🎬 共享元素过渡，电影级转场
- ✍️ 手写体正文，增强情感表达
- 🌟 光点收缩动画，仪式感满满

## 情感化设计

这个模块是整个网站的情感落脚点：
- Hero：震撼的开场
- Timeline：时间的流动
- Gallery：视觉的盛宴
- Crew：人物的刻画
- **Future Letter**：情感的归宿

通过"写给未来"的仪式，让用户参与到这段记忆的创造中。
