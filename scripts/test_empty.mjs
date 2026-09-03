import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  keyFile: 'service_account.json',
  scopes: ['https://www.googleapis.com/auth/drive'],
});

const drive = google.drive({ version: 'v3', auth });

async function testEmpty() {
  try {
    const res = await drive.files.create({
      requestBody: {
        name: 'test_empty.json',
        parents: ['11TlEubSg8iCcYUlL3V9S30qTRIaHtSty'],
      },
      fields: 'id, name',
      supportsAllDrives: true,
    });
    console.log('Created empty file:', res.data);
  } catch (err) {
    console.error('Empty file error:', err.message);
  }
}

testEmpty();
