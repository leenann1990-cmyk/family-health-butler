import { FamilyMember } from '@/types/health';

export const INITIAL_MEMBERS: FamilyMember[] = [
  {
    id: 'mom',
    name: '妈妈',
    relation: '母亲',
    role: 'elder',
    avatar: '👩',
    isElderlyModeDefault: true,
    notes: '重点关注：夜间睡眠呼吸机使用达标情况（AHI<5, 漏气<24L/min）',
  },
  {
    id: 'dad',
    name: '爸爸',
    relation: '父亲',
    role: 'elder',
    avatar: '👨',
    isElderlyModeDefault: true,
    notes: '重点关注：每日早晚血压监控（目标高压<130, 低压<80）',
  },
  {
    id: 'me',
    name: '我 (Quentin)',
    relation: '本人/管家',
    role: 'admin',
    avatar: '🧑‍💻',
    isElderlyModeDefault: false,
    notes: '家庭健康管理者与数据同步总控',
  },
  {
    id: 'dog_1',
    name: '毛孩子 1 (可可)',
    relation: '爱犬',
    role: 'pet',
    avatar: '🐶',
    breed: '金毛寻回犬',
    isElderlyModeDefault: false,
    notes: '定期体内外驱虫、狂犬疫苗、体态与关节保护',
  },
  {
    id: 'dog_2',
    name: '毛孩子 2 (豆豆)',
    relation: '爱犬',
    role: 'pet',
    avatar: '🐕',
    breed: '贵宾犬',
    isElderlyModeDefault: false,
    notes: '牙齿护理、体重管理与日常饮食监控',
  },
];

export function getVisibleMembersForMode(isElderlyMode: boolean, members: FamilyMember[] = INITIAL_MEMBERS): FamilyMember[] {
  if (isElderlyMode) {
    // Elder mode only shows Mom and Dad
    return members.filter((m) => m.role === 'elder');
  }
  // Admin mode shows all members (humans + pets)
  return members;
}
