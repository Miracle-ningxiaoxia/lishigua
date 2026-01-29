-- 照片模块快速启动指南
-- 执行这些步骤来设置照片上传功能

-- =============================================
-- 步骤 1: 确认 photos 表已创建
-- =============================================
-- 这个表应该已经通过用户提供的建表脚本创建了
-- 如果没有，请先执行用户提供的建表脚本

SELECT COUNT(*) as photo_count FROM photos;

-- =============================================
-- 步骤 2: 创建 Storage Bucket（如果还没有）
-- =============================================
-- 方法 A: 在 Supabase Dashboard 中手动创建
-- 1. 进入 Storage 页面
-- 2. 点击 "New bucket"
-- 3. 名称: photos
-- 4. 勾选 "Public bucket"
-- 5. 创建

-- 方法 B: 使用 SQL 创建（推荐）
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'photos',
  'photos',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']::text[];

-- =============================================
-- 步骤 3: 配置 Storage 权限策略
-- =============================================

-- 删除旧策略（如果存在）
DROP POLICY IF EXISTS "所有人可查看照片" ON storage.objects;
DROP POLICY IF EXISTS "认证用户可上传照片" ON storage.objects;
DROP POLICY IF EXISTS "用户可删除自己的照片" ON storage.objects;

-- 创建新策略
-- 1. 允许所有人查看照片
CREATE POLICY "所有人可查看照片"
ON storage.objects FOR SELECT
USING (bucket_id = 'photos');

-- 2. 认证用户可上传照片
CREATE POLICY "认证用户可上传照片"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'photos' AND 
  auth.role() = 'authenticated'
);

-- 3. 用户可删除自己的照片
CREATE POLICY "用户可删除自己的照片"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'photos' AND 
  auth.uid()::text = owner
);

-- =============================================
-- 步骤 4: 验证配置
-- =============================================

-- 检查 bucket 是否存在
SELECT * FROM storage.buckets WHERE id = 'photos';

-- 检查策略是否创建成功
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'objects' AND policyname LIKE '%照片%';

-- =============================================
-- 完成！现在可以在前端测试上传功能了
-- =============================================
-- 访问: http://localhost:3000/photos
-- 点击 "上传照片" 按钮
-- 拖拽或选择图片进行上传
