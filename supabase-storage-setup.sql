-- 时光快递驿站 · Supabase Storage 配置
-- 用于照片上传功能

-- =============================================
-- 1. 创建 Storage Bucket
-- =============================================
-- 注意：这个语句需要在 Supabase Dashboard 的 SQL Editor 中执行
-- 或者直接在 Storage 界面创建名为 'photos' 的 bucket

INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 2. 设置 Storage 权限策略 (RLS Policies)
-- =============================================

-- 允许所有人查看照片（因为 bucket 是公开的）
CREATE POLICY "所有人可查看照片"
ON storage.objects FOR SELECT
USING (bucket_id = 'photos');

-- 仅认证用户可上传照片
CREATE POLICY "认证用户可上传照片"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'photos' AND 
  auth.role() = 'authenticated'
);

-- 用户只能删除自己上传的照片
-- 注意：这里假设 owner 字段存储了上传者的 user_id
CREATE POLICY "用户可删除自己的照片"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'photos' AND 
  auth.uid() = owner
);

-- =============================================
-- 3. 配置说明
-- =============================================
-- Bucket 配置：
-- - 名称: photos
-- - 公开访问: true
-- - 文件大小限制: 建议设置为 10MB（在 Dashboard 中配置）
-- - 允许的文件类型: image/jpeg, image/png, image/webp, image/gif
--
-- 在 Supabase Dashboard 中：
-- 1. 进入 Storage 页面
-- 2. 创建新 bucket 'photos'
-- 3. 设置为 Public
-- 4. 在 Policies 选项卡配置上述策略
--
-- 或者直接在这里执行 SQL，然后在 Dashboard 中设置为 Public

-- =============================================
-- 完成！
-- =============================================
