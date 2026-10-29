import React, { useState } from 'react';
import { FileText, Calendar, User, Trash2, Eye, Search, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';

export default function HistoryView({ reports, onSelectReport, onDeleteReport, onRefresh }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredReports = reports.filter(r =>
    (r.patientName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.labName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header and Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Stored Patient Reports Archive</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Total records saved in database: <strong>{reports.length}</strong>
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by patient or clinic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500">
          <FileText className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="font-bold text-slate-700">No laboratory reports found.</p>
          <p className="text-xs text-slate-400 mt-1">
            Upload a report or load sample data from the top bar to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReports.map((report) => {
            const reportId = report.id || report._id;
            const healthScore = report.summary?.healthScore ?? 85;
            const abnormalCount = report.summary?.abnormalCount ?? 0;
            const totalCount = report.summary?.totalTests ?? report.tests?.length ?? 0;

            return (
              <div
                key={reportId}
                className="bg-white border border-slate-200 hover:border-teal-400 rounded-2xl p-5 shadow-sm transition hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  {/* Top: Name & Date */}
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-base text-slate-900">
                        {report.patientName}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center space-x-1 mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{report.reportDate || 'Recent'}</span>
                        <span>•</span>
                        <span>{report.labName || 'Diagnostic Lab'}</span>
                      </p>
                    </div>

                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                        healthScore >= 80
                          ? 'bg-emerald-100 text-emerald-800'
                          : healthScore >= 60
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {healthScore}% Index
                    </span>
                  </div>

                  {/* Summary badges */}
                  <div className="flex items-center space-x-3 my-3 text-xs text-slate-600">
                    <span className="flex items-center space-x-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{report.patientAge ? `${report.patientAge}y` : ''} {report.patientGender}</span>
                    </span>
                    <span>•</span>
                    <span>{totalCount} Tests Analyzed</span>
                    <span>•</span>
                    <span className={abnormalCount > 0 ? 'text-rose-600 font-semibold' : 'text-emerald-600'}>
                      {abnormalCount} Abnormal
                    </span>
                  </div>

                  {/* Abnormal tags */}
                  {report.tests && (
                    <div className="flex flex-wrap gap-1.5 my-3">
                      {report.tests
                        .filter(t => t.status !== 'NORMAL')
                        .slice(0, 3)
                        .map((t, idx) => (
                          <span
                            key={idx}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              t.status === 'ABOVE_NORMAL'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-sky-50 text-sky-700 border border-sky-200'
                            }`}
                          >
                            {t.name}: {t.value} {t.unit} ({t.status === 'ABOVE_NORMAL' ? 'HIGH' : 'LOW'})
                          </span>
                        ))}
                      {report.tests.filter(t => t.status !== 'NORMAL').length > 3 && (
                        <span className="text-[10px] text-slate-400 font-medium self-center">
                          +{report.tests.filter(t => t.status !== 'NORMAL').length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer buttons */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => onDeleteReport(reportId)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onSelectReport(report)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg text-xs font-semibold transition"
                  >
                    <span>Open Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
