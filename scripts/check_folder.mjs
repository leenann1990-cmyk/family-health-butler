import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { google } from 'googleapis';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const SERVICE_ACCOUNT_FILE = path.join(rootDir, 'service_account.json');
const SHARED_PARENT_FOLDER_ID = '11TlEubSg8iCcYUlL3V9S30qTRIaHtSty';

const auth = new google.auth.GoogleAuth({
  keyFile: SERVICE_ACCOUNT_FILE,
  scopes: [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/spreadsheets',
  ],
});

const drive = google.drive({ version: 'v3', auth });

async function listContents() {
  const res = await drive.files.list({
    q: `'${SHARED_PARENT_FOLDER_ID}' in parents and trashed = false`,
    fields: 'files(id, name, mimeType)',
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });
  console.log('Folder contents:', JSON.stringify(res.data.files, null, 2));
}

listContents();
