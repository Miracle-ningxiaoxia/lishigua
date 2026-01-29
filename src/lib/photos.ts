'use server'

import { supabase, Photo } from './supabase'

/**
 * 获取照片列表（按时间倒序）
 * @param limit 每页数量
 * @param offset 偏移量
 */
export async function getPhotos(limit: number = 20, offset: number = 0): Promise<Photo[]> {
  const { data, error } = await supabase
    .from('photos')
    .select(`
      *,
      author:members!photos_author_id_fkey (
        id,
        name,
        avatar
      )
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    return []
  }

  return data as Photo[]
}

/**
 * 获取单张照片详情
 * @param photoId 照片 ID
 */
export async function getPhotoById(photoId: string): Promise<Photo | null> {
  const { data, error } = await supabase
    .from('photos')
    .select(`
      *,
      author:members!photos_author_id_fkey (
        id,
        name,
        avatar
      )
    `)
    .eq('id', photoId)
    .single()

  if (error) {
    return null
  }

  return data as Photo
}

/**
 * 上传照片
 * @param photoData 照片数据
 */
export async function uploadPhoto(photoData: {
  url: string
  storage_path: string
  caption?: string
  author_id: string
  width?: number
  height?: number
  blur_hash?: string
}): Promise<Photo | null> {
  const { data, error } = await supabase
    .from('photos')
    .insert([photoData])
    .select()
    .single()

  if (error) {
    return null
  }

  return data as Photo
}
