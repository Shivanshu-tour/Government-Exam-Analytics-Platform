'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { DataSourceBadge } from '@/components/DataSourceBadge';
import { Search, Filter, BookOpen } from 'lucide-react';
import { api } from '@/lib/api';
import { Exam } from '@/types';

export default function ExamsCatalogPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchExams() {
      try {
        const res = await api.get('/exams');
        setExams(res.data);
      } catch (err) {
        console.error('Failed to fetch exams catalog:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchExams();
  }, []);

  const filteredExams = exams.filter((e) => {
    const matchesCategory = categoryFilter === 'all' || e.category.toLowerCase().includes(categoryFilter.toLowerCase());
    const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase()) || e.organization.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <Navbar />

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        <Sidebar className="hidden md:flex" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-sky-400" />
                Government Examinations Catalog
              </h1>
              <p className="text-xs text-slate-400 mt-1">Explore structure, phase breakdown, and multi-year recruitment cycles.</p>
            </div>
            <DataSourceBadge isDemo={true} />
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search exam name or conducting body..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="regulatory">Regulatory Body</option>
                <option value="banking">Banking</option>
                <option value="staff">Staff Selection (SSC)</option>
              </select>
            </div>
          </div>

          {/* Exam Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-44 bg-slate-900/40 rounded-xl animate-pulse border border-slate-800" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredExams.map((exam) => (
                <div
                  key={exam.id}
                  className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                        {exam.category}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">Cycles: {exam.cycles_count} Years</span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-100 mt-2">{exam.name}</h3>
                    <p className="text-xs text-slate-400 font-medium">{exam.organization}</p>
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">{exam.description}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <div className="text-xs text-slate-400">
                      <span>Latest Vacancies: </span>
                      <span className="font-semibold text-slate-200">{exam.total_vacancies_latest ? exam.total_vacancies_latest.toLocaleString('en-IN') : 'N/A'}</span>
                    </div>
                    <Link
                      href={`/exams/${exam.slug}`}
                      className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-medium transition-colors"
                    >
                      View Details
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
