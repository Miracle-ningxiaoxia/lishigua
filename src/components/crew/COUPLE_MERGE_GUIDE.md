# 众声模块情侣合体交互升级指南

## 🎯 功能概述

为 14 位成员（7对情侣）增加了二级交互触发效果。当用户点击一对情侣的两张个人卡片时，会触发震撼的"合体"动画，展示情侣合照和共同宣言。

---

## 📁 新增文件

### 1. `crewData.ts` - 数据定义文件

包含：
- **14 位成员数据**：每人都有 `partnerId` 字段关联配偶
- **7 对情侣数据**：包含情侣合照路径和共同宣言
- **辅助函数**：查找情侣、查找配偶等

### 2. `CoupleCard.tsx` - 情侣合体卡片组件

特性：
- 全屏模态展示情侣合照
- 梦幻的渐变叠加效果（mix-blend-mode: overlay）
- 动态心跳动画
- 情侣代表色背景
- 平滑的进入/退出动画

---

## 🎨 核心交互流程

### 触发机制

```
用户点击成员A 
  → 成员A卡片亮起（激活状态）
    → 用户点击成员B（A的配偶）
      → 触发合体动画
        → 显示情侣合照和宣言
```

### 视觉反馈

1. **点击第一位成员**
   - 卡片发光（代表色光晕）
   - 右上角出现 ✓ 标记
   - 卡片微微上浮

2. **点击第二位成员（配偶）**
   - 页面背景色渐变为情侣代表色
   - 两张卡片向中心靠拢（未来可增强）
   - 情侣合照全屏展示

3. **合体卡片展示**
   - 全屏背景模糊 + 渐变色
   - 情侣合照居中显示
   - 两人名字 + 心跳图标
   - 共同宣言
   - 点击任意处或 X 按钮关闭

---

## 🖼️ 添加情侣合照

### 步骤 1：准备照片

**规格要求**：
- 比例：3:2（横版，例如 1800x1200px）
- 格式：JPG 或 PNG
- 风格：情侣合照、双人照
- 大小：建议 < 800KB

### 步骤 2：存放位置

```
public/
└── images/
    └── crew/
        └── couples/          # 👈 创建这个文件夹
            ├── couple-1.jpg  # 陈果子 & 范大爷
            ├── couple-2.jpg  # 范小车 & 蓉姐
            ├── couple-3.jpg  # 李果子 & 王睿娃
            ├── couple-4.jpg  # 小霞 & 邱雪晶
            ├── couple-5.jpg  # 王燕 & 舒兴友
            ├── couple-6.jpg  # 唐蛋 & 王老师
            └── couple-7.jpg  # 佳姐 & 袁老师
```

### 步骤 3：修改数据文件

打开 `src/components/crew/crewData.ts`，找到 `couplesData` 数组，填充 `coupleImage` 字段：

```typescript
export const couplesData: Couple[] = [
  {
    id: 'couple-1',
    partner1Id: 'crew-1',
    partner2Id: 'crew-2',
    coupleImage: '/images/crew/couples/couple-1.jpg', // 👈 填充这里
    declaration: '从相识到相守，我们是彼此最好的陪伴',
    accentColor: '#f43f5e',
  },
  // ... 其他情侣
]
```

---

## 🎭 自定义宣言

在 `crewData.ts` 中修改 `declaration` 字段：

```typescript
{
  id: 'couple-1',
  // ...
  declaration: '你的专属宣言（20-30字为佳）', // 👈 修改这里
}
```

---

## 🎨 自定义代表色

在 `crewData.ts` 中修改 `accentColor` 字段：

```typescript
{
  id: 'couple-1',
  // ...
  accentColor: '#ff6b9d', // 👈 修改为你喜欢的颜色（HEX格式）
}
```

---

## 🔧 技术细节

### 状态管理

```typescript
// 激活的成员（Set 存储）
const [activatedMembers, setActivatedMembers] = useState<Set<string>>(new Set())

// 合体的情侣 ID
const [mergedCouple, setMergedCouple] = useState<string | null>(null)
```

### 动画技术

- **Framer Motion**：
  - `layoutId` 用于共享元素过渡
  - `AnimatePresence` 处理卡片进入/退出
  - `motion.div` 实现平滑动画

- **视觉效果**：
  - `backdrop-filter: blur(20px)` 背景模糊
  - `mix-blend-mode: overlay` 梦幻叠加
  - `radial-gradient` 径向渐变光晕

### 性能优化

- ✅ 使用 `Set` 数据结构提高查找效率
- ✅ 合体卡片使用 `priority` 优先加载图片
- ✅ 动画使用 `will-change: transform` GPU 加速
- ✅ 背景渐变使用 CSS 而非 JS 计算

---

## 📊 数据结构示例

### 成员数据

```typescript
{
  id: 'crew-1',
  name: '陈果子',
  nickname: '少爷',
  role: '氛围担当',
  quote: '王睿娃又在躲酒！！！',
  avatarUrl: '/images/crew/cgz.jpg',
  color: '#f43f5e',
  partnerId: 'crew-2', // 👈 关联配偶
}
```

### 情侣数据

```typescript
{
  id: 'couple-1',
  partner1Id: 'crew-1',
  partner2Id: 'crew-2',
  coupleImage: '/images/crew/couples/couple-1.jpg',
  declaration: '从相识到相守，我们是彼此最好的陪伴',
  accentColor: '#f43f5e',
}
```

---

## 🎯 未来增强

### 可选升级

1. **更复杂的合体动画**
   - 使用 GSAP 实现卡片真正的飞向中心
   - 添加粒子爆炸效果

2. **悬停触发模式**
   - 同时悬停两张卡片也可触发合体
   - 需要防抖处理

3. **3D 翻转效果**
   - 卡片翻转180度露出情侣合照
   - 使用 CSS `transform-style: preserve-3d`

4. **音效反馈**
   - 点击成员时播放"叮"声
   - 合体时播放"砰"声或浪漫音效

5. **分享功能**
   - 添加截图分享按钮
   - 生成专属情侣海报

---

## 🐛 常见问题

### Q: 点击了两个人但没有合体？
A: 检查是否点击的是一对情侣。查看 `crewData.ts` 确认 `partnerId` 是否正确配置。

### Q: 合体卡片显示占位符而不是照片？
A: 检查 `couplesData` 中 `coupleImage` 路径是否正确，图片是否存在。

### Q: 如何重置激活状态？
A: 再次点击已激活的成员即可取消激活。

### Q: 能否同时激活多对情侣？
A: 当前设计为一次只能激活一对，打开合体卡片后会自动清空激活状态。

---

## 📝 总结

这个升级为友谊纪念馆增加了一层深度互动：

- ✅ 14 位成员，7 对情侣
- ✅ 点击触发合体交互
- ✅ 电影级视觉效果
- ✅ 流畅不掉帧的动画
- ✅ 易于扩展和自定义

**现在去添加你的情侣照片，让回忆更生动！** 💕
