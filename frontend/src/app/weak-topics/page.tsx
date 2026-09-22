'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { AlertTriangle, Clock, Target, CheckCircle2, RefreshCw } from 'lucide-react';
import { api, authStorage } from '@/lib/api';
import { WeakTopic } from '@/types';

export default function WeakTopicsPage() {
  const router = useRouter();
  const [weakTopics, setWeakTopics] = useState<WeakTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = authStorage.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    async function loadWeakTopics() {
      try {
        const res = await api.get('/user/weak-topics');
        setWeakTopics(res.data);
      } catch (err) {
        console.error('Error fetching weak topics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadWeakTopics();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950">
        <Navbar />
        <div className="flex-1 p-8 text-center text-slate-400">Analyzing weak topics using empirical metrics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <Navbar />

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        <Sidebar className="hidden md:flex" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-rose-400" /> Transparent Weak Topic Detection Engine
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Factor-based evaluation evaluating accuracy, average solving time, question attempts, and recent mistake rates.
            </p>
          </div>

          {weakTopics.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm bg-slate-900/40 border border-slate-800 rounded-xl">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <span>Great job! No weak topics detected with accuracy below 60%. Keep solving mock tests to maintain accuracy!</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {weakTopics.map((item) => (
                <div key={item.topic_id} className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div>
                      <span className="text-[10px] text-sky-400 font-semibold uppercase">{item.exam_name} • {item.subject_name}</span>
                      <h3 className="text-base font-bold text-slate-100">{item.topic_name}</h3>
                    </div>
                    <span className="text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded">
                      {item.accuracy}% Accuracy
                    </span>
                  </div>

                  {/* Empirical Factor Grid */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-950 p-3 rounded-lg text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Avg Time</span>
                      <span className="text-amber-400 font-bold">{Math.floor(item.avg_time / 60)}m {Math.round(item.avg_time % 60)}s</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Attempts</span>
                      <span className="text-slate-200 font-bold">{item.attempts} Qs</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Recent Acc</span>
                      <span className="text-rose-400 font-bold">{item.recent_accuracy}%</span>
                    </div>
                  </div>

                  {/* Identified Reasons */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-slate-400 block">Diagnostic Factors:</span>
                    <ul className="text-xs text-slate-300 space-y-1 list-disc pl-4">
                      {item.reasons.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Recommendation Card */}
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-300 space-y-1">
                    <span className="font-bold block flex items-center gap-1">
                      <RefreshCw className="w-3.5 h-3.5 text-amber-400" /> Actionable Revision Plan:
                    </span>
                    <p className="leading-relaxed">{item.recommendation}</p>
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
