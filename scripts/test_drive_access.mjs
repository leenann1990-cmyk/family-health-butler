import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { google } from 'googleapis';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const SERVICE_ACCOUNT_FILE = path.join(rootDir, 'service_account.json');
const TARGET_PARENT_FOLDER_ID = '15CbbAVZTC1bff1BkyauJ5jTLxiuTDwAv';

const auth = new google.auth.GoogleAuth({
  keyFile: SERVICE_ACCOUNT_FILE,
  scopes: [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/spreadsheets',
  ],
});

const drive = google.drive({ version: 'v3', auth });

async function testAccess() {
  console.log('Testing access to folder:', TARGET_PARENT_FOLDER_ID);
  try {
    const res = await drive.files.get({
      fileId: TARGET_PARENT_FOLDER_ID,
      fields: 'id, name, owners, capabilities',
      supportsAllDrives: true,
    });
    console.log('✅ Access succeeded:', res.data);
  } catch (err) {
    console.error('❌ Access failed:', err.message);
  }
}

testAccess();
