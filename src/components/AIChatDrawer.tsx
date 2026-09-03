'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, Bot, User, Loader2, MessageSquare } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIChatDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: '您好！我是您的 24 小时 AI 家庭健康医生助手 🩺。无论您想咨询爸妈的血压波动、呼吸机面罩调节、低盐饮食搭配，还是毛孩子的疫苗驱虫，都可以随时向我提问！',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input.trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: query };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      if (data.success && data.reply) {
        setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
      } else {
        setMessages([...newMessages, { role: 'assistant', content: '抱歉，暂时连接不稳定，请稍后再试。' }]);
      }
    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: '网络异常，请检查连接。' }]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    '👨 爸爸今晨收缩压138偏高，怎么办？',
    '👩 呼吸机漏气量偏大该怎么调整？',
    '🥗 高血压老人晚饭吃什么菜控钠最有效？',
    '🐶 狗狗体外驱虫多久做一次？',
  ];

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        id="open-ai-chat-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-tr from-teal-700 to-emerald-600 text-white shadow-2xl hover:scale-105 transition-transform flex items-center gap-2 group ring-4 ring-white"
        title="打开 AI 家庭健康医生"
      >
        <Sparkles className="w-6 h-6 animate-pulse" />
        <span className="font-bold text-sm hidden sm:inline pr-1">AI 家庭医生</span>
      </button>

      {/* Drawer Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end p-0 sm:p-6 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full sm:w-[420px] h-[90vh] sm:h-[650px] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-stone-200">
            {/* Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-teal-800 to-emerald-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">
                  🩺
                </div>
                <div>
                  <h3 className="font-bold text-base">AI 家庭医生助手</h3>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>国内直连 · 随时在线解答</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Message Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50 text-sm">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-2.5 ${
                    m.role === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${
                      m.role === 'user'
                        ? 'bg-amber-600 text-white'
                        : 'bg-teal-700 text-white'
                    }`}
                  >
                    {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div
                    className={`p-3.5 rounded-2xl max-w-[82%] leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-amber-600 text-white rounded-tr-none'
                        : 'bg-white text-stone-800 border border-stone-200 shadow-sm rounded-tl-none'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2.5 text-stone-600 p-2">
                  <div className="w-8 h-8 rounded-full bg-teal-700 text-white flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-white border border-stone-200 p-3 rounded-2xl flex items-center gap-2 text-xs">
                    <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                    AI 医生正在分析并组织通俗建议...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            <div className="px-4 py-2 bg-white border-t border-stone-100 flex gap-1.5 overflow-x-auto text-xs no-scrollbar">
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  className="px-2.5 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 whitespace-nowrap shrink-0 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input Box */}
            <div className="p-3 bg-white border-t border-stone-200">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="输入您的健康、饮食或用药疑问..."
                  className="flex-1 px-4 py-2.5 bg-stone-100 rounded-xl text-sm border-0 focus:ring-2 focus:ring-teal-600 outline-none"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="p-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
