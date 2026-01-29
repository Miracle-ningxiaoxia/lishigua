'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Smile, Reply, Trash2, MessageCircle } from 'lucide-react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { toast } from 'sonner'
import {
  getComments,
  createComment,
  deleteComment,
  subscribeToComments,
  createNotification,
} from '@/lib/social'
import type { Comment } from '@/types/social'
import LikeButton from './LikeButton'

interface CommentSectionProps {
  moduleId: string // 模块标识（如 'gallery', 'crew', 'anecdotes'）
  targetOwnerId?: string // 内容作者 ID，用于创建通知
  isOpen: boolean
  onClose: () => void
}

// 表情选择器数据
const EMOJI_LIST = ['😊', '😂', '❤️', '👍', '🎉', '😍', '🤔', '👏', '🔥', '💯', '✨', '🌟']

export default function CommentSection({
  moduleId,
  targetOwnerId,
  isOpen,
  onClose,
}: CommentSectionProps) {
  const { data: session } = useSession()
  const [comments, setComments] = useState<Comment[]>([])
  const [commentText, setCommentText] = useState('')
  const [replyTo, setReplyTo] = useState<Comment | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const commentListRef = useRef<HTMLDivElement>(null)
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null)

  // 加载评论
  useEffect(() => {
    if (!isOpen) return

    const fetchComments = async () => {
      const data = await getComments(moduleId)
      setComments(data)
    }

    fetchComments()

    // 清理之前的订阅（如果存在）
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe()
      subscriptionRef.current = null
    }

    // 订阅实时更新 - 同时处理 INSERT 和 DELETE，确保列表和计数强同步
    const subscription = subscribeToComments(moduleId, {
      onInsert: (newComment) => {
        if (newComment.parent_id) {
          // 回复评论，更新对应父评论的 replies
          setComments((prev) =>
            prev.map((comment) => {
              if (comment.id === newComment.parent_id) {
                // 检查回复是否已存在（避免重复）
                const replyExists = comment.replies?.some(r => r.id === newComment.id)
                if (replyExists) {
                  return comment
                }
                return { ...comment, replies: [...(comment.replies || []), newComment] }
              }
              return comment
            })
          )
        } else {
          // 新的顶层评论 - 检查是否已存在（避免重复）
          setComments((prev) => {
            const exists = prev.some(c => c.id === newComment.id)
            if (exists) {
              return prev
            }
            return [newComment, ...prev]
          })
        }
      },
      onDelete: (commentId) => {
        // DELETE 事件：从列表中移除评论
        setComments((prev) =>
          prev
            .filter((c) => c.id !== commentId)
            .map((c) => ({
              ...c,
              replies: c.replies?.filter((r) => r.id !== commentId),
            }))
        )
      },
    })

    subscriptionRef.current = subscription

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
        subscriptionRef.current = null
      }
    }
  }, [isOpen, moduleId])

  // 自动调整 textarea 高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [commentText])

  // 提交评论
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user?.id || !commentText.trim() || isSubmitting) return

    setIsSubmitting(true)

    try {
      const newComment = await createComment(
        commentText.trim(),
        session.user.id,
        moduleId,
        replyTo?.id || null
      )

      if (newComment) {
        // ✅ 立即更新本地状态，不等待 Realtime
        if (newComment.parent_id) {
          // 回复评论
          setComments((prev) =>
            prev.map((comment) =>
              comment.id === newComment.parent_id
                ? { ...comment, replies: [...(comment.replies || []), newComment] }
                : comment
            )
          )
        } else {
          // 新的顶层评论
          setComments((prev) => [newComment, ...prev])
        }

        // 清空输入
        setCommentText('')
        setReplyTo(null)
        setShowEmojiPicker(false)

        // 🎉 Toast 成功提示
        toast.success('评论发表成功', {
          description: replyTo ? '你的回复已发送' : '你的评论已发表',
          duration: 2000,
        })

        // 创建通知
        if (replyTo && replyTo.author_id !== session.user.id) {
          // 回复通知
          await createNotification(
            replyTo.author_id,
            session.user.id,
            'reply',
            `回复了你的评论：${commentText.slice(0, 20)}${commentText.length > 20 ? '...' : ''}`,
            newComment.id,
            'comment'
          )
        } else if (targetOwnerId && targetOwnerId !== session.user.id && !replyTo) {
          // 评论通知
          await createNotification(
            targetOwnerId,
            session.user.id,
            'comment',
            `评论了你的内容：${commentText.slice(0, 20)}${commentText.length > 20 ? '...' : ''}`,
            newComment.id,
            moduleId
          )
        }

        // 滚动到顶部查看新评论
        if (commentListRef.current) {
          commentListRef.current.scrollTo({ top: 0, behavior: 'smooth' })
        }
      } else {
        // ❌ Toast 失败提示
        toast.error('评论发表失败', {
          description: '请稍后重试',
          duration: 3000,
        })
      }
    } catch (error) {
      console.error('提交评论出错:', error)
      toast.error('评论发表失败', {
        description: '网络错误，请稍后重试',
        duration: 3000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // 删除评论
  const handleDelete = async (commentId: string) => {
    if (!session?.user?.id) return

    try {
      const success = await deleteComment(commentId, session.user.id)
      if (success) {
        // ✅ 立即更新本地状态，不等待 Realtime
        setComments((prev) =>
          prev
            .filter((c) => c.id !== commentId)
            .map((c) => ({
              ...c,
              replies: c.replies?.filter((r) => r.id !== commentId),
            }))
        )

        // 🎉 Toast 成功提示
        toast.success('评论已删除', {
          duration: 2000,
        })
      } else {
        // ❌ Toast 失败提示
        toast.error('删除失败', {
          description: '你只能删除自己的评论',
          duration: 3000,
        })
      }
    } catch (error) {
      console.error('删除评论出错:', error)
      toast.error('删除失败', {
        description: '网络错误，请稍后重试',
        duration: 3000,
      })
    }
  }

  // 插入表情
  const insertEmoji = (emoji: string) => {
    setCommentText((prev) => prev + emoji)
    setShowEmojiPicker(false)
    textareaRef.current?.focus()
  }

  if (!session?.user) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* 评论抽屉 */}
          <motion.div
            className="fixed right-0 top-0 bottom-0 w-full md:w-[480px] bg-black/90 backdrop-blur-2xl border-l border-white/10 z-[100] flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* 头部 */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-white/70" />
                <h3 className="text-lg font-semibold text-white">评论</h3>
                <span className="text-sm text-white/40 font-mono">
                  {comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)}
                </span>
              </div>
              <motion.button
                onClick={onClose}
                className="w-10 h-10 rounded-full backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                data-cursor="hover"
              >
                <X className="w-4 h-4 text-white/70 group-hover:text-white transition-colors" />
              </motion.button>
            </div>

            {/* 评论列表 */}
            <div
              ref={commentListRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
            >
              {comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessageCircle className="w-16 h-16 text-white/10 mb-4" />
                  <p className="text-white/40 text-sm">还没有评论，快来抢沙发吧！</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    onReply={setReplyTo}
                    onDelete={handleDelete}
                    currentUserId={session.user.id!}
                  />
                ))
              )}
            </div>

            {/* 输入区域 */}
            <div className="p-6 border-t border-white/10 space-y-3">
              {/* 回复提示 */}
              {replyTo && (
                <motion.div
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center gap-2">
                    <Reply className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-white/60">
                      回复 <span className="text-white font-medium">{replyTo.author?.name}</span>
                    </span>
                  </div>
                  <button
                    onClick={() => setReplyTo(null)}
                    className="text-white/40 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              )}

              {/* 输入框 */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={replyTo ? `回复 ${replyTo.author?.name}...` : '写下你的评论...'}
                    className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 resize-none focus:outline-none focus:border-white/30 transition-colors"
                    rows={1}
                    maxLength={500}
                  />

                  {/* 表情按钮 */}
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="absolute right-3 top-3 text-white/40 hover:text-white transition-colors"
                  >
                    <Smile className="w-5 h-5" />
                  </button>

                  {/* 表情选择器 */}
                  <AnimatePresence>
                    {showEmojiPicker && (
                      <motion.div
                        className="absolute right-0 bottom-full mb-2 p-3 rounded-xl bg-black/90 backdrop-blur-xl border border-white/10 grid grid-cols-6 gap-2"
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                      >
                        {EMOJI_LIST.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => insertEmoji(emoji)}
                            className="w-10 h-10 flex items-center justify-center text-2xl hover:bg-white/10 rounded-lg transition-colors"
                          >
                            {emoji}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 发送按钮 */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/30 font-mono">
                    {commentText.length}/500
                  </span>
                  <motion.button
                    type="submit"
                    disabled={!commentText.trim() || isSubmitting}
                    className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl text-white text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    data-cursor="hover"
                  >
                    <Send className="w-4 h-4" />
                    {isSubmitting ? '发送中...' : '发送'}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// 评论项组件 - 使用 React.memo 优化渲染性能
const CommentItem = React.memo(function CommentItem({
  comment,
  onReply,
  onDelete,
  currentUserId,
  isReply = false,
}: {
  comment: Comment
  onReply: (comment: Comment) => void
  onDelete: (id: string) => void
  currentUserId: string
  isReply?: boolean
}) {
  const isOwner = comment.author_id === currentUserId
  const formattedTime = formatDistanceToNow(new Date(comment.created_at), {
    addSuffix: true,
    locale: zhCN,
  })

  return (
    <motion.div
      className={`flex gap-3 ${isReply ? 'ml-12 mt-4' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* 头像 */}
      <div className="flex-shrink-0">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-purple-900/40 to-blue-900/40 ring-2 ring-white/10">
          {comment.author?.avatar ? (
            <Image
              src={comment.author.avatar}
              alt={comment.author.name}
              width={40}
              height={40}
              className="w-full h-full object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/60 text-sm font-medium">
              {comment.author?.name?.[0]}
            </div>
          )}
        </div>
      </div>

      {/* 评论内容 */}
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white">{comment.author?.name}</span>
          <span className="text-xs text-white/30 font-mono">{formattedTime}</span>
        </div>

        <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
          {comment.content}
        </p>

        {/* 操作按钮 */}
        <div className="flex items-center gap-3">
          <LikeButton
            targetId={comment.id}
            targetType="comment"
            targetOwnerId={comment.author_id}
            size="sm"
            showCount={true}
          />

          {!isReply && (
            <button
              onClick={() => onReply(comment)}
              className="text-xs text-white/40 hover:text-white transition-colors flex items-center gap-1"
              data-cursor="hover"
            >
              <Reply className="w-3 h-3" />
              回复
            </button>
          )}

          {isOwner && (
            <button
              onClick={() => onDelete(comment.id)}
              className="text-xs text-white/40 hover:text-red-400 transition-colors flex items-center gap-1"
              data-cursor="hover"
            >
              <Trash2 className="w-3 h-3" />
              删除
            </button>
          )}
        </div>

        {/* 回复列表 */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="space-y-4 mt-4">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                onReply={onReply}
                onDelete={onDelete}
                currentUserId={currentUserId}
                isReply={true}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
})
