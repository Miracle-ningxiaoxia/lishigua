-- 照片上传功能验证脚本
-- 执行此脚本来检查所有配置是否正确

-- =============================================
-- 1. 检查 photos 表是否存在
-- =============================================
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'photos')
    THEN '✅ photos 表已存在'
    ELSE '❌ photos 表不存在，请先执行建表脚本'
  END as "表结构检查";

-- =============================================
-- 2. 检查 photos 表字段
-- =============================================
SELECT 
  column_name as "字段名",
  data_type as "数据类型",
  is_nullable as "可为空",
  column_default as "默认值"
FROM information_schema.columns
WHERE table_name = 'photos'
ORDER BY ordinal_position;

-- =============================================
-- 3. 检查 Storage Bucket
-- =============================================
SELECT 
  id as "Bucket ID",
  name as "名称",
  public as "公开访问",
  file_size_limit as "大小限制(字节)",
  allowed_mime_types as "允许的文件类型"
FROM storage.buckets
WHERE id = 'photos';

-- 如果返回 0 行，说明 bucket 不存在，请在 Dashboard 中创建

-- =============================================
-- 4. 检查 photos 表的 RLS 策略
-- =============================================
SELECT 
  policyname as "策略名称",
  cmd as "操作",
  permissive as "许可类型",
  CASE 
    WHEN cmd = 'SELECT' THEN '✅ 查询策略'
    WHEN cmd = 'INSERT' THEN '✅ 插入策略'
    WHEN cmd = 'UPDATE' THEN '✅ 更新策略'
    WHEN cmd = 'DELETE' THEN '✅ 删除策略'
  END as "说明"
FROM pg_policies
WHERE tablename = 'photos'
ORDER BY cmd;

-- 期望结果：
-- - 至少有一个 SELECT 策略
-- - 至少有一个 INSERT 策略

-- =============================================
-- 5. 检查 Storage 的 RLS 策略
-- =============================================
SELECT 
  policyname as "策略名称",
  cmd as "操作",
  CASE 
    WHEN policyname LIKE '%photos%' THEN '✅ 与 photos bucket 相关'
    ELSE '⚠️ 可能不相关'
  END as "说明"
FROM pg_policies
WHERE tablename = 'objects'
  AND policyname LIKE '%photos%'
ORDER BY cmd;

-- =============================================
-- 6. 检查 members 表（用于外键关联）
-- =============================================
SELECT 
  COUNT(*) as "成员总数",
  COUNT(DISTINCT id) as "唯一ID数量",
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ members 表有数据'
    ELSE '❌ members 表为空'
  END as "状态"
FROM members;

-- 显示前 5 个成员
SELECT 
  id as "成员ID",
  name as "姓名",
  invite_code as "邀请码"
FROM members
LIMIT 5;

-- =============================================
-- 7. 检查外键约束
-- =============================================
SELECT
  tc.constraint_name as "约束名称",
  tc.table_name as "表名",
  kcu.column_name as "字段名",
  ccu.table_name AS "关联表",
  ccu.column_name AS "关联字段"
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'photos';

-- =============================================
-- 8. 统计现有照片
-- =============================================
SELECT 
  COUNT(*) as "照片总数",
  COUNT(DISTINCT author_id) as "上传者数量",
  MIN(created_at) as "最早上传时间",
  MAX(created_at) as "最近上传时间"
FROM photos;

-- 按用户统计
SELECT 
  m.name as "上传者",
  COUNT(p.id) as "照片数量"
FROM photos p
LEFT JOIN members m ON p.author_id = m.id
GROUP BY m.name
ORDER BY COUNT(p.id) DESC
LIMIT 10;

-- =============================================
-- 9. 诊断建议
-- =============================================
DO $$
DECLARE
  table_exists BOOLEAN;
  bucket_exists BOOLEAN;
  policy_count INTEGER;
  member_count INTEGER;
BEGIN
  -- 检查表是否存在
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'photos'
  ) INTO table_exists;

  -- 检查 bucket 是否存在
  SELECT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'photos'
  ) INTO bucket_exists;

  -- 检查策略数量
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'photos';

  -- 检查成员数量
  SELECT COUNT(*) INTO member_count
  FROM members;

  RAISE NOTICE '========== 配置诊断 ==========';
  
  IF NOT table_exists THEN
    RAISE NOTICE '❌ photos 表不存在，请执行建表脚本';
  ELSE
    RAISE NOTICE '✅ photos 表已创建';
  END IF;

  IF NOT bucket_exists THEN
    RAISE NOTICE '❌ Storage bucket "photos" 不存在，请在 Dashboard 中创建';
  ELSE
    RAISE NOTICE '✅ Storage bucket "photos" 已创建';
  END IF;

  IF policy_count < 2 THEN
    RAISE NOTICE '⚠️ RLS 策略数量不足（当前: %），建议执行 supabase-photos-rls-fix.sql', policy_count;
  ELSE
    RAISE NOTICE '✅ RLS 策略已配置（% 条）', policy_count;
  END IF;

  IF member_count = 0 THEN
    RAISE NOTICE '❌ members 表为空，无法关联上传者';
  ELSE
    RAISE NOTICE '✅ members 表有 % 个成员', member_count;
  END IF;

  RAISE NOTICE '==============================';
END $$;

-- =============================================
-- 完成！
-- =============================================
-- 如果所有检查都通过，照片上传功能应该可以正常工作
-- 如果有任何 ❌ 或 ⚠️，请按照提示进行修复
