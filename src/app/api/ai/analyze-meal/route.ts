import { NextResponse } from 'next/server';
import { analyzeMealImage } from '@/lib/gemini';
import { getDatabase, saveDatabase } from '@/lib/storage';

export async function POST(request: Request) {
  try {
    const { imageBase64, mimeType, targetMember = '爸爸' } = await request.json();
    if (!imageBase64) {
      return NextResponse.json({ success: false, error: 'No image provided' }, { status: 400 });
    }

    const analysis = await analyzeMealImage(imageBase64, mimeType || 'image/jpeg');

    const db = getDatabase();
    const today = new Date().toISOString().split('T')[0];
    const newMeal = {
      id: `meal-${Date.now()}`,
      date: today,
      mealType: (new Date().getHours() < 10 ? '早餐' : new Date().getHours() < 15 ? '午餐' : '晚餐') as any,
      dishName: analysis.dishName,
      saltAssessment: analysis.saltAssessment,
      oilAssessment: analysis.oilAssessment,
      advice: analysis.advice,
      targetMember,
    };

    db.mealRecords.unshift(newMeal);
    saveDatabase(db);

    return NextResponse.json({ success: true, data: newMeal });
  } catch (err: any) {
    console.error('Meal API Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
