import { NextResponse } from 'next/server';
import { generateDoctorSummary } from '@/lib/gemini';
import { getDatabase } from '@/lib/storage';

export async function POST(request: Request) {
  try {
    const { member = '爸爸' } = await request.json();
    const db = getDatabase();

    let recentData = '';
    if (member === '爸爸') {
      recentData = db.bpRecords
        .slice(0, 15)
        .map((r) => `${r.date} ${r.period}：高压${r.systolic}/低压${r.diastolic} mmHg，心率${r.heartRate} (${r.status})`)
        .join('\n');
    } else if (member === '妈妈') {
      recentData = db.cpapRecords
        .slice(0, 15)
        .map((r) => `${r.date}：使用时长${r.usageHours}h，压力${r.pressure}，漏气${r.leakRate}L/min，AHI ${r.ahi}，总AI ${r.totalAi}`)
        .join('\n');
    } else {
      recentData = '各项常规健康指标打卡正常。';
    }

    const summary = await generateDoctorSummary(member, recentData);
    return NextResponse.json({ success: true, summary });
  } catch (err: any) {
    console.error('Doctor summary API Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
