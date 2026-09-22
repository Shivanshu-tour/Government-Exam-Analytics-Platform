'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { FileSpreadsheet, UploadCloud, AlertCircle, CheckCircle, Download, FileText } from 'lucide-react';
import { api, authStorage } from '@/lib/api';

export default function AdminImportPage() {
  const [dataType, setDataType] = useState<string>('vacancies');
  const [file, setFile] = useState<File | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMsg('Please select a CSV file to upload.');
      return;
    }

    setErrorMsg('');
    setSummary(null);
    setLoading(true);

    const formData = new FormData();
    formData.append('data_type', dataType);
    formData.append('file', file);

    try {
      const token = authStorage.getToken();
      const res = await api.post('/admin/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      setSummary(res.data);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Import failed. Verify CSV structure.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadErrorCsv = () => {
    if (!summary?.error_csv_content) return;
    const blob = new Blob([summary.error_csv_content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `import_errors_${dataType}_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <Navbar />

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        <Sidebar className="hidden md:flex" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <FileSpreadsheet className="w-6 h-6 text-sky-400" /> Admin CSV Data Import Pipeline
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Upload raw vacancy, cutoff, or question datasets with strict schema validation and error reporting.
            </p>
          </div>

          {errorMsg && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Upload Form */}
          <form onSubmit={handleSubmit} className="p-6 bg-slate-900/60 border border-slate-800 rounded-xl space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">Select Target Dataset Schema</label>
              <select
                value={dataType}
                onChange={(e) => setDataType(e.target.value)}
                className="w-full sm:w-72 bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200"
              >
                <option value="vacancies">Vacancies Dataset (exam_slug, year, post, category, vacancies)</option>
                <option value="cutoffs">Cutoffs Dataset (exam_slug, year, phase, category, section, cutoff, maximum_marks)</option>
                <option value="questions">PYQ Questions Dataset (exam_slug, year, phase, subject_name, topic_name, question_text, correct_answer)</option>
              </select>
            </div>

            {/* File Upload Zone */}
            <div className="border-2 border-dashed border-slate-800 hover:border-slate-700 bg-slate-950 rounded-xl p-8 text-center space-y-3 cursor-pointer">
              <UploadCloud className="w-10 h-10 text-sky-400 mx-auto" />
              <div className="text-xs text-slate-300 font-medium">
                {file ? (
                  <span className="text-sky-400 font-bold">{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                ) : (
                  <span>Drag and drop CSV file here, or click to browse</span>
                )}
              </div>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="csv-file-input"
              />
              <label
                htmlFor="csv-file-input"
                className="inline-block px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Select File
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !file}
              className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-lg shadow-sky-500/20 transition-all"
            >
              {loading ? 'Processing & Validating CSV...' : 'Process & Upload Dataset'}
            </button>
          </form>

          {/* Import Summary Box */}
          {summary && (
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400" /> CSV Import Validation Summary
                </h3>
                <span className="text-xs uppercase font-mono text-slate-400">Schema: {summary.data_type}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Rows Processed</span>
                  <span className="text-lg font-bold text-slate-100">{summary.rows_processed}</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Imported</span>
                  <span className="text-lg font-bold text-emerald-400">{summary.imported}</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Duplicates</span>
                  <span className="text-lg font-bold text-amber-400">{summary.duplicates}</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Errors</span>
                  <span className="text-lg font-bold text-rose-400">{summary.errors_count}</span>
                </div>
              </div>

              {/* Error CSV Download button if errors exist */}
              {summary.errors_count > 0 && summary.error_csv_content && (
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs text-rose-400 font-medium">
                    {summary.errors_count} rows failed validation checks.
                  </span>
                  <button
                    onClick={handleDownloadErrorCsv}
                    className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Error CSV Log</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
