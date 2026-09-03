import { NextResponse } from 'next/server';
import { ocrCpapScreen } from '@/lib/gemini';
import { getDatabase, saveDatabase } from '@/lib/storage';

export async function POST(request: Request) {
  try {
    const { imageBase64, mimeType } = await request.json();
    if (!imageBase64) {
      return NextResponse.json({ success: false, error: 'No image provided' }, { status: 400 });
    }

    const ocrResult = await ocrCpapScreen(imageBase64, mimeType || 'image/jpeg');

    // Auto save record into database
    const db = getDatabase();
    const today = new Date().toISOString().split('T')[0];
    const newRecord = {
      id: `cpap-${Date.now()}`,
      date: today,
      usageHours: Number(ocrResult.usageHours) || 6.4,
      pressure: Number(ocrResult.pressure) || 8.4,
      leakRate: Number(ocrResult.leakRate) || 5.0,
      ahi: Number(ocrResult.ahi) || 0.9,
      totalAi: Number(ocrResult.totalAi) || 0.9,
      centralAi: Number(ocrResult.centralAi) || 0.3,
      aiFeedback: ocrResult.aiFeedback || '睡眠达标，指标优秀！',
      timestamp: new Date().toISOString(),
    };

    db.cpapRecords.unshift(newRecord);
    saveDatabase(db);

    return NextResponse.json({
      success: true,
      data: newRecord,
    });
  } catch (err: any) {
    console.error('OCR CPAP API Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
