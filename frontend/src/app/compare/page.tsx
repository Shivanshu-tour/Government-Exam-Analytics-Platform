'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { DataSourceBadge } from '@/components/DataSourceBadge';
import { Columns, Check, ExternalLink } from 'lucide-react';
import { api } from '@/lib/api';
import { Exam } from '@/types';

export default function ComparePage() {
  const [allExams, setAllExams] = useState<Exam[]>([]);
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>(['rbi-grade-b', 'sebi-grade-a', 'nabard-grade-a']);
  const [comparisonData, setComparisonData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const eRes = await api.get('/exams');
        setAllExams(eRes.data);
      } catch (err) {
        console.error('Error loading exams list:', err);
      }
    }
    init();
  }, []);

  useEffect(() => {
    async function loadComparison() {
      if (selectedSlugs.length === 0) {
        setComparisonData([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const queryStr = selectedSlugs.map((s) => `slugs=${s}`).join('&');
        const res = await api.get(`/compare?${queryStr}`);
        setComparisonData(res.data);
      } catch (err) {
        console.error('Error loading comparison data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadComparison();
  }, [selectedSlugs]);

  const toggleExam = (slug: string) => {
    if (selectedSlugs.includes(slug)) {
      if (selectedSlugs.length <= 1) return; // keep at least 1
      setSelectedSlugs(selectedSlugs.filter((s) => s !== slug));
    } else {
      if (selectedSlugs.length >= 4) return; // max 4 for side-by-side view
      setSelectedSlugs([...selectedSlugs, slug]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <Navbar />

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        <Sidebar className="hidden md:flex" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                <Columns className="w-6 h-6 text-sky-400" /> Exam Comparison Matrix
              </h1>
              <p className="text-xs text-slate-400 mt-1">Side-by-side analysis of vacancies, subjects, phases, syllabus depth, and cutoffs.</p>
            </div>
            <DataSourceBadge isDemo={true} />
          </div>

          {/* Exam Selector Checkboxes */}
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
            <span className="text-xs font-semibold text-slate-300 block">Select Exams to Compare (Max 4):</span>
            <div className="flex flex-wrap gap-2">
              {allExams.map((e) => {
                const isSelected = selectedSlugs.includes(e.slug);
                return (
                  <button
                    key={e.id}
                    onClick={() => toggleExam(e.slug)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-all ${
                      isSelected
                        ? 'bg-sky-600/20 text-sky-300 border-sky-500/40'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-sky-400" />}
                    <span>{e.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comparison Matrix Table */}
          {loading ? (
            <div className="h-72 bg-slate-900/40 rounded-xl border border-slate-800 animate-pulse" />
          ) : comparisonData.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm bg-slate-900/40 rounded-xl border border-slate-800">
              Select exams above to compare.
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-900/60">
              <table className="w-full text-xs text-left text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-4 w-48 border-r border-slate-800">Comparison Attribute</th>
                    {comparisonData.map((item) => (
                      <th key={item.id} className="px-4 py-4 font-bold text-slate-100 text-sm">
                        {item.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  <tr>
                    <td className="px-4 py-3 font-semibold text-slate-400 border-r border-slate-800 bg-slate-950/40">Conducting Body</td>
                    {comparisonData.map((item) => (
                      <td key={item.id} className="px-4 py-3 font-medium text-slate-200">{item.organization}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-semibold text-slate-400 border-r border-slate-800 bg-slate-950/40">Category</td>
                    {comparisonData.map((item) => (
                      <td key={item.id} className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px]">
                          {item.category}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-semibold text-slate-400 border-r border-slate-800 bg-slate-950/40">Latest Vacancies ({comparisonData[0]?.latest_year})</td>
                    {comparisonData.map((item) => (
                      <td key={item.id} className="px-4 py-3 font-bold text-sky-400 text-sm">
                        {item.vacancies ? item.vacancies.toLocaleString('en-IN') : 'N/A'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-semibold text-slate-400 border-r border-slate-800 bg-slate-950/40">Phases Breakdown</td>
                    {comparisonData.map((item) => (
                      <td key={item.id} className="px-4 py-3 text-slate-300">
                        {item.phases.join(' → ')}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-semibold text-slate-400 border-r border-slate-800 bg-slate-950/40">Subjects Covered</td>
                    {comparisonData.map((item) => (
                      <td key={item.id} className="px-4 py-3 text-slate-300">
                        <ul className="list-disc pl-4 space-y-0.5">
                          {item.subjects.map((sub: string, i: number) => (
                            <li key={i}>{sub}</li>
                          ))}
                        </ul>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-semibold text-slate-400 border-r border-slate-800 bg-slate-950/40">Syllabus Depth (Total Topics)</td>
                    {comparisonData.map((item) => (
                      <td key={item.id} className="px-4 py-3 font-bold text-slate-200">
                        {item.total_topics} topics
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-semibold text-slate-400 border-r border-slate-800 bg-slate-950/40">Latest General (UR) Cutoff</td>
                    {comparisonData.map((item) => (
                      <td key={item.id} className="px-4 py-3 font-bold text-emerald-400">
                        {item.latest_ur_cutoff}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
