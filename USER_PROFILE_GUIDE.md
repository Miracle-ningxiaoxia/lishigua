# 👤 用户个人信息显示 - 使用指南

## 📍 当前实现

### ✅ 已完成功能

在页面右上角显示的用户卡片包含：
- **渐变头像占位符**：紫色-粉色-蓝色渐变圆形
- **用户姓名**：从 Session 中获取
- **身份标识**："拾光纪成员"
- **在线状态指示灯**：绿色呼吸动画
- **登出按钮**：红色悬停效果

### 🎨 设计特点

```
┌─────────────────────────────────────────────┐
│  ╔═══╗  张三            [退出]            │
│  ║ 👤 ║  拾光纪成员      [图标]            │
│  ╚═══╝  ●                                  │
└─────────────────────────────────────────────┘
```

- **毛玻璃效果**：`backdrop-blur-xl`
- **渐变背景**：半透明白色渐变
- **悬停动画**：缩放 + 边框发光
- **响应式设计**：适配各种屏幕尺寸

---

## 🖼️ 如何添加真实头像

### 方案 A：使用 Supabase Storage（推荐）

#### 1. 在 Supabase 创建 Storage Bucket

```sql
-- 在 Supabase Dashboard → Storage 中创建
-- Bucket 名称: avatars
-- Public: true（允许公开访问）
```

#### 2. 更新 members 表

```sql
-- 添加头像字段
ALTER TABLE members 
ADD COLUMN avatar TEXT;

-- 示例：更新某个成员的头像
UPDATE members 
SET avatar = 'https://yakoqbzwjxbpyedxmtnp.supabase.co/storage/v1/object/public/avatars/zhangsan.jpg'
WHERE name = '张三';
```

#### 3. 修改认证逻辑

编辑 `src/auth.ts`，在 `authorize` 函数中添加头像：

```typescript
// 在 authorize 函数中
return {
  id: member.id,
  name: member.name,
  coupleId: member.couple_id,
  avatar: member.avatar, // 添加这一行
};
```

#### 4. 更新 callbacks

```typescript
callbacks: {
  async jwt({ token, user }) {
    if (user) {
      token.id = user.id;
      token.name = user.name;
      token.coupleId = (user as any).coupleId;
      token.avatar = (user as any).avatar; // 添加这一行
    }
    return token;
  },
  async session({ session, token }) {
    if (token) {
      session.user.id = token.id as string;
      session.user.name = token.name as string;
      session.user.coupleId = token.coupleId as number | null;
      session.user.avatar = token.avatar as string | undefined; // 添加这一行
    }
    return session;
  },
},
```

#### 5. 取消 Navigation.tsx 中的注释

编辑 `src/components/ui/Navigation.tsx`，找到第 55-59 行：

```tsx
{/* 未来可以替换为真实头像 */}
<img 
  src={session.user.avatar || '/default-avatar.png'} 
  alt={session.user.name}
  className="w-full h-full object-cover"
/>
```

取消注释，删除上面的 `<User />` 图标。

---

### 方案 B：使用外部 CDN

如果头像托管在其他地方（如七牛云、阿里云 OSS）：

#### 1. 直接在数据库中存储 URL

```sql
UPDATE members 
SET avatar = 'https://your-cdn.com/avatars/zhangsan.jpg'
WHERE name = '张三';
```

#### 2. 按照方案 A 的步骤 3-5 操作

---

### 方案 C：使用 Gravatar

如果成员有邮箱，可以使用 Gravatar：

#### 1. 在 members 表添加邮箱字段

```sql
ALTER TABLE members 
ADD COLUMN email TEXT;
```

#### 2. 创建 Gravatar URL 生成函数

编辑 `src/lib/avatar.ts`（新建文件）：

```typescript
import crypto from 'crypto';

export function getGravatarUrl(email: string, size: number = 200): string {
  const hash = crypto
    .createHash('md5')
    .update(email.trim().toLowerCase())
    .digest('hex');
  
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon`;
}
```

#### 3. 在 Navigation.tsx 中使用

```tsx
import { getGravatarUrl } from '@/lib/avatar';

// 在组件中
const avatarUrl = session.user.email 
  ? getGravatarUrl(session.user.email, 80)
  : '/default-avatar.png';
```

---

### 方案 D：使用 UI Avatars（临时方案）

无需上传图片，基于姓名自动生成：

#### 在 Navigation.tsx 中直接使用

```tsx
const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.name)}&size=80&background=8B5CF6&color=fff&bold=true`;

<img 
  src={avatarUrl} 
  alt={session.user.name}
  className="w-full h-full object-cover"
/>
```

**效果**：自动生成带姓名首字母的彩色头像。

---

## 🎯 推荐实现顺序

### 阶段 1：快速测试（5分钟）
使用方案 D（UI Avatars），立即看到效果。

### 阶段 2：添加真实头像（1小时）
使用方案 A（Supabase Storage），上传成员照片。

### 阶段 3：完善功能（可选）
- 添加头像上传功能
- 允许用户更换头像
- 添加头像裁剪工具

---

## 📁 文件上传到 Supabase 的步骤

### 使用 Supabase Dashboard

1. 登录 Supabase Dashboard
2. 左侧菜单点击 **Storage**
3. 点击 **New Bucket** 创建 `avatars`
4. 设置为 **Public**
5. 点击 bucket 进入
6. 点击 **Upload File** 上传图片
7. 上传后点击图片，复制 **Public URL**
8. 在数据库中更新对应成员的 `avatar` 字段

### 使用代码上传（高级）

```typescript
import { supabase } from '@/lib/supabase';

async function uploadAvatar(file: File, memberId: string) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${memberId}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    console.error('上传失败:', error);
    return null;
  }

  // 获取公开 URL
  const { data: publicUrl } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName);

  return publicUrl.publicUrl;
}
```

---

## 🎨 自定义头像样式

### 圆形头像（当前）
```tsx
className="w-10 h-10 rounded-full"
```

### 圆角矩形
```tsx
className="w-10 h-10 rounded-lg"
```

### 六边形（需要 CSS）
```css
.hexagon-avatar {
  width: 40px;
  height: 40px;
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
}
```

### 添加边框光效
```tsx
<div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-purple-400/50 ring-offset-2 ring-offset-black">
  <img src={avatarUrl} alt={name} />
</div>
```

---

## 🔄 动态头像切换

### 鼠标悬停显示大图

```tsx
<motion.div
  className="relative"
  whileHover="hover"
>
  <img 
    src={session.user.avatar} 
    className="w-10 h-10 rounded-full"
  />
  
  <motion.div
    variants={{
      hover: { scale: 3, opacity: 1 }
    }}
    initial={{ scale: 1, opacity: 0 }}
    className="absolute top-0 left-0 w-10 h-10 rounded-full shadow-2xl"
  >
    <img src={session.user.avatar} />
  </motion.div>
</motion.div>
```

---

## 📊 数据库结构

### 更新后的 members 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| name | TEXT | 成员姓名 |
| invite_code | TEXT | 邀请码 |
| couple_id | INTEGER | 配对 ID |
| **avatar** | TEXT | 头像 URL（新增） |
| email | TEXT | 邮箱（可选） |
| created_at | TIMESTAMP | 创建时间 |

---

## ✅ 测试清单

完成后验证：
- [ ] 首页右上角显示用户卡片
- [ ] 卡片包含头像（占位符或真实头像）
- [ ] 显示用户姓名
- [ ] 显示"拾光纪成员"标签
- [ ] 绿色指示灯呼吸动画正常
- [ ] 悬停卡片有缩放效果
- [ ] 登出按钮功能正常
- [ ] 在其他页面（crew/vault/footprints）也正常显示

---

## 🎉 效果预览

### 当前效果（占位符）
```
┌──────────────────────┐
│  ╔════╗  张三         │
│  ║ 👤  ║  拾光纪成员   │
│  ╚════╝  ● 在线      │
└──────────────────────┘
```

### 添加真实头像后
```
┌──────────────────────┐
│  ╔════╗  张三         │
│  ║ 📷  ║  拾光纪成员   │
│  ╚════╝  ● 在线      │
└──────────────────────┘
```

---

## 💡 进阶功能建议

### 1. 配对徽章
根据 `couple_id` 显示配对标识：

```tsx
{session.user.coupleId && (
  <span className="text-xs bg-pink-500/20 text-pink-300 px-2 py-0.5 rounded-full">
    CP-{String(session.user.coupleId).padStart(3, '0')}
  </span>
)}
```

### 2. 在线状态
实时显示其他成员是否在线（需要 WebSocket）。

### 3. 个人主页
点击头像跳转到个人资料页。

### 4. 悬浮卡片
鼠标悬停显示更多信息：
- 纪念日
- 配对信息
- 最近活跃时间

---

## 📞 获取帮助

如有问题，请参考：
1. Supabase Storage 文档: https://supabase.com/docs/guides/storage
2. Next.js Image 优化: https://nextjs.org/docs/app/api-reference/components/image
3. Framer Motion 动画: https://www.framer.com/motion/

---

**🌟 用户信息卡片已准备就绪，随时可以添加真实头像！**
