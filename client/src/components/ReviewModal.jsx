import React, { useState } from 'react';
import {
  CheckCircle2, AlertTriangle, Plus, Trash2, ArrowRight,
  ShieldCheck, RefreshCw, User, Calendar, Building, Sparkles, X
} from 'lucide-react';

export default function ReviewModal({
  initialData,
  onConfirmSave,
  onDiscard,
  isSaving = false
}) {
  const [patientName, setPatientName] = useState(initialData.patientName || 'Unknown Patient');
  const [patientAge, setPatientAge] = useState(initialData.patientAge || '');
  const [patientGender, setPatientGender] = useState(initialData.patientGender || 'Male');
  const [reportDate, setReportDate] = useState(initialData.reportDate || new Date().toISOString().split('T')[0]);
  const [labName, setLabName] = useState(initialData.labName || 'Diagnostic Laboratory');

  // Test rows state
  const [tests, setTests] = useState(initialData.tests || []);

  // Compute live test status
  const calculateStatus = (val, min, max) => {
    const num = parseFloat(val);
    const minVal = parseFloat(min);
    const maxVal = parseFloat(max);
    if (isNaN(num)) return 'NORMAL';
    if (!isNaN(minVal) && num < minVal) return 'BELOW_NORMAL';
    if (!isNaN(maxVal) && num > maxVal) return 'ABOVE_NORMAL';
    return 'NORMAL';
  };

  const handleTestChange = (index, field, value) => {
    setTests(prev => {
      const updated = [...prev];
      const current = { ...updated[index], [field]: value };

      if (field === 'value' || field === 'referenceMin' || field === 'referenceMax') {
        const val = field === 'value' ? value : current.value;
        const min = field === 'referenceMin' ? value : current.referenceMin;
        const max = field === 'referenceMax' ? value : current.referenceMax;
        current.status = calculateStatus(val, min, max);
      }
      updated[index] = current;
      return updated;
    });
  };

  const handleRemoveTest = (index) => {
    setTests(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddTest = () => {
    setTests(prev => [
      ...prev,
      {
        testId: `custom_${Date.now()}`,
        name: 'New Test Parameter',
        category: 'Custom Panel',
        value: 100,
        unit: 'mg/dL',
        referenceMin: 70,
        referenceMax: 100,
        referenceString: '70 - 100',
        status: 'NORMAL',
        severity: 'normal',
        interpretation: 'Custom verified parameter.'
      }
    ]);
  };

  const normalCount = tests.filter(t => t.status === 'NORMAL').length;
  const highCount = tests.filter(t => t.status === 'ABOVE_NORMAL').length;
  const lowCount = tests.filter(t => t.status === 'BELOW_NORMAL').length;
  const healthScore = tests.length > 0
    ? Math.max(20, Math.round(100 - ((highCount + lowCount) / tests.length) * 70))
    : 100;

  const handleConfirm = () => {
    const verifiedPayload = {
      ...initialData,
      patientName,
      patientAge: patientAge ? parseInt(patientAge, 10) : null,
      patientGender,
      reportDate,
      labName,
      tests: tests.map(t => ({
        ...t,
        value: parseFloat(t.value) || 0,
        referenceMin: parseFloat(t.referenceMin) || 0,
        referenceMax: parseFloat(t.referenceMax) || 0,
        referenceString: `${t.referenceMin || 0} - ${t.referenceMax || 0}`
      }))
    };
    onConfirmSave(verifiedPayload);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl my-auto overflow-hidden flex flex-col max-h-[92vh]">

        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex justify-between items-center shrink-0">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 bg-teal-500/20 text-teal-400 rounded-lg">
                <Sparkles className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold">OCR Verification & Review Checkpoint</h2>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Verify and edit the OCR-extracted values below before committing to the database.
            </p>
          </div>

          <button
            onClick={onDiscard}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Discard"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">

          {/* Patient Details Form */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
              <User className="w-4 h-4 text-teal-600" />
              <span>Extracted Patient Demographics (Editable)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Patient Name</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Age</label>
                <input
                  type="number"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                  placeholder="e.g. 45"
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Gender</label>
                <select
                  value={patientGender}
                  onChange={(e) => setPatientGender(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Report Date</label>
                <input
                  type="date"
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Diagnostic Laboratory</label>
                <input
                  type="text"
                  value={labName}
                  onChange={(e) => setLabName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-4 gap-2.5 text-center text-xs">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
              <span className="text-slate-500 text-[11px]">Total Parameters</span>
              <p className="text-base font-extrabold text-slate-800">{tests.length}</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5">
              <span className="text-emerald-700 text-[11px] font-semibold">Normal</span>
              <p className="text-base font-extrabold text-emerald-700">{normalCount}</p>
            </div>
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-2.5">
              <span className="text-rose-700 text-[11px] font-semibold">Elevated (High)</span>
              <p className="text-base font-extrabold text-rose-700">{highCount}</p>
            </div>
            <div className="bg-sky-50 border border-sky-200 rounded-xl p-2.5">
              <span className="text-sky-700 text-[11px] font-semibold">Below (Low)</span>
              <p className="text-base font-extrabold text-sky-700">{lowCount}</p>
            </div>
          </div>

          {/* Editable Test Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-100/80 px-4 py-2.5 flex justify-between items-center border-b border-slate-200">
              <span className="text-xs font-bold text-slate-700">
                Extracted Clinical Parameters ({tests.length})
              </span>
              <button
                type="button"
                onClick={handleAddTest}
                className="inline-flex items-center space-x-1 px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Missing Test</span>
              </button>
            </div>

            <div className="overflow-x-auto max-h-72">
              <table className="w-full text-left text-xs divide-y divide-slate-200">
                <thead className="bg-slate-50 text-slate-500 font-semibold sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3">Test Name</th>
                    <th className="py-2.5 px-3 w-28">Measured Value</th>
                    <th className="py-2.5 px-3 w-20">Unit</th>
                    <th className="py-2.5 px-3 w-24">Ref Min</th>
                    <th className="py-2.5 px-3 w-24">Ref Max</th>
                    <th className="py-2.5 px-3 w-24 text-center">Live Status</th>
                    <th className="py-2.5 px-3 w-12 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {tests.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-slate-400">
                        No parameters detected. Click "+ Add Missing Test" above to manually enter values.
                      </td>
                    </tr>
                  ) : (
                    tests.map((test, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70 transition">
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={test.name}
                            onChange={(e) => handleTestChange(idx, 'name', e.target.value)}
                            className="w-full px-2 py-1 bg-slate-50 border border-slate-300 rounded font-semibold text-slate-800 text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none"
                          />
                        </td>

                        <td className="py-2 px-3">
                          <input
                            type="number"
                            step="any"
                            value={test.value}
                            onChange={(e) => handleTestChange(idx, 'value', e.target.value)}
                            className="w-full px-2 py-1 bg-slate-50 border border-slate-300 rounded font-black text-slate-900 text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none font-mono"
                          />
                        </td>

                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={test.unit || ''}
                            onChange={(e) => handleTestChange(idx, 'unit', e.target.value)}
                            placeholder="unit"
                            className="w-full px-2 py-1 bg-slate-50 border border-slate-300 rounded text-slate-600 text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none font-mono"
                          />
                        </td>

                        <td className="py-2 px-3">
                          <input
                            type="number"
                            step="any"
                            value={test.referenceMin ?? ''}
                            onChange={(e) => handleTestChange(idx, 'referenceMin', e.target.value)}
                            placeholder="min"
                            className="w-full px-2 py-1 bg-slate-50 border border-slate-300 rounded text-slate-700 text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none font-mono"
                          />
                        </td>

                        <td className="py-2 px-3">
                          <input
                            type="number"
                            step="any"
                            value={test.referenceMax ?? ''}
                            onChange={(e) => handleTestChange(idx, 'referenceMax', e.target.value)}
                            placeholder="max"
                            className="w-full px-2 py-1 bg-slate-50 border border-slate-300 rounded text-slate-700 text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none font-mono"
                          />
                        </td>

                        <td className="py-2 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-block whitespace-nowrap ${
                              test.status === 'NORMAL'
                                ? 'bg-emerald-100 text-emerald-800'
                                : test.status === 'ABOVE_NORMAL'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-sky-100 text-sky-800'
                            }`}
                          >
                            {test.status === 'NORMAL' ? 'NORMAL' : test.status === 'ABOVE_NORMAL' ? 'HIGH ▲' : 'LOW ▼'}
                          </span>
                        </td>

                        <td className="py-2 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveTest(idx)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                            title="Remove row"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3.5 flex flex-col sm:flex-row justify-between items-center gap-3 shrink-0">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Human-in-the-loop checkpoint ensures complete medical data accuracy</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onDiscard}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              Discard & Re-upload
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={isSaving || tests.length === 0}
              className="px-6 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 hover:from-teal-700 hover:to-emerald-700 transition flex items-center space-x-1.5 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Verified Report...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Confirm & Save to Records</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
