'use server'

import { supabase } from './supabase'
import { uploadPhoto } from './photos'

interface UploadResult {
  success: boolean
  photoId?: string
  error?: string
  url?: string
}

/**
 * 上传照片到 Supabase Storage 并创建数据库记录
 * @param formData 包含图片和元数据的 FormData
 */
export async function uploadPhotoToStorage(formData: FormData): Promise<UploadResult> {
  try {
    const file = formData.get('file') as File
    const caption = formData.get('caption') as string
    const authorId = formData.get('authorId') as string
    const width = parseInt(formData.get('width') as string)
    const height = parseInt(formData.get('height') as string)
    const blurHash = formData.get('blurHash') as string

    if (!file || !authorId) {
      return { success: false, error: '缺少必要参数' }
    }

    // 生成唯一文件名（优化：加入用户 ID 避免冲突）
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 9)
    
    // 从原始文件名或 MIME type 获取正确的扩展名
    let extension = 'jpg' // 默认扩展名
    if (file.name && file.name.includes('.') && !file.name.endsWith('.blob')) {
      extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    } else if (file.type) {
      // 从 MIME type 推断扩展名
      const typeMap: Record<string, string> = {
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
        'image/gif': 'gif',
      }
      extension = typeMap[file.type] || 'jpg'
    }
    
    const fileName = `${timestamp}_${randomStr}.${extension}`
    // 按用户 ID 组织文件：photos/用户ID/文件名
    const storagePath = `photos/${authorId}/${fileName}`
    
    // 上传到 Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('photos')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      // 提供更友好的错误信息
      let errorMessage = uploadError.message
      if (errorMessage.includes('row-level security')) {
        errorMessage = 'Storage 权限不足，请检查 Supabase RLS 配置'
      } else if (errorMessage.includes('exceeded')) {
        errorMessage = '文件过大，请压缩后重试'
      }
      return { success: false, error: errorMessage }
    }

    // 获取公共 URL
    const { data: urlData } = supabase.storage.from('photos').getPublicUrl(storagePath)

    if (!urlData?.publicUrl) {
      return { success: false, error: '无法获取图片 URL' }
    }

    // 创建数据库记录
    const photo = await uploadPhoto({
      url: urlData.publicUrl,
      storage_path: storagePath,
      caption: caption || undefined,
      author_id: authorId,
      width: width || undefined,
      height: height || undefined,
      blur_hash: blurHash || undefined,
    })

    if (!photo) {
      // 如果数据库记录创建失败，删除已上传的文件
      await supabase.storage.from('photos').remove([storagePath])
      return { 
        success: false, 
        error: '数据库写入失败，可能是权限问题，请检查 photos 表的 RLS 策略' 
      }
    }

    return {
      success: true,
      photoId: photo.id,
      url: urlData.publicUrl,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    }
  }
}

/**
 * 删除照片（从 Storage 和数据库）
 * @param photoId 照片 ID
 * @param storagePath Storage 路径
 */
export async function deletePhoto(photoId: string, storagePath: string): Promise<boolean> {
  try {
    // 删除 Storage 文件
    const { error: storageError } = await supabase.storage.from('photos').remove([storagePath])

    if (storageError) {
      return false
    }

    // 删除数据库记录
    const { error: dbError } = await supabase.from('photos').delete().eq('id', photoId)

    if (dbError) {
      return false
    }

    return true
  } catch (error) {
    return false
  }
}
