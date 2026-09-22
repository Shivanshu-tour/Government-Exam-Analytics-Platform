'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { DataSourceBadge } from '@/components/DataSourceBadge';
import { BookOpen, Calendar, TrendingUp, Award, Layers, ExternalLink, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Exam } from '@/types';

export default function ExamDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [exam, setExam] = useState<Exam | null>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    async function loadData() {
      try {
        const [eRes, sRes] = await Promise.all([
          api.get(`/exams/${slug}`),
          api.get(`/syllabus/${slug}`),
        ]);
        setExam(eRes.data);
        setSubjects(sRes.data);
      } catch (err) {
        console.error('Error loading exam detail:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <Navbar />
        <div className="flex-1 p-8 text-center text-slate-400">Loading examination data...</div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <Navbar />
        <div className="flex-1 p-8 text-center text-slate-400">Exam not found.</div>
      </div>
    );
  }

  // Group subjects by Phase
  const phasesMap: Record<string, any[]> = {};
  subjects.forEach((sub) => {
    if (!phasesMap[sub.phase]) {
      phasesMap[sub.phase] = [];
    }
    phasesMap[sub.phase].push(sub);
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <Navbar />

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        <Sidebar className="hidden md:flex" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Header Card */}
          <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                {exam.category}
              </span>
              {exam.official_website && (
                <a
                  href={exam.official_website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-slate-400 hover:text-sky-400 flex items-center gap-1"
                >
                  <span>Official Website</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">{exam.name}</h1>
              <p className="text-xs text-slate-400 font-medium mt-1">Conducting Body: {exam.organization}</p>
              <p className="text-sm text-slate-300 mt-3 leading-relaxed max-w-3xl">{exam.description}</p>
            </div>

            {/* Quick Action Navigation Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href={`/vacancies?exam=${exam.slug}`}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5"
              >
                <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
                <span>Vacancy Trends</span>
              </Link>
              <Link
                href={`/cutoffs?exam=${exam.slug}`}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5"
              >
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                <span>Cutoff Trends</span>
              </Link>
              <Link
                href={`/syllabus?exam=${exam.slug}`}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5"
              >
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>Syllabus Explorer</span>
              </Link>
            </div>
          </div>

          <DataSourceBadge isDemo={true} />

          {/* Exam Structure & Pattern */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-sky-400" /> Exam Structure & Phase Pattern
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.keys(phasesMap).length === 0 ? (
                <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl text-xs text-slate-400">
                  Standard selection process consists of Phase I (Objective), Phase II (Mains), and Interview / Document Verification.
                </div>
              ) : (
                Object.entries(phasesMap).map(([phaseName, subList]) => (
                  <div key={phaseName} className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <h3 className="font-bold text-slate-200 text-sm">{phaseName}</h3>
                      <span className="text-[10px] text-slate-400">{subList.length} Subjects</span>
                    </div>

                    <div className="space-y-2">
                      {subList.map((sub) => (
                        <div key={sub.id} className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/80">
                          <div className="text-xs font-semibold text-sky-400">{sub.name}</div>
                          <div className="text-[11px] text-slate-400 mt-1">
                            {sub.topics.length} Key Topics ({sub.topics.map((t: any) => t.name).slice(0, 3).join(', ')})
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Historical Cycles List */}
          {exam.cycles && exam.cycles.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-400" /> Historical Recruitment Cycles
              </h3>

              <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-900/60">
                <table className="w-full text-xs text-left text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="px-4 py-3">Year</th>
                      <th className="px-4 py-3">Notification</th>
                      <th className="px-4 py-3">Prelims Date</th>
                      <th className="px-4 py-3">Mains Date</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {exam.cycles.map((cycle) => (
                      <tr key={cycle.id} className="hover:bg-slate-800/40">
                        <td className="px-4 py-3 font-semibold text-slate-200">{cycle.year}</td>
                        <td className="px-4 py-3">{cycle.notification_date || 'N/A'}</td>
                        <td className="px-4 py-3">{cycle.prelims_date || 'N/A'}</td>
                        <td className="px-4 py-3">{cycle.mains_date || 'N/A'}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                            {cycle.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
