'use client';

import React, { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import HealthOverviewBoard from '@/components/HealthOverviewBoard';
import AIChatDrawer from '@/components/AIChatDrawer';
import { AppDatabase } from '@/lib/storage';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const [db, setDb] = useState<AppDatabase | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHealthData = async () => {
    try {
      const res = await fetch('/api/health-data');
      const data = await res.json();
      if (data.success && data.data) {
        setDb(data.data);
      }
    } catch (err) {
      console.error('Failed to load health data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Navigation />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-96 gap-3">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            <p className="text-sm text-stone-600">正在同步家庭健康数据底座...</p>
          </div>
        ) : db ? (
          <HealthOverviewBoard data={db} onRefresh={fetchHealthData} />
        ) : (
          <div className="text-center py-20 text-stone-600">数据加载异常，请刷新重试</div>
        )}
      </main>

      <AIChatDrawer />

      {/* Warm Footer */}
      <footer className="border-t border-stone-200 bg-white py-6 text-center text-xs text-stone-600">
        <p>❤️ 家庭健康管家 · Google Gemini AI 多模态守护 · Google Drive / Sheets 云端存储</p>
      </footer>
    </div>
  );
}
