'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, Image as ImageIcon, Loader2, Check, AlertCircle } from 'lucide-react'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { uploadPhotoToStorage } from '@/lib/upload'
import { compressImage, generateBlurHash, getImageDimensions, isValidImageFile } from '@/lib/image-utils'
import { toast } from 'sonner'

interface UploadItem {
  id: string
  file: File
  preview: string
  status: 'pending' | 'compressing' | 'uploading' | 'success' | 'error'
  progress: number
  caption: string
  error?: string
  width?: number
  height?: number
}

interface PhotoUploaderProps {
  onUploadComplete?: () => void
  onClose?: () => void
}

export default function PhotoUploader({ onUploadComplete, onClose }: PhotoUploaderProps) {
  const { data: session } = useSession()
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 处理文件选择
  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter(isValidImageFile)

    if (validFiles.length === 0) {
      toast.error('请选择有效的图片文件（JPG、PNG、WEBP、GIF）')
      return
    }

    const newItems: UploadItem[] = await Promise.all(
      validFiles.map(async (file) => {
        const dimensions = await getImageDimensions(file).catch(() => ({ width: 0, height: 0 }))
        return {
          id: Math.random().toString(36).substring(7),
          file,
          preview: URL.createObjectURL(file),
          status: 'pending' as const,
          progress: 0,
          caption: '',
          width: dimensions.width,
          height: dimensions.height,
        }
      })
    )

    setUploadItems((prev) => [...prev, ...newItems])
  }, [])

  // 处理拖拽
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles]
  )

  // 处理粘贴
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return

      const files: File[] = []
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile()
          if (file) files.push(file)
        }
      }

      if (files.length > 0) {
        handleFiles(files)
        toast.success(`已粘贴 ${files.length} 张图片`)
      }
    }

    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, [handleFiles])

  // 上传单张照片 - 返回成功状态
  const uploadSinglePhoto = async (item: UploadItem): Promise<boolean> => {
    if (!session?.user?.id) {
      toast.error('登录状态已过期，请重新登录')
      setUploadItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: 'error', error: '未登录' } : i))
      )
      return false
    }

    try {
      // 1. 压缩
      setUploadItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: 'compressing', progress: 10 } : i))
      )

      const compressedFile = await compressImage(item.file, 2)

      setUploadItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, progress: 30 } : i))
      )

      // 2. 生成 BlurHash
      const blurHash = await generateBlurHash(compressedFile)

      setUploadItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, progress: 50, status: 'uploading' } : i))
      )

      // 3. 上传
      const formData = new FormData()
      formData.append('file', compressedFile)
      formData.append('caption', item.caption)
      formData.append('authorId', session.user.id)
      formData.append('width', item.width?.toString() || '0')
      formData.append('height', item.height?.toString() || '0')
      formData.append('blurHash', blurHash)

      const result = await uploadPhotoToStorage(formData)

      if (result.success) {
        setUploadItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, status: 'success', progress: 100 } : i))
        )
        toast.success(`《${item.file.name}》上传成功！`)
        return true
      } else {
        throw new Error(result.error || '上传失败')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      setUploadItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? { ...i, status: 'error', error: errorMessage }
            : i
        )
      )
      toast.error(`《${item.file.name}》上传失败: ${errorMessage}`)
      return false
    }
  }

  // 上传所有照片
  const handleUploadAll = async () => {
    const pendingItems = uploadItems.filter((item) => item.status === 'pending')

    if (pendingItems.length === 0) {
      toast.warning('没有待上传的照片')
      return
    }

    if (!session?.user?.id) {
      toast.error('登录状态已过期，请重新登录')
      return
    }

    // 逐个上传并追踪结果
    let successCount = 0
    let failedCount = 0

    for (const item of pendingItems) {
      const success = await uploadSinglePhoto(item)
      if (success) {
        successCount++
      } else {
        failedCount++
      }
    }

    // 显示汇总提示
    if (successCount > 0 && failedCount === 0) {
      toast.success(`全部上传成功！共 ${successCount} 张照片 🎉`)
    } else if (successCount > 0 && failedCount > 0) {
      toast.warning(`上传完成：成功 ${successCount} 张，失败 ${failedCount} 张`)
    } else if (failedCount > 0) {
      toast.error(`上传失败：${failedCount} 张照片上传失败`)
    }

    // 如果有成功的上传，先刷新列表，再关闭窗口
    if (successCount > 0) {
      onUploadComplete?.()
      
      // 延迟关闭，让用户看到成功提示和刷新效果
      setTimeout(() => {
        onClose?.()
      }, 1500)
    }
  }

  // 移除单项
  const handleRemove = (id: string) => {
    setUploadItems((prev) => {
      const item = prev.find((i) => i.id === id)
      if (item) URL.revokeObjectURL(item.preview)
      return prev.filter((i) => i.id !== id)
    })
  }

  // 更新描述
  const handleCaptionChange = (id: string, caption: string) => {
    setUploadItems((prev) => prev.map((i) => (i.id === id ? { ...i, caption } : i)))
  }

  // 清理 URL
  useEffect(() => {
    return () => {
      uploadItems.forEach((item) => URL.revokeObjectURL(item.preview))
    }
  }, [uploadItems])

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* 背景遮罩 */}
      <motion.div
        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />

      {/* 主容器 */}
      <motion.div
        className="relative z-10 w-full max-w-4xl max-h-[90vh] flex flex-col bg-black/60 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-white">上传照片</h2>
            <p className="text-white/60 text-sm mt-1">支持拖拽、粘贴或点击选择图片</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all"
            data-cursor="hover"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 上传区域 */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {uploadItems.length === 0 ? (
            // 空状态 - 拖拽区
            <div
              className={`relative h-64 border-2 border-dashed rounded-2xl transition-all ${
                isDragging
                  ? 'border-purple-400 bg-purple-400/10'
                  : 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer" data-cursor="hover">
                <motion.div
                  animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Upload className={`w-16 h-16 mb-4 ${isDragging ? 'text-purple-400' : 'text-white/40'}`} />
                </motion.div>
                <p className="text-white/70 text-lg font-medium mb-2">
                  {isDragging ? '松开鼠标上传' : '拖拽图片到这里'}
                </p>
                <p className="text-white/50 text-sm">或点击选择文件 / 使用 Ctrl+V 粘贴</p>
                <p className="text-white/30 text-xs mt-2">支持 JPG、PNG、WEBP、GIF</p>
              </div>
            </div>
          ) : (
            // 图片列表
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {uploadItems.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="relative flex gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10"
                  >
                    {/* 缩略图 */}
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
                      <Image
                        src={item.preview}
                        alt="预览"
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                      {/* 状态图标 */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        {item.status === 'success' && (
                          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                            <Check className="w-5 h-5 text-white" />
                          </div>
                        )}
                        {item.status === 'error' && (
                          <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                            <AlertCircle className="w-5 h-5 text-white" />
                          </div>
                        )}
                        {(item.status === 'compressing' || item.status === 'uploading') && (
                          <div className="w-8 h-8">
                            <Loader2 className="w-8 h-8 text-white animate-spin" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 信息区 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium truncate">{item.file.name}</p>
                          <p className="text-white/50 text-xs">
                            {(item.file.size / 1024 / 1024).toFixed(2)} MB
                            {item.width && item.height && ` · ${item.width}×${item.height}`}
                          </p>
                        </div>
                        {item.status === 'pending' && (
                          <button
                            onClick={() => handleRemove(item.id)}
                            className="w-6 h-6 flex items-center justify-center rounded-full bg-white/5 hover:bg-red-500/20 text-white/50 hover:text-red-400 transition-all"
                            data-cursor="hover"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* 描述输入 */}
                      {item.status === 'pending' && (
                        <input
                          type="text"
                          placeholder="添加描述（可选）"
                          value={item.caption}
                          onChange={(e) => handleCaptionChange(item.id, e.target.value)}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:border-purple-400/50 transition-all"
                        />
                      )}

                      {/* 进度条 */}
                      {(item.status === 'compressing' || item.status === 'uploading') && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs text-white/60 mb-1">
                            <span>{item.status === 'compressing' ? '压缩中...' : '上传中...'}</span>
                            <span>{item.progress}%</span>
                          </div>
                          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-purple-400 to-pink-400"
                              initial={{ width: 0 }}
                              animate={{ width: `${item.progress}%` }}
                              transition={{ duration: 0.3 }}
                            />
                          </div>
                        </div>
                      )}

                      {/* 错误信息 */}
                      {item.status === 'error' && item.error && (
                        <p className="text-red-400 text-xs mt-2">{item.error}</p>
                      )}

                      {/* 成功提示 */}
                      {item.status === 'success' && (
                        <p className="text-green-400 text-xs mt-2">✓ 上传成功</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* 继续添加按钮 */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 border-2 border-dashed border-white/20 rounded-2xl text-white/60 hover:text-white hover:border-white/40 hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                data-cursor="hover"
              >
                <ImageIcon className="w-5 h-5" />
                <span>继续添加图片</span>
              </button>
            </div>
          )}
        </div>

        {/* 底部操作栏 */}
        <div className="flex items-center justify-between p-6 border-t border-white/10">
          <div className="text-white/60 text-sm">
            {uploadItems.length > 0 && (
              <>
                共 {uploadItems.length} 张 · 待上传{' '}
                {uploadItems.filter((i) => i.status === 'pending').length} 张
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all"
              data-cursor="hover"
            >
              取消
            </button>
            <button
              onClick={handleUploadAll}
              disabled={uploadItems.filter((i) => i.status === 'pending').length === 0}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-600 text-white font-medium transition-all disabled:cursor-not-allowed"
              data-cursor="hover"
            >
              开始上传
            </button>
          </div>
        </div>
      </motion.div>

      {/* 隐藏的文件选择器 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />
    </motion.div>
  )
}
