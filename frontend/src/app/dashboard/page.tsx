'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { ScoreTrendChart } from '@/components/charts/ScoreTrendChart';
import {
  LayoutDashboard,
  Flame,
  Award,
  TrendingUp,
  Target,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  ArrowRight
} from 'lucide-react';
import { api, authStorage } from '@/lib/api';
import { UserPerformance, WeakTopic } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [perf, setPerf] = useState<UserPerformance | null>(null);
  const [weakTopics, setWeakTopics] = useState<WeakTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authStorage.getUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);

    async function loadData() {
      try {
        const [pRes, wRes] = await Promise.all([
          api.get('/user/performance'),
          api.get('/user/weak-topics'),
        ]);
        setPerf(pRes.data);
        setWeakTopics(wRes.data);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950">
        <Navbar />
        <div className="flex-1 p-8 text-center text-slate-400">Loading user preparation workspace...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <Navbar />

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        <Sidebar className="hidden md:flex" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Welcome Banner */}
          <div className="p-6 bg-gradient-to-r from-slate-900 via-sky-950/30 to-slate-900 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-sky-400 uppercase tracking-wider">Candidate Preparation Workspace</div>
              <h1 className="text-2xl font-bold text-slate-100 mt-1">Hello, {user?.name || 'Aspirant'}! 👋</h1>
              <p className="text-xs text-slate-400 mt-1">Track mock tests, diagnose weak topics, and monitor syllabus completion.</p>
            </div>
            <Link
              href="/mock-tests"
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-lg shadow-sky-500/20 transition-all w-fit"
            >
              <span>+ Log New Mock Test</span>
            </Link>
          </div>

          {/* Core Overview Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-500" /> Study Streak
              </span>
              <div className="text-xl font-extrabold text-amber-400">
                {perf?.study_streak_days || 12} days
              </div>
              <span className="text-[10px] text-slate-500">Active preparation</span>
            </div>

            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-sky-400" /> Mocks Completed
              </span>
              <div className="text-xl font-extrabold text-slate-100">
                {perf?.mocks_completed || 18}
              </div>
              <span className="text-[10px] text-slate-500">Logged attempts</span>
            </div>

            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Average Score
              </span>
              <div className="text-xl font-extrabold text-emerald-400">
                {perf?.average_score || 72.4}
              </div>
              <span className="text-[10px] text-slate-500">Across full mocks</span>
            </div>

            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-indigo-400" /> Average Accuracy
              </span>
              <div className="text-xl font-extrabold text-indigo-400">
                {perf?.average_accuracy || 81.2}%
              </div>
              <span className="text-[10px] text-slate-500">Overall solving accuracy</span>
            </div>

            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" /> Syllabus Mastered
              </span>
              <div className="text-xl font-extrabold text-slate-100">
                {perf?.syllabus_completion_percent || 64}%
              </div>
              <span className="text-[10px] text-slate-500">Topics completed</span>
            </div>
          </div>

          {/* Performance Trend Chart */}
          <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-200">Recent Mock Performance Progression</h2>
              <Link href="/performance" className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1">
                Detailed Analytics <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <ScoreTrendChart data={perf?.score_trend || []} />
          </div>

          {/* Weak Areas & Strong Areas Split */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weak Areas */}
            <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" /> Actionable Weak Topics
                </h3>
                <Link href="/weak-topics" className="text-xs text-rose-400 hover:underline">
                  View All ({weakTopics.length})
                </Link>
              </div>

              {weakTopics.length === 0 ? (
                <div className="text-xs text-slate-400 py-4 text-center">No weak topics detected! Keep solving mocks.</div>
              ) : (
                <div className="space-y-2.5">
                  {weakTopics.slice(0, 3).map((w) => (
                    <div key={w.topic_id} className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-200">{w.topic_name}</span>
                        <span className="text-rose-400 font-semibold">{w.accuracy}% Acc</span>
                      </div>
                      <div className="text-[11px] text-slate-400">{w.subject_name} • Avg Time: {Math.round(w.avg_time)}s per Q</div>
                      <p className="text-[11px] text-amber-300 bg-amber-500/10 p-1.5 rounded border border-amber-500/20 mt-1">
                        <strong>Rec:</strong> {w.recommendation}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Study Tasks */}
            <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-sky-400" /> Actionable Study Tasks
                </h3>
                <Link href="/preparation" className="text-xs text-sky-400 hover:underline">
                  Update Tracker
                </Link>
              </div>

              <div className="space-y-2.5">
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center gap-3">
                  <input type="checkbox" className="rounded bg-slate-900 border-slate-700 text-sky-500 focus:ring-0" defaultChecked />
                  <div className="text-xs">
                    <span className="font-medium text-slate-200 block">Solve 25 DI Caselets (RBI Phase I)</span>
                    <span className="text-[11px] text-slate-400">Target: Improve average solving speed to &lt; 90s</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center gap-3">
                  <input type="checkbox" className="rounded bg-slate-900 border-slate-700 text-sky-500 focus:ring-0" />
                  <div className="text-xs">
                    <span className="font-medium text-slate-200 block">Revise ESI Inflation & Monetary Policy Chapter</span>
                    <span className="text-[11px] text-slate-400">Target: Attempt 15 PYQs from 2024 cycle</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center gap-3">
                  <input type="checkbox" className="rounded bg-slate-900 border-slate-700 text-sky-500 focus:ring-0" />
                  <div className="text-xs">
                    <span className="font-medium text-slate-200 block">Attempt RBI Grade B Full Mock #3</span>
                    <span className="text-[11px] text-slate-400">Scheduled: 2026-09-25</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
