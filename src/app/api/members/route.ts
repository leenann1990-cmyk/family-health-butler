import { NextResponse } from 'next/server';
import { getDatabase, saveDatabase } from '@/lib/storage';
import { FamilyMember } from '@/types/health';

export async function GET() {
  const db = getDatabase();
  return NextResponse.json({ success: true, members: db.members });
}

export async function POST(request: Request) {
  try {
    const member: FamilyMember = await request.json();
    if (!member.id || !member.name) {
      return NextResponse.json({ success: false, error: 'Missing id or name' }, { status: 400 });
    }

    const db = getDatabase();
    // Check duplicate
    const index = db.members.findIndex((m) => m.id === member.id);
    if (index >= 0) {
      db.members[index] = member;
    } else {
      db.members.push(member);
    }

    saveDatabase(db);
    return NextResponse.json({ success: true, members: db.members });
  } catch (err: any) {
    console.error('Member API Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
