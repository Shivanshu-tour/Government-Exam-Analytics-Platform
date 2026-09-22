'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { DataSourceBadge } from '@/components/DataSourceBadge';
import { VacancyChart } from '@/components/charts/VacancyChart';
import { TrendingUp, Filter, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { api } from '@/lib/api';
import { Exam } from '@/types';

export default function VacanciesPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<string>('rbi-grade-b');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
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
    async function fetchAnalytics() {
      setLoading(true);
      try {
        let url = `/vacancies/analytics?`;
        if (selectedExam) url += `exam_slug=${selectedExam}&`;
        if (selectedCategory) url += `category=${selectedCategory}&`;

        const res = await api.get(url);
        setAnalytics(res.data);
      } catch (err) {
        console.error('Error fetching vacancy analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, [selectedExam, selectedCategory]);

  const latestYoY = analytics?.yoy_change && analytics.yoy_change.length > 0 ? analytics.yoy_change[analytics.yoy_change.length - 1] : null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <Navbar />

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        <Sidebar className="hidden md:flex" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-sky-400" /> Vacancy Analytics Dashboard
              </h1>
              <p className="text-xs text-slate-400 mt-1">Multi-year headcount trends, category split, and post distribution.</p>
            </div>
            <DataSourceBadge isDemo={true} />
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-4 p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-medium text-slate-300">Exam:</span>
              <select
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
              >
                <option value="">All Exams</option>
                {exams.map((e) => (
                  <option key={e.id} value={e.slug}>{e.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-300">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
              >
                <option value="">All Categories</option>
                <option value="UR">General (UR)</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="EWS">EWS</option>
              </select>
            </div>
          </div>

          {/* Key Metric Card: YoY Change */}
          {latestYoY && (
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Latest Cycle Vacancy Shift ({latestYoY.year})</span>
                <div className="text-2xl font-bold text-slate-100 mt-0.5">
                  {latestYoY.vacancies.toLocaleString('en-IN')} Vacancies
                </div>
              </div>

              {latestYoY.prev_year && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 rounded-lg border border-slate-800">
                  {latestYoY.absolute_change >= 0 ? (
                    <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <ArrowDownRight className="w-5 h-5 text-rose-400" />
                  )}
                  <div className="text-xs">
                    <span className="text-slate-400">vs {latestYoY.prev_year} ({latestYoY.prev_vacancies.toLocaleString('en-IN')}): </span>
                    <span className={`font-bold ${latestYoY.absolute_change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {latestYoY.absolute_change >= 0 ? '+' : ''}{latestYoY.absolute_change} ({latestYoY.percentage_change >= 0 ? '+' : ''}{latestYoY.percentage_change}%)
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Visualizations */}
          {loading ? (
            <div className="h-72 bg-slate-900/40 rounded-xl border border-slate-800 animate-pulse" />
          ) : (
            <div className="space-y-6">
              <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
                <h3 className="text-sm font-bold text-slate-200">Yearly Vacancy Trend</h3>
                <VacancyChart type="trend" data={analytics?.trend || []} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
                  <h3 className="text-sm font-bold text-slate-200">Category Distribution (UR / OBC / EWS / SC / ST)</h3>
                  <VacancyChart type="category" data={analytics?.category_distribution || []} />
                </div>

                <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
                  <h3 className="text-sm font-bold text-slate-200">Post-wise Vacancy Breakdown</h3>
                  <VacancyChart type="post" data={analytics?.post_distribution || []} />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
