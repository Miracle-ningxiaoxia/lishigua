// 成员数据结构
export interface CrewMember {
  id: string
  name: string
  nickname: string
  role: string
  quote: string
  avatarUrl: string
  color: string
  partnerId?: string // 配偶的 ID（如果有）
  size: 'small' | 'medium' | 'large' // 瀑布流卡片尺寸
}

// 情侣数据结构
export interface Couple {
  id: string
  partner1Id: string
  partner2Id: string
  coupleImage: string // 情侣合照路径
  declaration: string // 共同宣言
  accentColor: string // 代表色
}

// 14 位成员数据（7对情侣）
export const crewMembers: CrewMember[] = [
  {
    id: 'crew-1',
    name: '陈果子',
    nickname: '少爷',
    role: '氛围担当',
    quote: '王睿娃又在躲酒！！！',
    avatarUrl: '/images/crew/intro/cgz.jpg',
    color: '#f43f5e', // rose-500
    partnerId: 'crew-4', // 陈果子 ↔ 蓉姐
    size: 'medium',
  },
  {
    id: 'crew-2',
    name: '范大爷',
    nickname: '饭大爷',
    role: '武警队长',
    quote: '现役武警！哪个躲酒抓哪个',
    avatarUrl: '/images/crew/intro/fk.jpg',
    color: '#ec4899', // pink-500
    partnerId: 'crew-12', // 范大爷 ↔ 王老师
    size: 'large',
  },
  {
    id: 'crew-3',
    name: '范小车',
    nickname: '睡王',
    role: '睡神',
    quote: '等一哈倒酒，我先睡哈多',
    avatarUrl: '/images/crew/intro/fxj.jpg',
    color: '#8b5cf6', // violet-500
    partnerId: 'crew-14', // 范小车 ↔ 袁老师
    size: 'small',
  },
  {
    id: 'crew-4',
    name: '蓉姐',
    nickname: '豆豆',
    role: '吐槽担当',
    quote: '陈登睿是瓜皮',
    avatarUrl: '/images/crew/intro/ljr.jpg',
    color: '#a855f7', // purple-500
    partnerId: 'crew-1', // 蓉姐 ↔ 陈果子
    size: 'small',
  },
  {
    id: 'crew-5',
    name: '李果子',
    nickname: '李事瓜',
    role: '酒王',
    quote: '我这人没别的优点，就是能喝',
    avatarUrl: '/images/crew/intro/lqw.jpg',
    color: '#0ea5e9', // sky-500
    partnerId: 'crew-8', // 李果子 ↔ 邱雪晶
    size: 'medium',
  },
  {
    id: 'crew-6',
    name: '王睿娃',
    nickname: '吐王',
    role: '洗手池承包商',
    quote: '全市的ktv洗手池我李睿承包了！',
    avatarUrl: '/images/crew/intro/lr.jpg',
    color: '#06b6d4', // cyan-500
    partnerId: 'crew-7', // 王睿娃 ↔ 小霞
    size: 'small',
  },
  {
    id: 'crew-7',
    name: '小霞',
    nickname: '宁老师',
    role: '见证人',
    quote: '我作证，王睿是吐王',
    avatarUrl: '/images/crew/intro/nxx.jpg',
    color: '#10b981', // emerald-500
    partnerId: 'crew-6', // 小霞 ↔ 王睿娃
    size: 'large',
  },
  {
    id: 'crew-8',
    name: '邱雪晶',
    nickname: '小邱',
    role: '颜值担当',
    quote: '李清文最帅',
    avatarUrl: '/images/crew/intro/qxj.jpg',
    color: '#14b8a6', // teal-500
    partnerId: 'crew-5', // 邱雪晶 ↔ 李果子
    size: 'large',
  },
  {
    id: 'crew-9',
    name: '王燕',
    nickname: '烧烤大师',
    role: '灵魂烤手',
    quote: '你们就说我烤的烧烤好吃不',
    avatarUrl: '/images/crew/intro/sdx.jpg',
    color: '#f59e0b', // amber-500
    partnerId: 'crew-10', // 王燕 ↔ 舒兴友
    size: 'medium',
  },
  {
    id: 'crew-10',
    name: '舒兴友',
    nickname: '舒老板',
    role: '露营大王',
    quote: '请叫我露营大王！',
    avatarUrl: '/images/crew/intro/sxy.jpg',
    color: '#f97316', // orange-500
    partnerId: 'crew-9', // 舒兴友 ↔ 王燕
    size: 'small',
  },
  {
    id: 'crew-11',
    name: '唐蛋',
    nickname: '蛋蛋',
    role: '毒舌王',
    quote: '恕我直言，在座的各位都是垃圾',
    avatarUrl: '/images/crew/intro/trd.jpg',
    color: '#ef4444', // red-500
    partnerId: 'crew-13', // 唐蛋 ↔ 佳姐
    size: 'large',
  },
  {
    id: 'crew-12',
    name: '王老师',
    nickname: '王老师',
    role: '最差导师',
    quote: '你们真的是我带的最差的一届',
    avatarUrl: '/images/crew/intro/wls.jpg',
    color: '#dc2626', // red-600
    partnerId: 'crew-2', // 王老师 ↔ 范大爷
    size: 'medium',
  },
  {
    id: 'crew-13',
    name: '佳姐',
    nickname: '佳姐',
    role: '酒神',
    quote: '把唐蛋喝翻再来找我喝酒哈',
    avatarUrl: '/images/crew/intro/zyj.jpg',
    color: '#84cc16', // lime-500
    partnerId: 'crew-11', // 佳姐 ↔ 唐蛋
    size: 'medium',
  },
  {
    id: 'crew-14',
    name: '袁老师',
    nickname: '袁老师',
    role: '喝酒教练',
    quote: '大家好，我是袁老师，我教范小车怎么喝酒不睡觉',
    avatarUrl: '/images/crew/intro/fxjdx.jpg',
    color: '#22c55e', // green-500
    partnerId: 'crew-3', // 袁老师 ↔ 范小车
    size: 'medium',
  },
]

// 7 对情侣数据
export const couplesData: Couple[] = [
  {
    id: 'couple-1',
    partner1Id: 'crew-1', // 陈果子
    partner2Id: 'crew-4', // 蓉姐
    coupleImage: '/images/crew/couples/couple-1.jpg',
    declaration: '从相识到相守，我们是彼此最好的陪伴',
    accentColor: '#f43f5e',
  },
  {
    id: 'couple-2',
    partner1Id: 'crew-3', // 范小车
    partner2Id: 'crew-14', // 袁老师
    coupleImage: '/images/crew/couples/couple-2.jpg',
    declaration: '你睡觉的时候，我帮你挡酒',
    accentColor: '#8b5cf6',
  },
  {
    id: 'couple-3',
    partner1Id: 'crew-5', // 李果子
    partner2Id: 'crew-8', // 邱雪晶
    coupleImage: '/images/crew/couples/couple-3.jpg',
    declaration: '一个能喝，一个能吐，天生一对',
    accentColor: '#0ea5e9',
  },
  {
    id: 'couple-4',
    partner1Id: 'crew-6', // 王睿娃
    partner2Id: 'crew-7', // 小霞
    coupleImage: '/images/crew/couples/couple-4.jpg',
    declaration: '见证你的美好，陪伴你的每一天',
    accentColor: '#10b981',
  },
  {
    id: 'couple-5',
    partner1Id: 'crew-10', // 舒兴友
    partner2Id: 'crew-9', // 王燕
    coupleImage: '/images/crew/couples/couple-5.jpg',
    declaration: '你烤烧烤，我搭帐篷，一起露营到天明',
    accentColor: '#f59e0b',
  },
  {
    id: 'couple-6',
    partner1Id: 'crew-11', // 唐蛋
    partner2Id: 'crew-13', // 佳姐
    coupleImage: '/images/crew/couples/couple-6.jpg',
    declaration: '最暖的心，永远在一起',
    accentColor: '#ef4444',
  },
  {
    id: 'couple-7',
    partner1Id: 'crew-2', // 范大爷
    partner2Id: 'crew-12', // 王老师
    coupleImage: '/images/crew/couples/couple-7.jpg',
    declaration: '携手相伴，共度美好时光',
    accentColor: '#ec4899',
  },
]

// 辅助函数：根据两个成员 ID 查找情侣数据
export function findCoupleByMembers(memberId1: string, memberId2: string): Couple | undefined {
  return couplesData.find(
    couple =>
      (couple.partner1Id === memberId1 && couple.partner2Id === memberId2) ||
      (couple.partner1Id === memberId2 && couple.partner2Id === memberId1)
  )
}

// 辅助函数：根据成员 ID 查找其配偶
export function findPartner(memberId: string): CrewMember | undefined {
  const member = crewMembers.find(m => m.id === memberId)
  if (!member?.partnerId) return undefined
  return crewMembers.find(m => m.id === member.partnerId)
}
