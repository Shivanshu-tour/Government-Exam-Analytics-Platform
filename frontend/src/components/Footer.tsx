'use client';

import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full bg-slate-950 border-t border-slate-900 py-8 px-4 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        <div>
          <div className="font-semibold text-slate-300">ExamIntel India — Government Exam Analytics Platform</div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Empowering competitive exam aspirants through rigorous data analytics, historical trends, and preparation metrics.
          </p>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <Link href="/about" className="hover:text-slate-200">Data Sources & Transparency</Link>
          <span>•</span>
          <Link href="/exams" className="hover:text-slate-200">Exams Catalog</Link>
          <span>•</span>
          <Link href="/analytics" className="hover:text-slate-200">Analytics</Link>
        </div>
      </div>
    </footer>
  );
}
