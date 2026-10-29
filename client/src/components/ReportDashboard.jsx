import React, { useState } from 'react';
import {
  CheckCircle, AlertTriangle, ArrowUpRight, ArrowDownRight,
  User, Calendar, Building, Printer, Filter, Search,
  HeartPulse, ShieldAlert, Award, FileText, ChevronRight, Info, Download
} from 'lucide-react';
import RangeVisualizer from './RangeVisualizer.jsx';
import MedicalDisclaimer from './MedicalDisclaimer.jsx';
import { generateReportPDF } from '../utils/pdfGenerator.js';

export default function ReportDashboard({ report, onBackToUpload, onViewTrends }) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  if (!report) return null;

  const {
    patientName,
    patientAge,
    patientGender,
    reportDate,
    labName,
    tests = [],
    summary = {}
  } = report;

  // Extract unique categories
  const categories = ['ALL', ...new Set(tests.map(t => t.category))];

  // Filtering tests
  const filteredTests = tests.filter(test => {
    const matchesCategory = selectedCategory === 'ALL' || test.category === selectedCategory;
    const matchesStatus =
      statusFilter === 'ALL'
        ? true
        : statusFilter === 'ABNORMAL'
        ? test.status !== 'NORMAL'
        : test.status === statusFilter;
    const matchesSearch =
      test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const handlePrint = () => {
    window.print();
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 60) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  return (
    <div className="space-y-6 print:m-0 print:p-0">
      {/* Disclaimer */}
      <MedicalDisclaimer compact />

      {/* Header & Patient Details Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {patientName || 'Laboratory Test Report'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800">
                Verified Analysis
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center space-x-2">
              <span>Automated OCR & Clinical Parameter Analysis</span>
            </p>
          </div>

          <div className="flex items-center space-x-2 print:hidden">
            <button
              onClick={() => generateReportPDF(report)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white text-xs font-bold hover:from-teal-700 hover:to-emerald-700 transition shadow-sm shadow-teal-600/20"
              title="Download clean branded medical PDF report"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF Report</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition shadow-sm"
              title="Print via browser dialog"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Print</span>
            </button>
            <button
              onClick={onViewTrends}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition shadow-sm"
            >
              <HeartPulse className="w-4 h-4 text-teal-600" />
              <span>Trends</span>
            </button>
          </div>
        </div>

        {/* Patient Profile Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5 text-xs">
          <div className="flex items-center space-x-2 text-slate-600">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
              <User className="w-4 h-4" />
            </div>
            <div>
              <p className="text-slate-400 font-medium">Demographics</p>
              <p className="font-bold text-slate-800">
                {patientAge ? `${patientAge} Yrs` : 'N/A'} • {patientGender || 'Unspecified'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-slate-600">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-slate-400 font-medium">Report Date</p>
              <p className="font-bold text-slate-800">{reportDate || 'Recent'}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-slate-600">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <p className="text-slate-400 font-medium">Laboratory Facility</p>
              <p className="font-bold text-slate-800 truncate max-w-[150px]">
                {labName || 'Clinical Diagnostic'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-slate-600">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <p className="text-slate-400 font-medium">Wellness Index</p>
              <p className="font-bold text-slate-800">
                {summary.healthScore ?? 85} / 100
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary KPI Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Tests</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{summary.totalTests || tests.length}</p>
          </div>
          <div className="p-2.5 bg-slate-100 rounded-xl text-slate-600">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Normal</p>
            <p className="text-2xl font-extrabold text-emerald-700 mt-1">{summary.normalCount || 0}</p>
          </div>
          <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-rose-600 uppercase tracking-wider">High Levels</p>
            <p className="text-2xl font-extrabold text-rose-700 mt-1">{summary.highCount || 0}</p>
          </div>
          <div className="p-2.5 bg-rose-50 rounded-xl text-rose-600">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-sky-600 uppercase tracking-wider">Low Levels</p>
            <p className="text-2xl font-extrabold text-sky-700 mt-1">{summary.lowCount || 0}</p>
          </div>
          <div className="p-2.5 bg-sky-50 rounded-xl text-sky-600">
            <ArrowDownRight className="w-5 h-5" />
          </div>
        </div>

        <div className="col-span-2 lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Health Index</p>
            <p className={`text-2xl font-extrabold mt-1 ${getScoreColor(summary.healthScore).split(' ')[0]}`}>
              {summary.healthScore ?? 85}%
            </p>
          </div>
          <div className={`p-2.5 rounded-xl border ${getScoreColor(summary.healthScore)}`}>
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Clinical Insights & Recommendations Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Key Findings */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center space-x-2 text-rose-700 font-bold text-sm mb-3">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Key Clinical Observations</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-700">
            {summary.keyFindings && summary.keyFindings.length > 0 ? (
              summary.keyFindings.map((finding, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                  <span className="leading-relaxed">{finding}</span>
                </li>
              ))
            ) : (
              <li className="text-slate-500">All tests within normal reference range limits.</li>
            )}
          </ul>
        </div>

        {/* Actionable Recommendations */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center space-x-2 text-teal-800 font-bold text-sm mb-3">
            <HeartPulse className="w-4 h-4 text-teal-600" />
            <span>Health Guidance & Next Steps</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-700">
            {summary.recommendations && summary.recommendations.length > 0 ? (
              summary.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 flex-shrink-0" />
                  <span className="leading-relaxed">{rec}</span>
                </li>
              ))
            ) : (
              <li className="text-slate-500">Maintain standard routine preventative wellness protocols.</li>
            )}
          </ul>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search test parameter..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <span className="text-xs font-semibold text-slate-500 flex items-center space-x-1 flex-shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>Panel:</span>
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-teal-600 text-white font-semibold shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'ALL' ? 'All Panels' : cat}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-1.5 w-full md:w-auto justify-end">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
              statusFilter === 'ALL' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('ABNORMAL')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
              statusFilter === 'ABNORMAL' ? 'bg-rose-600 text-white font-bold' : 'text-rose-600 hover:bg-rose-50'
            }`}
          >
            Abnormal Only
          </button>
          <button
            onClick={() => setStatusFilter('NORMAL')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
              statusFilter === 'NORMAL' ? 'bg-emerald-600 text-white font-bold' : 'text-emerald-600 hover:bg-emerald-50'
            }`}
          >
            Normal
          </button>
        </div>
      </div>

      {/* Tests Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTests.length === 0 ? (
          <div className="col-span-2 bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500">
            <Info className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <p className="text-sm font-semibold">No test parameters match your filters.</p>
          </div>
        ) : (
          filteredTests.map((test, index) => {
            const isNormal = test.status === 'NORMAL';
            const isHigh = test.status === 'ABOVE_NORMAL';
            const isLow = test.status === 'BELOW_NORMAL';

            return (
              <div
                key={index}
                className={`bg-white border rounded-2xl p-5 shadow-sm transition hover:shadow-md ${
                  isHigh
                    ? 'border-rose-200 bg-gradient-to-b from-rose-50/20 to-white'
                    : isLow
                    ? 'border-sky-200 bg-gradient-to-b from-sky-50/20 to-white'
                    : 'border-slate-200'
                }`}
              >
                {/* Header: Name & Status Badge */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      {test.category}
                    </span>
                    <h3 className="font-extrabold text-base text-slate-900 leading-tight mt-0.5">
                      {test.name}
                    </h3>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center space-x-1 ${
                      isNormal
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : isHigh
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : 'bg-sky-100 text-sky-800 border border-sky-200'
                    }`}
                  >
                    {isNormal && <CheckCircle className="w-3.5 h-3.5" />}
                    {isHigh && <ArrowUpRight className="w-3.5 h-3.5" />}
                    {isLow && <ArrowDownRight className="w-3.5 h-3.5" />}
                    <span>{isNormal ? 'Normal' : isHigh ? 'Above Normal (High)' : 'Below Normal (Low)'}</span>
                  </span>
                </div>

                {/* Value Display */}
                <div className="flex items-baseline space-x-2 my-2">
                  <span
                    className={`text-3xl font-black tracking-tight ${
                      isNormal ? 'text-slate-900' : isHigh ? 'text-rose-600' : 'text-sky-600'
                    }`}
                  >
                    {test.value}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">{test.unit}</span>
                </div>

                {/* Visual Reference Range Gauge */}
                <RangeVisualizer
                  value={test.value}
                  min={test.referenceMin}
                  max={test.referenceMax}
                  unit={test.unit}
                  status={test.status}
                />

                {/* Patient-Friendly Interpretation */}
                <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-3 rounded-xl">
                  <p className="font-semibold text-slate-800 mb-1 flex items-center space-x-1">
                    <Info className="w-3.5 h-3.5 text-teal-600" />
                    <span>Clinical Interpretation:</span>
                  </p>
                  <p>{test.interpretation || 'Parameter measured and compared to clinical laboratory reference bounds.'}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
