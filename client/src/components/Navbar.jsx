import React from 'react';
import { Activity, FileText, TrendingUp, BookOpen, Sparkles, PlusCircle } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onNewUpload, onSeedSample }) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="w-full max-w-none mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('upload')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  Medi<span className="text-teal-600">Scan</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block font-medium">
                Laboratory Test Report Analyzer
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex space-x-1 lg:space-x-2">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'upload'
                  ? 'bg-teal-50 text-teal-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-teal-600" />
              <span>Analyze Report</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'history'
                  ? 'bg-teal-50 text-teal-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-4 h-4 text-teal-600" />
              <span>Report History</span>
            </button>

            <button
              onClick={() => setActiveTab('trends')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'trends'
                  ? 'bg-teal-50 text-teal-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-teal-600" />
              <span>Trends & History</span>
            </button>

            <button
              onClick={() => setActiveTab('dictionary')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'dictionary'
                  ? 'bg-teal-50 text-teal-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-4 h-4 text-teal-600" />
              <span>Reference Range Guide</span>
            </button>
          </nav>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onSeedSample}
              title="Populate realistic demo test reports"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">Load Sample Data</span>
            </button>

            <button
              onClick={() => {
                onNewUpload();
                setActiveTab('upload');
              }}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition shadow-sm shadow-teal-600/20"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>New Analysis</span>
            </button>
          </div>
        </div>

        {/* Mobile Submenu */}
        <div className="flex md:hidden border-t border-slate-100 py-2 space-x-2 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap ${
              activeTab === 'upload' ? 'bg-teal-100 text-teal-800 font-bold' : 'text-slate-600'
            }`}
          >
            Analyze
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap ${
              activeTab === 'history' ? 'bg-teal-100 text-teal-800 font-bold' : 'text-slate-600'
            }`}
          >
            History
          </button>
          <button
            onClick={() => setActiveTab('trends')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap ${
              activeTab === 'trends' ? 'bg-teal-100 text-teal-800 font-bold' : 'text-slate-600'
            }`}
          >
            Trends
          </button>
          <button
            onClick={() => setActiveTab('dictionary')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap ${
              activeTab === 'dictionary' ? 'bg-teal-100 text-teal-800 font-bold' : 'text-slate-600'
            }`}
          >
            Guide
          </button>
        </div>
      </div>
    </header>
  );
}
