import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { google } from 'googleapis';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const SERVICE_ACCOUNT_FILE = path.join(rootDir, 'service_account.json');

const auth = new google.auth.GoogleAuth({
  keyFile: SERVICE_ACCOUNT_FILE,
  scopes: [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/spreadsheets',
  ],
});

const drive = google.drive({ version: 'v3', auth });

async function listShared() {
  try {
    const res = await drive.files.list({
      q: "sharedWithMe = true or mimeType = 'application/vnd.google-apps.folder'",
      fields: 'files(id, name, mimeType, owners, shared)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });
    console.log('Shared / Accessible files:', JSON.stringify(res.data.files, null, 2));
  } catch (err) {
    console.error('List error:', err.message);
  }
}

listShared();
