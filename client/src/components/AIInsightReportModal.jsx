import React from 'react';
import {
  X,
  Sparkles,
  TrendingDown,
  AlertOctagon,
  CheckCircle2,
  Calendar,
  Layers,
  Copy,
  Check,
} from 'lucide-react';

export const AIInsightReportModal = ({ isOpen, onClose, report }) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !report) return null;

  const handleCopy = () => {
    const text = `
OMNIPULSE CX EXECUTIVE INTELLIGENCE REPORT
Date: ${new Date(report.generatedAt).toLocaleDateString()}
Health Score: ${report.overallHealthScore}/100
Tickets Analyzed: ${report.ticketsAnalyzedCount}

EXECUTIVE SUMMARY:
${report.executiveSummary}

TOP RECURRING PAIN POINTS:
${report.topPainPoints?.map((p, i) => `${i + 1}. [${p.severity}] ${p.issue} (${p.frequency}): ${p.description}`).join('\n')}

CHURN DRIVERS:
${report.churnDrivers?.map((c, i) => `${i + 1}. ${c.factor} [Impact: ${c.impact}]: ${c.recommendation}`).join('\n')}

CONCRETE LEADERSHIP RECOMMENDATIONS:
${report.recommendations?.map((r, i) => `${i + 1}. [${r.priority} Priority] ${r.title}\n   Action: ${r.action}\n   Expected Outcome: ${r.expectedOutcome}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getHealthColor = (score) => {
    if (score >= 80) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (score >= 60) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{report.title}</h2>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Gemini 2.5 Flash
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <Calendar className="w-3.5 h-3.5" />
                Generated on {new Date(report.generatedAt).toLocaleString()} • Analyzed {report.ticketsAnalyzedCount} recent tickets
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Brief'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Health Score & Executive Summary Card */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="flex flex-col items-center justify-center p-3 rounded-lg border bg-slate-900/60 md:col-span-1">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Overall CX Health</span>
              <div className="text-4xl font-extrabold text-white mt-1">
                {report.overallHealthScore}
                <span className="text-lg text-slate-500 font-normal">/100</span>
              </div>
              <div className={`mt-2 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getHealthColor(report.overallHealthScore)}`}>
                {report.overallHealthScore >= 80 ? 'Optimal' : report.overallHealthScore >= 60 ? 'Moderate Risk' : 'Urgent Attention'}
              </div>
            </div>

            <div className="md:col-span-3 flex flex-col justify-center">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                Executive Summary
              </span>
              <p className="text-sm text-slate-200 leading-relaxed font-normal">
                {report.executiveSummary}
              </p>
            </div>
          </div>

          {/* Section: Recurring Product Pain Points */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-rose-400" />
              Top Recurring Product Pain Points
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {report.topPainPoints?.map((pain, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 hover:border-slate-700 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                        pain.severity === 'High' ? 'bg-rose-500/15 border-rose-500/30 text-rose-300' : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                      }`}>
                        {pain.severity} Severity
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">{pain.frequency}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-white mb-1.5">{pain.issue}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{pain.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Churn Drivers */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-amber-400" />
              Primary Churn Drivers & Mitigation
            </h3>
            <div className="space-y-2.5">
              {report.churnDrivers?.map((driver, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-200">{driver.factor}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {driver.impact} Impact
                      </span>
                    </div>
                    <p className="text-slate-400">{driver.recommendation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: 3 Concrete Leadership Recommendations */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              3 Concrete Recommendations for Business Leadership
            </h3>
            <div className="space-y-3">
              {report.recommendations?.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/30 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <h4 className="font-semibold text-white text-sm">{rec.title}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                        {rec.priority} Priority
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 pl-7">{rec.action}</p>
                  </div>

                  <div className="shrink-0 pl-7 md:pl-0">
                    <div className="text-[11px] px-3 py-1.5 rounded-lg bg-indigo-900/30 border border-indigo-700/40 text-indigo-200 font-medium">
                      🎯 {rec.expectedOutcome}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-500">
          <span>OmniPulse CX Intelligence Engine • Model: Gemini 2.5 Flash</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIInsightReportModal;
