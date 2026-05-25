'use client';

import React, { useState } from 'react';
import {
  CheckCircle2, XCircle, AlertTriangle, Clock,
  ChevronDown, ChevronUp, Lightbulb, Bug, Zap
} from 'lucide-react';

export interface TestResult {
  id: number;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  status: 'passed' | 'wrong_answer' | 'runtime_error' | 'compilation_error' | 'time_limit_exceeded';
  errorDetail: string | null;
}

export interface SubmissionReportData {
  verdict: 'accepted' | 'wrong_answer' | 'runtime_error' | 'compilation_error' | 'time_limit_exceeded';
  passedCount: number;
  totalCount: number;
  testResults: TestResult[];
  errorLogs: string[];
  mistakeCategory: string | null;
  suggestedFix: string | null;
  explanation: string | null;
  severity: 'low' | 'medium' | 'high' | null;
  submittedAt: string;
}

const VERDICT_CONFIG = {
  accepted:             { label: 'Accepted',              color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', Icon: CheckCircle2 },
  wrong_answer:         { label: 'Wrong Answer',          color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/30',         Icon: XCircle },
  runtime_error:        { label: 'Runtime Error',         color: 'text-orange-400',  bg: 'bg-orange-500/10 border-orange-500/30',   Icon: Bug },
  compilation_error:    { label: 'Compilation Error',     color: 'text-yellow-400',  bg: 'bg-yellow-500/10 border-yellow-500/30',   Icon: AlertTriangle },
  time_limit_exceeded:  { label: 'Time Limit Exceeded',   color: 'text-purple-400',  bg: 'bg-purple-500/10 border-purple-500/30',   Icon: Clock },
};

const SEVERITY_COLOR = { low: 'text-yellow-400', medium: 'text-orange-400', high: 'text-red-400' };

function StatusBadge({ status }: { status: TestResult['status'] }) {
  const map: Record<string, string> = {
    passed:              'bg-emerald-500/15 text-emerald-400',
    wrong_answer:        'bg-red-500/15 text-red-400',
    runtime_error:       'bg-orange-500/15 text-orange-400',
    compilation_error:   'bg-yellow-500/15 text-yellow-400',
    time_limit_exceeded: 'bg-purple-500/15 text-purple-400',
  };
  const labels: Record<string, string> = {
    passed: 'Passed', wrong_answer: 'Wrong Answer',
    runtime_error: 'Runtime Error', compilation_error: 'Compile Error',
    time_limit_exceeded: 'TLE',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${map[status] ?? ''}`}>
      {labels[status] ?? status}
    </span>
  );
}

export default function SubmissionReport({ report }: { report: SubmissionReportData }) {
  const [expandedCase, setExpandedCase] = useState<number | null>(null);
  const cfg = VERDICT_CONFIG[report.verdict] ?? VERDICT_CONFIG.wrong_answer;
  const { Icon } = cfg;
  const hasAI = !!report.mistakeCategory;

  return (
    <div className="space-y-4 text-sm">

      {/* Verdict banner */}
      <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${cfg.bg}`}>
        <Icon className={`h-6 w-6 shrink-0 ${cfg.color}`} />
        <div className="flex-1 min-w-0">
          <p className={`font-bold text-base ${cfg.color}`}>{cfg.label}</p>
          <p className="text-slate-400 text-xs mt-0.5">
            {report.passedCount} / {report.totalCount} test cases passed
            &nbsp;&middot;&nbsp;
            {new Date(report.submittedAt).toLocaleTimeString()}
          </p>
        </div>
        {/* Progress pill */}
        <div className="shrink-0 text-right">
          <span className="text-xs font-bold text-slate-300">
            {report.totalCount > 0
              ? Math.round((report.passedCount / report.totalCount) * 100)
              : 0}%
          </span>
          <div className="mt-1 w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${report.verdict === 'accepted' ? 'bg-emerald-500' : 'bg-red-500'}`}
              style={{ width: `${report.totalCount > 0 ? (report.passedCount / report.totalCount) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Test cases */}
      {report.testResults.length > 0 && (
        <div className="rounded-2xl border border-slate-700/60 overflow-hidden">
          <div className="px-4 py-2.5 bg-slate-800/60 border-b border-slate-700/60">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Test Cases</span>
          </div>
          <div className="divide-y divide-slate-700/40">
            {report.testResults.map((tc) => (
              <div key={tc.id}>
                <button
                  onClick={() => setExpandedCase(expandedCase === tc.id ? null : tc.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800/40 transition-colors text-left"
                >
                  {tc.status === 'passed'
                    ? <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    : <XCircle className="h-4 w-4 text-red-400 shrink-0" />}
                  <span className="flex-1 text-slate-300 font-medium">Test Case {tc.id}</span>
                  <StatusBadge status={tc.status} />
                  {expandedCase === tc.id
                    ? <ChevronUp className="h-3.5 w-3.5 text-slate-500" />
                    : <ChevronDown className="h-3.5 w-3.5 text-slate-500" />}
                </button>

                {expandedCase === tc.id && (
                  <div className="px-4 pb-4 space-y-2 bg-slate-900/40">
                    {[
                      { label: 'Input',    value: tc.input           },
                      { label: 'Expected', value: tc.expectedOutput  },
                      { label: 'Actual',   value: tc.actualOutput    },
                      ...(tc.errorDetail ? [{ label: 'Error', value: tc.errorDetail }] : []),
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-[11px] text-slate-500 font-semibold uppercase mb-1">{label}</p>
                        <pre className="bg-slate-950 text-slate-300 text-xs px-3 py-2 rounded-lg overflow-x-auto whitespace-pre-wrap break-all">
                          {value || '(empty)'}
                        </pre>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Analysis */}
      {hasAI && (
        <div className="rounded-2xl border border-slate-700/60 overflow-hidden">
          <div className="px-4 py-2.5 bg-slate-800/60 border-b border-slate-700/60 flex items-center gap-2">
            <Zap className="h-3.5 w-3.5 text-indigo-400" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">AI Analysis</span>
            {report.severity && (
              <span className={`ml-auto text-[11px] font-semibold capitalize ${SEVERITY_COLOR[report.severity]}`}>
                {report.severity} severity
              </span>
            )}
          </div>

          <div className="p-4 space-y-4 bg-slate-900/30">
            {/* Category */}
            <div className="flex items-center gap-2">
              <Bug className="h-4 w-4 text-orange-400 shrink-0" />
              <span className="text-slate-400 text-xs font-semibold">Mistake Type</span>
              <span className="ml-auto px-2.5 py-0.5 rounded-full bg-orange-500/15 text-orange-300 text-xs font-bold border border-orange-500/20">
                {report.mistakeCategory}
              </span>
            </div>

            {/* Explanation */}
            {report.explanation && (
              <div>
                <p className="text-[11px] text-slate-500 font-semibold uppercase mb-1.5">What went wrong</p>
                <p className="text-slate-300 leading-relaxed text-xs">{report.explanation}</p>
              </div>
            )}

            {/* Fix */}
            {report.suggestedFix && (
              <div className="rounded-xl bg-indigo-500/10 border border-indigo-500/20 p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <Lightbulb className="h-3.5 w-3.5 text-indigo-400" />
                  <span className="text-[11px] text-indigo-400 font-bold uppercase">Suggested Fix</span>
                </div>
                <p className="text-slate-200 leading-relaxed text-xs">{report.suggestedFix}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Raw error logs (compile/runtime) */}
      {report.errorLogs.length > 0 && (
        <div className="rounded-2xl border border-slate-700/60 overflow-hidden">
          <div className="px-4 py-2.5 bg-slate-800/60 border-b border-slate-700/60">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Error Logs</span>
          </div>
          <pre className="p-4 text-red-400 text-xs font-mono whitespace-pre-wrap overflow-x-auto bg-slate-950/50 leading-relaxed">
            {report.errorLogs.join('\n')}
          </pre>
        </div>
      )}
    </div>
  );
}
