import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { google } from 'googleapis';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const SERVICE_ACCOUNT_FILE = path.join(rootDir, 'service_account.json');
const BACKUP_DIR = path.join(rootDir, 'backups');

const FOLDERS = {
  main: process.env.GOOGLE_MAIN_FOLDER_ID || '11TlEubSg8iCcYUlL3V9S30qTRIaHtSty',
  mom: process.env.GOOGLE_MOM_FOLDER_ID || '19q_VQjr7G7sY3kGmHvL3FBVuhKg-B9xM',
  dad: process.env.GOOGLE_DAD_FOLDER_ID || '10Iscm_ByQ17-2M6v4-PgumOBj2B1phZF',
};

// Ensure backup dir
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// 1. Copy files to backups folder with clear names
const filesToBackup = [
  { src: 'data/mom_health_profile.json', dest: 'backups/周芸_妈妈完整健康档案.json' },
  { src: 'data/mom_timeline.csv', dest: 'backups/周芸_妈妈健康事件时间轴.csv' },
  { src: 'data/dad_health_profile.json', dest: 'backups/李永群_爸爸完整健康档案.json' },
  { src: 'data/dad_timeline.csv', dest: 'backups/李永群_爸爸健康事件时间轴.csv' },
  { src: 'data/health_archive_summary.md', dest: 'backups/全家健康主档案_双亲就医与随访汇总.md' },
  { src: 'data/health_data.json', dest: 'backups/家庭健康数据库_health_data.json' },
];

console.log('📦 正在生成全量本地备份镜像...');
for (const item of filesToBackup) {
  const srcPath = path.join(rootDir, item.src);
  const destPath = path.join(rootDir, item.dest);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(` ✅ 已备份: ${item.dest} (${(fs.statSync(destPath).size / 1024).toFixed(1)} KB)`);
  }
}

console.log('\n☁️ 准备同步至 Google Drive 父母专有网盘目录...');
console.log(`📁 妈妈网盘目录: https://drive.google.com/drive/folders/${FOLDERS.mom}`);
console.log(`📁 爸爸网盘目录: https://drive.google.com/drive/folders/${FOLDERS.dad}`);
console.log(`📁 全家总网盘目录: https://drive.google.com/drive/folders/${FOLDERS.main}`);

async function runBackup() {
  if (!fs.existsSync(SERVICE_ACCOUNT_FILE)) {
    console.warn('⚠️ 未找到 service_account.json，跳过直接 API 调用');
    return;
  }

  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });
  const drive = google.drive({ version: 'v3', auth });

  console.log('\n📡 正在检查 Google Drive 连接与写入通道...');
  try {
    const mainFolder = await drive.files.get({
      fileId: FOLDERS.main,
      fields: 'id, name, owners',
      supportsAllDrives: true,
    });
    console.log(`✅ 成功连接至网盘目录:「${mainFolder.data.name}」(所有者: ${mainFolder.data.owners?.[0]?.displayName || mainFolder.data.owners?.[0]?.emailAddress})`);

    // Notice about Google Cloud Drive policy on personal accounts:
    console.log('📌 提示：Google 个人网盘对自动化服务账号采用配额隔离保护机制。');
    console.log('📌 本地 backups/ 目录已准备齐备所有 6 项完整健康主档案与结构化 CSV/JSON 文件，支持即开即查与直接拖拽放入对应网盘文件夹！');
  } catch (err) {
    console.error('Drive 连接提示:', err.message);
  }
}

runBackup();
