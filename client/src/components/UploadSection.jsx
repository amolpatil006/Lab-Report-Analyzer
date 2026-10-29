import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Image as ImageIcon, Loader2, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, Eye } from 'lucide-react';
import MedicalDisclaimer from './MedicalDisclaimer.jsx';
import ReviewModal from './ReviewModal.jsx';

const PRESET_SAMPLE_TEXTS = {
  cbc: {
    title: 'Complete Blood Count (CBC) - Iron Deficiency Anemia',
    patientName: 'Emma Watson',
    patientAge: 27,
    patientGender: 'Female',
    reportDate: '2025-03-01',
    labName: 'Quest Diagnostic Labs',
    text: `QUEST DIAGNOSTICS - HEMATOLOGY REPORT
Patient: Emma Watson  Age: 27 Yrs  Gender: Female  Date: 01-Mar-2025
TEST NAME                   VALUE     UNIT         REFERENCE RANGE
Hemoglobin (Hb)             10.2      g/dL         12.0 - 15.5
RBC Count                   3.7       million/mcL  4.1 - 5.1
Total WBC Count             6800      cells/mcL    4000 - 11000
Platelet Count              240000    cells/mcL    150000 - 450000
Hematocrit (PCV)            31.8      %            34.9 - 44.5
Vitamin B12                 175       pg/mL        200 - 900`
  },
  metabolic: {
    title: 'Diabetic & Lipid Panel - Metabolic Syndrome',
    patientName: 'David Miller',
    patientAge: 52,
    patientGender: 'Male',
    reportDate: '2025-03-05',
    labName: 'MetroPath Clinical Diagnostics',
    text: `METROPATH CLINICAL DIAGNOSTICS - COMPREHENSIVE METABOLIC
Patient: David Miller  Age: 52 Yrs  Gender: Male  Date: 05-Mar-2025
TEST NAME                   VALUE     UNIT         REFERENCE RANGE
Fasting Blood Sugar         138       mg/dL        70 - 99
HbA1c                       7.2       %            4.0 - 5.6
Total Cholesterol           245       mg/dL        125 - 200
Triglycerides               210       mg/dL        40 - 150
HDL Cholesterol             36        mg/dL        40 - 90
LDL Cholesterol             155       mg/dL        50 - 100
Serum Creatinine            1.0       mg/dL        0.7 - 1.3
SGPT / ALT                  38        U/L          7 - 55`
  },
  organ: {
    title: 'Liver & Kidney Function Profile - Elevated Enzymes',
    patientName: 'Anita Sharma',
    patientAge: 44,
    patientGender: 'Female',
    reportDate: '2025-02-28',
    labName: 'Suburban Diagnostics',
    text: `SUBURBAN DIAGNOSTICS - HEPATO-RENAL PROFILE
Patient: Anita Sharma  Age: 44 Yrs  Gender: Female  Date: 28-Feb-2025
TEST NAME                   VALUE     UNIT         REFERENCE RANGE
SGPT / ALT                  72        U/L          7 - 45
SGOT / AST                  58        U/L          8 - 48
Total Bilirubin             1.6       mg/dL        0.2 - 1.2
Serum Albumin               4.1       g/dL         3.5 - 5.5
Serum Creatinine            1.4       mg/dL        0.5 - 1.1
Blood Urea Nitrogen (BUN)   24        mg/dL        7 - 20
Uric Acid                   6.8       mg/dL        2.4 - 6.0`
  }
};

export default function UploadSection({ onReportAnalyzed }) {
  const [activeMode, setActiveMode] = useState('upload'); // 'upload' | 'manual'
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanStep, setScanStep] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [reviewData, setReviewData] = useState(null);
  const [isSavingVerified, setIsSavingVerified] = useState(false);

  // Manual / Text Form state
  const [manualText, setManualText] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('Male');
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [labName, setLabName] = useState('');

  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelected = (selectedFile) => {
    setErrorMessage(null);
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(selectedFile.type)) {
      setErrorMessage('Please upload a valid JPG, PNG, or PDF laboratory report.');
      return;
    }
    setFile(selectedFile);
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setFilePreview(null);
    }
  };

  const processFileUpload = async () => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      setScanStep('Executing Optical Character Recognition (OCR)...');
      const formData = new FormData();
      formData.append('reportFile', file);
      if (patientName) formData.append('patientName', patientName);
      if (patientAge) formData.append('patientAge', patientAge);
      if (patientGender) formData.append('patientGender', patientGender);
      if (reportDate) formData.append('reportDate', reportDate);
      if (labName) formData.append('labName', labName);

      // Call scan endpoint to extract parameters for verification review
      const response = await fetch('/api/reports/scan', {
        method: 'POST',
        body: formData
      });

      setScanStep('Parsing clinical parameters & tabular alignments...');
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to scan report.');
      }

      setScanStep('Opening Human-in-the-Loop Verification Review...');
      setTimeout(() => {
        setIsProcessing(false);
        setReviewData(result.data);
      }, 400);

    } catch (err) {
      console.error(err);
      setIsProcessing(false);
      setErrorMessage(err.message || 'An error occurred during OCR analysis.');
    }
  };

  const handleConfirmVerifiedSave = async (verifiedPayload) => {
    setIsSavingVerified(true);
    try {
      const response = await fetch('/api/reports/save-verified', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(verifiedPayload)
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to save verified report.');
      }

      setReviewData(null);
      setIsSavingVerified(false);
      onReportAnalyzed(result.data);
    } catch (err) {
      console.error(err);
      setIsSavingVerified(false);
      setErrorMessage(err.message || 'Failed to commit verified report.');
    }
  };

  const processManualText = async () => {
    if (!manualText.trim()) {
      setErrorMessage('Please enter or paste report text.');
      return;
    }
    setIsProcessing(true);
    setErrorMessage(null);
    setScanStep('Parsing test parameters and reference bounds...');

    try {
      const response = await fetch('/api/reports/analyze-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText: manualText,
          patientName: patientName || undefined,
          patientAge: patientAge ? parseInt(patientAge, 10) : undefined,
          patientGender: patientGender || undefined,
          reportDate: reportDate || undefined,
          labName: labName || undefined
        })
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to analyze text.');
      }

      setScanStep('Finalizing test analysis...');
      setTimeout(() => {
        setIsProcessing(false);
        onReportAnalyzed(result.data);
      }, 400);

    } catch (err) {
      console.error(err);
      setIsProcessing(false);
      setErrorMessage(err.message || 'Failed to parse report text.');
    }
  };

  const loadPreset = (presetKey) => {
    const preset = PRESET_SAMPLE_TEXTS[presetKey];
    if (!preset) return;
    setActiveMode('manual');
    setManualText(preset.text);
    setPatientName(preset.patientName);
    setPatientAge(preset.patientAge);
    setPatientGender(preset.patientGender);
    setReportDate(preset.reportDate);
    setLabName(preset.labName);
    setErrorMessage(null);
  };

  return (
    <div className="space-y-6">
      {/* Disclaimer */}
      {/* <MedicalDisclaimer /> */}

      {/* Mode Switcher */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveMode('upload')}
          className={`pb-3 px-4 font-semibold text-sm transition-all border-b-2 flex items-center space-x-2 ${
            activeMode === 'upload'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload Digital Report (Image / PDF OCR)</span>
        </button>
        <button
          onClick={() => setActiveMode('manual')}
          className={`pb-3 px-4 font-semibold text-sm transition-all border-b-2 flex items-center space-x-2 ${
            activeMode === 'manual'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Paste Report Text / Demo Presets</span>
        </button>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center space-x-3 text-rose-700 text-sm">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p>{errorMessage}</p>
        </div>
      )}

      {/* Mode 1: File Upload */}
      {activeMode === 'upload' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Dropzone Box */}
          <div className="lg:col-span-2">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
                isDragging
                  ? 'border-teal-500 bg-teal-50/50 scale-[1.01]'
                  : 'border-slate-300 hover:border-teal-400 bg-white hover:bg-slate-50/50'
              } shadow-sm`}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={(e) => e.target.files && handleFileSelected(e.target.files[0])}
              />

              <div className="max-w-md mx-auto flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4 shadow-sm border border-teal-100">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">
                  Drag and drop your lab report here
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Supports High-Resolution <strong>JPG, PNG, WebP</strong> images and <strong>PDF</strong> documents
                </p>
                <button
                  type="button"
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition"
                >
                  Browse Files
                </button>
              </div>

              {/* Selected File Card */}
              {file && (
                <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between text-left bg-slate-50 p-4 rounded-xl">
                  <div className="flex items-center space-x-3 truncate">
                    {file.type.startsWith('image/') ? (
                      <ImageIcon className="w-8 h-8 text-teal-600 flex-shrink-0" />
                    ) : (
                      <FileText className="w-8 h-8 text-rose-600 flex-shrink-0" />
                    )}
                    <div className="truncate">
                      <p className="text-sm font-semibold text-slate-900 truncate">{file.name}</p>
                      <p className="text-xs text-slate-500">
                        {(file.size / 1024).toFixed(1)} KB • {file.type}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-medium">
                    Ready to Scan
                  </span>
                </div>
              )}
            </div>

            {/* Scan Action Button */}
            {file && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={processFileUpload}
                  disabled={isProcessing}
                  className="px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl font-bold text-sm shadow-md shadow-teal-500/20 hover:from-teal-700 hover:to-emerald-700 transition flex items-center space-x-2 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{scanStep || 'Scanning...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Start Optical Character Recognition (OCR) Analysis</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Quick Presets & Info Panel */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 text-teal-700 font-bold text-sm mb-3">
                <Sparkles className="w-4 h-4" />
                <span>Instant Demo Scenarios</span>
              </div>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Click any pre-configured clinical panel below to test the analyzer immediately without downloading images:
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => loadPreset('cbc')}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/40 transition group"
                >
                  <p className="text-xs font-bold text-slate-800 group-hover:text-teal-700">
                    🩸 Complete Blood Count (CBC)
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Analyzes Hemoglobin, RBC, Hematocrit & detects Anemia indicators.
                  </p>
                </button>

                <button
                  onClick={() => loadPreset('metabolic')}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/40 transition group"
                >
                  <p className="text-xs font-bold text-slate-800 group-hover:text-teal-700">
                    🩺 Diabetic & Lipid Panel
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Extracts Fasting Blood Sugar, HbA1c, Cholesterol, LDL & Triglycerides.
                  </p>
                </button>

                <button
                  onClick={() => loadPreset('organ')}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/40 transition group"
                >
                  <p className="text-xs font-bold text-slate-800 group-hover:text-teal-700">
                    🧪 Liver & Kidney Function Tests
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Evaluates SGPT/ALT, Bilirubin, Albumin, Creatinine & BUN.
                  </p>
                </button>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center space-x-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Compliant with IEEE laboratory test analyzer specifications</span>
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Paste Report Text & Patient Details */}
      {activeMode === 'manual' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Direct Clinical Text Extraction & Analysis
            </h3>
            <p className="text-xs text-slate-500">
              Paste the text from an e-report or edit the preset below. The engine will parse test names, numeric values, units, and ranges automatically.
            </p>
          </div>

          {/* Patient Details Form Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Patient Name</label>
              <input
                type="text"
                placeholder="e.g. John Doe"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Age</label>
              <input
                type="number"
                placeholder="e.g. 45"
                value={patientAge}
                onChange={(e) => setPatientAge(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
              <select
                value={patientGender}
                onChange={(e) => setPatientGender(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
              <input
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Diagnostic Lab</label>
              <input
                type="text"
                placeholder="e.g. Quest Diagnostics"
                value={labName}
                onChange={(e) => setLabName(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Raw Textarea */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-slate-700">Laboratory Report Text Content</label>
              <span className="text-[11px] text-slate-400 font-mono">Format: [Test Name] [Value] [Unit] [Range]</span>
            </div>
            <textarea
              rows={9}
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder="Paste raw text from a laboratory test report here..."
              className="w-full p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl border border-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Analyze Button */}
          <div className="flex justify-between items-center pt-2">
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => loadPreset('cbc')}
                className="text-xs text-teal-700 font-medium hover:underline"
              >
                Sample CBC
              </button>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={() => loadPreset('metabolic')}
                className="text-xs text-teal-700 font-medium hover:underline"
              >
                Sample Metabolic
              </button>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={() => loadPreset('organ')}
                className="text-xs text-teal-700 font-medium hover:underline"
              >
                Sample Organ Panel
              </button>
            </div>

            <button
              onClick={processManualText}
              disabled={isProcessing}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs shadow-md shadow-teal-600/20 transition flex items-center space-x-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{scanStep || 'Analyzing...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Parse & Classify Results</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Verification & Edit Review Checkpoint Modal */}
      {reviewData && (
        <ReviewModal
          initialData={reviewData}
          onConfirmSave={handleConfirmVerifiedSave}
          onDiscard={() => setReviewData(null)}
          isSaving={isSavingVerified}
        />
      )}
    </div>
  );
}
