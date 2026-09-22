'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Shield, User as UserIcon, LogOut, Menu } from 'lucide-react';
import { SearchModal } from './SearchModal';
import { authStorage } from '@/lib/api';
import { User } from '@/types';

export function Navbar({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(authStorage.getUser());
  }, []);

  const handleLogout = () => {
    authStorage.clearAuth();
    setUser(null);
    window.location.href = '/';
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 md:hidden"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-sky-500/20">
                E
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-slate-100 tracking-tight leading-none text-base">ExamIntel <span className="text-sky-400 font-normal">India</span></span>
                <span className="text-[10px] text-slate-400 tracking-wider uppercase font-medium">Exam Analytics</span>
              </div>
            </Link>
          </div>

          {/* Quick Search trigger */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex-1 max-w-md hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-400 hover:border-slate-700 transition-colors"
          >
            <Search className="w-4 h-4 text-slate-400" />
            <span>Search exams, cutoffs, topics, or questions...</span>
            <kbd className="ml-auto px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] font-mono text-slate-400">⌘K</kbd>
          </button>

          {/* Right Navigation / User menu */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="sm:hidden p-2 text-slate-400 hover:text-slate-200"
            >
              <Search className="w-5 h-5" />
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg text-xs font-medium text-slate-200"
                >
                  <UserIcon className="w-3.5 h-3.5 text-sky-400" />
                  <span>{user.name.split(' ')[0]}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  title="Log out"
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-lg"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-3 py-1.5 text-xs font-medium bg-sky-600 hover:bg-sky-500 text-white rounded-lg shadow-sm transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
