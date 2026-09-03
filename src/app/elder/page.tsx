'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  Camera, 
  Heart, 
  Wind, 
  Utensils, 
  ArrowLeft, 
  Check, 
  Sparkles, 
  Loader2, 
  X,
  ThumbsUp,
  AlertCircle,
  AlertTriangle,
  FileText,
  Stethoscope,
  MessageSquare,
  Send,
  CheckCircle2,
  ChevronRight,
  Pill,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkle,
  Mic,
  Volume2,
  VolumeX
} from 'lucide-react';
import { PARENT_HEALTH_PROFILES } from '@/lib/parent-health-profiles';
import { PhysicalExamMetric } from '@/types/health';

type ElderTab = 'checkin' | 'exam' | 'alerts' | 'ai';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  time: string;
}

export default function ElderPage() {
  // Current active parent: 'mom' | 'dad'
  const [selectedParent, setSelectedParent] = useState<'mom' | 'dad'>('mom');
  const [activeTab, setActiveTab] = useState<ElderTab>('checkin');

  // Modals for checkin
  const [activeModal, setActiveModal] = useState<'cpap' | 'bp' | 'meal' | null>(null);
  
  // CPAP State
  const [cpapLoading, setCpapLoading] = useState(false);
  const [cpapResult, setCpapResult] = useState<any>(null);
  const cpapInputRef = useRef<HTMLInputElement>(null);

  // BP State
  const [systolic, setSystolic] = useState('125');
  const [diastolic, setDiastolic] = useState('75');
  const [heartRate, setHeartRate] = useState('72');
  const [bpPeriod, setBpPeriod] = useState<'早晨' | '晚间'>('早晨');
  const [bpSubmitting, setBpSubmitting] = useState(false);
  const [bpSuccess, setBpSuccess] = useState<string | null>(null);

  // Meal State
  const [mealLoading, setMealLoading] = useState(false);
  const [mealResult, setMealResult] = useState<any>(null);
  const mealInputRef = useRef<HTMLInputElement>(null);

  // Category filter for physical exam
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');

  // AI Chat & Voice State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: '阿姨、叔叔好！我是您的 24 小时全能家庭助手。无论是健康养生、做菜做饭、生活常识、睡眠鼻炎，还是想发语音聊聊天，您随时都可以问我！',
      time: '刚刚',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const profile = PARENT_HEALTH_PROFILES[selectedParent] || PARENT_HEALTH_PROFILES.mom;

  // Auto scroll chat
  useEffect(() => {
    if (activeTab === 'ai') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab]);

  // Handlers
  const handleCpapImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCpapLoading(true);
    setCpapResult(null);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      try {
        const res = await fetch('/api/ai/ocr-cpap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64, mimeType: file.type }),
        });
        const data = await res.json();
        if (data.success) {
          setCpapResult(data.data);
        } else {
          alert('识别失败，请重新拍照');
        }
      } catch (err) {
        alert('网络异常');
      } finally {
        setCpapLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBpSubmit = async () => {
    const sys = parseInt(systolic, 10);
    const dia = parseInt(diastolic, 10);
    const hr = parseInt(heartRate, 10) || 72;

    if (isNaN(sys) || isNaN(dia)) {
      alert('请输入正确的血压数值');
      return;
    }

    setBpSubmitting(true);
    try {
      const status = sys >= 140 || dia >= 90 ? '危险高压' : sys >= 130 || dia >= 80 ? '偏高需关注' : '正常';
      const aiFeedback =
        status === '正常'
          ? '太棒了！血压控制在标准范围内，请继续保持！'
          : status === '偏高需关注'
          ? '血压稍偏高，请放松心情、清淡少盐，记得按时吃药。'
          : '血压明显偏高，请静坐休息，必要时联系家属或就医。';

      const res = await fetch('/api/health-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'bp',
          record: {
            date: new Date().toISOString().split('T')[0],
            period: bpPeriod,
            systolic: sys,
            diastolic: dia,
            heartRate: hr,
            status,
            aiFeedback,
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        setBpSuccess(aiFeedback);
      }
    } catch (err) {
      alert('打卡失败，请重试');
    } finally {
      setBpSubmitting(false);
    }
  };

  const handleMealUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMealLoading(true);
    setMealResult(null);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      try {
        const res = await fetch('/api/ai/analyze-meal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64, mimeType: file.type }),
        });
        const data = await res.json();
        if (data.success) {
          setMealResult(data.data);
        }
      } catch (err) {
        alert('分析失败');
      } finally {
        setMealLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Voice Synthesis (朗读回答)
  const speakText = (text: string, msgId?: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('当前手机浏览器不支持语音朗读，请尝试在 Safari 或 Chrome 中打开');
      return;
    }

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      if (speakingId === msgId) {
        setSpeakingId(null);
        return;
      }
    }

    const cleanText = text.replace(/[*#`\-_[\]]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.95; // 稍慢、清晰亲切
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      if (msgId) setSpeakingId(msgId);
    };
    utterance.onend = () => {
      setSpeakingId(null);
    };
    utterance.onerror = () => {
      setSpeakingId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Voice Input (发语音 / 语音转文字)
  const startVoiceInput = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('您的浏览器暂未支持直接语音录音，推荐直接打字或使用手机输入法键盘自带的语音麦克风（转文字）哦！');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'zh-CN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setChatInput(transcript);
          handleSendMessage(transcript, true); // 发送并朗读回复
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          alert('请在手机浏览器设置中允许麦克风权限后重试。');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Speech init error:', err);
      setIsListening(false);
    }
  };

  // AI Chat Handler (支持文字和语音)
  const handleSendMessage = async (textToSend?: string, isVoice: boolean = false) => {
    const query = textToSend || chatInput.trim();
    if (!query || chatLoading) return;

    const userMsg: ChatMessage = {
      id: 'u-' + Date.now(),
      role: 'user',
      content: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...chatMessages, userMsg];
    setChatMessages(newHistory);
    if (!textToSend) setChatInput('');
    setChatLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await res.json();
      if (data.success && data.reply) {
        const newReplyId = 'a-' + Date.now();
        setChatMessages((prev) => [
          ...prev,
          {
            id: newReplyId,
            role: 'assistant',
            content: data.reply,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        if (isVoice) {
          speakText(data.reply, newReplyId);
        }
      } else {
        throw new Error('AI 服务暂不可用');
      }
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: 'a-' + Date.now(),
          role: 'assistant',
          content: '您好！遇到任何生活健康疑问都可以问我，日常多喝温水、注意休息保暖哦！',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // Filter metrics
  const categories = ['全部', '基础体态', '心血管与血压', '血糖代谢', '血脂四项', '肝肾与痛风', '专科特检'];
  const filteredMetrics = selectedCategory === '全部'
    ? profile.metrics
    : profile.metrics.filter((m) => m.category === selectedCategory);

  // Abnormal metrics for alert view
  const abnormalMetrics = profile.metrics.filter((m) => m.status !== 'normal');

  // Quick Questions for elderly
  const quickQuestions = selectedParent === 'mom' ? [
    '低密度脂蛋白 3.42 偏高，平时吃什么好降脂？',
    '睡眠呼吸机面罩晚上总觉得吹风漏气怎么办？',
    '昨晚睡了 6 个多小时，今天头脑感觉挺清爽',
    '甘油三酯在正常边缘，晚上能吃水果零食吗？',
    '降脂药需要每天固定在晚上吃吗？',
    '带呼吸机打卡记录去复查，一般看呼吸科还是睡眠科？'
  ] : [
    '早晨高压有时候 135，降压药什么时候吃最好？',
    '血尿酸 445，日常可以喝淡绿茶或豆浆吗？',
    '甘油三酯 2.35 偏高，吃鱼油或者粗粮管用吗？',
    '高血压老人平时烧菜每天放多少盐合适？',
    '去医院复诊高血压，医生会问哪些情况？',
    '轻度脂肪肝该怎样科学快走锻炼？'
  ];

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col select-none pb-12">
      {/* Elderly Top Bar - Clean & Elegant */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs px-4 sm:px-6 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">❤️</span>
            <div className="leading-tight">
              <span className="font-bold text-base sm:text-lg text-stone-900 tracking-tight block">
                家庭健康管家
              </span>
              <span className="text-[11px] font-medium text-stone-500 block">
                爸妈专属贴心版
              </span>
            </div>
          </div>

          {/* Parent Switcher (Mom / Dad - Young middle-aged avatars) */}
          <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200">
            <button
              onClick={() => setSelectedParent('mom')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg font-bold text-sm sm:text-base transition-all ${
                selectedParent === 'mom'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span className="text-lg">👩</span>
              <span>妈妈面板</span>
            </button>

            <button
              onClick={() => setSelectedParent('dad')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg font-bold text-sm sm:text-base transition-all ${
                selectedParent === 'dad'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span className="text-lg">👨</span>
              <span>爸爸面板</span>
            </button>
          </div>

          {/* Emergency Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>急救: 120</span>
          </div>
        </div>
      </header>

      {/* 4 Main Function Tabs - Minimalist & Refined */}
      <div className="max-w-3xl mx-auto w-full px-4 pt-4">
        <div className="grid grid-cols-4 gap-2 bg-white p-1.5 rounded-2xl border border-stone-200/80 shadow-xs">
          <button
            onClick={() => setActiveTab('checkin')}
            className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl transition-all ${
              activeTab === 'checkin'
                ? 'bg-stone-900 text-white font-bold shadow-xs'
                : 'text-stone-600 hover:bg-stone-50 font-medium'
            }`}
          >
            <span className="text-xl sm:text-2xl mb-1">📸</span>
            <span className="text-xs sm:text-sm">拍照打卡</span>
          </button>

          <button
            onClick={() => setActiveTab('exam')}
            className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl transition-all ${
              activeTab === 'exam'
                ? 'bg-stone-900 text-white font-bold shadow-xs'
                : 'text-stone-600 hover:bg-stone-50 font-medium'
            }`}
          >
            <span className="text-xl sm:text-2xl mb-1">📋</span>
            <span className="text-xs sm:text-sm">体检对比</span>
          </button>

          <button
            onClick={() => setActiveTab('alerts')}
            className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl transition-all relative ${
              activeTab === 'alerts'
                ? 'bg-stone-900 text-white font-bold shadow-xs'
                : 'text-stone-600 hover:bg-stone-50 font-medium'
            }`}
          >
            {abnormalMetrics.length > 0 && (
              <span className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white" />
            )}
            <span className="text-xl sm:text-2xl mb-1">⚠️</span>
            <span className="text-xs sm:text-sm">就医指南</span>
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl transition-all ${
              activeTab === 'ai'
                ? 'bg-teal-800 text-white font-bold shadow-xs'
                : 'text-stone-600 hover:bg-stone-50 font-medium'
            }`}
          >
            <span className="text-xl sm:text-2xl mb-1">💬</span>
            <span className="text-xs sm:text-sm">家庭助手</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-3xl mx-auto w-full px-4 pt-4 flex-1">
        {/* ========================================================
            TAB 1: 📸 拍照打卡 (清爽大字卡片，已删除问候栏目)
           ======================================================== */}
        {activeTab === 'checkin' && (
          <div className="space-y-4 animate-fade-in">
            {/* 3 Clean Action Cards */}
            <div className="space-y-3.5">
              {/* 1. 妈妈-拍呼吸机屏幕 */}
              <div
                onClick={() => {
                  setActiveModal('cpap');
                  setCpapResult(null);
                }}
                className={`cursor-pointer group relative overflow-hidden rounded-2xl p-5 sm:p-6 bg-white border transition-all active:scale-[0.99] shadow-xs hover:shadow-sm ${
                  selectedParent === 'mom' ? 'border-amber-400/80 ring-2 ring-amber-400/20' : 'border-stone-200/90'
                } flex items-center gap-4.5`}
              >
                <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center text-3xl sm:text-4xl shrink-0 border border-amber-100">
                  🫁
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-xs">
                      妈妈重点项
                    </span>
                    <span className="text-xs text-stone-600 font-medium">对准屏幕 · 拍照即识</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-stone-900 leading-tight">
                    拍呼吸机屏幕打卡
                  </h3>
                  <p className="text-stone-600 text-sm font-medium mt-1">
                    自动提取昨晚使用小时、AHI指数、漏气量与贴合度
                  </p>
                </div>
              </div>

              {/* 2. 爸爸-记血压 */}
              <div
                onClick={() => {
                  setActiveModal('bp');
                  setBpSuccess(null);
                }}
                className={`cursor-pointer group relative overflow-hidden rounded-2xl p-5 sm:p-6 bg-white border transition-all active:scale-[0.99] shadow-xs hover:shadow-sm ${
                  selectedParent === 'dad' ? 'border-blue-400/80 ring-2 ring-blue-400/20' : 'border-stone-200/90'
                } flex items-center gap-4.5`}
              >
                <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-blue-50 text-blue-800 flex items-center justify-center text-3xl sm:text-4xl shrink-0 border border-blue-100">
                  🩺
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 font-bold text-xs">
                      爸爸重点项
                    </span>
                    <span className="text-xs text-stone-600 font-medium">大字号 · 快速记录</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-stone-900 leading-tight">
                    记录早晚血压
                  </h3>
                  <p className="text-stone-600 text-sm font-medium mt-1">
                    输入高压与低压，自动比对健康标准范围
                  </p>
                </div>
              </div>

              {/* 3. 饮食随手拍 */}
              <div
                onClick={() => {
                  setActiveModal('meal');
                  setMealResult(null);
                }}
                className="cursor-pointer group relative overflow-hidden rounded-2xl p-5 sm:p-6 bg-white border border-stone-200/90 hover:border-emerald-400/80 transition-all active:scale-[0.99] shadow-xs hover:shadow-sm flex items-center gap-4.5"
              >
                <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center text-3xl sm:text-4xl shrink-0 border border-emerald-100">
                  🍲
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-xs">
                      全家餐饮
                    </span>
                    <span className="text-xs text-stone-600 font-medium">随手拍 · 营养分析</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-stone-900 leading-tight">
                    拍一日三餐
                  </h3>
                  <p className="text-stone-600 text-sm font-medium mt-1">
                    AI 营养助手帮您看咸淡和油腻，给出白话饮食建议
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: 📋 体检数据与正常对比看板 (满足用户提出的核心诉求)
           ======================================================== */}
        {activeTab === 'exam' && (
          <div className="space-y-5 animate-fade-in">
            {/* Header info */}
            <div className="bg-white p-5 rounded-3xl border-2 border-emerald-300 shadow-sm flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-3xl">{selectedParent === 'mom' ? '👩' : '👨'}</span>
                  <h2 className="text-2xl font-black text-stone-900">
                    {profile.memberName} · 综合体检对照看板
                  </h2>
                </div>
                <p className="text-xs sm:text-sm font-bold text-stone-500 mt-1">
                  最近体检日期：{profile.lastExamDate} · 三甲医院综合体检标准对照
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-stone-600 block">体检项目</span>
                <span className="text-2xl font-black text-emerald-700">{profile.metrics.length} 项</span>
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-2xl text-sm font-black whitespace-nowrap transition-all border-2 ${
                    selectedCategory === cat
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                      : 'bg-white text-stone-700 border-stone-200 hover:border-emerald-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Metric Comparison Cards List */}
            <div className="space-y-3.5">
              {filteredMetrics.map((m) => {
                const isDanger = m.status === 'danger';
                const isAttention = m.status === 'attention';
                const isNormal = m.status === 'normal';

                return (
                  <div
                    key={m.id}
                    className={`bg-white rounded-3xl p-5 border-3 transition-all shadow-sm ${
                      isDanger
                        ? 'border-rose-400 bg-rose-50/30'
                        : isAttention
                        ? 'border-amber-400 bg-amber-50/20'
                        : 'border-emerald-200 hover:border-emerald-300'
                    }`}
                  >
                    {/* Top row: Name, Category, Status Badge */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg sm:text-xl font-black text-stone-900">
                          {m.name}
                        </span>
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
                          {m.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {isNormal && (
                          <span className="flex items-center gap-1 text-xs sm:text-sm font-black text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                            <CheckCircle2 className="w-4 h-4" />
                            正常达标
                          </span>
                        )}
                        {isAttention && (
                          <span className="flex items-center gap-1 text-xs sm:text-sm font-black text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                            稍偏高需关注
                          </span>
                        )}
                        {isDanger && (
                          <span className="flex items-center gap-1 text-xs sm:text-sm font-black text-rose-800 bg-rose-100 px-3 py-1 rounded-full border border-rose-300 animate-pulse">
                            <AlertCircle className="w-4 h-4 text-rose-600" />
                            异常需干预
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Middle: Big Value Comparison */}
                    <div className="flex items-baseline justify-between py-2 border-b border-stone-100">
                      <div>
                        <span className="text-xs font-extrabold text-stone-500 block mb-0.5">
                          实测数值
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span
                            className={`text-3xl sm:text-4xl font-black tracking-tight ${
                              isDanger
                                ? 'text-rose-600'
                                : isAttention
                                ? 'text-amber-600'
                                : 'text-emerald-700'
                            }`}
                          >
                            {m.value}
                          </span>
                          <span className="text-sm sm:text-base font-bold text-stone-600">
                            {m.unit}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-extrabold text-stone-500 block mb-0.5">
                          医学标准正常范围
                        </span>
                        <div className="text-base sm:text-lg font-black text-stone-700 bg-stone-100 px-3 py-1 rounded-xl inline-block border border-stone-200">
                          {m.normalRange} <span className="text-xs font-normal">{m.unit}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom: Plain language explanation & advice */}
                    <div className="mt-3 space-y-1.5">
                      <div className="text-sm font-bold text-stone-800 flex items-start gap-1.5">
                        <span className="text-stone-400 shrink-0">💬</span>
                        <span>{m.meaning}</span>
                      </div>
                      <div className="text-xs sm:text-sm font-extrabold text-emerald-900 bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200 flex items-start gap-1.5">
                        <span className="text-emerald-600 shrink-0">💡</span>
                        <span>{m.advice}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: ⚠️ 身体异常状态管理提醒 与 就医指南
           ======================================================== */}
        {activeTab === 'alerts' && (
          <div className="space-y-5 animate-fade-in">
            {/* Section 1: Abnormal Warning Summary */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border-3 border-rose-300 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b-2 border-stone-100">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">⚠️</span>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-rose-950">
                      {profile.memberName} · 当前待关注与异常管理清单
                    </h3>
                    <p className="text-xs sm:text-sm font-bold text-rose-700">
                      共检测到 {abnormalMetrics.length} 项需日常生活防范与饮食干预
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-rose-100 text-rose-800 rounded-full font-black text-xs sm:text-sm border border-rose-200">
                  日常重点防范
                </span>
              </div>

              <div className="space-y-3">
                {abnormalMetrics.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-4 bg-rose-50/60 rounded-2xl border-2 border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-rose-600 text-white font-black text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-lg font-black text-rose-950">
                          {item.name}：{item.value} {item.unit}
                        </span>
                        <span className="text-xs font-bold text-stone-600">
                          (标准参考: {item.normalRange})
                        </span>
                      </div>
                      <p className="text-sm font-bold text-stone-700 mt-1.5 pl-8">
                        {item.meaning}
                      </p>
                      <p className="text-xs sm:text-sm font-extrabold text-rose-900 mt-1 pl-8">
                        👉 应对建议：{item.advice}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2: Hospital Department Guide */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border-3 border-blue-300 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b-2 border-stone-100">
                <span className="text-3xl">🏥</span>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-blue-950">
                    三甲医院就医门诊指南
                  </h3>
                  <p className="text-xs sm:text-sm font-bold text-blue-700">
                    避免跑错科室，精准对症挂号
                  </p>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-2xl border-2 border-blue-200 space-y-2">
                <div className="text-xs font-bold text-blue-800">推荐挂号科室</div>
                <div className="text-xl sm:text-2xl font-black text-blue-950">
                  🩺 {profile.visitGuide.recommendedDept}
                </div>
                <div className="text-sm font-bold text-stone-700">
                  <strong>挂号原因</strong>：{profile.visitGuide.reason}
                </div>
                {profile.visitGuide.nextReviewDate && (
                  <div className="text-xs font-extrabold text-blue-900 pt-1">
                    📅 建议复查周期：{profile.visitGuide.nextReviewDate}
                  </div>
                )}
              </div>
            </div>

            {/* Section 3: Pack Checklist */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border-3 border-amber-300 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b-2 border-stone-100">
                <span className="text-3xl">🎒</span>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-amber-950">
                    就医出门必备清单（带齐不白跑）
                  </h3>
                  <p className="text-xs sm:text-sm font-bold text-amber-800">
                    出门前逐项对照装进随身包里
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {profile.visitGuide.checklist.map((c, i) => (
                  <div
                    key={i}
                    className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200 flex items-center gap-3"
                  >
                    <div className="w-7 h-7 rounded-xl bg-amber-600 text-white flex items-center justify-center font-black text-sm shrink-0">
                      ✓
                    </div>
                    <span className="text-base font-black text-amber-950">{c}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 4: 3 Questions to Ask Doctor */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border-3 border-emerald-300 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b-2 border-stone-100">
                <span className="text-3xl">🗣️</span>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-emerald-950">
                    见医生必问的 3 句话（小抄备忘）
                  </h3>
                  <p className="text-xs sm:text-sm font-bold text-emerald-800">
                    在诊室直接照着手机念，医生一听全明白
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {profile.visitGuide.questionsToDoctor.map((q, i) => (
                  <div
                    key={i}
                    className="p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-200 text-stone-800"
                  >
                    <p className="text-base sm:text-lg font-black text-emerald-950 leading-relaxed">
                      {q}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 5: Daily Lifestyle Tips */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border-3 border-stone-200 shadow-sm space-y-3">
              <h4 className="text-lg font-black text-stone-900 flex items-center gap-2">
                <span>🌱</span>
                <span>居家生活调理小要诀</span>
              </h4>
              <div className="space-y-2">
                {profile.visitGuide.lifestyleAdvice.map((a, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm sm:text-base font-bold text-stone-700">
                    <span className="text-emerald-600 font-black">•</span>
                    <span>{a}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 4: 💬 24小时全能家庭助手 (生活百事 · 健康养生 · 发语音)
           ======================================================== */}
        {activeTab === 'ai' && (
          <div className="space-y-3.5 animate-fade-in flex flex-col h-[calc(100vh-210px)] min-h-[500px]">
            {/* Banner - Clean & Warm */}
            <div className="bg-stone-900 text-white rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center text-2xl">
                  💬
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold">
                    24小时 全能家庭助手
                  </h3>
                  <p className="text-xs text-stone-400 font-medium mt-0.5">
                    生活百事 · 身体健康 · 随时发语音 · 24小时在岗
                  </p>
                </div>
              </div>

              <button
                onClick={() =>
                  setChatMessages([
                    {
                      id: 'init-1',
                      role: 'assistant',
                      content: `叔叔、阿姨好！我是您的 24 小时全能家庭助手。健康养生、做菜做饭、生活常识、睡眠鼻炎，或者想发语音聊聊天，您随时都可以问我！`,
                      time: '刚刚',
                    },
                  ])
                }
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white text-xs font-medium transition-colors"
              >
                清空重聊
              </button>
            </div>

            {/* Quick Questions Pills - Clean & Subtle */}
            <div className="shrink-0 space-y-1.5">
              <div className="text-xs font-semibold text-stone-500 flex items-center gap-1">
                <Sparkle className="w-3.5 h-3.5 text-teal-700" />
                <span>点一下直接问（生活百事随时问）：</span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    disabled={chatLoading}
                    onClick={() => handleSendMessage(q)}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-stone-100 text-stone-800 border border-stone-200/90 font-medium text-xs sm:text-sm whitespace-nowrap shadow-2xs transition-all active:scale-95 disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Dialog Messages Container */}
            <div className="flex-1 bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/90 shadow-2xs overflow-y-auto space-y-4">
              {chatMessages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.role === 'assistant' && (
                    <div className="w-9 h-9 rounded-xl bg-teal-800 text-white flex items-center justify-center text-base shrink-0 shadow-2xs">
                      💬
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 shadow-2xs ${
                      m.role === 'user'
                        ? 'bg-stone-900 text-white font-medium text-base sm:text-lg'
                        : 'bg-stone-100 text-stone-900 text-base sm:text-lg border border-stone-200/60'
                    }`}
                  >
                    <p className="leading-relaxed whitespace-pre-line font-medium">{m.content}</p>
                    
                    {/* Voice Readback Button for Assistant */}
                    {m.role === 'assistant' && (
                      <button
                        onClick={() => speakText(m.content, m.id)}
                        className={`mt-2.5 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                          speakingId === m.id
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300 animate-pulse'
                            : 'bg-white text-stone-600 hover:text-stone-900 border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{speakingId === m.id ? '⏹️ 停止朗读' : '🔊 听语音回答'}</span>
                      </button>
                    )}

                    <span
                      className={`text-[11px] block text-right mt-1.5 ${
                        m.role === 'user' ? 'text-stone-400' : 'text-stone-600'
                      }`}
                    >
                      {m.time}
                    </span>
                  </div>

                  {m.role === 'user' && (
                    <div className="w-9 h-9 rounded-xl bg-stone-200 text-stone-900 flex items-center justify-center text-lg shrink-0 border border-stone-300">
                      {selectedParent === 'mom' ? '👩' : '👨'}
                    </div>
                  )}
                </div>
              ))}

              {chatLoading && (
                <div className="flex items-center gap-2.5 text-stone-600 font-medium text-sm bg-stone-100 p-3 rounded-xl w-fit border border-stone-200 animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin text-teal-700" />
                  <span>全能家庭助手正在贴心为您整理回答...</span>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input Bar with Voice Input (发语音) */}
            <div className="bg-white p-2 rounded-2xl border border-stone-200/90 shadow-sm flex items-center gap-2 shrink-0">
              {/* Voice Input Button */}
              <button
                type="button"
                onClick={startVoiceInput}
                className={`px-3.5 sm:px-4 py-3 rounded-xl flex items-center gap-1.5 font-bold text-sm sm:text-base transition-all shadow-xs shrink-0 ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30'
                    : 'bg-emerald-700 text-white hover:bg-emerald-800 active:scale-95'
                }`}
                title={isListening ? '点击停止录音' : '点击发语音'}
              >
                <Mic className="w-5 h-5" />
                <span>{isListening ? '倾听中...' : '发语音'}</span>
              </button>

              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
                placeholder={isListening ? '正在听您说话，说完将自动发送...' : '问健康、问生活，或直接点发语音...'}
                className="flex-1 px-3.5 py-3 text-base font-medium bg-stone-50 rounded-xl border border-stone-200 outline-none focus:border-stone-400 text-stone-900 placeholder:text-stone-600"
              />

              <button
                disabled={chatLoading || !chatInput.trim()}
                onClick={() => handleSendMessage()}
                className="px-4 sm:px-5 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-30 text-white text-sm sm:text-base font-bold flex items-center gap-1.5 transition-all shrink-0 shadow-xs"
              >
                <span>发送</span>
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================
          MODALS FOR PUNCH-IN ACTIONS
         ======================================================== */}
      {/* MODAL 1: CPAP 呼吸机识别 */}
      {activeModal === 'cpap' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-amber-300 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-stone-100">
              <h3 className="text-2xl font-black text-stone-900 flex items-center gap-2">
                <span>🫁 妈妈 · 拍呼吸机屏幕</span>
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {!cpapResult ? (
              <div className="text-center py-6 space-y-6">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  ref={cpapInputRef}
                  onChange={handleCpapImageUpload}
                  className="hidden"
                />

                <div className="p-6 bg-amber-50 rounded-2xl border-2 border-dashed border-amber-300">
                  <div className="text-5xl mb-3">📸</div>
                  <p className="text-lg font-extrabold text-stone-800 mb-1">
                    请对准呼吸机正面的「睡眠报告」屏幕拍照
                  </p>
                  <p className="text-sm font-semibold text-stone-600">
                    系统会自动提取：使用小时、AHI、漏气量等所有指标
                  </p>
                </div>

                <button
                  disabled={cpapLoading}
                  onClick={() => cpapInputRef.current?.click()}
                  className="w-full py-5 rounded-2xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-2xl font-black shadow-lg shadow-amber-600/30 flex items-center justify-center gap-3 transition-transform active:scale-95"
                >
                  {cpapLoading ? (
                    <>
                      <Loader2 className="w-7 h-7 animate-spin" />
                      Gemini 正在识别屏幕数据...
                    </>
                  ) : (
                    <>
                      <Camera className="w-8 h-8" />
                      点击拍照或从相册选择
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-5 animate-fade-in">
                {/* Result Card */}
                <div className="bg-emerald-50 border-3 border-emerald-300 rounded-2xl p-5 text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-600 text-white text-2xl mb-2 shadow-md">
                    <ThumbsUp className="w-7 h-7" />
                  </div>
                  <h4 className="text-2xl font-black text-emerald-900">
                    打卡成功！昨晚睡得很好！
                  </h4>
                  <p className="text-base font-bold text-emerald-800 mt-2 bg-white/80 p-3 rounded-xl">
                    💬 {cpapResult.aiFeedback}
                  </p>
                </div>

                {/* 6 Key Medical Metrics */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-stone-100 rounded-xl text-center">
                    <div className="text-xs font-bold text-stone-600">使用小时</div>
                    <div className="text-2xl font-black text-stone-900">{cpapResult.usageHours}<span className="text-sm font-normal">h</span></div>
                  </div>
                  <div className="p-3 bg-emerald-100 rounded-xl text-center border-2 border-emerald-300">
                    <div className="text-xs font-bold text-emerald-800">AHI指数</div>
                    <div className="text-2xl font-black text-emerald-900">{cpapResult.ahi}</div>
                  </div>
                  <div className="p-3 bg-stone-100 rounded-xl text-center">
                    <div className="text-xs font-bold text-stone-600">漏气量</div>
                    <div className="text-2xl font-black text-stone-900">{cpapResult.leakRate}<span className="text-sm font-normal">L/m</span></div>
                  </div>
                  <div className="p-3 bg-stone-100 rounded-xl text-center">
                    <div className="text-xs font-bold text-stone-600">治疗压力</div>
                    <div className="text-xl font-bold text-stone-900">{cpapResult.pressure}</div>
                  </div>
                  <div className="p-3 bg-stone-100 rounded-xl text-center">
                    <div className="text-xs font-bold text-stone-600">总AI</div>
                    <div className="text-xl font-bold text-stone-900">{cpapResult.totalAi}</div>
                  </div>
                  <div className="p-3 bg-stone-100 rounded-xl text-center">
                    <div className="text-xs font-bold text-stone-600">中枢AI</div>
                    <div className="text-xl font-bold text-stone-900">{cpapResult.centralAi}</div>
                  </div>
                </div>

                <button
                  onClick={() => setActiveModal(null)}
                  className="w-full py-4 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xl font-black shadow-md transition-colors"
                >
                  好的，已存入健康档案
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: 血压大字打卡 */}
      {activeModal === 'bp' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-blue-300 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-stone-100">
              <h3 className="text-2xl font-black text-stone-900 flex items-center gap-2">
                <span>🩺 爸爸 · 记早晚血压</span>
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {!bpSuccess ? (
              <div className="space-y-6">
                {/* Period Selector */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setBpPeriod('早晨')}
                    className={`py-3.5 rounded-2xl text-xl font-black transition-all ${
                      bpPeriod === '早晨'
                        ? 'bg-amber-500 text-white shadow-md ring-2 ring-amber-300'
                        : 'bg-stone-100 text-stone-700'
                    }`}
                  >
                    🌅 早晨测量
                  </button>
                  <button
                    type="button"
                    onClick={() => setBpPeriod('晚间')}
                    className={`py-3.5 rounded-2xl text-xl font-black transition-all ${
                      bpPeriod === '晚间'
                        ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400'
                        : 'bg-stone-100 text-stone-700'
                    }`}
                  >
                    🌙 晚间测量
                  </button>
                </div>

                {/* Big Inputs */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-stone-50 rounded-2xl border-2 border-stone-200 text-center">
                    <label className="block text-sm font-bold text-stone-600 mb-1">
                      高压 (收缩压)
                    </label>
                    <input
                      type="number"
                      value={systolic}
                      onChange={(e) => setSystolic(e.target.value)}
                      className={`w-full text-center text-4xl font-black py-2 rounded-xl border-2 outline-none ${
                        parseInt(systolic) >= 140
                          ? 'border-rose-500 text-rose-600 bg-rose-50'
                          : parseInt(systolic) >= 130
                          ? 'border-amber-500 text-amber-600 bg-amber-50'
                          : 'border-emerald-500 text-emerald-700 bg-emerald-50'
                      }`}
                    />
                    <span className="text-xs font-bold text-stone-600 mt-1 block">正常 130 以下</span>
                  </div>

                  <div className="p-4 bg-stone-50 rounded-2xl border-2 border-stone-200 text-center">
                    <label className="block text-sm font-bold text-stone-600 mb-1">
                      低压 (舒张压)
                    </label>
                    <input
                      type="number"
                      value={diastolic}
                      onChange={(e) => setDiastolic(e.target.value)}
                      className="w-full text-center text-4xl font-black py-2 rounded-xl border-2 border-blue-400 text-blue-900 bg-blue-50 outline-none"
                    />
                    <span className="text-xs font-bold text-stone-600 mt-1 block">正常 80 以下</span>
                  </div>
                </div>

                {/* Heart Rate */}
                <div className="p-3 bg-stone-50 rounded-2xl flex items-center justify-between px-4 border border-stone-200">
                  <span className="text-base font-bold text-stone-700">❤️ 测量心率 (次/分)：</span>
                  <input
                    type="number"
                    value={heartRate}
                    onChange={(e) => setHeartRate(e.target.value)}
                    className="w-24 text-center text-2xl font-bold p-1 bg-white rounded-lg border border-stone-300"
                  />
                </div>

                <button
                  disabled={bpSubmitting}
                  onClick={handleBpSubmit}
                  className="w-full py-5 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-2xl font-black shadow-lg shadow-blue-600/30 flex items-center justify-center gap-3 transition-transform active:scale-95"
                >
                  {bpSubmitting ? <Loader2 className="w-7 h-7 animate-spin" /> : <Check className="w-8 h-8" />}
                  确认打卡保存
                </button>
              </div>
            ) : (
              <div className="space-y-5 text-center animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto text-3xl shadow-lg">
                  ✓
                </div>
                <h4 className="text-2xl font-black text-stone-900">
                  打卡成功！
                </h4>
                <div className="text-lg font-bold text-stone-800 bg-stone-100 p-4 rounded-2xl">
                  {bpSuccess}
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xl font-black shadow-md transition-colors"
                >
                  完成
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 3: 饮食随手拍 */}
      {activeModal === 'meal' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-emerald-300 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-stone-100">
              <h3 className="text-2xl font-black text-stone-900 flex items-center gap-2">
                <span>🍲 饮食随手拍 · 控盐减脂</span>
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {!mealResult ? (
              <div className="text-center py-6 space-y-6">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  ref={mealInputRef}
                  onChange={handleMealUpload}
                  className="hidden"
                />

                <div className="p-6 bg-emerald-50 rounded-2xl border-2 border-dashed border-emerald-300">
                  <div className="text-5xl mb-3">🥗</div>
                  <p className="text-lg font-extrabold text-stone-800 mb-1">
                    随手拍下今天的餐盘或菜品
                  </p>
                  <p className="text-sm font-semibold text-stone-600">
                    Gemini 营养医生会帮您看咸淡与油脂，给出贴心建议
                  </p>
                </div>

                <button
                  disabled={mealLoading}
                  onClick={() => mealInputRef.current?.click()}
                  className="w-full py-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-2xl font-black shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-3 transition-transform active:scale-95"
                >
                  {mealLoading ? (
                    <>
                      <Loader2 className="w-7 h-7 animate-spin" />
                      正在评估营养与盐分...
                    </>
                  ) : (
                    <>
                      <Camera className="w-8 h-8" />
                      拍照上传餐盘
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-5 animate-fade-in">
                <div className="p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-200">
                  <div className="text-xl font-extrabold text-emerald-950 mb-2">
                    🍲 菜品识别：{mealResult.dishName}
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 rounded-full bg-white text-emerald-800 text-sm font-bold border border-emerald-300">
                      盐分：{mealResult.saltAssessment}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white text-teal-800 text-sm font-bold border border-teal-300">
                      油脂：{mealResult.oilAssessment}
                    </span>
                  </div>
                  <p className="text-base font-bold text-stone-800 bg-white p-3.5 rounded-xl border border-emerald-100">
                    💡 <strong>饮食建议</strong>：{mealResult.advice}
                  </p>
                </div>

                <button
                  onClick={() => setActiveModal(null)}
                  className="w-full py-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xl font-black shadow-md transition-colors"
                >
                  知道了
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
