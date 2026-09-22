'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { Bookmark, BookOpen } from 'lucide-react';
import { api } from '@/lib/api';
import { Exam } from '@/types';

export default function SavedExamsPage() {
  const [savedExams, setSavedExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadExams() {
      try {
        const res = await api.get('/exams');
        // Filter top 3 saved exams as bookmarks for demo
        setSavedExams(res.data.slice(0, 3));
      } catch (err) {
        console.error('Error loading saved exams:', err);
      } finally {
        setLoading(false);
      }
    }
    loadExams();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <Navbar />

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        <Sidebar className="hidden md:flex" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <Bookmark className="w-6 h-6 text-sky-400" /> Saved & Tracked Examinations
            </h1>
            <p className="text-xs text-slate-400 mt-1">Quick access to bookmarked exam dashboards, cutoffs, and notifications.</p>
          </div>

          {loading ? (
            <div className="h-44 bg-slate-900/40 rounded-xl border border-slate-800 animate-pulse" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedExams.map((e) => (
                <div key={e.id} className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                      {e.category}
                    </span>
                    <span className="text-xs text-slate-400">Bookmarked</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-100">{e.name}</h3>
                  <p className="text-xs text-slate-400">{e.organization}</p>
                  <div className="pt-2 flex justify-end">
                    <Link
                      href={`/exams/${e.slug}`}
                      className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold"
                    >
                      Open Dashboard
                    </Link>
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
