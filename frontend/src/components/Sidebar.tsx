'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  TrendingUp,
  Award,
  Layers,
  HelpCircle,
  Columns,
  CheckCircle2,
  AlertTriangle,
  Bookmark,
  FileSpreadsheet,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  const navGroups = [
    {
      title: 'Exam Intelligence',
      items: [
        { name: 'Exams Catalog', href: '/exams', icon: BookOpen },
        { name: 'Analytics Home', href: '/analytics', icon: BarChart3 },
        { name: 'Vacancies', href: '/vacancies', icon: TrendingUp },
        { name: 'Historical Cutoffs', href: '/cutoffs', icon: Award },
        { name: 'Syllabus Explorer', href: '/syllabus', icon: Layers },
        { name: 'PYQ Bank', href: '/questions', icon: HelpCircle },
        { name: 'Exam Comparison', href: '/compare', icon: Columns },
        { name: 'About & Data Sources', href: '/about', icon: Info },
      ],
    },
    {
      title: 'My Preparation',
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Study Progress', href: '/preparation', icon: CheckCircle2 },
        { name: 'Mock Tests', href: '/mock-tests', icon: BarChart3 },
        { name: 'Performance Analytics', href: '/performance', icon: TrendingUp },
        { name: 'Weak Topics', href: '/weak-topics', icon: AlertTriangle },
        { name: 'Saved Exams', href: '/saved', icon: Bookmark },
      ],
    },
    {
      title: 'Admin Tools',
      items: [
        { name: 'CSV Data Import', href: '/admin/import', icon: FileSpreadsheet },
      ],
    },
  ];

  return (
    <aside className={cn('w-64 bg-slate-950 border-r border-slate-800 flex flex-col py-4 px-3 gap-6 shrink-0 min-h-[calc(100vh-4rem)]', className)}>
      {navGroups.map((group, idx) => (
        <div key={idx}>
          <h3 className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            {group.title}
          </h3>
          <div className="space-y-1">
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                    isActive
                      ? 'bg-sky-600/10 text-sky-400 border border-sky-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  )}
                >
                  <Icon className={cn('w-4 h-4', isActive ? 'text-sky-400' : 'text-slate-500')} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </aside>
  );
}
