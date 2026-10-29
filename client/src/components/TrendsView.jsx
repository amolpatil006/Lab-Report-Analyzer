import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar, AlertCircle, ArrowUpRight, ArrowDownRight, Minus, Sparkles } from 'lucide-react';

export default function TrendsView({ reports }) {
  const [trendsData, setTrendsData] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTrends();
  }, [selectedPatient]);

  const fetchTrends = async () => {
    setIsLoading(true);
    try {
      const url = selectedPatient && selectedPatient !== 'ALL'
        ? `/api/reports/trends?patientName=${encodeURIComponent(selectedPatient)}`
        : '/api/reports/trends';
      const res = await fetch(url);
      const json = await res.json();
      if (json.success && json.data) {
        setTrendsData(json.data);
        if (json.data.length > 0 && !selectedTest) {
          setSelectedTest(json.data[0].testName);
        }
      }
    } catch (e) {
      console.error('Failed to load trends:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Unique patient names
  const patientNames = ['ALL', ...new Set(reports.map(r => r.patientName).filter(Boolean))];

  // Active trend series
  const activeSeries = trendsData.find(t => t.testName === selectedTest) || trendsData[0];

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-teal-600" />
            <h2 className="text-xl font-bold text-slate-900">Longitudinal Test History & Trends</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Compare biometric parameters across consecutive clinical tests to track progress over time.
          </p>
        </div>

        {/* Patient Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-600">Patient:</span>
          <select
            value={selectedPatient}
            onChange={(e) => setSelectedPatient(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
          >
            {patientNames.map((name) => (
              <option key={name} value={name}>
                {name === 'ALL' ? 'All Patients' : name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500">
          <p className="text-sm font-semibold">Loading chronological trend data...</p>
        </div>
      ) : trendsData.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500">
          <AlertCircle className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <p className="font-bold text-slate-700">No time-series parameters available yet.</p>
          <p className="text-xs text-slate-400 mt-1">
            Upload multiple reports over different dates to visualize trend lines.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Test Selector Sidebar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm lg:col-span-1">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Monitored Tests ({trendsData.length})
            </h3>
            <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
              {trendsData.map((t) => (
                <button
                  key={t.testName}
                  onClick={() => setSelectedTest(t.testName)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition flex items-center justify-between ${
                    (selectedTest || trendsData[0]?.testName) === t.testName
                      ? 'bg-teal-600 text-white font-bold shadow-sm'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="truncate">{t.testName}</span>
                  <span className="text-[10px] opacity-75 font-mono ml-2">
                    {t.timeline.length} pts
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Trend Chart and Timeline Table */}
          <div className="lg:col-span-3 space-y-6">
            {activeSeries && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-teal-600">
                      {activeSeries.category}
                    </span>
                    <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
                      {activeSeries.testName}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      Normal Range Target: {activeSeries.referenceMin} – {activeSeries.referenceMax} {activeSeries.unit}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 font-medium">Latest Measurement</span>
                    <p className="text-2xl font-black text-slate-900">
                      {activeSeries.timeline[activeSeries.timeline.length - 1]?.value}{' '}
                      <span className="text-xs font-normal text-slate-500">{activeSeries.unit}</span>
                    </p>
                  </div>
                </div>

                {/* SVG Line Chart */}
                <div className="h-64 w-full relative mb-6">
                  <TrendChart series={activeSeries} />
                </div>

                {/* Timeline Data Points Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 uppercase font-semibold">
                        <th className="py-2">Date</th>
                        <th className="py-2">Patient</th>
                        <th className="py-2">Value</th>
                        <th className="py-2">Status</th>
                        <th className="py-2">Trajectory</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeSeries.timeline.map((point, index) => {
                        const prevPoint = activeSeries.timeline[index - 1];
                        const diff = prevPoint ? point.value - prevPoint.value : null;

                        return (
                          <tr key={index} className="hover:bg-slate-50">
                            <td className="py-2.5 font-medium text-slate-800">{point.date}</td>
                            <td className="py-2.5 text-slate-600">{point.patientName}</td>
                            <td className="py-2.5 font-bold font-mono text-slate-900">
                              {point.value} {activeSeries.unit}
                            </td>
                            <td className="py-2.5">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  point.status === 'NORMAL'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : point.status === 'ABOVE_NORMAL'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-sky-100 text-sky-800'
                                }`}
                              >
                                {point.status === 'NORMAL' ? 'Normal' : point.status === 'ABOVE_NORMAL' ? 'High' : 'Low'}
                              </span>
                            </td>
                            <td className="py-2.5">
                              {diff === null ? (
                                <span className="text-slate-400">— Baseline</span>
                              ) : diff > 0 ? (
                                <span className="text-rose-600 font-semibold flex items-center space-x-1">
                                  <ArrowUpRight className="w-3.5 h-3.5" />
                                  <span>+{diff.toFixed(1)}</span>
                                </span>
                              ) : diff < 0 ? (
                                <span className="text-emerald-600 font-semibold flex items-center space-x-1">
                                  <ArrowDownRight className="w-3.5 h-3.5" />
                                  <span>{diff.toFixed(1)}</span>
                                </span>
                              ) : (
                                <span className="text-slate-500 flex items-center space-x-1">
                                  <Minus className="w-3.5 h-3.5" />
                                  <span>No change</span>
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Responsive Pure SVG Trend Chart with Reference Range Shaded Band
 */
function TrendChart({ series }) {
  const points = series.timeline;
  if (!points || points.length === 0) return null;

  const minRef = series.referenceMin || 0;
  const maxRef = series.referenceMax || 100;

  const values = points.map(p => p.value);
  const dataMin = Math.min(...values, minRef);
  const dataMax = Math.max(...values, maxRef);
  const rangeSpan = (dataMax - dataMin) || 10;
  const yPad = rangeSpan * 0.2;
  const yMin = Math.max(0, dataMin - yPad);
  const yMax = dataMax + yPad;
  const yTotal = yMax - yMin;

  const width = 600;
  const height = 220;
  const paddingX = 50;
  const paddingY = 25;
  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  // Scales
  const getY = (val) => chartH - ((val - yMin) / yTotal) * chartH + paddingY;
  const getX = (idx) => {
    if (points.length === 1) return paddingX + chartW / 2;
    return paddingX + (idx / (points.length - 1)) * chartW;
  };

  const refTopY = getY(maxRef);
  const refBottomY = getY(minRef);
  const refHeight = Math.abs(refBottomY - refTopY);

  const polylineCoords = points.map((p, idx) => `${getX(idx)},${getY(p.value)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
      {/* Background gridlines */}
      <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="#e2e8f0" strokeDasharray="3 3" />
      <line x1={paddingX} y1={paddingY + chartH / 2} x2={width - paddingX} y2={paddingY + chartH / 2} stroke="#e2e8f0" strokeDasharray="3 3" />
      <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="#cbd5e1" />

      {/* Shaded Normal Range Band */}
      <rect
        x={paddingX}
        y={Math.min(refTopY, refBottomY)}
        width={chartW}
        height={refHeight}
        fill="#10b981"
        fillOpacity="0.08"
        stroke="#10b981"
        strokeOpacity="0.25"
        strokeDasharray="4 2"
      />
      <text
        x={width - paddingX - 6}
        y={Math.min(refTopY, refBottomY) + 14}
        textAnchor="end"
        fill="#059669"
        fontSize="10"
        fontWeight="600"
      >
        Target Healthy Zone
      </text>

      {/* Connecting Trend Line */}
      {points.length > 1 && (
        <polyline
          fill="none"
          stroke="#0d9488"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={polylineCoords}
        />
      )}

      {/* Plotted Data Dots & Value tooltips */}
      {points.map((p, idx) => {
        const cx = getX(idx);
        const cy = getY(p.value);
        const isAbnormal = p.status !== 'NORMAL';

        return (
          <g key={idx}>
            <circle
              cx={cx}
              cy={cy}
              r="6"
              fill={isAbnormal ? '#e11d48' : '#0d9488'}
              stroke="#ffffff"
              strokeWidth="2.5"
              className="transition hover:r-8 cursor-pointer"
            />
            {/* Value Label */}
            <text
              x={cx}
              y={cy - 10}
              textAnchor="middle"
              fill={isAbnormal ? '#be123c' : '#0f766e'}
              fontSize="11"
              fontWeight="bold"
            >
              {p.value}
            </text>
            {/* Date Label */}
            <text
              x={cx}
              y={height - paddingY + 16}
              textAnchor="middle"
              fill="#64748b"
              fontSize="10"
            >
              {p.date}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
