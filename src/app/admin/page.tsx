'use client';

import React, { useState, useEffect, useRef } from 'react';
import Navigation from '@/components/Navigation';
import StatCharts from '@/components/StatCharts';
import AIChatDrawer from '@/components/AIChatDrawer';
import { AppDatabase } from '@/lib/storage';
import { 
  Users, 
  Plus, 
  FileText, 
  Calendar, 
  Upload, 
  Printer, 
  Copy, 
  Check, 
  Loader2, 
  Sparkles, 
  ShieldAlert, 
  Dog, 
  ExternalLink,
  Table,
  CheckSquare,
  Square
} from 'lucide-react';
import { FamilyMember } from '@/types/health';

export default function AdminPage() {
  const [db, setDb] = useState<AppDatabase | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('all');
  
  // Doctor summary generator state
  const [doctorTarget, setDoctorTarget] = useState<'爸爸' | '妈妈'>('爸爸');
  const [doctorSummary, setDoctorSummary] = useState<string>('');
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Checkbox checklist
  const [checklist, setChecklist] = useState({
    card: true,
    reports: true,
    meds: true,
  });

  // Archive upload state
  const [uploadingReport, setUploadingReport] = useState(false);
  const [reportTargetMember, setReportTargetMember] = useState('妈妈');
  const reportInputRef = useRef<HTMLInputElement>(null);

  // Batch import state (for ChatGPT migration)
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [batchText, setBatchText] = useState('');
  const [batchStatus, setBatchStatus] = useState<string | null>(null);

  // Add Member Modal
  const [addMemberModal, setAddMemberModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRelation, setNewMemberRelation] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'elder' | 'admin' | 'pet'>('elder');
  const [newMemberAvatar, setNewMemberAvatar] = useState('🧑');

  const fetchHealthData = async () => {
    try {
      const res = await fetch('/api/health-data');
      const data = await res.json();
      if (data.success) {
        setDb(data.data);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
  }, []);

  // Generate Doctor Summary
  const handleGenerateSummary = async () => {
    setGeneratingSummary(true);
    setDoctorSummary('');
    try {
      const res = await fetch('/api/ai/doctor-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ member: doctorTarget }),
      });
      const data = await res.json();
      if (data.success) {
        setDoctorSummary(data.summary);
      }
    } catch (err) {
      alert('生成失败');
    } finally {
      setGeneratingSummary(false);
    }
  };

  // Upload Medical Report
  const handleReportUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingReport(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      try {
        const res = await fetch('/api/ai/ocr-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64,
            mimeType: file.type,
            targetMember: reportTargetMember,
          }),
        });
        const data = await res.json();
        if (data.success) {
          alert('体检报告已成功识别并归档上传至 Google Drive！');
          fetchHealthData();
        } else {
          alert('识别失败');
        }
      } catch (err) {
        alert('上传异常');
      } finally {
        setUploadingReport(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Add Member
  const handleAddMember = async () => {
    if (!newMemberName.trim()) return;
    const newM: FamilyMember = {
      id: `member-${Date.now()}`,
      name: newMemberName.trim(),
      relation: newMemberRelation.trim() || '家庭成员',
      role: newMemberRole,
      avatar: newMemberRole === 'pet' ? '🐶' : newMemberAvatar,
      isElderlyModeDefault: newMemberRole === 'elder',
    };

    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newM),
      });
      const data = await res.json();
      if (data.success) {
        setAddMemberModal(false);
        setNewMemberName('');
        fetchHealthData();
      }
    } catch (err) {
      alert('添加失败');
    }
  };

  // Batch import simple parser
  const handleBatchImport = async () => {
    if (!batchText.trim()) return;
    setBatchStatus('正在解析并导入数据...');
    try {
      // Parse markdown/csv lines
      const lines = batchText.trim().split('\n');
      const cpapList: any[] = [];
      const bpList: any[] = [];

      lines.forEach((line) => {
        // e.g. 2026-03-01, 130, 80, 72 or 2026-03-01 | 6.4 | 8.4 | 5.0 | 0.9
        const parts = line.split(/[,\t|]/).map((s) => s.trim()).filter(Boolean);
        if (parts.length >= 4 && parts[0].includes('-')) {
          if (parts[1].includes('.') || Number(parts[1]) < 24) {
            // Probably CPAP (date, hours, pressure, leak, ahi)
            cpapList.push({
              id: `cpap-batch-${Date.now()}-${Math.random()}`,
              date: parts[0],
              usageHours: parseFloat(parts[1]) || 6.0,
              pressure: parseFloat(parts[2]) || 8.4,
              leakRate: parseFloat(parts[3]) || 5.0,
              ahi: parseFloat(parts[4]) || 1.0,
              totalAi: parseFloat(parts[4]) || 1.0,
              centralAi: 0.3,
              aiFeedback: '历史数据导入',
            });
          } else {
            // Probably BP (date, systolic, diastolic, hr)
            bpList.push({
              id: `bp-batch-${Date.now()}-${Math.random()}`,
              date: parts[0],
              period: '早晨',
              systolic: parseInt(parts[1]) || 125,
              diastolic: parseInt(parts[2]) || 75,
              heartRate: parseInt(parts[3]) || 70,
              status: parseInt(parts[1]) >= 130 ? '偏高需关注' : '正常',
              aiFeedback: '历史数据导入',
            });
          }
        }
      });

      const res = await fetch('/api/health-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'batch-import',
          record: { cpap: cpapList, bp: bpList },
        }),
      });

      const data = await res.json();
      if (data.success) {
        setBatchStatus(`成功导入 ${cpapList.length} 条呼吸机记录，${bpList.length} 条血压记录！`);
        fetchHealthData();
        setTimeout(() => setBatchModalOpen(false), 2000);
      }
    } catch (err) {
      setBatchStatus('导入失败，请检查格式');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-800">
      <Navigation />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">📊</span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                家庭健康全能管理看板
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              多成员趋势追踪 · 就医助手 · 云端病历库 · 宠物关怀
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setBatchModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 hover:bg-stone-100 text-xs font-semibold shadow-sm transition-colors"
            >
              <Table className="w-4 h-4 text-emerald-600" />
              导入 ChatGPT 历史数据
            </button>

            <button
              onClick={() => setAddMemberModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-md shadow-emerald-700/20 transition-colors"
            >
              <Plus className="w-4 h-4" />
              添加成员 / 宠物
            </button>
          </div>
        </div>

        {/* Member Selector Tabs */}
        {db && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'all'
                  ? 'bg-stone-900 text-white shadow-md'
                  : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              <span>🏠 全部概览</span>
            </button>

            {db.members.map((m) => (
              <button
                key={m.id}
                onClick={() => setActiveTab(m.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                  activeTab === m.id
                    ? 'bg-emerald-700 text-white shadow-md ring-2 ring-emerald-400'
                    : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                <span>{m.avatar}</span>
                <span>{m.name}</span>
                {m.role === 'pet' && (
                  <span className="px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-700 text-[10px]">
                    宠物
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Dynamic Content based on selected tab */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          </div>
        ) : db ? (
          <>
            {/* 1. Charts Section */}
            {(activeTab === 'all' || activeTab === 'dad' || activeTab === 'mom') && (
              <StatCharts bpData={db.bpRecords} cpapData={db.cpapRecords} />
            )}

            {/* 2. Doctor Appointment Prep Assistant */}
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center text-xl">
                    🩺
                  </div>
                  <div>
                    <h2 className="font-bold text-stone-900 text-lg">
                      就医助手 · 一键生成结构化问诊清单
                    </h2>
                    <p className="text-xs text-stone-600">
                      Gemini 自动聚合近 30 天日常血压与呼吸机打卡数据，生成标准《1页病情陈述与医生待咨询问题》
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={doctorTarget}
                    onChange={(e) => setDoctorTarget(e.target.value as any)}
                    className="px-3 py-2 bg-stone-100 rounded-xl text-xs font-semibold border-0 outline-none"
                  >
                    <option value="爸爸">针对：爸爸 (高血压/心血管)</option>
                    <option value="妈妈">针对：妈妈 (睡眠呼吸暂停)</option>
                  </select>

                  <button
                    disabled={generatingSummary}
                    onClick={handleGenerateSummary}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white text-xs font-bold shadow-sm transition-colors"
                  >
                    {generatingSummary ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    一键智能生成
                  </button>
                </div>
              </div>

              {/* Checklist */}
              <div className="p-4 bg-stone-50 rounded-xl flex flex-wrap items-center gap-4 text-xs font-medium text-stone-700">
                <span className="font-bold text-stone-900 flex items-center gap-1">
                  🎒 就医随身必带：
                </span>
                <label
                  onClick={() => setChecklist({ ...checklist, card: !checklist.card })}
                  className="flex items-center gap-1.5 cursor-pointer select-none"
                >
                  {checklist.card ? <CheckSquare className="w-4 h-4 text-teal-600" /> : <Square className="w-4 h-4" />}
                  医保卡 / 身份证
                </label>
                <label
                  onClick={() => setChecklist({ ...checklist, reports: !checklist.reports })}
                  className="flex items-center gap-1.5 cursor-pointer select-none"
                >
                  {checklist.reports ? <CheckSquare className="w-4 h-4 text-teal-600" /> : <Square className="w-4 h-4" />}
                  近期体检与心电图原件
                </label>
                <label
                  onClick={() => setChecklist({ ...checklist, meds: !checklist.meds })}
                  className="flex items-center gap-1.5 cursor-pointer select-none"
                >
                  {checklist.meds ? <CheckSquare className="w-4 h-4 text-teal-600" /> : <Square className="w-4 h-4" />}
                  当前在服降压药盒（便于医生看规格）
                </label>
              </div>

              {/* Generated Sheet Output */}
              {doctorSummary && (
                <div
                  id="printable-doctor-summary"
                  className="p-5 bg-teal-50/60 rounded-2xl border border-teal-200 space-y-4 animate-fade-in"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-teal-950 text-sm flex items-center gap-2">
                      <FileText className="w-4 h-4 text-teal-700" />
                      已生成的就诊陈述单（可直接打印或带去医院）：
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(doctorSummary);
                          setCopiedSummary(true);
                          setTimeout(() => setCopiedSummary(false), 2000);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-white border border-teal-300 text-teal-900 text-xs font-semibold flex items-center gap-1 hover:bg-teal-50"
                      >
                        {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedSummary ? '已复制' : '复制文本'}
                      </button>
                      <button
                        onClick={() => window.print()}
                        className="px-3 py-1.5 rounded-lg bg-teal-700 text-white text-xs font-semibold flex items-center gap-1 hover:bg-teal-800"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        直接打印
                      </button>
                    </div>
                  </div>

                  <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-stone-800 bg-white p-4 rounded-xl border border-teal-100">
                    {doctorSummary}
                  </pre>
                </div>
              )}
            </div>

            {/* 3. Medical Archives & Drive Library */}
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center text-xl">
                    📁
                  </div>
                  <div>
                    <h2 className="font-bold text-stone-900 text-lg">
                      体检与病历归档库 (Google Drive 实时同步)
                    </h2>
                    <p className="text-xs text-stone-600">
                      上传体检单照片/PDF，Gemini 自动 OCR 提取核心指标，并重命名自动归入对应成员的 Google 云盘
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={reportTargetMember}
                    onChange={(e) => setReportTargetMember(e.target.value)}
                    className="px-3 py-2 bg-stone-100 rounded-xl text-xs font-semibold border-0 outline-none"
                  >
                    <option value="妈妈">归档至：妈妈_健康归档</option>
                    <option value="爸爸">归档至：爸爸_健康归档</option>
                    <option value="本人">归档至：本人_健康归档</option>
                  </select>

                  <input
                    type="file"
                    accept="image/*,.pdf"
                    ref={reportInputRef}
                    onChange={handleReportUpload}
                    className="hidden"
                  />

                  <button
                    disabled={uploadingReport}
                    onClick={() => reportInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold shadow-sm transition-colors"
                  >
                    {uploadingReport ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    上传体检照片 / PDF
                  </button>
                </div>
              </div>

              {/* Archive Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200 text-stone-600">
                      <th className="py-2.5 px-3">日期</th>
                      <th className="py-2.5 px-3">成员</th>
                      <th className="py-2.5 px-3">文件名称</th>
                      <th className="py-2.5 px-3">核心异常指标摘要</th>
                      <th className="py-2.5 px-3">云端链接</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-700">
                    {db.medicalArchives.map((arc, i) => (
                      <tr key={arc.id || i} className="hover:bg-stone-50/80 transition-colors">
                        <td className="py-3 px-3 font-semibold text-stone-900 whitespace-nowrap">{arc.date}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full bg-stone-100 font-medium">
                            {arc.member}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-medium text-stone-900">{arc.fileName}</td>
                        <td className="py-3 px-3 max-w-xs">{arc.summary}</td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <a
                            href={arc.driveLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-bold"
                          >
                            打开云盘
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4. Pet Care Section (Only in Admin View) */}
            {(activeTab === 'all' || activeTab.startsWith('dog')) && (
              <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center text-xl">
                      🐾
                    </div>
                    <div>
                      <h2 className="font-bold text-stone-900 text-lg">
                        毛孩子专属关怀档案 (仅管家端可见)
                      </h2>
                      <p className="text-xs text-stone-600">
                        体内外驱虫倒计时 · 疫苗日程 · 体重曲线 · 看诊记录
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {db.petRecords.map((pet, idx) => (
                    <div key={pet.id || idx} className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                          <span>🐶</span> {pet.petName}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold text-xs">
                          {pet.type}
                        </span>
                      </div>
                      <p className="text-xs text-stone-700 font-medium">{pet.detail}</p>
                      <div className="flex items-center justify-between text-xs text-stone-600 pt-2 border-t border-stone-200">
                        <span>记录日期：{pet.date}</span>
                        {pet.nextDueDate && (
                          <span className="text-emerald-700 font-bold">
                            下次提醒：{pet.nextDueDate}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : null}
      </main>

      {/* Batch Import Modal (ChatGPT migration) */}
      {batchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 sm:p-7 shadow-2xl border border-stone-200 space-y-4">
            <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Table className="w-5 h-5 text-emerald-600" />
              一键迁移 ChatGPT 历史健康数据
            </h3>
            <p className="text-xs text-stone-600">
              请直接把 ChatGPT 输出的表格文本（CSV 或 Markdown 格式）粘贴在下方，系统会自动解析并批量写入 Google Sheets 及看板。
            </p>

            <textarea
              rows={8}
              value={batchText}
              onChange={(e) => setBatchText(e.target.value)}
              placeholder={`示例（直接粘贴即可）：\n2026-03-01, 132, 82, 70\n2026-03-02, 128, 76, 72\n或呼吸机：\n2026-03-01 | 6.5 | 8.4 | 5.0 | 0.9`}
              className="w-full p-3 bg-stone-50 rounded-xl text-xs font-mono border border-stone-200 focus:ring-2 focus:ring-emerald-600 outline-none"
            />

            {batchStatus && (
              <div className="text-xs font-bold text-emerald-700 bg-emerald-50 p-2.5 rounded-lg">
                {batchStatus}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setBatchModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold"
              >
                取消
              </button>
              <button
                onClick={handleBatchImport}
                className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md transition-colors"
              >
                开始解析并导入
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {addMemberModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-stone-200 space-y-4">
            <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-600" />
              添加家庭成员或宠物
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">成员类型</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNewMemberRole('elder');
                      setNewMemberAvatar('👵');
                    }}
                    className={`p-2 rounded-xl border text-center font-bold ${
                      newMemberRole === 'elder' ? 'border-emerald-600 bg-emerald-50 text-emerald-900' : 'bg-stone-50'
                    }`}
                  >
                    👵 长辈
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewMemberRole('admin');
                      setNewMemberAvatar('🧑');
                    }}
                    className={`p-2 rounded-xl border text-center font-bold ${
                      newMemberRole === 'admin' ? 'border-emerald-600 bg-emerald-50 text-emerald-900' : 'bg-stone-50'
                    }`}
                  >
                    🧑 成人/子女
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewMemberRole('pet');
                      setNewMemberAvatar('🐶');
                    }}
                    className={`p-2 rounded-xl border text-center font-bold ${
                      newMemberRole === 'pet' ? 'border-emerald-600 bg-emerald-50 text-emerald-900' : 'bg-stone-50'
                    }`}
                  >
                    🐶 宠物
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">称呼 / 名字</label>
                <input
                  type="text"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="例如：奶奶、弟弟、可可"
                  className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">关系 / 备注</label>
                <input
                  type="text"
                  value={newMemberRelation}
                  onChange={(e) => setNewMemberRelation(e.target.value)}
                  placeholder="例如：母亲、爱犬、本人"
                  className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3">
              <button
                onClick={() => setAddMemberModal(false)}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold"
              >
                取消
              </button>
              <button
                onClick={handleAddMember}
                className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md transition-colors"
              >
                确认添加
              </button>
            </div>
          </div>
        </div>
      )}

      <AIChatDrawer />
    </div>
  );
}
