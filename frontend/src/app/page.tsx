'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { DataSourceBadge } from '@/components/DataSourceBadge';
import { ArrowRight, BarChart3, TrendingUp, Award, Layers, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Exam } from '@/types';

export default function LandingPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadExams() {
      try {
        const res = await api.get('/exams');
        setExams(res.data);
      } catch (err) {
        console.error('Failed to load exams:', err);
      } finally {
        setLoading(false);
      }
    }
    loadExams();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-900 bg-gradient-to-b from-slate-950 via-slate-900/50 to-slate-950">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              Indian Government Exam Analytics Platform
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-100 tracking-tight leading-tight">
              Understand Government Exams <span className="bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">Through Data.</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Analyze vacancies, cutoffs, exam patterns and your own preparation performance in one place.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link
                href="/exams"
                className="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-sky-500/20 transition-all"
              >
                <span>Explore Exams</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/analytics"
                className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold text-sm flex items-center gap-2 transition-all"
              >
                <BarChart3 className="w-4 h-4 text-sky-400" />
                <span>Open Analytics</span>
              </Link>
            </div>

            <div className="pt-2">
              <DataSourceBadge sourceName="Official Exam Notifications & Aggregated Results" isDemo={true} />
            </div>
          </div>
        </section>

        {/* EXAM CARDS GRID */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Supported Competitive Examinations</h2>
              <p className="text-slate-400 text-sm mt-1">Multi-cycle analysis for top regulatory, banking, and recruitment exams.</p>
            </div>
            <Link href="/compare" className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1">
              Compare All Exams →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-56 bg-slate-900/50 border border-slate-800 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exams.map((exam) => (
                <Link
                  key={exam.id}
                  href={`/exams/${exam.slug}`}
                  className="group relative p-6 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition-all shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                        {exam.category}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">Cycle: {exam.latest_cycle_year || 2025}</span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-100 group-hover:text-sky-400 transition-colors">
                      {exam.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 font-medium">{exam.organization}</p>

                    <p className="text-xs text-slate-400 mt-3 line-clamp-2 leading-relaxed">
                      {exam.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Latest Vacancies</span>
                      <span className="font-semibold text-slate-200">{exam.total_vacancies_latest ? exam.total_vacancies_latest.toLocaleString('en-IN') : 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Phases</span>
                      <span className="font-semibold text-slate-200">{exam.slug.includes('ssc') ? '2 Tiers' : 'Phase I, II & Interview'}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sky-400 font-semibold group-hover:translate-x-1 inline-block transition-transform">
                        Explore →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* CORE ANALYTICAL PILLARS */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900/40 border-y border-slate-900">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">Designed for Serious Data Analysis</h2>
              <p className="text-slate-400 text-sm mt-2">Replace guesswork with empirical statistics, score trends, and weak topic detection.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                <div className="p-2.5 w-fit bg-sky-500/10 text-sky-400 rounded-lg">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-200 text-base">Vacancy Trends</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Track YoY changes, category distribution splits (UR, OBC, SC, ST, EWS), and post-wise recruitment shifts.
                </p>
              </div>

              <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                <div className="p-2.5 w-fit bg-emerald-500/10 text-emerald-400 rounded-lg">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-200 text-base">Cutoff Intelligence</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Analyze overall vs sectional cutoffs across phases with dynamic 3-year movement calculators.
                </p>
              </div>

              <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                <div className="p-2.5 w-fit bg-indigo-500/10 text-indigo-400 rounded-lg">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-200 text-base">Syllabus Breakdown</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Interactive 4-tier hierarchy (Exam → Phase → Subject → Topic) with syllabus progress completion counters.
                </p>
              </div>

              <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                <div className="p-2.5 w-fit bg-rose-500/10 text-rose-400 rounded-lg">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-200 text-base">Weak Topic Engine</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Transparent factor-based weak topic detector evaluating accuracy, average solving time, and mistake counts.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
