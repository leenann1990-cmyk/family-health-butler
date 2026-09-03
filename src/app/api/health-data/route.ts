import { NextResponse } from 'next/server';
import { getDatabase, saveDatabase } from '@/lib/storage';

export async function GET() {
  try {
    const db = getDatabase();
    return NextResponse.json({ success: true, data: db });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, record } = body;
    const db = getDatabase();

    const timestamp = new Date().toISOString();
    const id = `${type}-${Date.now()}`;

    if (type === 'cpap') {
      db.cpapRecords.unshift({ ...record, id, timestamp });
    } else if (type === 'bp') {
      db.bpRecords.unshift({ ...record, id, timestamp });
    } else if (type === 'meal') {
      db.mealRecords.unshift({ ...record, id });
    } else if (type === 'archive') {
      db.medicalArchives.unshift({ ...record, id });
    } else if (type === 'pet') {
      db.petRecords.unshift({ ...record, id });
    } else if (type === 'batch-import') {
      // Batch importing historical ChatGPT/CSV data
      if (record.cpap && Array.isArray(record.cpap)) {
        db.cpapRecords = [...record.cpap, ...db.cpapRecords];
      }
      if (record.bp && Array.isArray(record.bp)) {
        db.bpRecords = [...record.bp, ...db.bpRecords];
      }
      if (record.pet && Array.isArray(record.pet)) {
        db.petRecords = [...record.pet, ...db.petRecords];
      }
    } else {
      return NextResponse.json({ success: false, error: 'Unknown record type' }, { status: 400 });
    }

    saveDatabase(db);
    return NextResponse.json({ success: true, message: 'Record saved successfully', data: db });
  } catch (err: any) {
    console.error('Error saving health data:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
