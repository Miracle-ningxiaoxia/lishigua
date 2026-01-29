-- ==========================================
-- Supabase 性能优化索引
-- 用于支持高并发场景和快速查询
-- ==========================================

-- 1. 点赞表（likes）索引优化
-- 加速按目标 ID 和类型查询点赞数
CREATE INDEX IF NOT EXISTS idx_likes_target 
ON likes(target_id, target_type);

-- 加速用户点赞状态查询和去重检查
CREATE INDEX IF NOT EXISTS idx_likes_user_target 
ON likes(user_id, target_id, target_type);

-- 加速按用户查询所有点赞记录
CREATE INDEX IF NOT EXISTS idx_likes_user 
ON likes(user_id, created_at DESC);

-- ==========================================

-- 2. 评论表（comments）索引优化
-- 加速按模块 ID 查询评论列表（倒序）
CREATE INDEX IF NOT EXISTS idx_comments_module 
ON comments(module_id, created_at DESC) 
WHERE parent_id IS NULL; -- 只对顶层评论建索引

-- 加速回复评论查询（正序）
CREATE INDEX IF NOT EXISTS idx_comments_parent 
ON comments(parent_id, created_at ASC) 
WHERE parent_id IS NOT NULL; -- 只对回复建索引

-- 加速按作者查询评论
CREATE INDEX IF NOT EXISTS idx_comments_author 
ON comments(author_id, created_at DESC);

-- ==========================================

-- 3. 通知表（notifications）索引优化
-- 加速未读通知查询（最常用）
CREATE INDEX IF NOT EXISTS idx_notifications_receiver_unread 
ON notifications(receiver_id, is_read, created_at DESC);

-- 加速按类型查询通知
CREATE INDEX IF NOT EXISTS idx_notifications_type 
ON notifications(receiver_id, type, created_at DESC);

-- ==========================================

-- 4. 成员表（members）索引优化
-- 加速邀请码验证（登录必需）
CREATE INDEX IF NOT EXISTS idx_members_invite_code 
ON members(invite_code);

-- 加速按 couple_id 查询情侣成员
CREATE INDEX IF NOT EXISTS idx_members_couple 
ON members(couple_id) 
WHERE couple_id IS NOT NULL;

-- ==========================================

-- 5. 优化 Realtime 性能：设置 REPLICA IDENTITY FULL
-- 这样 DELETE 事件的 payload.old 会包含完整行数据，方便过滤

-- 评论表
ALTER TABLE comments REPLICA IDENTITY FULL;

-- 点赞表
ALTER TABLE likes REPLICA IDENTITY FULL;

-- 通知表
ALTER TABLE notifications REPLICA IDENTITY FULL;

-- ==========================================

-- 6. 性能分析：查询慢查询和未使用的索引

-- 查看表大小和索引大小
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS index_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- 查看未使用的索引（生产环境运行一段时间后执行）
SELECT
  schemaname || '.' || tablename AS table,
  indexname AS index,
  pg_size_pretty(pg_relation_size(i.indexrelid)) AS index_size,
  idx_scan AS index_scans
FROM pg_stat_user_indexes ui
JOIN pg_index i ON ui.indexrelid = i.indexrelid
WHERE NOT indisunique 
  AND idx_scan < 50 
  AND pg_relation_size(i.indexrelid) > 5 * 8192
ORDER BY pg_relation_size(i.indexrelid) DESC;

-- ==========================================

-- 7. 建议的数据库连接池配置（Supabase Dashboard）
-- Settings → Database → Connection Pooling
-- 
-- Transaction Mode (推荐)：
-- - Pool Size: 20-50（根据并发用户数调整）
-- - Pool Timeout: 15s
-- - Max Client Connections: 200
-- 
-- Session Mode（如需长连接）：
-- - Pool Size: 10-20
-- - Pool Timeout: 30s
-- - Max Client Connections: 100

-- ==========================================

-- 8. 自动清理旧数据（可选，节省存储空间）

-- 清理 90 天前的已读通知
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- SELECT cron.schedule(
--   'cleanup-old-notifications',
--   '0 3 * * *', -- 每天凌晨 3 点执行
--   $$
--   DELETE FROM notifications 
--   WHERE is_read = true 
--     AND created_at < NOW() - INTERVAL '90 days';
--   $$
-- );

-- ==========================================

-- 执行完成后的验证：

-- 1. 检查所有索引是否创建成功
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 2. 分析查询性能（在应用中执行典型查询后）
-- EXPLAIN ANALYZE 
-- SELECT * FROM comments WHERE module_id = 'gallery' AND parent_id IS NULL 
-- ORDER BY created_at DESC LIMIT 20;

-- 预期：应该使用 idx_comments_module 索引，执行时间 < 10ms
