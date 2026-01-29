'use client'

import imageCompression from 'browser-image-compression'
import { encode } from 'blurhash'

/**
 * 压缩图片
 * @param file 原始图片文件
 * @param maxSizeMB 最大文件大小（MB）
 * @returns 压缩后的文件
 */
export async function compressImage(file: File, maxSizeMB: number = 2): Promise<File> {
  const options = {
    maxSizeMB,
    maxWidthOrHeight: 3840, // 4K 宽度
    useWebWorker: true,
    fileType: 'image/jpeg',
    initialQuality: 0.9, // 保持高质量
  }

  try {
    const compressedFile = await imageCompression(file, options)
    
    // 修复文件名：保留原始扩展名，避免 .blob 后缀
    const originalExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const newFileName = file.name.replace(/\.[^.]+$/, `.${originalExtension}`)
    
    // 创建新的 File 对象，使用正确的文件名
    const fixedFile = new File([compressedFile], newFileName, {
      type: compressedFile.type || 'image/jpeg',
      lastModified: Date.now(),
    })
    
    return fixedFile
  } catch (error) {
    return file // 如果压缩失败，返回原文件
  }
}

/**
 * 生成 BlurHash
 * @param file 图片文件
 * @returns BlurHash 字符串
 */
export async function generateBlurHash(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    img.onload = () => {
      // 缩小到 32x32 用于生成 BlurHash
      const scale = Math.min(32 / img.width, 32 / img.height)
      canvas.width = Math.floor(img.width * scale)
      canvas.height = Math.floor(img.height * scale)

      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height)

      const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height)
      if (!imageData) {
        reject(new Error('无法获取图片数据'))
        return
      }

      try {
        const hash = encode(imageData.data, canvas.width, canvas.height, 4, 3)
        resolve(hash)
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => {
      reject(new Error('图片加载失败'))
    }

    img.src = URL.createObjectURL(file)
  })
}

/**
 * 获取图片尺寸
 * @param file 图片文件
 * @returns 图片宽高
 */
export async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()

    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      })
      URL.revokeObjectURL(img.src)
    }

    img.onerror = () => {
      reject(new Error('无法加载图片'))
      URL.revokeObjectURL(img.src)
    }

    img.src = URL.createObjectURL(file)
  })
}

/**
 * 验证图片文件
 * @param file 文件
 * @returns 是否为有效图片
 */
export function isValidImageFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  return validTypes.includes(file.type)
}

/**
 * 生成唯一文件名
 * @param originalName 原始文件名
 * @returns 新文件名
 */
export function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(2, 9)
  const extension = originalName.split('.').pop() || 'jpg'
  return `${timestamp}_${randomStr}.${extension}`
}
