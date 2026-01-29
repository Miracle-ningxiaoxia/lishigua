// 社交功能相关的 Supabase 操作函数
import { supabase } from './supabase'
import type { Comment, Like, Notification, LikeCount } from '@/types/social'

// ==================== 评论相关 ====================

/**
 * 获取指定模块的评论列表（包含作者信息和回复）
 */
export async function getComments(moduleId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      author:members!comments_author_id_fkey(id, name, avatar)
    `)
    .eq('module_id', moduleId)
    .is('parent_id', null) // 只获取顶层评论
    .order('created_at', { ascending: false })

  if (error) {
    console.error('获取评论失败:', error)
    return []
  }

  // 为每个顶层评论获取回复
  const commentsWithReplies = await Promise.all(
    (data || []).map(async (comment) => {
      const replies = await getReplies(comment.id)
      return {
        ...comment,
        replies,
      }
    })
  )

  return commentsWithReplies as Comment[]
}

/**
 * 获取指定评论的回复列表
 */
export async function getReplies(parentId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      author:members!comments_author_id_fkey(id, name, avatar)
    `)
    .eq('parent_id', parentId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('获取回复失败:', error)
    return []
  }

  return data as Comment[]
}

/**
 * 创建新评论
 */
export async function createComment(
  content: string,
  authorId: string,
  moduleId: string,
  parentId: string | null = null
): Promise<Comment | null> {
  const { data, error } = await supabase
    .from('comments')
    .insert({
      content,
      author_id: authorId,
      module_id: moduleId,
      parent_id: parentId,
    })
    .select(`
      *,
      author:members!comments_author_id_fkey(id, name, avatar)
    `)
    .single()

  if (error) {
    console.error('创建评论失败:', error)
    return null
  }

  return data as Comment
}

/**
 * 删除评论（只能删除自己的评论）
 */
export async function deleteComment(commentId: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)
    .eq('author_id', userId)

  if (error) {
    console.error('删除评论失败:', error)
    return false
  }

  return true
}

/**
 * 获取指定模块的评论总数（包含回复）
 */
export async function getCommentCount(moduleId: string): Promise<number> {
  const { count, error } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('module_id', moduleId)

  if (error) {
    console.error('获取评论数量失败:', error)
    return 0
  }

  return count || 0
}

// ==================== 点赞相关 ====================

/**
 * 获取指定目标的点赞数量和当前用户是否已点赞
 */
export async function getLikeCount(
  targetId: string,
  targetType: string,
  userId: string
): Promise<LikeCount> {
  // 获取总点赞数
  const { count, error: countError } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('target_id', targetId)
    .eq('target_type', targetType)

  // 检查当前用户是否已点赞
  const { data: userLike, error: likeError } = await supabase
    .from('likes')
    .select('id')
    .eq('target_id', targetId)
    .eq('target_type', targetType)
    .eq('user_id', userId)
    .maybeSingle()

  if (countError || likeError) {
    console.error('获取点赞信息失败:', countError || likeError)
  }

  return {
    targetId,
    count: count || 0,
    hasLiked: !!userLike,
  }
}

/**
 * 切换点赞状态（点赞/取消点赞）
 */
export async function toggleLike(
  targetId: string,
  targetType: string,
  userId: string,
  targetOwnerId?: string // 被点赞内容的作者 ID，用于创建通知
): Promise<{ success: boolean; hasLiked: boolean }> {
  // 检查是否已点赞
  const { data: existingLike } = await supabase
    .from('likes')
    .select('id')
    .eq('target_id', targetId)
    .eq('target_type', targetType)
    .eq('user_id', userId)
    .maybeSingle()

  if (existingLike) {
    // 取消点赞
    const { error } = await supabase.from('likes').delete().eq('id', existingLike.id)

    if (error) {
      console.error('取消点赞失败:', error)
      return { success: false, hasLiked: true }
    }

    return { success: true, hasLiked: false }
  } else {
    // 添加点赞
    const { error } = await supabase.from('likes').insert({
      user_id: userId,
      target_id: targetId,
      target_type: targetType,
    })

    if (error) {
      console.error('点赞失败:', error)
      return { success: false, hasLiked: false }
    }

    // 创建通知（如果提供了目标作者 ID 且不是自己点赞自己）
    if (targetOwnerId && targetOwnerId !== userId) {
      await createNotification(
        targetOwnerId,
        userId,
        'like',
        `给你的${targetType === 'photo' ? '照片' : targetType === 'comment' ? '评论' : '内容'}点了赞`,
        targetId,
        targetType
      )
    }

    return { success: true, hasLiked: true }
  }
}

// ==================== 通知相关 ====================

/**
 * 获取用户的通知列表
 */
export async function getNotifications(userId: string): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select(`
      *,
      actor:members!notifications_actor_id_fkey(id, name, avatar)
    `)
    .eq('receiver_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('获取通知失败:', error)
    return []
  }

  return data as Notification[]
}

/**
 * 获取未读通知数量
 */
export async function getUnreadCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('receiver_id', userId)
    .eq('is_read', false)

  if (error) {
    console.error('获取未读通知数量失败:', error)
    return 0
  }

  return count || 0
}

/**
 * 标记通知为已读
 */
export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)

  if (error) {
    console.error('标记通知已读失败:', error)
    return false
  }

  return true
}

/**
 * 标记所有通知为已读
 */
export async function markAllNotificationsAsRead(userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('receiver_id', userId)
    .eq('is_read', false)

  if (error) {
    console.error('标记所有通知已读失败:', error)
    return false
  }

  return true
}

/**
 * 创建新通知
 */
export async function createNotification(
  receiverId: string,
  actorId: string,
  type: 'like' | 'comment' | 'reply',
  content: string,
  targetId: string,
  targetType: string
): Promise<Notification | null> {
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      receiver_id: receiverId,
      actor_id: actorId,
      type,
      content,
      target_id: targetId,
      target_type: targetType,
    })
    .select(`
      *,
      actor:members!notifications_actor_id_fkey(id, name, avatar)
    `)
    .single()

  if (error) {
    console.error('创建通知失败:', error)
    return null
  }

  return data as Notification
}

// ==================== 实时订阅相关 ====================

/**
 * 订阅评论变化（用于实时更新评论列表和计数）
 * 支持 INSERT 和 DELETE 事件，确保列表和计数强同步
 * 
 * 注意：DELETE 事件的 payload.old 默认只包含主键，无法使用 filter
 * 因此我们订阅所有变化，然后在回调中手动过滤
 */
export function subscribeToComments(
  moduleId: string,
  callbacks: {
    onInsert?: (comment: Comment) => void
    onDelete?: (commentId: string) => void
  }
) {
  // 使用唯一的 channel 名称（加入随机 ID），避免多个组件订阅冲突
  const channelId = `comments:${moduleId}:${Math.random().toString(36).substring(7)}`
  const channel = supabase.channel(channelId)

  // 监听 INSERT 事件 - 可以使用 filter
  if (callbacks.onInsert) {
    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'comments',
        filter: `module_id=eq.${moduleId}`,
      },
      async (payload) => {
        // 获取完整的评论信息（包含作者）
        const { data } = await supabase
          .from('comments')
          .select(`
            *,
            author:members!comments_author_id_fkey(id, name, avatar)
          `)
          .eq('id', payload.new.id)
          .single()

        if (data && callbacks.onInsert) {
          callbacks.onInsert(data as Comment)
        }
      }
    )
  }

  // 监听 DELETE 事件 - 不使用 filter，因为 payload.old 默认只包含主键
  // 建议在 Supabase 中执行: ALTER TABLE comments REPLICA IDENTITY FULL;
  if (callbacks.onDelete) {
    channel.on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'comments',
      },
      (payload) => {
        const deletedId = payload.old.id as string
        const deletedModuleId = payload.old.module_id as string | undefined

        // 如果 payload.old 包含 module_id（REPLICA IDENTITY FULL 已设置）
        if (deletedModuleId) {
          // 仅当 module_id 匹配时才触发回调
          if (deletedModuleId === moduleId && callbacks.onDelete) {
            callbacks.onDelete(deletedId)
          }
        } else {
          // 如果不包含 module_id，则触发回调（让调用方决定如何处理）
          // CommentButton 会重新查询计数，CommentSection 会过滤
          if (callbacks.onDelete) {
            callbacks.onDelete(deletedId)
          }
        }
      }
    )
  }

  return channel.subscribe()
}

/**
 * 订阅通知变化（用于实时更新通知提示）
 */
export function subscribeToNotifications(
  userId: string,
  callback: (notification: Notification) => void
) {
  return supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `receiver_id=eq.${userId}`,
      },
      async (payload) => {
        // 获取完整的通知信息（包含触发者）
        const { data } = await supabase
          .from('notifications')
          .select(`
            *,
            actor:members!notifications_actor_id_fkey(id, name, avatar)
          `)
          .eq('id', payload.new.id)
          .single()

        if (data) {
          callback(data as Notification)
        }
      }
    )
    .subscribe()
}
