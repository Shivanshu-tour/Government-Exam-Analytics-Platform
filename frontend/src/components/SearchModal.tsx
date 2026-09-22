'use client';

import React, { useState, useEffect } from 'react';
import { Search, X, BookOpen, FileText, HelpCircle, Layers } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    exams: any[];
    subjects: any[];
    topics: any[];
    questions: any[];
  }>({ exams: [], subjects: [], topics: [], questions: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults({ exams: [], subjects: [], topics: [], questions: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get(`/search?q=${encodeURIComponent(query)}`);
        setResults(res.data);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-start justify-center pt-16 px-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-800 gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search exams, subjects, topics, or questions (e.g. RBI ESI inflation)..."
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
            autoFocus
          />
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Results */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {loading && <div className="text-center py-6 text-slate-400 text-sm">Searching ExamIntel database...</div>}

          {!loading && query.trim().length >= 2 &&
            results.exams.length === 0 &&
            results.subjects.length === 0 &&
            results.topics.length === 0 &&
            results.questions.length === 0 && (
              <div className="text-center py-6 text-slate-400 text-sm">No matching records found for "{query}".</div>
            )}

          {results.exams.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-sky-400" /> Exams
              </h4>
              <div className="space-y-1">
                {results.exams.map((item) => (
                  <Link
                    key={item.id}
                    href={`/exams/${item.slug}`}
                    onClick={onClose}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-800/80 transition-colors"
                  >
                    <div>
                      <div className="text-sm font-medium text-slate-200">{item.name}</div>
                      <div className="text-xs text-slate-400">{item.organization}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {results.topics.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" /> Syllabus Topics
              </h4>
              <div className="space-y-1">
                {results.topics.map((item) => (
                  <Link
                    key={item.id}
                    href={`/syllabus?exam=${item.exam_slug}`}
                    onClick={onClose}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/80"
                  >
                    <div className="text-sm text-slate-200">{item.name}</div>
                    <div className="text-xs text-slate-400">{item.exam_name} • {item.subject_name}</div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {results.questions.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-emerald-400" /> Questions
              </h4>
              <div className="space-y-1.5">
                {results.questions.map((item) => (
                  <Link
                    key={item.id}
                    href={`/questions?id=${item.id}`}
                    onClick={onClose}
                    className="block p-2.5 rounded-lg hover:bg-slate-800/80"
                  >
                    <div className="text-xs text-slate-300 font-mono line-clamp-2">{item.question_text}</div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      {item.exam_name} ({item.year}) • {item.subject_name} • {item.difficulty}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
