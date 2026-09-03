'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, Heart, ShieldCheck, Stethoscope, Users, Cloud } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();

  const isElder = pathname?.startsWith('/elder');

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-sm transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Left Branding */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Heart className="w-6 h-6 fill-current text-white" />
          </div>
          <div>
            <div className="font-bold text-lg text-stone-900 tracking-tight flex items-center gap-1.5">
              <span>家庭健康管家</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium">AI 守护中</span>
            </div>
            <p className="text-xs text-stone-600 hidden sm:block">适老化智能打卡 · 多成员档案 · 云端长效归档</p>
          </div>
        </Link>

        {/* Center / Right Mode Switch */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Elder Mode Button */}
          <Link
            href="/elder"
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              isElder
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20 ring-2 ring-amber-400'
                : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <span className="text-lg">👵</span>
            <span className="font-bold">长辈极简模式</span>
          </Link>

          {/* Admin / Full Board Button */}
          <Link
            href="/admin"
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              pathname === '/admin'
                ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20 ring-2 ring-emerald-400'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">家庭全能看板</span>
            <span className="sm:hidden">管理端</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
