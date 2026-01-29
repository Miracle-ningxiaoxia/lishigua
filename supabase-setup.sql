-- 时光快递驿站 · Supabase 数据库初始化脚本

-- =============================================
-- 1. 创建 members 表
-- =============================================
CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  invite_code TEXT UNIQUE NOT NULL,
  couple_id INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以优化查询
CREATE INDEX IF NOT EXISTS idx_members_invite_code ON members(invite_code);
CREATE INDEX IF NOT EXISTS idx_members_couple_id ON members(couple_id);

-- =============================================
-- 2. 创建 couples 表
-- =============================================
CREATE TABLE IF NOT EXISTS couples (
  id SERIAL PRIMARY KEY,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 3. 示例数据：插入 14 位成员
-- =============================================
-- 注意：请根据实际情况修改 name 和 invite_code

INSERT INTO members (name, invite_code, couple_id) VALUES
  ('张三', 'INVITE2026A1', 1),
  ('李四', 'INVITE2026B2', 1),
  ('王五', 'INVITE2026C3', 2),
  ('赵六', 'INVITE2026D4', 2),
  ('孙七', 'INVITE2026E5', 3),
  ('周八', 'INVITE2026F6', 3),
  ('吴九', 'INVITE2026G7', 4),
  ('郑十', 'INVITE2026H8', 4),
  ('冯十一', 'INVITE2026I9', 5),
  ('陈十二', 'INVITE2026J0', 5),
  ('楚十三', 'INVITE2026K1', 6),
  ('卫十四', 'INVITE2026L2', 6),
  ('蒋十五', 'INVITE2026M3', 7),
  ('沈十六', 'INVITE2026N4', 7)
ON CONFLICT (invite_code) DO NOTHING;

-- =============================================
-- 4. 插入配对信息
-- =============================================
INSERT INTO couples (id, name) VALUES
  (1, '配对一'),
  (2, '配对二'),
  (3, '配对三'),
  (4, '配对四'),
  (5, '配对五'),
  (6, '配对六'),
  (7, '配对七')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 5. 查看数据
-- =============================================
-- 查看所有成员
SELECT * FROM members ORDER BY couple_id, name;

-- 查看所有配对
SELECT * FROM couples ORDER BY id;

-- =============================================
-- 6. 安全设置（重要！）
-- =============================================
-- 在 Supabase Dashboard 中配置 RLS (Row Level Security)

-- 启用 RLS
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE couples ENABLE ROW LEVEL SECURITY;

-- 允许所有人读取（因为我们使用 NextAuth 在应用层做认证）
CREATE POLICY "Allow read access for all" ON members
  FOR SELECT USING (true);

CREATE POLICY "Allow read access for all" ON couples
  FOR SELECT USING (true);

-- =============================================
-- 7. 测试查询
-- =============================================
-- 测试邀请码验证
SELECT id, name, couple_id 
FROM members 
WHERE invite_code = 'INVITE2026A1';

-- 查看成员及其配对信息
SELECT 
  m.id,
  m.name,
  m.invite_code,
  c.name as couple_name
FROM members m
LEFT JOIN couples c ON m.couple_id = c.id
ORDER BY m.couple_id, m.name;

-- =============================================
-- 完成！
-- =============================================
-- 现在可以使用任一 invite_code 登录系统了
-- 例如：INVITE2026A1
