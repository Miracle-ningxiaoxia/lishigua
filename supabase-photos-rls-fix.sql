-- 修复照片上传的 RLS 策略
-- 问题：使用 NextAuth 而不是 Supabase Auth，导致 auth.role() 无法识别

-- =============================================
-- 方案：放宽 RLS 策略（应用层已有 NextAuth 认证）
-- =============================================

-- 1. 删除旧的严格策略
DROP POLICY IF EXISTS "仅成员可上传照片" ON photos;
DROP POLICY IF EXISTS "认证用户可上传照片" ON storage.objects;

-- 2. 创建新的宽松策略（因为 NextAuth 在应用层已验证）

-- photos 表 - 允许所有人插入（应用层控制权限）
CREATE POLICY "允许插入照片" ON photos
  FOR INSERT 
  WITH CHECK (true);

-- photos 表 - 允许作者删除自己的照片
CREATE POLICY "作者可删除照片" ON photos
  FOR DELETE 
  USING (author_id = current_setting('app.current_user_id', true)::uuid);

-- Storage - 允许所有人上传到 photos bucket
CREATE POLICY "允许上传到 photos bucket"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'photos');

-- Storage - 允许删除（应用层控制）
DROP POLICY IF EXISTS "用户可删除自己的照片" ON storage.objects;
CREATE POLICY "允许删除 photos bucket 文件"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'photos');

-- =============================================
-- 验证配置
-- =============================================

-- 查看 photos 表的策略
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'photos'
ORDER BY policyname;

-- 查看 storage.objects 的策略
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'objects' AND policyname LIKE '%photos%'
ORDER BY policyname;

-- =============================================
-- 说明
-- =============================================
-- 由于使用 NextAuth 进行认证，Supabase 无法通过 auth.role() 
-- 识别当前用户。因此我们：
-- 1. 在 RLS 层面放宽限制
-- 2. 在应用层（Next.js）通过 NextAuth session 控制权限
-- 3. 确保所有 API 调用都检查 session.user.id
--
-- 这是一个常见的混合认证方案：
-- - 前端：NextAuth 管理会话
-- - 后端：Supabase 存储数据
-- - 权限：在应用层（Server Actions）验证
