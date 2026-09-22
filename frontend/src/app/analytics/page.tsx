'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { DataSourceBadge } from '@/components/DataSourceBadge';
import { VacancyChart } from '@/components/charts/VacancyChart';
import { CutoffChart } from '@/components/charts/CutoffChart';
import { BarChart3, Filter, Award, TrendingUp, Sparkles, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { Exam } from '@/types';

export default function AnalyticsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<string>('rbi-grade-b');
  const [overview, setOverview] = useState<any>(null);
  const [vacAnalytics, setVacAnalytics] = useState<any>(null);
  const [cutAnalytics, setCutAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const eRes = await api.get('/exams');
        setExams(eRes.data);
      } catch (err) {
        console.error('Error loading exams:', err);
      }
    }
    init();
  }, []);

  useEffect(() => {
    async function loadAllAnalytics() {
      setLoading(true);
      try {
        const [oRes, vRes, cRes] = await Promise.all([
          api.get(`/analytics/overview?exam_slug=${selectedExam}`),
          api.get(`/vacancies/analytics?exam_slug=${selectedExam}`),
          api.get(`/cutoffs/analytics?exam_slug=${selectedExam}`),
        ]);

        setOverview(oRes.data);
        setVacAnalytics(vRes.data);
        setCutAnalytics(cRes.data);
      } catch (err) {
        console.error('Error fetching analytics overview:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAllAnalytics();
  }, [selectedExam]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <Navbar />

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        <Sidebar className="hidden md:flex" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-sky-400" /> Platform Intelligence & Analytics
              </h1>
              <p className="text-xs text-slate-400 mt-1">Cross-examination analytics, factual observations, and historical metrics.</p>
            </div>
            <DataSourceBadge isDemo={true} />
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-3 p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-medium text-slate-300">Exam Scope:</span>
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

          {/* Metric Cards Grid */}
          {overview && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Total Vacancies</span>
                <div className="text-2xl font-bold text-sky-400">
                  {overview.total_vacancies.toLocaleString('en-IN')}
                </div>
                <span className="text-[10px] text-slate-500">Across recorded cycles</span>
              </div>

              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Average Cutoff</span>
                <div className="text-2xl font-bold text-emerald-400">
                  {overview.average_cutoff} pts
                </div>
                <span className="text-[10px] text-slate-500">General (UR) overall</span>
              </div>

              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Highest Cutoff</span>
                <div className="text-2xl font-bold text-amber-400">
                  {overview.highest_cutoff} pts
                </div>
                <span className="text-[10px] text-slate-500">Peak historical score</span>
              </div>

              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Lowest Cutoff</span>
                <div className="text-2xl font-bold text-slate-300">
                  {overview.lowest_cutoff} pts
                </div>
                <span className="text-[10px] text-slate-500">Minimum recorded threshold</span>
              </div>
            </div>
          )}

          {/* Factual Key Data Insights Section */}
          {overview?.key_data_insights && overview.key_data_insights.length > 0 && (
            <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 border border-indigo-500/20 rounded-xl space-y-3">
              <div className="flex items-center gap-2 font-bold text-slate-100 text-sm">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Key Factual Data Insights</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300 list-disc pl-5">
                {overview.key_data_insights.map((insight: string, idx: number) => (
                  <li key={idx} className="leading-relaxed">{insight}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Charts */}
          {loading ? (
            <div className="h-72 bg-slate-900/40 rounded-xl border border-slate-800 animate-pulse" />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
                <h3 className="text-sm font-bold text-slate-200">Historical Vacancy Movement</h3>
                <VacancyChart type="trend" data={vacAnalytics?.trend || []} />
              </div>

              <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
                <h3 className="text-sm font-bold text-slate-200">Historical Cutoff Movement</h3>
                <CutoffChart type="trend" data={cutAnalytics?.trend || []} />
              </div>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
