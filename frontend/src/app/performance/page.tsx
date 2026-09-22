'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { ScoreTrendChart } from '@/components/charts/ScoreTrendChart';
import { SubjectRadarChart } from '@/components/charts/SubjectRadarChart';
import { TrendingUp, Clock, Target, Award } from 'lucide-react';
import { api, authStorage } from '@/lib/api';
import { UserPerformance } from '@/types';

export default function PerformanceAnalyticsPage() {
  const router = useRouter();
  const [perf, setPerf] = useState<UserPerformance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = authStorage.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    async function loadPerf() {
      try {
        const res = await api.get('/user/performance');
        setPerf(res.data);
      } catch (err) {
        console.error('Error fetching performance analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPerf();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950">
        <Navbar />
        <div className="flex-1 p-8 text-center text-slate-400">Loading performance analytics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <Navbar />

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        <Sidebar className="hidden md:flex" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-sky-400" /> Personal Performance Analytics
            </h1>
            <p className="text-xs text-slate-400 mt-1">Multi-test score trends, accuracy trajectory, and subject radar breakdown.</p>
          </div>

          {/* Core Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
              <span className="text-xs text-slate-400">Average Score</span>
              <div className="text-2xl font-bold text-sky-400">{perf?.average_score || 0} pts</div>
              <span className="text-[11px] text-slate-500">Across {perf?.mocks_completed || 0} mocks</span>
            </div>

            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
              <span className="text-xs text-slate-400">Overall Accuracy</span>
              <div className="text-2xl font-bold text-emerald-400">{perf?.average_accuracy || 0}%</div>
              <span className="text-[11px] text-slate-500">Correct vs attempted</span>
            </div>

            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
              <span className="text-xs text-slate-400">Time Efficiency</span>
              <div className="text-2xl font-bold text-amber-400">1.2m / Q</div>
              <span className="text-[11px] text-slate-500">Average speed benchmark</span>
            </div>

            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
              <span className="text-xs text-slate-400">Strong Subjects</span>
              <div className="text-2xl font-bold text-indigo-400">{perf?.strong_areas_count || 0}</div>
              <span className="text-[11px] text-slate-500">High accuracy subjects</span>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
              <h3 className="text-sm font-bold text-slate-200">Score & Accuracy Progression Timeline</h3>
              <ScoreTrendChart data={perf?.score_trend || []} />
            </div>

            <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
              <h3 className="text-sm font-bold text-slate-200">Subject Accuracy Radar Distribution</h3>
              <SubjectRadarChart data={perf?.subject_performance || []} />
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
