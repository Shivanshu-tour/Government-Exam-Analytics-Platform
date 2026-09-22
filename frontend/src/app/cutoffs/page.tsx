'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { DataSourceBadge } from '@/components/DataSourceBadge';
import { CutoffChart } from '@/components/charts/CutoffChart';
import { Award, Filter, ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';
import { api } from '@/lib/api';
import { Exam } from '@/types';

export default function CutoffsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<string>('rbi-grade-b');
  const [selectedPhase, setSelectedPhase] = useState<string>('Phase I');
  const [selectedCategory, setSelectedCategory] = useState<string>('UR');
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const eRes = await api.get('/exams');
        setExams(eRes.data);
      } catch (err) {
        console.error('Error fetching exams:', err);
      }
    }
    init();
  }, []);

  useEffect(() => {
    async function fetchCutoffs() {
      setLoading(true);
      try {
        let url = `/cutoffs/analytics?exam_slug=${selectedExam}&phase=${encodeURIComponent(selectedPhase)}&category=${selectedCategory}`;
        const res = await api.get(url);
        setAnalytics(res.data);
      } catch (err) {
        console.error('Error fetching cutoff analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCutoffs();
  }, [selectedExam, selectedPhase, selectedCategory]);

  const stats = analytics?.movement_stats;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <Navbar />

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        <Sidebar className="hidden md:flex" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                <Award className="w-6 h-6 text-emerald-400" /> Cutoff Intelligence Dashboard
              </h1>
              <p className="text-xs text-slate-400 mt-1">Analyze multi-year cutoff scores, sectional cutoffs, and 3-year movement trends.</p>
            </div>
            <DataSourceBadge isDemo={true} />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-medium text-slate-300">Exam:</span>
              <select
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
              >
                {exams.map((e) => (
                  <option key={e.id} value={e.slug}>{e.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-300">Phase:</span>
              <select
                value={selectedPhase}
                onChange={(e) => setSelectedPhase(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
              >
                <option value="Phase I">Phase I / Tier 1</option>
                <option value="Phase II">Phase II / Mains</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-300">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
              >
                <option value="UR">General (UR)</option>
                <option value="OBC">OBC</option>
                <option value="EWS">EWS</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
              </select>
            </div>
          </div>

          {/* Movement Statistics Cards */}
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
                <span className="text-xs text-slate-400">Latest Recorded Cutoff</span>
                <div className="text-xl font-bold text-emerald-400">
                  {stats.latest_cutoff !== null ? `${stats.latest_cutoff} marks` : 'N/A'}
                </div>
                <span className="text-[11px] text-slate-500">Year: {stats.latest_year || 'N/A'}</span>
              </div>

              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
                <span className="text-xs text-slate-400">3-Year Multi-Year Movement</span>
                <div className="text-xl font-bold flex items-center gap-1.5 text-slate-100">
                  {stats.movement_3_year >= 0 ? (
                    <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <ArrowDownRight className="w-5 h-5 text-rose-400" />
                  )}
                  <span className={stats.movement_3_year >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    {stats.movement_3_year >= 0 ? '+' : ''}{stats.movement_3_year} pts ({stats.pct_change_3_year >= 0 ? '+' : ''}{stats.pct_change_3_year}%)
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">Historical Movement Trend</span>
              </div>

              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
                <span className="text-xs text-slate-400">Multi-Year Average</span>
                <div className="text-xl font-bold text-slate-100">
                  {stats.avg_cutoff !== null ? `${stats.avg_cutoff} marks` : 'N/A'}
                </div>
                <span className="text-[11px] text-slate-500">Baseline Benchmark</span>
              </div>

              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
                <span className="text-xs text-slate-400">Historical Min / Max Range</span>
                <div className="text-xl font-bold text-slate-100">
                  {stats.min_cutoff} - {stats.max_cutoff}
                </div>
                <span className="text-[11px] text-slate-500">Boundary Bounds</span>
              </div>
            </div>
          )}

          {/* Historical Trend Analysis Label */}
          <div className="p-3 bg-indigo-950/30 border border-indigo-500/20 rounded-lg flex items-center gap-2 text-xs text-indigo-300">
            <Info className="w-4 h-4 shrink-0 text-indigo-400" />
            <span>
              <strong>Historical Trend Analysis:</strong> Cutoff dynamics reflect historical difficulty, paper complexity, and candidate pool size. Future cutoffs are not predicted as static facts.
            </span>
          </div>

          {/* Charts */}
          {loading ? (
            <div className="h-72 bg-slate-900/40 rounded-xl border border-slate-800 animate-pulse" />
          ) : (
            <div className="space-y-6">
              <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
                <h3 className="text-sm font-bold text-slate-200">Overall Historical Cutoff Trend</h3>
                <CutoffChart type="trend" data={analytics?.trend || []} />
              </div>

              {analytics?.sectional_breakdown && analytics.sectional_breakdown.length > 0 && (
                <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
                  <h3 className="text-sm font-bold text-slate-200">Section-wise Cutoff Comparison</h3>
                  <CutoffChart type="sectional" data={analytics.sectional_breakdown} />
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
