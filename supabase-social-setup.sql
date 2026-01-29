-- 时光快递驿站 · 社交功能数据库设置
-- 评论、点赞、通知系统

-- =============================================
-- 1. 创建 comments 表（评论）
-- =============================================
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL, -- 模块标识（如 'gallery-photo-1', 'anecdote-1', 'couple-1'）
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- 用于回复功能
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以优化查询
CREATE INDEX IF NOT EXISTS idx_comments_module_id ON comments(module_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- 启用 Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE comments;

-- =============================================
-- 2. 创建 likes 表（点赞）
-- =============================================
CREATE TABLE IF NOT EXISTS likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  target_id TEXT NOT NULL, -- 点赞的目标 ID
  target_type TEXT NOT NULL, -- 点赞类型（'photo', 'anecdote', 'comment'）
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 确保同一用户不能对同一目标重复点赞
  UNIQUE(user_id, target_id, target_type)
);

-- 创建索引以优化查询
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_target ON likes(target_id, target_type);
CREATE INDEX IF NOT EXISTS idx_likes_created_at ON likes(created_at DESC);

-- =============================================
-- 3. 创建 notifications 表（通知）
-- =============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receiver_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE, -- 接收通知的用户
  actor_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE, -- 触发通知的用户
  type TEXT NOT NULL, -- 通知类型（'like', 'comment', 'reply'）
  content TEXT NOT NULL, -- 通知内容
  target_id TEXT NOT NULL, -- 关联的目标 ID
  target_type TEXT NOT NULL, -- 关联的目标类型
  is_read BOOLEAN DEFAULT FALSE, -- 是否已读
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以优化查询
CREATE INDEX IF NOT EXISTS idx_notifications_receiver_id ON notifications(receiver_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(receiver_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- 启用 Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- =============================================
-- 4. 更新 members 表添加 avatar 字段（如果还没有）
-- =============================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'members' AND column_name = 'avatar'
  ) THEN
    ALTER TABLE members ADD COLUMN avatar TEXT;
  END IF;
END $$;

-- =============================================
-- 5. 配置 Row Level Security (RLS)
-- =============================================

-- 评论表 RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- 允许所有人读取评论
CREATE POLICY "Allow read access for all" ON comments
  FOR SELECT USING (true);

-- 允许已登录用户创建评论
CREATE POLICY "Allow insert for authenticated users" ON comments
  FOR INSERT WITH CHECK (true);

-- 允许用户删除自己的评论
CREATE POLICY "Allow delete own comments" ON comments
  FOR DELETE USING (author_id = auth.uid());

-- 允许用户更新自己的评论
CREATE POLICY "Allow update own comments" ON comments
  FOR UPDATE USING (author_id = auth.uid());

-- 点赞表 RLS
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- 允许所有人读取点赞
CREATE POLICY "Allow read access for all" ON likes
  FOR SELECT USING (true);

-- 允许已登录用户点赞
CREATE POLICY "Allow insert for authenticated users" ON likes
  FOR INSERT WITH CHECK (true);

-- 允许用户删除自己的点赞
CREATE POLICY "Allow delete own likes" ON likes
  FOR DELETE USING (user_id = auth.uid());

-- 通知表 RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 只允许接收者读取自己的通知
CREATE POLICY "Allow read own notifications" ON notifications
  FOR SELECT USING (receiver_id = auth.uid());

-- 允许已登录用户创建通知
CREATE POLICY "Allow insert for authenticated users" ON notifications
  FOR INSERT WITH CHECK (true);

-- 允许用户更新自己的通知（标记已读）
CREATE POLICY "Allow update own notifications" ON notifications
  FOR UPDATE USING (receiver_id = auth.uid());

-- 允许用户删除自己的通知
CREATE POLICY "Allow delete own notifications" ON notifications
  FOR DELETE USING (receiver_id = auth.uid());

-- =============================================
-- 6. 创建触发器：自动更新 updated_at
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 7. 示例数据（可选，用于测试）
-- =============================================

-- 插入一些示例评论
-- INSERT INTO comments (content, author_id, module_id) VALUES
--   ('这张照片太美了！', (SELECT id FROM members WHERE invite_code = 'INVITE2026A1'), 'gallery-gallery-1'),
--   ('哈哈哈，这个太搞笑了', (SELECT id FROM members WHERE invite_code = 'INVITE2026B2'), 'anecdote-anec-1'),
--   ('好有爱的一对❤️', (SELECT id FROM members WHERE invite_code = 'INVITE2026C3'), 'couple-couple-1');

-- 插入一些示例点赞
-- INSERT INTO likes (user_id, target_id, target_type) VALUES
--   ((SELECT id FROM members WHERE invite_code = 'INVITE2026A1'), 'gallery-1', 'photo'),
--   ((SELECT id FROM members WHERE invite_code = 'INVITE2026B2'), 'anec-1', 'anecdote');

-- =============================================
-- 8. 查询示例
-- =============================================

-- 查看所有评论及作者信息
-- SELECT 
--   c.*,
--   m.name as author_name,
--   m.avatar as author_avatar
-- FROM comments c
-- LEFT JOIN members m ON c.author_id = m.id
-- ORDER BY c.created_at DESC;

-- 查看特定模块的点赞数
-- SELECT 
--   target_id,
--   target_type,
--   COUNT(*) as like_count
-- FROM likes
-- WHERE target_id = 'gallery-1' AND target_type = 'photo'
-- GROUP BY target_id, target_type;

-- 查看用户的未读通知数量
-- SELECT COUNT(*) 
-- FROM notifications 
-- WHERE receiver_id = (SELECT id FROM members WHERE invite_code = 'INVITE2026A1')
--   AND is_read = FALSE;

-- =============================================
-- 完成！
-- =============================================
-- 社交功能数据库设置已完成
-- 记得在 Supabase Dashboard 中：
-- 1. 启用 Realtime for comments 和 notifications 表
-- 2. 配置 Storage bucket（如果需要上传图片）
-- 3. 测试 RLS 策略是否正常工作
