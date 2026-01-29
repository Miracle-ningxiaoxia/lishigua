// 社交功能相关类型定义

export interface Comment {
  id: string
  content: string
  author_id: string
  module_id: string // 标识是哪个页面的评论（如 'gallery', 'crew', 'anecdotes'）
  parent_id: string | null // 用于回复功能
  created_at: string
  // 关联的作者信息（通过 JOIN 查询获得）
  author?: {
    id: string
    name: string
    avatar: string | null
  }
  // 回复列表（如果是父评论）
  replies?: Comment[]
}

export interface Like {
  id: string
  user_id: string
  target_id: string // 点赞的目标 ID
  target_type: 'photo' | 'anecdote' | 'comment' // 点赞类型
  created_at: string
}

export interface Notification {
  id: string
  receiver_id: string // 接收通知的用户 ID
  actor_id: string // 触发通知的用户 ID
  type: 'like' | 'comment' | 'reply' // 通知类型
  content: string // 通知内容
  target_id: string // 关联的目标 ID（如被点赞的照片 ID）
  target_type: string // 关联的目标类型
  is_read: boolean // 是否已读
  created_at: string
  // 关联的触发者信息
  actor?: {
    id: string
    name: string
    avatar: string | null
  }
}

export interface LikeCount {
  targetId: string
  count: number
  hasLiked: boolean // 当前用户是否已点赞
}
