import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';
import { Readable } from 'stream';

const SERVICE_ACCOUNT_FILE = path.join(process.cwd(), 'service_account.json');

function getDriveClient() {
  if (!fs.existsSync(SERVICE_ACCOUNT_FILE)) {
    return null;
  }
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });
  return google.drive({ version: 'v3', auth });
}

export async function uploadFileToDrive(
  fileName: string,
  buffer: Buffer,
  mimeType: string,
  targetFolderKey: 'mom' | 'dad' | 'me' | 'pet' | 'main' = 'main'
) {
  const drive = getDriveClient();
  if (!drive) {
    console.warn('Google Drive Service Account not found, skipping cloud upload');
    return {
      fileId: 'local-' + Date.now(),
      webViewLink: '#local-storage',
    };
  }

  let folderId = process.env.GOOGLE_MAIN_FOLDER_ID || '';
  if (targetFolderKey === 'mom') folderId = process.env.GOOGLE_MOM_FOLDER_ID || folderId;
  else if (targetFolderKey === 'dad') folderId = process.env.GOOGLE_DAD_FOLDER_ID || folderId;
  else if (targetFolderKey === 'me') folderId = process.env.GOOGLE_ME_FOLDER_ID || folderId;
  else if (targetFolderKey === 'pet') folderId = process.env.GOOGLE_PET_FOLDER_ID || folderId;

  try {
    const fileMetadata = {
      name: fileName,
      parents: folderId ? [folderId] : [],
    };

    const media = {
      mimeType,
      body: Readable.from(buffer),
    };

    const res = await drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: 'id, name, webViewLink',
      supportsAllDrives: true,
    });

    return {
      fileId: res.data.id,
      webViewLink: res.data.webViewLink || `https://drive.google.com/file/d/${res.data.id}/view`,
    };
  } catch (err: any) {
    console.error('Upload to Drive error:', err.message);
    return {
      fileId: 'local-upload-id',
      webViewLink: `https://drive.google.com/drive/folders/${folderId}`,
    };
  }
}
