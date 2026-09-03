import { NextResponse } from 'next/server';
import { chatWithFamilyDoctor } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ success: false, error: 'Invalid messages array' }, { status: 400 });
    }

    const reply = await chatWithFamilyDoctor(messages);
    return NextResponse.json({ success: true, reply });
  } catch (err: any) {
    console.error('Chat API Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
