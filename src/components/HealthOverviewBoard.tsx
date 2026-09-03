'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Heart, 
  Wind, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Calendar, 
  ChevronRight, 
  Dog, 
  Clock,
  FileText,
  TrendingUp,
  Activity
} from 'lucide-react';
import { AppDatabase } from '@/lib/storage';

interface Props {
  data: AppDatabase;
  onRefresh?: () => void;
}

export default function HealthOverviewBoard({ data }: Props) {
  const latestCpap = data.cpapRecords[0];
  const latestBp = data.bpRecords[0];
  const latestPet = data.petRecords[0];

  // Derive status
  const isCpapGood = latestCpap ? latestCpap.usageHours >= 4 && latestCpap.ahi < 5 : true;
  const isBpNormal = latestBp ? latestBp.systolic < 130 && latestBp.diastolic < 80 : true;
  const isBpWarning = latestBp ? latestBp.systolic >= 130 && latestBp.systolic < 140 : false;
  const isBpCritical = latestBp ? latestBp.systolic >= 140 : false;

  return (
    <div className="space-y-6">
      {/* Top Banner: AI Daily Health Focus Briefing */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white p-6 sm:p-7 shadow-xl shadow-emerald-950/10">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center gap-2.5 mb-3">
          <div className="p-1.5 rounded-lg bg-emerald-400/20 text-emerald-300">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-xs uppercase tracking-wider font-bold text-emerald-300">
            Gemini AI 全家健康焦点简报
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-100 font-medium ml-auto">
            今日最新评估
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2">
          {isBpNormal && isCpapGood
            ? '全家人今日核心体征总体平稳达标！'
            : isBpWarning
            ? '全家健康总体稳定，爸爸血压略有波动需清淡饮食。'
            : '注意：今日有重点指标需要关注，请长辈按时服药。'}
        </h2>

        <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed max-w-3xl">
          👵 <strong>妈妈</strong>：昨夜呼吸机佩戴 <strong>{latestCpap?.usageHours || 6.4}小时</strong>，AHI 仅 <strong>{latestCpap?.ahi || 0.9}次/小时</strong>（优于标准），面罩气密性极佳；<br className="hidden sm:inline" />
          👴 <strong>爸爸</strong>：今晨血压 <strong>{latestBp?.systolic || 128}/{latestBp?.diastolic || 78} mmHg</strong>（心率 {latestBp?.heartRate || 72}），{isBpNormal ? '控制在安全范围内' : '略偏高，请提醒按时服药控盐'}；<br className="hidden sm:inline" />
          🐶 <strong>毛孩子</strong>：体外驱虫已覆盖，无过敏反应。
        </p>

        <div className="mt-5 pt-4 border-t border-emerald-700/60 flex flex-wrap items-center justify-between gap-3 text-xs text-emerald-200">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>数据底座：Google Sheets & Drive 实时同步中</span>
          </div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-white font-semibold hover:text-emerald-300 transition-colors"
          >
            查看多成员详细趋势折线图
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 🚦 Health Traffic Lights: 3 Key Pillar Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Mom Card */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-3xl p-2 rounded-2xl bg-amber-50 border border-amber-100">👵</div>
              <div>
                <h3 className="font-bold text-stone-900 text-lg">妈妈 · 睡眠呼吸机</h3>
                <span className="text-xs text-stone-600">夜间呼吸暂停 (OSAHS) 监测</span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5" /> 达标 🟢
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 p-3 bg-stone-50 rounded-xl mb-4 text-center">
            <div>
              <div className="text-xs text-stone-600">使用时长</div>
              <div className="text-lg font-bold text-stone-900">{latestCpap?.usageHours || 6.4}<span className="text-xs font-normal">h</span></div>
            </div>
            <div>
              <div className="text-xs text-stone-600">AHI指数</div>
              <div className="text-lg font-bold text-emerald-700">{latestCpap?.ahi || 0.9}</div>
            </div>
            <div>
              <div className="text-xs text-stone-600">漏气量</div>
              <div className="text-lg font-bold text-stone-900">{latestCpap?.leakRate || 5}<span className="text-xs font-normal">L/m</span></div>
            </div>
          </div>

          <div className="text-xs text-stone-600 line-clamp-2 mb-4 bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100">
            💬 <strong>AI建议</strong>：{latestCpap?.aiFeedback || '昨夜深度睡眠充足，面罩贴合度佳！'}
          </div>

          <Link
            href="/elder"
            className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm text-center flex items-center justify-center gap-1.5 shadow-sm transition-colors"
          >
            <Wind className="w-4 h-4" />
            拍照打卡 / 录入昨夜数据
          </Link>
        </div>

        {/* Dad Card */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-3xl p-2 rounded-2xl bg-blue-50 border border-blue-100">👴</div>
              <div>
                <h3 className="font-bold text-stone-900 text-lg">爸爸 · 血压监控</h3>
                <span className="text-xs text-stone-600">原发性高血压 2 级日常管理</span>
              </div>
            </div>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                isBpCritical
                  ? 'bg-rose-100 text-rose-800'
                  : isBpWarning
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {isBpCritical ? '🔴 偏高警报' : isBpWarning ? '🟡 需关注' : '🟢 正常'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 p-3 bg-stone-50 rounded-xl mb-4 text-center">
            <div>
              <div className="text-xs text-stone-600">高压 (收缩)</div>
              <div className={`text-lg font-bold ${latestBp && latestBp.systolic >= 130 ? 'text-amber-600' : 'text-stone-900'}`}>
                {latestBp?.systolic || 128}
              </div>
            </div>
            <div>
              <div className="text-xs text-stone-600">低压 (舒张)</div>
              <div className="text-lg font-bold text-stone-900">{latestBp?.diastolic || 78}</div>
            </div>
            <div>
              <div className="text-xs text-stone-600">心率</div>
              <div className="text-lg font-bold text-stone-900">{latestBp?.heartRate || 72}</div>
            </div>
          </div>

          <div className="text-xs text-stone-600 line-clamp-2 mb-4 bg-stone-50 p-2.5 rounded-lg border border-stone-200">
            💬 <strong>状态</strong>：{latestBp?.aiFeedback || '早晚定时测量，保持少盐饮食。'}
          </div>

          <Link
            href="/elder"
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm text-center flex items-center justify-center gap-1.5 shadow-sm transition-colors"
          >
            <Heart className="w-4 h-4" />
            快速输入血压
          </Link>
        </div>

        {/* Pet & Routine Card */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-3xl p-2 rounded-2xl bg-emerald-50 border border-emerald-100">🐶</div>
              <div>
                <h3 className="font-bold text-stone-900 text-lg">毛孩子 · 护理档案</h3>
                <span className="text-xs text-stone-600">可可 (金毛) & 豆豆 (贵宾)</span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
              🐾 保护中
            </span>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between p-2.5 bg-stone-50 rounded-xl text-xs">
              <span className="font-medium text-stone-700">💊 体外驱虫状态</span>
              <span className="text-emerald-700 font-bold">已完成 (下次 30 天后)</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-stone-50 rounded-xl text-xs">
              <span className="font-medium text-stone-700">⚖️ 体重监控</span>
              <span className="text-stone-900 font-bold">可可 28.5kg · 豆豆 4.2kg</span>
            </div>
          </div>

          <div className="text-xs text-stone-600 line-clamp-2 mb-4 bg-purple-50/50 p-2.5 rounded-lg border border-purple-100">
            🔒 <strong>隐私隔离保护</strong>：长辈手机端自动屏蔽宠物与个人模块，仅管理端可见。
          </div>

          <Link
            href="/admin"
            className="w-full py-2.5 rounded-xl bg-stone-800 hover:bg-stone-900 text-white font-bold text-sm text-center flex items-center justify-center gap-1.5 shadow-sm transition-colors"
          >
            <Dog className="w-4 h-4" />
            进入管理端查看全部记录
          </Link>
        </div>
      </div>

      {/* Action Gateway row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/elder"
          className="p-5 rounded-2xl bg-amber-50 border border-amber-200 hover:bg-amber-100/80 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-600 text-white flex items-center justify-center text-2xl shadow-md shadow-amber-600/20">
              👵
            </div>
            <div>
              <div className="font-bold text-stone-900 text-base group-hover:text-amber-900">
                进入长辈极简模式
              </div>
              <p className="text-xs text-amber-800/80">大字体 · 拍照识别 · 免密打卡</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-amber-600 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          href="/admin"
          className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100/80 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center text-xl shadow-md shadow-emerald-700/20">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-stone-900 text-base group-hover:text-emerald-900">
                子女管理端 · 趋势看板
              </div>
              <p className="text-xs text-emerald-800/80">多成员图表 · 云端病历库 · 问诊单</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-emerald-700 group-hover:translate-x-1 transition-transform" />
        </Link>

        <div
          onClick={() => {
            const btn = document.getElementById('open-ai-chat-btn');
            if (btn) btn.click();
          }}
          className="p-5 rounded-2xl bg-teal-50 border border-teal-200 hover:bg-teal-100/80 transition-all flex items-center justify-between group cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center text-xl shadow-md shadow-teal-600/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-stone-900 text-base group-hover:text-teal-900">
                24小时 AI 家庭医生
              </div>
              <p className="text-xs text-teal-800/80">随时提问 · 慢病与饮食解答</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-teal-600 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
}
