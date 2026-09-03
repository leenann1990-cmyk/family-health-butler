import { google } from 'googleapis';
import { Readable } from 'stream';

const auth = new google.auth.GoogleAuth({
  keyFile: 'service_account.json',
  scopes: ['https://www.googleapis.com/auth/drive'],
});

const drive = google.drive({ version: 'v3', auth });

async function testUpdate() {
  try {
    const res = await drive.files.update({
      fileId: '1PLdqdLZ_ODR6_hqO0GXcoTt9wmifg59Z',
      media: {
        mimeType: 'application/json',
        body: Readable.from(JSON.stringify({ test: 'hello world', time: new Date().toISOString() })),
      },
      fields: 'id, name, size',
      supportsAllDrives: true,
    });
    console.log('Update success:', res.data);
  } catch (err) {
    console.error('Update error:', err.message);
  }
}

testUpdate();
