import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  keyFile: 'service_account.json',
  scopes: ['https://www.googleapis.com/auth/drive'],
});

const drive = google.drive({ version: 'v3', auth });

async function check() {
  const res = await drive.files.list({
    q: "trashed = false and mimeType != 'application/vnd.google-apps.folder'",
    fields: 'files(id, name, mimeType, owners, parents, webViewLink)',
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });
  console.log('Existing non-folder files:', JSON.stringify(res.data.files, null, 2));
}

check().catch(console.error);
