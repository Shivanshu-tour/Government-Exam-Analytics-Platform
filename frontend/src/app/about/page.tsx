'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { DataSourceBadge } from '@/components/DataSourceBadge';
import { Info, Database, ShieldCheck, Cpu } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <Navbar />

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        <Sidebar className="hidden md:flex" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                <Info className="w-6 h-6 text-sky-400" /> Platform Architecture & Data Transparency
              </h1>
              <p className="text-xs text-slate-400 mt-1">Methodologies, source metadata, and data integrity guarantees.</p>
            </div>
            <DataSourceBadge isDemo={true} />
          </div>

          <div className="space-y-6">
            {/* Core Mission */}
            <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" /> Platform Objective & Principles
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                ExamIntel India is engineered to bridge the gap between static government exam notifications and actionable preparation analytics. The platform combines multi-year recruitment vacancy distributions, cutoff movements across exam phases, syllabus completion tracking, and empirical mock-test performance analytics.
              </p>
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-300">
                <strong>Data Integrity Policy:</strong> Historical statistics are never fabricated or presented as fake official facts. All demonstration datasets are explicitly tagged with <span className="font-semibold underline">Demo Dataset</span> labels until verified official data is uploaded.
              </div>
            </div>

            {/* Analytical Methodology */}
            <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-xl space-y-4">
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-indigo-400" /> Analytical Formulas & Metrics
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5">
                  <span className="font-bold text-sky-400 block">Mock Test Accuracy Formula</span>
                  <div className="font-mono bg-slate-900 p-2 rounded text-slate-200">
                    Accuracy (%) = (Correct Questions / Attempted Questions) × 100
                  </div>
                  <p className="text-slate-400 text-[11px]">Evaluates question-solving precision per subject and test cycle.</p>
                </div>

                <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5">
                  <span className="font-bold text-emerald-400 block">Weak Topic Detection Engine</span>
                  <div className="font-mono bg-slate-900 p-2 rounded text-slate-200">
                    Weak = (Accuracy &lt; 60%) OR (Avg Time &gt; 90s) OR (Attempts &lt; 15)
                  </div>
                  <p className="text-slate-400 text-[11px]">Factor-based evaluation without black-box magic numbers.</p>
                </div>

                <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5">
                  <span className="font-bold text-indigo-400 block">YoY Vacancy Percentage Change</span>
                  <div className="font-mono bg-slate-900 p-2 rounded text-slate-200">
                    Change (%) = [(Vacancies_T - Vacancies_T-1) / Vacancies_T-1] × 100
                  </div>
                  <p className="text-slate-400 text-[11px]">Calculates relative headcount expansion or contraction.</p>
                </div>

                <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5">
                  <span className="font-bold text-amber-400 block">3-Year Multi-Year Cutoff Movement</span>
                  <div className="font-mono bg-slate-900 p-2 rounded text-slate-200">
                    Movement = Cutoff_Latest - Cutoff_Base (3 Years Prior)
                  </div>
                  <p className="text-slate-400 text-[11px]">Tracks historical score benchmark movement over 3-year cycles.</p>
                </div>
              </div>
            </div>

            {/* Data Source Metadata Table */}
            <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-xl space-y-4">
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Database className="w-5 h-5 text-sky-400" /> Data Source Metadata
              </h2>

              <div className="overflow-x-auto border border-slate-800 rounded-lg bg-slate-950">
                <table className="w-full text-xs text-left text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="px-4 py-3">Source Name</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Collection Date</th>
                      <th className="px-4 py-3">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    <tr className="hover:bg-slate-900/50">
                      <td className="px-4 py-3 font-semibold text-slate-200">ExamIntel Synthetic Demo Dataset</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px]">
                          Demo Dataset
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono">2026-09-20</td>
                      <td className="px-4 py-3 text-slate-400">Aggregated multi-cycle baseline for RBI Grade B, SEBI Grade A, NABARD Grade A, SSC CGL, IBPS PO, SBI PO.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
