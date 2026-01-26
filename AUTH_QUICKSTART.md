# 🚀 认证系统快速启动指南

## 步骤 1: 配置 Supabase 数据库

### 1.1 登录 Supabase Dashboard
访问: https://yakoqbzwjxbpyedxmtnp.supabase.co

### 1.2 执行 SQL 脚本
1. 在左侧菜单点击 **SQL Editor**
2. 创建新查询
3. 复制粘贴 `supabase-setup.sql` 的内容
4. 点击 **Run** 执行

### 1.3 验证数据
```sql
-- 检查成员表
SELECT * FROM members;

-- 应该看到 14 条记录
```

---

## 步骤 2: 启动开发服务器

```bash
# 安装依赖（如果还没安装）
npm install

# 启动开发服务器
npm run dev
```

服务器将运行在: http://localhost:3000

---

## 步骤 3: 测试登录流程

### 3.1 访问登录页
打开浏览器访问: http://localhost:3000/login

### 3.2 输入测试邀请码
使用以下任一邀请码测试：
- `INVITE2026A1` (张三)
- `INVITE2026B2` (李四)
- `INVITE2026C3` (王五)
- ...（查看 `supabase-setup.sql` 获取完整列表）

### 3.3 验证登录成功
- ✅ 应该看到加载动画
- ✅ 自动跳转到首页 `/`
- ✅ 右上角显示用户名和登出按钮

---

## 步骤 4: 测试路由保护

### 4.1 测试受保护路由
1. 在浏览器中打开新的隐身窗口
2. 直接访问: http://localhost:3000/crew
3. 应该自动重定向到登录页

### 4.2 测试登出功能
1. 点击右上角的「退出」按钮
2. 应该返回登录页
3. 再次尝试访问首页，应该被重定向到登录页

---

## 步骤 5: 自定义邀请码

### 方法 A: 直接在 Supabase 修改
1. 在 Supabase Dashboard 打开 **Table Editor**
2. 选择 `members` 表
3. 编辑 `invite_code` 字段
4. 保存更改

### 方法 B: 使用 SQL 更新
```sql
-- 更新特定成员的邀请码
UPDATE members 
SET invite_code = '你的自定义邀请码'
WHERE name = '张三';
```

---

## 🎨 UI 定制建议

### 修改渐变色
编辑 `src/app/login/page.tsx`:

```tsx
// 主标题渐变
className="... from-purple-400 via-pink-400 to-blue-400 ..."

// 按钮渐变
className="... from-purple-500 to-blue-500 ..."
```

### 调整星空密度
编辑 `src/app/login/page.tsx` 中的 CSS:

```css
.stars-layer-1 {
  opacity: 0.3; /* 增加数值让星星更亮 */
}
```

### 修改动画速度
```tsx
// 光晕呼吸速度
transition={{
  duration: 8, // 减小数值让动画更快
  ...
}}
```

---

## 🔧 故障排查

### 问题 1: 登录失败 "邀请码无效"
**可能原因:**
- Supabase 数据未正确插入
- 环境变量配置错误

**解决方案:**
```bash
# 1. 检查环境变量
cat .env.local

# 2. 验证 Supabase 连接
# 在浏览器控制台运行:
fetch('https://yakoqbzwjxbpyedxmtnp.supabase.co/rest/v1/members?select=*', {
  headers: {
    'apikey': 'YOUR_ANON_KEY',
    'Authorization': 'Bearer YOUR_ANON_KEY'
  }
}).then(r => r.json()).then(console.log)
```

### 问题 2: 页面刷新后登录状态丢失
**可能原因:**
- Cookie 被浏览器阻止
- `NEXTAUTH_SECRET` 未设置

**解决方案:**
1. 检查浏览器隐私设置，允许 Cookie
2. 确认 `.env.local` 中有 `NEXTAUTH_SECRET`
3. 重启开发服务器: `Ctrl+C` 然后 `npm run dev`

### 问题 3: 中间件不生效
**解决方案:**
```bash
# 1. 确认文件位置
ls -la src/middleware.ts

# 2. 清除 Next.js 缓存
rm -rf .next
npm run dev
```

### 问题 4: 类型错误
**解决方案:**
```bash
# 重新构建类型
npm run build

# 如果使用 VS Code，重启 TypeScript 服务器
# 按 Cmd+Shift+P (Mac) 或 Ctrl+Shift+P (Windows)
# 搜索 "TypeScript: Restart TS Server"
```

---

## 📊 数据库结构速查

### members 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| name | TEXT | 成员姓名 |
| invite_code | TEXT | 邀请码（唯一） |
| couple_id | INTEGER | 配对 ID（外键） |
| created_at | TIMESTAMP | 创建时间 |

### couples 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | SERIAL | 主键 |
| name | TEXT | 配对名称 |
| created_at | TIMESTAMP | 创建时间 |

---

## 🎯 下一步开发建议

### 1. 个性化欢迎页
根据 `couple_id` 显示专属内容:

```tsx
import { getCurrentUser } from '@/lib/auth-helpers';

export default async function HomePage() {
  const user = await getCurrentUser();
  
  return (
    <div>
      <h1>欢迎回来, {user?.name}!</h1>
      {user?.coupleId && (
        <p>你属于配对 #{user.coupleId}</p>
      )}
    </div>
  );
}
```

### 2. 配对专属内容
创建配对墙或配对相册:

```tsx
// src/app/couple-wall/page.tsx
import { getCurrentUser } from '@/lib/auth-helpers';
import { supabase } from '@/lib/supabase';

export default async function CoupleWallPage() {
  const user = await getCurrentUser();
  
  // 获取同一配对的所有成员
  const { data: members } = await supabase
    .from('members')
    .select('*')
    .eq('couple_id', user?.coupleId);
  
  return (
    <div>
      <h1>我们的配对</h1>
      {members?.map(member => (
        <div key={member.id}>{member.name}</div>
      ))}
    </div>
  );
}
```

### 3. 登录历史记录
添加一个 `login_logs` 表记录登录时间:

```sql
CREATE TABLE login_logs (
  id SERIAL PRIMARY KEY,
  member_id UUID REFERENCES members(id),
  login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address TEXT
);
```

### 4. 邀请码过期机制
添加过期时间字段:

```sql
ALTER TABLE members 
ADD COLUMN invite_code_expires_at TIMESTAMP WITH TIME ZONE;

-- 设置 1 年后过期
UPDATE members 
SET invite_code_expires_at = NOW() + INTERVAL '1 year';
```

---

## 🎉 完成！

你的「拾光纪」认证系统已经准备就绪！

**测试清单:**
- [ ] 登录页星空动画正常
- [ ] 输入正确邀请码可以登录
- [ ] 输入错误邀请码显示错误
- [ ] 登录后右上角显示用户名
- [ ] 登出功能正常
- [ ] 未登录无法访问其他页面

**如有问题，请查看 `AUTH_SYSTEM_GUIDE.md` 获取详细文档。**
