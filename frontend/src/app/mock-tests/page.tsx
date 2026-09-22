'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { BarChart3, Plus, X, Calendar, CheckCircle2 } from 'lucide-react';
import { api, authStorage } from '@/lib/api';
import { MockTest, Exam, Subject } from '@/types';

export default function MockTestsPage() {
  const router = useRouter();
  const [mockTests, setMockTests] = useState<MockTest[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<number>(0);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form State
  const [mockName, setMockName] = useState('');
  const [mockDate, setMockDate] = useState('2026-09-22');
  const [resultsInput, setResultsInput] = useState<
    Array<{ subject_id: number; attempted: number; correct: number; incorrect: number; score: number; time_taken: number }>
  >([]);

  useEffect(() => {
    const user = authStorage.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    async function loadData() {
      try {
        const [mRes, eRes] = await Promise.all([
          api.get('/mock-tests'),
          api.get('/exams'),
        ]);
        setMockTests(mRes.data);
        setExams(eRes.data);
        if (eRes.data.length > 0) {
          setSelectedExamId(eRes.data[0].id);
        }
      } catch (err) {
        console.error('Error fetching mock tests:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  useEffect(() => {
    if (!selectedExamId) return;
    const exam = exams.find((e) => e.id === selectedExamId);
    if (!exam || !exam.slug) return;

    async function loadSubjects() {
      try {
        const res = await api.get(`/syllabus/${exam!.slug}`);
        setSubjects(res.data);
        // Pre-fill results input for each subject
        const initialResults = res.data.map((s: Subject) => ({
          subject_id: s.id,
          attempted: 25,
          correct: 18,
          incorrect: 7,
          score: 16.25,
          time_taken: 20.0,
        }));
        setResultsInput(initialResults);
      } catch (err) {
        console.error('Error loading subjects:', err);
      }
    }
    loadSubjects();
  }, [selectedExamId, exams]);

  const handleResultChange = (idx: number, field: string, val: number) => {
    const updated = [...resultsInput];
    (updated[idx] as any)[field] = val;
    setResultsInput(updated);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/mock-tests', {
        exam_id: selectedExamId,
        name: mockName || 'Full Length Practice Mock',
        date: mockDate,
        results: resultsInput,
      });

      // Refresh mock tests list
      const res = await api.get('/mock-tests');
      setMockTests(res.data);
      setIsFormOpen(false);
      setMockName('');
    } catch (err) {
      console.error('Error logging mock test:', err);
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
                <BarChart3 className="w-6 h-6 text-sky-400" /> Mock Test Performance Tracker
              </h1>
              <p className="text-xs text-slate-400 mt-1">Log mock attempts with automatic Accuracy, Attempt Rate, and Error Rate calculation.</p>
            </div>

            <button
              onClick={() => setIsFormOpen(true)}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-sky-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Log Mock Test</span>
            </button>
          </div>

          {/* Log Mock Test Modal / Form */}
          {isFormOpen && (
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="text-base font-bold text-slate-100">Log New Mock Test Result</h2>
                <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-200">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Target Examination</label>
                    <select
                      value={selectedExamId}
                      onChange={(e) => setSelectedExamId(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200"
                    >
                      {exams.map((e) => (
                        <option key={e.id} value={e.id}>{e.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Mock Name / Code</label>
                    <input
                      type="text"
                      value={mockName}
                      onChange={(e) => setMockName(e.target.value)}
                      placeholder="e.g. RBI Grade B Full Mock #3"
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Attempt Date</label>
                    <input
                      type="date"
                      value={mockDate}
                      onChange={(e) => setMockDate(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200"
                    />
                  </div>
                </div>

                {/* Per Subject Input Fields */}
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-bold text-slate-300 block">Subject Breakdown:</span>
                  {subjects.map((sub, idx) => (
                    <div key={sub.id} className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                      <span className="text-xs font-bold text-sky-400">{sub.name} ({sub.phase})</span>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-500 block">Attempted</span>
                          <input
                            type="number"
                            value={resultsInput[idx]?.attempted || 0}
                            onChange={(e) => handleResultChange(idx, 'attempted', Number(e.target.value))}
                            className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-slate-200"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Correct</span>
                          <input
                            type="number"
                            value={resultsInput[idx]?.correct || 0}
                            onChange={(e) => handleResultChange(idx, 'correct', Number(e.target.value))}
                            className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-emerald-400"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Incorrect</span>
                          <input
                            type="number"
                            value={resultsInput[idx]?.incorrect || 0}
                            onChange={(e) => handleResultChange(idx, 'incorrect', Number(e.target.value))}
                            className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-rose-400"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Score</span>
                          <input
                            type="number"
                            step="0.25"
                            value={resultsInput[idx]?.score || 0}
                            onChange={(e) => handleResultChange(idx, 'score', Number(e.target.value))}
                            className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-slate-200"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Time (Mins)</span>
                          <input
                            type="number"
                            value={resultsInput[idx]?.time_taken || 0}
                            onChange={(e) => handleResultChange(idx, 'time_taken', Number(e.target.value))}
                            className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-slate-200"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold"
                  >
                    Save Mock Results
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Logged Mock Tests List */}
          {loading ? (
            <div className="h-64 bg-slate-900/40 rounded-xl border border-slate-800 animate-pulse" />
          ) : mockTests.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm bg-slate-900/40 border border-slate-800 rounded-xl">
              No mock test attempts logged yet. Click "Log Mock Test" above to add your first attempt!
            </div>
          ) : (
            <div className="space-y-4">
              {mockTests.map((t) => (
                <div key={t.id} className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-xs font-bold text-sky-400">{t.exam_name}</span>
                      <h3 className="text-base font-bold text-slate-100">{t.name}</h3>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" /> Attempted: {t.date}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-medium">
                      <div className="text-right">
                        <span className="text-slate-400 block text-[10px]">Total Score</span>
                        <span className="font-extrabold text-slate-100 text-base">{t.total_score} pts</span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 block text-[10px]">Accuracy</span>
                        <span className="font-extrabold text-emerald-400 text-base">{t.accuracy}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Calculated Rate Metrics */}
                  <div className="grid grid-cols-3 gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800/80 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Accuracy Rate</span>
                      <span className="font-semibold text-emerald-400">{t.accuracy}%</span>
                      <p className="text-[10px] text-slate-500">Correct / Attempted</p>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Attempt Rate</span>
                      <span className="font-semibold text-sky-400">{t.attempt_rate}%</span>
                      <p className="text-[10px] text-slate-500">Attempted / Benchmark</p>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Error Rate</span>
                      <span className="font-semibold text-rose-400">{t.error_rate}%</span>
                      <p className="text-[10px] text-slate-500">Incorrect / Attempted</p>
                    </div>
                  </div>

                  {/* Subject Breakdown Table */}
                  <div className="overflow-x-auto border border-slate-800 rounded-lg bg-slate-950/60">
                    <table className="w-full text-xs text-left text-slate-300">
                      <thead className="bg-slate-900 text-slate-400 uppercase text-[10px]">
                        <tr>
                          <th className="px-3 py-2">Subject</th>
                          <th className="px-3 py-2">Attempted</th>
                          <th className="px-3 py-2">Correct</th>
                          <th className="px-3 py-2">Incorrect</th>
                          <th className="px-3 py-2">Score</th>
                          <th className="px-3 py-2">Time (mins)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {t.results.map((r) => (
                          <tr key={r.id} className="hover:bg-slate-900/40">
                            <td className="px-3 py-2 font-medium text-slate-200">{r.subject_name}</td>
                            <td className="px-3 py-2">{r.attempted}</td>
                            <td className="px-3 py-2 text-emerald-400 font-semibold">{r.correct}</td>
                            <td className="px-3 py-2 text-rose-400">{r.incorrect}</td>
                            <td className="px-3 py-2 font-bold text-slate-100">{r.score}</td>
                            <td className="px-3 py-2 text-slate-400">{r.time_taken}m</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
