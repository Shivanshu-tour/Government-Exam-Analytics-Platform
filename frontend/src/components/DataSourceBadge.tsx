'use client';

import React from 'react';
import { Database, Info } from 'lucide-react';

interface DataSourceBadgeProps {
  sourceName?: string;
  isDemo?: boolean;
  lastUpdated?: string;
}

export function DataSourceBadge({
  sourceName = 'ExamIntel Aggregated Public Notifications',
  isDemo = true,
  lastUpdated = '2026-09-20',
}: DataSourceBadgeProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-900/60 border border-slate-800 rounded-lg text-xs text-slate-400 my-4">
      <div className="flex items-center gap-1.5 font-medium text-slate-300">
        <Database className="w-3.5 h-3.5 text-sky-400" />
        <span>Data Source:</span>
        <span className="text-slate-200 underline decoration-slate-600 underline-offset-2">{sourceName}</span>
      </div>

      {isDemo && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <Info className="w-3 h-3" />
          Demo Dataset
        </span>
      )}

      {lastUpdated && <span className="ml-auto text-slate-500">Collected: {lastUpdated}</span>}
    </div>
  );
}
