export type MemberRole = 'elder' | 'admin' | 'pet';

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  role: MemberRole;
  avatar: string;
  age?: number;
  breed?: string; // for pets
  isElderlyModeDefault?: boolean;
  notes?: string;
}

export interface CpapRecord {
  id?: string;
  date: string;
  usageHours: number;
  pressure: number;
  leakRate: number;
  ahi: number;
  totalAi: number;
  centralAi: number;
  aiFeedback: string;
  timestamp?: string;
}

export interface BloodPressureRecord {
  id?: string;
  date: string;
  period: '早晨' | '晚间' | '其他';
  systolic: number; // 高压 (收缩压)
  diastolic: number; // 低压 (舒张压)
  heartRate: number;
  status: '正常' | '偏高需关注' | '危险高压';
  aiFeedback?: string;
  timestamp?: string;
}

export interface MealRecord {
  id?: string;
  date: string;
  mealType: '早餐' | '午餐' | '晚餐' | '加餐';
  dishName: string;
  saltAssessment: '低盐' | '适中' | '偏高' | '严重高盐';
  oilAssessment: '清淡' | '适中' | '油腻' | '重油重脂';
  advice: string;
  targetMember: string;
}

export interface MedicalArchiveRecord {
  id?: string;
  date: string;
  member: string;
  fileName: string;
  driveLink: string;
  summary: string;
  aiInterpretation: string;
}

export interface PetCareRecord {
  id?: string;
  date: string;
  petName: string;
  type: '疫苗接种' | '体外驱虫' | '体内驱虫' | '体重记录' | '就诊病历' | '日常症状';
  detail: string;
  nextDueDate?: string;
  notes?: string;
}

export interface HealthFocusAlert {
  id: string;
  level: 'green' | 'yellow' | 'red';
  title: string;
  description: string;
  actionText?: string;
  actionUrl?: string;
  timestamp: string;
}

export interface PhysicalExamMetric {
  id: string;
  name: string;
  category: '基础体态' | '心血管与血压' | '血糖代谢' | '血脂四项' | '肝肾与痛风' | '专科特检';
  value: string | number;
  unit: string;
  normalRange: string;
  status: 'normal' | 'attention' | 'danger';
  meaning: string;
  advice: string;
  trend?: 'up' | 'down' | 'stable';
}

export interface DoctorVisitGuide {
  recommendedDept: string;
  reason: string;
  checklist: string[];
  questionsToDoctor: string[];
  lifestyleAdvice: string[];
  nextReviewDate?: string;
}

export interface MemberHealthProfile {
  memberId: string;
  memberName: string;
  lastExamDate: string;
  metrics: PhysicalExamMetric[];
  visitGuide: DoctorVisitGuide;
}
