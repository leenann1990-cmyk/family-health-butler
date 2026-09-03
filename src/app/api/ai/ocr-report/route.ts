import { NextResponse } from 'next/server';
import { ocrMedicalReport } from '@/lib/gemini';
import { getDatabase, saveDatabase } from '@/lib/storage';
import { uploadFileToDrive } from '@/lib/google-drive';

export async function POST(request: Request) {
  try {
    const { imageBase64, mimeType = 'image/jpeg', targetMember = '妈妈' } = await request.json();
    if (!imageBase64) {
      return NextResponse.json({ success: false, error: 'No image provided' }, { status: 400 });
    }

    const reportData = await ocrMedicalReport(imageBase64, mimeType);

    // Save into cloud drive if possible
    const buffer = Buffer.from(imageBase64.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    const folderKey = targetMember === '妈妈' ? 'mom' : targetMember === '爸爸' ? 'dad' : 'me';
    const fileName = `${reportData.reportDate || new Date().toISOString().split('T')[0]}_${targetMember}_${reportData.reportTitle || '体检报告'}.jpg`;
    
    const driveUpload = await uploadFileToDrive(fileName, buffer, mimeType, folderKey);

    const db = getDatabase();
    const newArchive = {
      id: `archive-${Date.now()}`,
      date: reportData.reportDate || new Date().toISOString().split('T')[0],
      member: targetMember,
      fileName,
      driveLink: driveUpload.webViewLink,
      summary: reportData.abnormalFindings || '常规检查指标',
      aiInterpretation: reportData.aiInterpretation || '指标已归档，保持常规随访。',
    };

    db.medicalArchives.unshift(newArchive);
    saveDatabase(db);

    return NextResponse.json({ success: true, data: newArchive });
  } catch (err: any) {
    console.error('Report OCR API Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
