-- 修复 Supabase Realtime DELETE 事件问题
-- 设置 comments 表的 REPLICA IDENTITY 为 FULL
-- 这样 DELETE 事件的 payload.old 会包含所有字段，而不仅仅是主键

-- 为 comments 表启用完整的行级复制标识
ALTER TABLE comments REPLICA IDENTITY FULL;

-- 验证设置
-- 你可以在 Supabase SQL Editor 中运行以下查询来验证：
-- SELECT relname, relreplident FROM pg_class WHERE relname = 'comments';
-- 结果应该显示 relreplident = 'f' (FULL)
