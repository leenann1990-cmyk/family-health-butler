import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { google } from 'googleapis';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const SERVICE_ACCOUNT_FILE = path.join(rootDir, 'service_account.json');
const SHARED_PARENT_FOLDER_ID = '11TlEubSg8iCcYUlL3V9S30qTRIaHtSty'; // ❤️ 家庭健康管家 (Owned by leenann1990@gmail.com)

if (!fs.existsSync(SERVICE_ACCOUNT_FILE)) {
  console.error('❌ Error: service_account.json not found.');
  process.exit(1);
}

const auth = new google.auth.GoogleAuth({
  keyFile: SERVICE_ACCOUNT_FILE,
  scopes: [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/spreadsheets',
  ],
});

const drive = google.drive({ version: 'v3', auth });
const sheets = google.sheets({ version: 'v4', auth });

async function findOrCreateFolder(name, parentId) {
  try {
    const q = `'${parentId}' in parents and name = '${name}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;

    const res = await drive.files.list({
      q,
      fields: 'files(id, name)',
      spaces: 'drive',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    if (res.data.files && res.data.files.length > 0) {
      console.log(`📁 Found existing folder: ${name} (${res.data.files[0].id})`);
      return res.data.files[0].id;
    }

    const fileMetadata = {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId],
    };

    const folder = await drive.files.create({
      requestBody: fileMetadata,
      fields: 'id, name',
      supportsAllDrives: true,
    });

    console.log(`✅ Created new folder: ${name} (${folder.data.id})`);
    return folder.data.id;
  } catch (error) {
    console.error(`❌ Error finding/creating folder ${name}:`, error.message);
    throw error;
  }
}

async function findOrCreateSpreadsheet(title, parentId) {
  try {
    const q = `'${parentId}' in parents and name = '${title}' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`;

    const res = await drive.files.list({
      q,
      fields: 'files(id, name, webViewLink)',
      spaces: 'drive',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    let spreadsheetId = null;
    let webViewLink = '';

    if (res.data.files && res.data.files.length > 0) {
      spreadsheetId = res.data.files[0].id;
      webViewLink = res.data.files[0].webViewLink;
      console.log(`📊 Found existing spreadsheet: ${title} (${spreadsheetId})`);
    } else {
      // Create via Drive API directly inside user's shared parent folder
      const fileMetadata = {
        name: title,
        mimeType: 'application/vnd.google-apps.spreadsheet',
        parents: [parentId],
      };

      const file = await drive.files.create({
        requestBody: fileMetadata,
        fields: 'id, webViewLink',
        supportsAllDrives: true,
      });

      spreadsheetId = file.data.id;
      webViewLink = file.data.webViewLink;
      console.log(`✅ Created new Google Spreadsheet inside shared folder: ${title} (${spreadsheetId})`);
    }

    // Configure sheet tabs
    try {
      const sheetMeta = await sheets.spreadsheets.get({
        spreadsheetId,
      });
      const existingSheetTitles = (sheetMeta.data.sheets || []).map((s) => s.properties.title);

      const targetSheets = [
        '妈妈_呼吸机',
        '爸爸_血压',
        '体检与病历归档',
        '日常饮食记录',
        '宠物健康记录',
      ];

      const addSheetRequests = [];
      for (const t of targetSheets) {
        if (!existingSheetTitles.includes(t)) {
          addSheetRequests.push({
            addSheet: {
              properties: {
                title: t,
                gridProperties: { frozenRowCount: 1 },
              },
            },
          });
        }
      }

      if (addSheetRequests.length > 0) {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: {
            requests: addSheetRequests,
          },
        });
        console.log('✅ Created missing sheet tabs.');
      }

      // Write standard medical headers
      const headerData = [
        {
          range: '妈妈_呼吸机!A1:I1',
          values: [['日期', '使用时长(小时)', '压力(cmH2O)', '漏气量(升/分)', 'AHI(次/小时)', '总AI', '中央AI', 'AI健康评估/建议', '录入时间']],
        },
        {
          range: '爸爸_血压!A1:H1',
          values: [['日期', '时间段(早/晚)', '收缩压(高压)', '舒张压(低压)', '心率(次/分)', '血压状态', 'AI健康提示', '录入时间']],
        },
        {
          range: '体检与病历归档!A1:F1',
          values: [['上传日期', '家庭成员', '文件名称', '云盘链接', '核心指标摘要', 'AI解读建议']],
        },
        {
          range: '日常饮食记录!A1:G1',
          values: [['记录日期', '用餐时段', '菜品识别', '盐分评估', '油脂评估', '控钠减脂建议', '针对成员']],
        },
        {
          range: '宠物健康记录!A1:F1',
          values: [['记录日期', '宠物名称', '记录类型(疫苗/驱虫/体重/看诊)', '指标/项目内容', '下次提醒日期', '状态备注']],
        },
      ];

      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        requestBody: {
          valueInputOption: 'USER_ENTERED',
          data: headerData,
        },
      });

      console.log('✅ Initialized all 5 sheet headers successfully.');
    } catch (sheetErr) {
      console.warn('⚠️ Sheets config notice:', sheetErr.message);
    }

    return { id: spreadsheetId, link: webViewLink };
  } catch (error) {
    console.error(`❌ Error configuring spreadsheet:`, error.message);
    throw error;
  }
}

async function main() {
  console.log(`🚀 Connecting to shared parent folder: ${SHARED_PARENT_FOLDER_ID}...`);

  const mainFolder = await drive.files.get({
    fileId: SHARED_PARENT_FOLDER_ID,
    fields: 'id, name, webViewLink',
    supportsAllDrives: true,
  });
  console.log(`🎯 Successfully connected to: ${mainFolder.data.name} (${mainFolder.data.id})`);

  // Create Subfolders inside user's shared folder
  const momFolderId = await findOrCreateFolder('妈妈_健康归档', SHARED_PARENT_FOLDER_ID);
  const dadFolderId = await findOrCreateFolder('爸爸_健康归档', SHARED_PARENT_FOLDER_ID);
  const meFolderId = await findOrCreateFolder('本人_健康归档', SHARED_PARENT_FOLDER_ID);
  const petFolderId = await findOrCreateFolder('宠物_狗狗档案', SHARED_PARENT_FOLDER_ID);

  // Create or verify Spreadsheet inside user's shared folder
  const spreadsheet = await findOrCreateSpreadsheet('家庭健康数据库', SHARED_PARENT_FOLDER_ID);

  // Write .env.local
  const envPath = path.join(rootDir, '.env.local');
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }

  const updateEnvKey = (content, key, value) => {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(content)) {
      return content.replace(regex, `${key}=${value}`);
    }
    return content + `\n${key}=${value}`;
  };

  envContent = updateEnvKey(envContent, 'GOOGLE_MAIN_FOLDER_ID', SHARED_PARENT_FOLDER_ID);
  envContent = updateEnvKey(envContent, 'GOOGLE_MOM_FOLDER_ID', momFolderId);
  envContent = updateEnvKey(envContent, 'GOOGLE_DAD_FOLDER_ID', dadFolderId);
  envContent = updateEnvKey(envContent, 'GOOGLE_ME_FOLDER_ID', meFolderId);
  envContent = updateEnvKey(envContent, 'GOOGLE_PET_FOLDER_ID', petFolderId);
  envContent = updateEnvKey(envContent, 'GOOGLE_SPREADSHEET_ID', spreadsheet.id);
  if (!envContent.includes('GEMINI_API_KEY=')) {
    envContent += '\nGEMINI_API_KEY=';
  }

  fs.writeFileSync(envPath, envContent.trim() + '\n');

  console.log('\n======================================================');
  console.log('🎉 Google Cloud Infrastructure successfully initialized in your Drive!');
  console.log(`📁 Main Folder: ❤️ 家庭健康管家 (${SHARED_PARENT_FOLDER_ID})`);
  console.log(`📁 Mom Folder: 妈妈_健康归档 (${momFolderId})`);
  console.log(`📁 Dad Folder: 爸爸_健康归档 (${dadFolderId})`);
  console.log(`📁 Me Folder: 本人_健康归档 (${meFolderId})`);
  console.log(`📁 Pet Folder: 宠物_狗狗档案 (${petFolderId})`);
  console.log(`📊 Spreadsheet: 家庭健康数据库 (${spreadsheet.id})`);
  console.log('======================================================\n');
}

main().catch((err) => {
  console.error('Fatal error initializing cloud storage:', err);
  process.exit(1);
});
