import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 定义 Member 类型
export interface Member {
  id: string;
  name: string;
  invite_code: string;
  couple_id: number | null;
  avatar?: string | null; // 头像 URL
  created_at: string;
}

// 定义 Photo 类型
export interface Photo {
  id: string;
  url: string;
  storage_path: string;
  caption?: string | null;
  author_id: string;
  width?: number | null;
  height?: number | null;
  blur_hash?: string | null;
  created_at: string;
  // 关联的作者信息（通过 JOIN 查询获得）
  author?: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

// 验证邀请码
export async function verifyInviteCode(inviteCode: string): Promise<Member | null> {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('invite_code', inviteCode)
    .single();

  if (error || !data) {
    return null;
  }

  return data as Member;
}
