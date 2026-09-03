import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '家庭健康管家 - 智能慢病与全家健康总控',
  description: '专为家庭定制的智能健康管理系统，集成长辈极简大字打卡、呼吸机与血压精准监控、多成员与宠物健康档案、Google Drive/Sheets 云端持久化及 Gemini 24小时家庭医生。',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🩺</text></svg>',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen flex flex-col bg-stone-50 text-stone-800">
        {children}
      </body>
    </html>
  );
}
