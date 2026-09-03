import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  keyFile: 'service_account.json',
  scopes: [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/spreadsheets',
  ],
});

const sheets = google.sheets({ version: 'v4', auth });

async function testSheets() {
  try {
    const res = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: '家庭健康数据库',
        },
      },
    });
    console.log('Created sheet via Sheets API:', res.data.spreadsheetId, res.data.spreadsheetUrl);
  } catch (err) {
    console.error('Sheets create error:', err.message);
  }
}

testSheets();
