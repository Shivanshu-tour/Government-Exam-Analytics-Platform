'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { DataSourceBadge } from '@/components/DataSourceBadge';
import { DifficultyChart } from '@/components/charts/DifficultyChart';
import { HelpCircle, Filter, Eye, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { Question, Exam } from '@/types';

export default function QuestionsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<string>('rbi-grade-b');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [difficultyData, setDifficultyData] = useState<any>(null);
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});
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
    async function loadQuestions() {
      setLoading(true);
      try {
        let qUrl = `/questions?limit=50&`;
        if (selectedExam) qUrl += `exam_slug=${selectedExam}&`;
        if (selectedDifficulty) qUrl += `difficulty=${selectedDifficulty}&`;

        let dUrl = `/analytics/difficulty?`;
        if (selectedExam) dUrl += `exam_slug=${selectedExam}&`;

        const [qRes, dRes] = await Promise.all([
          api.get(qUrl),
          api.get(dUrl),
        ]);

        setQuestions(qRes.data);
        setDifficultyData(dRes.data);
      } catch (err) {
        console.error('Error loading questions:', err);
      } finally {
        setLoading(false);
      }
    }
    loadQuestions();
  }, [selectedExam, selectedDifficulty]);

  const toggleAnswer = (id: number) => {
    setRevealedAnswers((prev) => ({ ...prev, [id]: !prev[id] }));
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
                <HelpCircle className="w-6 h-6 text-emerald-400" /> Previous-Year Question (PYQ) Explorer
              </h1>
              <p className="text-xs text-slate-400 mt-1">Filter by exam, difficulty, subject, and topic with step-by-step solutions.</p>
            </div>
            <DataSourceBadge isDemo={true} />
          </div>

          {/* Filters Bar */}
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
              <span className="text-xs font-medium text-slate-300">Difficulty:</span>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
              >
                <option value="">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Moderate">Moderate</option>
                <option value="Difficult">Difficult</option>
              </select>
            </div>
          </div>

          {/* Difficulty Breakdown Analytics Chart */}
          {difficultyData && (
            <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-200">Historical Question Difficulty Breakdown</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Questions are classified by complexity. High-difficulty questions emphasize multi-concept DI and analytical reasoning.
                </p>
                <div className="flex gap-4 mt-4 text-xs font-medium">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    <span className="text-slate-300">Easy: {difficultyData.overall_distribution.Easy}%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <span className="text-slate-300">Moderate: {difficultyData.overall_distribution.Moderate}%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-rose-400" />
                    <span className="text-slate-300">Difficult: {difficultyData.overall_distribution.Difficult}%</span>
                  </div>
                </div>
              </div>
              <DifficultyChart distribution={difficultyData.overall_distribution} />
            </div>
          )}

          {/* Question Cards List */}
          {loading ? (
            <div className="h-64 bg-slate-900/40 border border-slate-800 rounded-xl animate-pulse" />
          ) : questions.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm bg-slate-900/40 rounded-xl border border-slate-800">
              No questions found for the selected filter criteria.
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((q) => {
                const isRevealed = revealedAnswers[q.id];
                return (
                  <div key={q.id} className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-sky-400">{q.exam_name}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400">{q.year} ({q.phase})</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-300">{q.subject_name}</span>
                      </div>

                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                          q.difficulty === 'Easy'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : q.difficulty === 'Moderate'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}
                      >
                        {q.difficulty}
                      </span>
                    </div>

                    <div className="text-sm font-medium text-slate-200 leading-relaxed font-mono whitespace-pre-wrap">
                      {q.question_text}
                    </div>

                    {/* Options list */}
                    {q.options && q.options.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                        {q.options.map((opt, idx) => (
                          <div key={idx} className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300">
                            <span className="font-bold text-slate-500 mr-2">{String.fromCharCode(65 + idx)}.</span>
                            <span>{opt}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Answer & Explanation reveal toggle */}
                    <div className="pt-2">
                      <button
                        onClick={() => toggleAnswer(q.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-sky-400" />
                        <span>{isRevealed ? 'Hide Solution' : 'Show Correct Answer & Explanation'}</span>
                      </button>

                      {isRevealed && (
                        <div className="mt-3 p-4 bg-slate-950 border border-emerald-500/20 rounded-lg space-y-2 text-xs">
                          <div className="flex items-center gap-2 font-bold text-emerald-400">
                            <CheckCircle className="w-4 h-4" />
                            <span>Correct Answer: {q.correct_answer}</span>
                          </div>
                          {q.explanation && (
                            <div className="text-slate-300 leading-relaxed pt-1 border-t border-slate-900">
                              <span className="font-semibold text-slate-400 block mb-1">Step-by-step Solution:</span>
                              {q.explanation}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
