import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import UploadSection from './components/UploadSection.jsx';
import ReportDashboard from './components/ReportDashboard.jsx';
import HistoryView from './components/HistoryView.jsx';
import TrendsView from './components/TrendsView.jsx';
import DictionaryModal from './components/DictionaryModal.jsx';
import { Activity, Database, CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'dashboard' | 'history' | 'trends' | 'dictionary'
  const [currentReport, setCurrentReport] = useState(null);
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/reports');
      const data = await res.json();
      if (data.success && data.data) {
        setReports(data.data);
        // If we have existing reports and none is currently selected, pick the first one
        if (data.data.length > 0 && !currentReport) {
          setCurrentReport(data.data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReportAnalyzed = (newReport) => {
    setCurrentReport(newReport);
    setReports(prev => [newReport, ...prev.filter(r => (r.id || r._id) !== (newReport.id || newReport._id))]);
    setActiveTab('dashboard');
    showToast('Report successfully analyzed and saved!');
  };

  const handleSelectReport = (report) => {
    setCurrentReport(report);
    setActiveTab('dashboard');
  };

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this clinical report record?')) return;
    try {
      const res = await fetch(`/api/reports/${reportId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setReports(prev => prev.filter(r => (r.id || r._id) !== reportId));
        if (currentReport && (currentReport.id || currentReport._id) === reportId) {
          setCurrentReport(reports.find(r => (r.id || r._id) !== reportId) || null);
        }
        showToast('Report record deleted.');
      }
    } catch (e) {
      console.error('Failed to delete report:', e);
    }
  };

  const handleSeedSample = async () => {
    try {
      const res = await fetch('/api/reports/seed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast('Sample laboratory test reports loaded!');
        await fetchReports();
      }
    } catch (e) {
      console.error('Failed to seed:', e);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewUpload={() => {
          setActiveTab('upload');
        }}
        onSeedSample={handleSeedSample}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center space-x-2 text-xs font-semibold animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-teal-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 w-full max-w-none px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'upload' && (
          <UploadSection onReportAnalyzed={handleReportAnalyzed} />
        )}

        {activeTab === 'dashboard' && (
          currentReport ? (
            <ReportDashboard
              report={currentReport}
              onBackToUpload={() => setActiveTab('upload')}
              onViewTrends={() => setActiveTab('trends')}
            />
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
              <Activity className="w-12 h-12 text-teal-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-800">No Active Report Selected</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Please upload a lab report or select an existing one from history.
              </p>
              <button
                onClick={() => setActiveTab('upload')}
                className="px-4 py-2 bg-teal-600 text-white text-xs font-semibold rounded-lg hover:bg-teal-700 transition"
              >
                Go to Upload
              </button>
            </div>
          )
        )}

        {activeTab === 'history' && (
          <HistoryView
            reports={reports}
            onSelectReport={handleSelectReport}
            onDeleteReport={handleDeleteReport}
            onRefresh={fetchReports}
          />
        )}

        {activeTab === 'trends' && (
          <TrendsView reports={reports} />
        )}

        {activeTab === 'dictionary' && (
          <DictionaryModal />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500 print:hidden">
          <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping" />
            <span className="font-semibold text-slate-700 text-center ">Laboratory Test Report Analyzer</span>
            
          </div>


        </div>
      </footer>
    </div>
  );
}
