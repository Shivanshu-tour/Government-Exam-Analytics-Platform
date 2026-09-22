'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { DataSourceBadge } from '@/components/DataSourceBadge';
import { Layers, ChevronRight, ChevronDown, CheckCircle2, BookOpen, Filter } from 'lucide-react';
import { api, authStorage } from '@/lib/api';
import { Exam, Subject } from '@/types';

export default function SyllabusPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<string>('rbi-grade-b');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [expandedTopics, setExpandedTopics] = useState<Record<number, boolean>>({});
  const [userStatuses, setUserStatuses] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const eRes = await api.get('/exams');
        setExams(eRes.data);
      } catch (err) {
        console.error('Error loading exams:', err);
      }
    }
    init();
  }, []);

  useEffect(() => {
    async function loadSyllabus() {
      setLoading(true);
      try {
        const res = await api.get(`/syllabus/${selectedExam}`);
        setSubjects(res.data);

        // Pre-populate topic status map
        const statusMap: Record<number, string> = {};
        res.data.forEach((sub: Subject) => {
          sub.topics.forEach((top) => {
            statusMap[top.id] = top.user_status || 'Not Started';
          });
        });
        setUserStatuses(statusMap);
      } catch (err) {
        console.error('Error loading syllabus:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSyllabus();
  }, [selectedExam]);

  const toggleTopic = (id: number) => {
    setExpandedTopics((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleStatusChange = async (topicId: number, newStatus: string) => {
    setUserStatuses((prev) => ({ ...prev, [topicId]: newStatus }));
    const user = authStorage.getUser();
    if (user) {
      try {
        await api.post('/syllabus/progress', { topic_id: topicId, status: newStatus });
      } catch (err) {
        console.error('Failed to update progress on backend:', err);
      }
    }
  };

  // Calculate syllabus statistics
  const allTopicIds = Object.keys(userStatuses);
  const totalCount = allTopicIds.length;
  const counts = {
    'Not Started': 0,
    Learning: 0,
    Revised: 0,
    Strong: 0,
  };
  Object.values(userStatuses).forEach((st) => {
    if (counts[st as keyof typeof counts] !== undefined) {
      counts[st as keyof typeof counts]++;
    }
  });

  const completedCount = counts['Strong'] + counts['Revised'];
  const overallPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <Navbar />

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        <Sidebar className="hidden md:flex" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                <Layers className="w-6 h-6 text-indigo-400" /> Syllabus Intelligence Explorer
              </h1>
              <p className="text-xs text-slate-400 mt-1">4-tier hierarchy: Exam → Phase → Subject → Topic → Subtopic.</p>
            </div>
            <DataSourceBadge isDemo={true} />
          </div>

          {/* Controls Bar */}
          <div className="flex items-center gap-3 p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-medium text-slate-300">Select Exam:</span>
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

          {/* Completion Stats Overview Bar */}
          <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Overall Syllabus Completion</span>
                <div className="text-2xl font-extrabold text-indigo-400 mt-0.5">{overallPct}% Completed</div>
              </div>
              <div className="text-right text-xs text-slate-400">
                <span>{completedCount} of {totalCount} topics mastered</span>
              </div>
            </div>

            {/* Status Breakdown Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80">
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block">Strong</span>
                <span className="text-sm font-bold text-emerald-400">{counts['Strong']} topics</span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block">Revised</span>
                <span className="text-sm font-bold text-sky-400">{counts['Revised']} topics</span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block">Learning</span>
                <span className="text-sm font-bold text-amber-400">{counts['Learning']} topics</span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block">Not Started</span>
                <span className="text-sm font-bold text-slate-400">{counts['Not Started']} topics</span>
              </div>
            </div>
          </div>

          {/* Syllabus Tree */}
          {loading ? (
            <div className="h-72 bg-slate-900/40 rounded-xl border border-slate-800 animate-pulse" />
          ) : (
            <div className="space-y-6">
              {subjects.map((sub) => (
                <div key={sub.id} className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                        {sub.phase}
                      </span>
                      <h2 className="text-lg font-bold text-slate-100 mt-1">{sub.name}</h2>
                    </div>
                    <span className="text-xs text-slate-400">{sub.topics.length} Key Topics</span>
                  </div>

                  <div className="space-y-3">
                    {sub.topics.map((top) => {
                      const isExpanded = expandedTopics[top.id];
                      const status = userStatuses[top.id] || 'Not Started';

                      return (
                        <div key={top.id} className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <button
                              onClick={() => toggleTopic(top.id)}
                              className="flex items-center gap-2 text-sm font-medium text-slate-200 hover:text-sky-400 text-left"
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-slate-400" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                              )}
                              <span>{top.name}</span>
                              <span className="text-[10px] text-slate-500 font-mono">({top.subtopics.length} subtopics)</span>
                            </button>

                            {/* Status Selector */}
                            <select
                              value={status}
                              onChange={(e) => handleStatusChange(top.id, e.target.value)}
                              className={`text-xs rounded-lg px-2.5 py-1 font-semibold border focus:outline-none ${
                                status === 'Strong'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                  : status === 'Revised'
                                  ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                                  : status === 'Learning'
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                  : 'bg-slate-900 text-slate-400 border-slate-800'
                              }`}
                            >
                              <option value="Not Started">Not Started</option>
                              <option value="Learning">Learning</option>
                              <option value="Revised">Revised</option>
                              <option value="Strong">Strong</option>
                            </select>
                          </div>

                          {/* Subtopics collapse */}
                          {isExpanded && top.subtopics.length > 0 && (
                            <div className="pl-6 pt-2 border-t border-slate-900 grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {top.subtopics.map((st) => (
                                <div key={st.id} className="text-xs text-slate-400 flex items-center gap-1.5">
                                  <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                                  <span>{st.name}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
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
