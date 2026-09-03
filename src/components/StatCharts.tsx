'use client';

import React from 'react';
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

  // Format CPAP for Recharts
  const cpapChartData = [...cpapData]
    .reverse()
    .slice(-14)
    .map((d) => ({
      date: d.date.slice(5),
      AHI: d.ahi,
      使用时长: d.usageHours,
      漏气量: d.leakRate,
    }));

  return (
    <div className="space-y-8">
      {/* 1. 爸爸血压趋势图 */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="font-bold text-stone-900 text-lg flex items-center gap-2">
              <span>👨 爸爸 · 近两周血压与心率波动走势</span>
            </h3>
            <p className="text-xs text-stone-600">
              绿色虚线：正常高压上限 130 mmHg / 低压上限 80 mmHg
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-rose-500 inline-block" /> 高压 (收缩)</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> 低压 (舒张)</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> 心率</span>
          </div>
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

      {/* 2. 妈妈呼吸机趋势图 */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="font-bold text-stone-900 text-lg flex items-center gap-2">
              <span>👩 妈妈 · 近两周呼吸机 AHI 暂停指数与使用时长</span>
            </h3>
            <p className="text-xs text-stone-600">
              黄色虚线：AHI 正常分界线 5.0 次/小时（低于5为正常/治疗理想）
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-teal-600 inline-block" /> AHI 指数</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500 inline-block" /> 使用时长(h)</span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cpapChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis yAxisId="left" domain={[0, 8]} tick={{ fontSize: 11, fill: '#0f766e' }} />
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
              <ReferenceLine yAxisId="left" y={5} stroke="#eab308" strokeDasharray="4 4" label={{ value: 'AHI 正常限值 5.0', fill: '#ca8a04', fontSize: 10, position: 'insideTopRight' }} />
              <Bar yAxisId="left" dataKey="AHI" fill="#0d9488" radius={[4, 4, 0, 0]} maxBarSize={35} />
              <Line yAxisId="right" type="monotone" dataKey="使用时长" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
