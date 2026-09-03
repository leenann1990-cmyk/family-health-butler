'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from 'recharts';
import { BloodPressureRecord, CpapRecord } from '@/types/health';

interface Props {
  bpData: BloodPressureRecord[];
  cpapData: CpapRecord[];
}

export default function StatCharts({ bpData, cpapData }: Props) {
  const [dadMetricTab, setDadMetricTab] = useState<'bp' | 'biochem'>('bp');

  // Format BP for Recharts (chronological order)
  const bpChartData = [...bpData]
    .reverse()
    .slice(-14)
    .map((d) => ({
      date: d.date.slice(5) + ` (${d.period})`,
      高压: d.systolic,
      低压: d.diastolic,
      心率: d.heartRate,
    }));

  // Dad's longitudinal biochemical test trends (ESD recovery, Anemia HGB, Creatinine)
  const dadBiochemData = [
    { date: '04-22 (仁济活检)', HGB血红蛋白: 133, Cr肌酐: 110, CA724胃肿瘤标: 20 },
    { date: '05-11 (ESD术前)', HGB血红蛋白: 124, Cr肌酐: 124, CA724胃肿瘤标: 31.4 },
    { date: '06-09 (术后恢复)', HGB血红蛋白: 97, Cr肌酐: 112, CA724胃肿瘤标: 18 },
    { date: '06-17 (仁济复查)', HGB血红蛋白: 122, Cr肌酐: 100, CA724胃肿瘤标: 12 },
    { date: '06-22 (贫血复核)', HGB血红蛋白: 120, Cr肌酐: 102, CA724胃肿瘤标: 9.02 },
    { date: '07-13 (贵医复查)', HGB血红蛋白: 122, Cr肌酐: 106.97, CA724胃肿瘤标: 9.02 },
  ];

  // Format CPAP for Recharts (chronological order)
  const cpapChartData = [...cpapData]
    .reverse()
    .slice(-14)
    .map((d) => ({
      date: d.date.slice(5),
      AHI: d.ahi,
      中央AI: d.centralAi ?? 0,
      使用时长: d.usageHours,
      漏气量: d.leakRate,
    }));

  return (
    <div className="space-y-8">
      {/* 1. 爸爸专区：血压走势 / 生化检验长期恢复趋势 */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="font-bold text-stone-900 text-lg flex items-center gap-2">
              <span>👨 爸爸 (李永群) · 核心体征与生化恢复趋势</span>
            </h3>
            <p className="text-xs text-stone-600 mt-0.5">
              {dadMetricTab === 'bp'
                ? '绿色虚线：正常高压上限 130 mmHg / 低压上限 80 mmHg'
                : '追踪胃 ESD 术后血红蛋白 (HGB)、肾肌酐 (Cr) 与胃标志物 (CA72-4) 显著回落趋势'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setDadMetricTab('bp')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                dadMetricTab === 'bp'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              家庭血压 & 心率
            </button>
            <button
              onClick={() => setDadMetricTab('biochem')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                dadMetricTab === 'biochem'
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              生化检验 (贫血/肌酐/肿瘤标)
            </button>
          </div>
        </div>

        {dadMetricTab === 'bp' ? (
          <div>
            <div className="flex items-center justify-end gap-3 text-xs mb-3">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-rose-500 inline-block" /> 高压 (收缩)</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> 低压 (舒张)</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> 心率</span>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={bpChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis domain={[50, 160]} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                    }}
                  />
                  <ReferenceLine y={130} stroke="#10b981" strokeDasharray="4 4" label={{ value: '高压警戒 130', fill: '#059669', fontSize: 10, position: 'insideTopRight' }} />
                  <ReferenceLine y={80} stroke="#3b82f6" strokeDasharray="4 4" label={{ value: '低压警戒 80', fill: '#2563eb', fontSize: 10, position: 'insideTopRight' }} />
                  <Line type="monotone" dataKey="高压" stroke="#f43f5e" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="低压" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="心率" stroke="#10b981" strokeWidth={1.5} strokeDasharray="3 3" dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-end gap-3 text-xs mb-3">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-600 inline-block" /> HGB 血红蛋白 (目标≥120)</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-600 inline-block" /> Cr 肌酐 (正常57-111)</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-rose-500 inline-block" /> CA72-4 肿瘤标 (正常&lt;10)</span>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dadBiochemData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis domain={[0, 150]} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                    }}
                  />
                  <ReferenceLine y={120} stroke="#10b981" strokeDasharray="4 4" label={{ value: 'HGB 正常下限 120', fill: '#059669', fontSize: 10, position: 'insideTopRight' }} />
                  <ReferenceLine y={10} stroke="#f43f5e" strokeDasharray="4 4" label={{ value: 'CA72-4 正常上限 10', fill: '#e11d48', fontSize: 10, position: 'insideBottomRight' }} />
                  <Line type="monotone" dataKey="HGB血红蛋白" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} />
                  <Line type="monotone" dataKey="Cr肌酐" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="CA724胃肿瘤标" stroke="#f43f5e" strokeWidth={2.5} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* 2. 妈妈专区：呼吸机 AHI 暂停指数、中央 AI 与使用时长 */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="font-bold text-stone-900 text-lg flex items-center gap-2">
              <span>👩 妈妈 (周芸) · 呼吸机 AHI 暂停指数、中央 AI 与使用时长</span>
            </h3>
            <p className="text-xs text-stone-600 mt-0.5">
              黄色虚线：AHI 正常分界线 5.0 次/小时（低于5为理想治疗达标；中央 AI 夜间波动已纳入长期监控）
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs flex-wrap">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-teal-600 inline-block" /> 总 AHI 指数</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-purple-500 inline-block" /> 中央 AI 波动</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500 inline-block" /> 使用时长 (小时)</span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cpapChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis yAxisId="left" domain={[0, 14]} tick={{ fontSize: 11, fill: '#0f766e' }} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 10]} tick={{ fontSize: 11, fill: '#d97706' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  border: '1px solid #e2e8f0',
                  fontSize: '12px',
                }}
              />
              <ReferenceLine yAxisId="left" y={5} stroke="#eab308" strokeDasharray="4 4" label={{ value: 'AHI 达标上限 5.0', fill: '#ca8a04', fontSize: 10, position: 'insideTopRight' }} />
              <Bar yAxisId="left" dataKey="AHI" fill="#0d9488" radius={[4, 4, 0, 0]} maxBarSize={28} />
              <Bar yAxisId="left" dataKey="中央AI" fill="#a855f7" radius={[4, 4, 0, 0]} maxBarSize={28} />
              <Line yAxisId="right" type="monotone" dataKey="使用时长" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
