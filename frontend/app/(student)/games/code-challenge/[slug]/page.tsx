'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Header from '../../../../components/Header';
import SubmissionReport, { SubmissionReportData } from '@/components/submission/SubmissionReport';
import { useAuth } from '@/contexts/AuthContext';
import {
  Code2, Play, Send, ChevronDown, ChevronUp,
  CheckCircle2, XCircle, BookOpen, Clock, BarChart2,
  Loader2, Terminal, FlaskConical
} from 'lucide-react';
import { Panel, Group, Separator } from 'react-resizable-panels';

const AceEditorWrapper = dynamic(
  () => import('@/components/editor/AceEditorWrapper'),
  { ssr: false, loading: () => <div className="h-full bg-slate-950 animate-pulse rounded-xl" /> }
);

interface Example { input: string; output: string; explanation?: string }
interface TestCase { id: string; input: string; expected_output: string; is_hidden: boolean }
interface RunResult { input: string; expected: string; actual: string; passed: boolean; error?: string }
interface Problem {
  id: string; slug: string; title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string; category: string;
  constraints: string[]; examples: Example[];
  starter_code: Record<string, string>;
}

const LANGUAGES = [
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
];

const DIFF_COLOR: Record<string, string> = {
  Easy: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  Medium: 'text-yellow-400  bg-yellow-500/10  border-yellow-500/30',
  Hard: 'text-red-400     bg-red-500/10     border-red-500/30',
};

const EXT: Record<string, string> = { python: 'py', java: 'java', cpp: 'cpp', javascript: 'js' };

const DEFAULT_SLUG = 'two-sum';
const CONSOLE_H = 240; // px — bottom console panel height

const mapSubmissionData = (sub: any): SubmissionReportData => ({
  verdict: sub.verdict,
  passedCount: sub.passed_count ?? sub.passedCount,
  totalCount: sub.total_count ?? sub.totalCount,
  testResults: sub.test_results ?? sub.testResults ?? [],
  errorLogs: sub.error_logs ?? sub.errorLogs ?? [],
  mistakeCategory: sub.mistake_category ?? sub.mistakeCategory ?? null,
  suggestedFix: sub.suggested_fix ?? sub.suggestedFix ?? null,
  explanation: sub.explanation ?? sub.explanation ?? null,
  severity: sub.severity ?? sub.severity ?? null,
  submittedAt: sub.submitted_at ?? sub.submittedAt,
});

export default function CodeChallengePage() {
  const { user } = useAuth();
  const params = useParams();
  const slug = (params?.slug as string) || DEFAULT_SLUG;

  const [problem, setProblem] = useState<Problem | null>(null);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('');

  // Submission
  const [submitting, setSubmitting] = useState(false);
  const [report, setReport] = useState<SubmissionReportData | null>(null);
  const [leftTab, setLeftTab] = useState<'problem' | 'report' | 'history'>('problem');
  const [descOpen, setDescOpen] = useState(true);

  // History
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Run / console
  const [running, setRunning] = useState(false);
  const [consoleOpen, setConsoleOpen] = useState(true);
  const [consoleTab, setConsoleTab] = useState<'cases' | 'output'>('cases');
  const [customInput, setCustomInput] = useState('');
  const [runResults, setRunResults] = useState<RunResult[]>([]);
  const [rawOutput, setRawOutput] = useState<string | null>(null);

  // Load problem and recent submission
  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    const loadData = async () => {
      // Reset state for new problem
      setReport(null);
      setHistory([]);
      setRunResults([]);
      setRawOutput(null);
      setLeftTab('problem');

      try {
        const pRes = await fetch(`/api/code-server/problems/${slug}`);
        const { problem: p, testCases: tc, error } = await pRes.json();
        
        if (error || !p) { 
          setLoadError(error ?? 'Problem not found'); 
          return; 
        }

        setProblem(p);
        setTestCases(tc ?? []);
        if (tc?.length) setCustomInput(tc.find((t: TestCase) => !t.is_hidden)?.input ?? '');

        // Restore most recent submission if user is logged in
        if (user?.user_id) {
          const subRes = await fetch(`/api/code-server/submissions?studentUid=${user.user_id}&problemId=${p.id}&limit=1`);
          const subData = await subRes.json();
          if (subData.submissions && subData.submissions.length > 0) {
            const lastSubId = subData.submissions[0].id;
            // Fetch full submission data because the list endpoint omits code and AI details
            const fullSubRes = await fetch(`/api/code-server/submissions/${lastSubId}`);
            const fullSubData = await fullSubRes.json();
            
            if (fullSubData.submission) {
              const fullSub = fullSubData.submission;
              setLanguage(fullSub.language);
              setCode(fullSub.code);
              setReport(mapSubmissionData(fullSub));
              setLeftTab('report'); // Automatically open report tab to show previous feedback
            } else {
              setCode(p.starter_code?.[language] ?? p.starter_code?.['python'] ?? '');
              setReport(null);
            }
          } else {
            setCode(p.starter_code?.[language] ?? p.starter_code?.['python'] ?? '');
            setReport(null);
          }
        } else {
          setCode(p.starter_code?.[language] ?? p.starter_code?.['python'] ?? '');
          setReport(null);
        }
      } catch (e: any) {
        setLoadError(e.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [slug, user?.user_id]);

  // ── RUN against visible test cases ────────────────────────────────────────
  const handleRun = useCallback(async () => {
    if (running || !problem) return;
    setRunning(true);
    setRunResults([]);
    setRawOutput(null);
    setConsoleTab('output');
    setConsoleOpen(true);

    const visible = testCases.filter(tc => !tc.is_hidden);
    const casesToRun = visible.length ? visible : [{ id: 'custom', input: customInput, expected_output: '', is_hidden: false }];

    const results: RunResult[] = [];

    for (const tc of casesToRun) {
      try {
        const res = await fetch('/api/code-server/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, language, customInput: tc.input }),
        });
        const data = await res.json();
        const actual = (data.output ?? '').trim();
        const expected = tc.expected_output.trim();
        results.push({
          input: tc.input,
          expected,
          actual,
          passed: expected ? actual === expected : true,
          error: data.error || undefined,
        });
      } catch (e: any) {
        results.push({ input: tc.input, expected: tc.expected_output, actual: '', passed: false, error: e.message });
      }
    }

    setRunResults(results);
    setRawOutput(results.map(r => r.actual || r.error || '').join('\n---\n'));
    setRunning(false);
  }, [running, code, language, problem, testCases, customInput]);

  // ── SUBMIT (full test suite + AI) ─────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (submitting || !problem) return;
    setSubmitting(true);
    setReport(null);

    try {
      const res = await fetch('/api/code-server/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code, language,
          problemSlug: problem.slug,
          studentId: String(user?.user_id ?? 'anonymous'),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error ?? 'Submission failed');
      setReport(data.report);
      setLeftTab('report');
    } catch (err: any) {
      alert(`Submission error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  }, [submitting, code, language, problem, user]);

  // ── LOAD HISTORY ──────────────────────────────────────────────────────────
  const fetchHistory = useCallback(async () => {
    if (!problem || !user?.user_id) return;
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/code-server/submissions?studentUid=${user.user_id}&problemId=${problem.id}`);
      const data = await res.json();
      setHistory(data.submissions || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHistory(false);
    }
  }, [problem, user]);

  useEffect(() => {
    if (leftTab === 'history') {
      fetchHistory();
    }
  }, [leftTab, fetchHistory]);



  const handleViewSubmission = async (id: string) => {
    try {
      const res = await fetch(`/api/code-server/submissions/${id}`);
      const data = await res.json();
      if (data.submission) {
        setReport(mapSubmissionData(data.submission));
        setLeftTab('report');
      }
    } catch (e) {
      console.error('Failed to load submission:', e);
    }
  };

  // ── Loading / error states ────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
    </div>
  );
  if (loadError || !problem) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-red-400">
      {loadError ?? 'Problem not found'}
    </div>
  );

  const visibleTestCases = testCases.filter(tc => !tc.is_hidden);

  return (
    <div className="h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans flex flex-col">
      <Header />

      {/* ── Top bar ── */}
      <div className="border-b border-slate-800 bg-slate-900/70 px-4 py-2.5 flex items-center gap-3 flex-wrap shrink-0">
        <div className="flex items-center gap-2">
          <Code2 className="h-4 w-4 text-indigo-400" />
          <span className="font-bold text-white text-sm">{problem.title}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${DIFF_COLOR[problem.difficulty]}`}>
            {problem.difficulty}
          </span>
          <span className="text-xs text-slate-500 hidden sm:inline">{problem.category}</span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <select
            value={language}
            onChange={e => {
              const newLang = e.target.value;
              setLanguage(newLang);
              if (problem?.starter_code?.[newLang]) {
                setCode(problem.starter_code[newLang]);
                setReport(null);
                setRunResults([]);
                setRawOutput(null);
              }
            }}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>

          {/* Run */}
          <button
            onClick={handleRun}
            disabled={running || submitting}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:cursor-not-allowed text-slate-200 rounded-lg text-xs font-semibold transition-colors border border-slate-600"
          >
            {running
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <Play className="h-3.5 w-3.5 text-emerald-400" />}
            Run
          </button>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting || running}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold transition-colors"
          >
            {submitting
              ? <><Loader2 className="animate-spin h-3.5 w-3.5" />Evaluating…</>
              : <><Send className="h-3.5 w-3.5" />Submit</>}
          </button>
        </div>
      </div>

      {/* ── Main body ── */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <Group orientation="horizontal">
          {/* LEFT — Problem / Report */}
          <Panel defaultSize={30} minSize={20}>
            <div className="h-full flex flex-col overflow-hidden border-r border-slate-800">
              {/* Tabs */}
              <div className="flex border-b border-slate-800 shrink-0">
                {(['problem', 'report', 'history'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setLeftTab(tab)}
                    className={`flex-1 py-2 text-[11px] font-bold uppercase tracking-widest transition-colors capitalize
                  ${leftTab === tab
                        ? 'text-indigo-400 border-b-2 border-indigo-500 bg-slate-900/40'
                        : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    {tab === 'report' && report && (
                      <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle
                    ${report.verdict === 'accepted' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                    )}
                    {tab}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {leftTab === 'problem' && (
                  <>
                    {/* Description */}
                    <div className="rounded-xl border border-slate-800 overflow-hidden">
                      <button
                        onClick={() => setDescOpen(v => !v)}
                        className="w-full flex items-center gap-2 px-4 py-2.5 bg-slate-900/60 hover:bg-slate-800/60 transition-colors"
                      >
                        <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
                        <span className="text-xs font-semibold">Description</span>
                        {descOpen ? <ChevronUp className="h-3.5 w-3.5 ml-auto text-slate-500" /> : <ChevronDown className="h-3.5 w-3.5 ml-auto text-slate-500" />}
                      </button>
                      {descOpen && (
                        <div className="p-4 text-slate-300 text-xs leading-relaxed space-y-2">
                          {problem.description.split('\n\n').map((para, i) => (
                            <p key={i} dangerouslySetInnerHTML={{
                              __html: para
                                .replace(/`([^`]+)`/g, '<code class="bg-slate-800 px-1 py-0.5 rounded text-indigo-300">$1</code>')
                                .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                            }} />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Examples */}
                    {problem.examples.map((ex, i) => (
                      <div key={i} className="rounded-xl border border-slate-800 bg-slate-900/30 overflow-hidden">
                        <div className="px-4 py-1.5 border-b border-slate-800 bg-slate-900/60">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Example {i + 1}</span>
                        </div>
                        <div className="p-3 space-y-1.5 font-mono text-xs">
                          <div><span className="text-slate-500">Input:  </span><span className="text-slate-200">{ex.input}</span></div>
                          <div><span className="text-slate-500">Output: </span><span className="text-emerald-300">{ex.output}</span></div>
                          {ex.explanation && <div className="text-slate-400 font-sans text-[11px] mt-1">// {ex.explanation}</div>}
                        </div>
                      </div>
                    ))}

                    {/* Constraints */}
                    {problem.constraints.length > 0 && (
                      <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-3">
                        <div className="flex items-center gap-1.5 mb-2">
                          <BarChart2 className="h-3.5 w-3.5 text-slate-500" />
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Constraints</span>
                        </div>
                        <ul className="space-y-1">
                          {problem.constraints.map((c, i) => (
                            <li key={i} className="text-slate-300 text-xs flex items-start gap-2">
                              <span className="text-indigo-500">•</span>{c}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Sample test cases */}
                    {visibleTestCases.length > 0 && (
                      <div className="rounded-xl border border-slate-800 bg-slate-900/30 overflow-hidden">
                        <div className="px-4 py-1.5 border-b border-slate-800 bg-slate-900/60 flex items-center gap-1.5">
                          <FlaskConical className="h-3 w-3 text-slate-500" />
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Sample Cases ({visibleTestCases.length})
                          </span>
                        </div>
                        <div className="divide-y divide-slate-800">
                          {visibleTestCases.map((tc, i) => (
                            <div key={tc.id} className="px-4 py-2.5 font-mono text-xs space-y-1">
                              <div className="text-[10px] text-slate-500 font-semibold uppercase mb-1">Case {i + 1}</div>
                              <div><span className="text-slate-500">In:  </span><span className="text-slate-300">{tc.input.replace(/\n/g, ', ')}</span></div>
                              <div><span className="text-slate-500">Out: </span><span className="text-emerald-300">{tc.expected_output}</span></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {leftTab === 'report' && (
                  report
                    ? <SubmissionReport report={report} />
                    : (
                      <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center p-8 border border-slate-800 border-dashed rounded-2xl bg-slate-900/20">
                        <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4 border border-slate-700/50">
                          <Send className="h-8 w-8 text-slate-500 opacity-50" />
                        </div>
                        <h3 className="text-slate-300 font-bold mb-1">No Report Available</h3>
                        <p className="text-slate-500 text-xs max-w-[200px]">Submit your code to see detailed test results and AI analysis here.</p>
                      </div>
                    )
                )}

                {leftTab === 'history' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-4 text-slate-300 px-1">
                      <Clock className="w-4 h-4 text-indigo-400" />
                      <h3 className="font-semibold text-sm">Submission History</h3>
                      <button 
                        onClick={fetchHistory} 
                        disabled={loadingHistory}
                        className="ml-auto text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        {loadingHistory ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Refresh'}
                      </button>
                    </div>
                    {loadingHistory && history.length === 0 ? (
                      <div className="flex justify-center p-8">
                        <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                      </div>
                    ) : history.length === 0 ? (
                      <div className="text-center p-8 text-slate-500 text-xs border border-slate-800 border-dashed rounded-xl bg-slate-900/20">
                        No submissions yet for this problem.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {history.map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => handleViewSubmission(sub.id)}
                            className="w-full text-left p-3 bg-slate-900/40 border border-slate-800 rounded-xl flex items-center justify-between hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all group"
                          >
                            <div className="flex items-center gap-3">
                              {sub.verdict === 'accepted' ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                              )}
                              <div>
                                <div className={`text-xs font-bold capitalize ${sub.verdict === 'accepted' ? 'text-emerald-400' : 'text-red-400'}`}>
                                  {sub.verdict}
                                </div>
                                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                                  {new Date(sub.submitted_at).toLocaleString()} • {sub.language}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-slate-300 font-mono font-bold group-hover:text-indigo-300 transition-colors">
                                {sub.passed_count} / {sub.total_count}
                              </div>
                              <div className="text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">
                                Passed
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Panel>
          <Separator className="w-1.5 bg-slate-800 hover:bg-indigo-600 transition-colors cursor-col-resize" />
          <Panel defaultSize={70} minSize={30}>
            <div className="h-full flex flex-col overflow-hidden">
              <Group orientation="vertical">
                {/* Editor Area */}
                <Panel defaultSize={70} minSize={20}>
                  <div className="h-full flex flex-col overflow-hidden">
                    {/* Editor header */}
                    <div className="flex items-center gap-2 px-4 py-1.5 border-b border-slate-800 bg-slate-900/40 shrink-0">
                      {(running || submitting) && (
                        <span className="ml-auto text-[11px] text-indigo-400 animate-pulse">
                          {submitting ? 'Running all test cases…' : 'Running…'}
                        </span>
                      )}
                    </div>

                    {/* Code editor */}
                    <div className="flex-1 min-h-0">
                      <AceEditorWrapper
                        code={code}
                        language={language}
                        theme="dark"
                        onChange={setCode}
                      />
                    </div>
                  </div>
                </Panel>

                {consoleOpen && <Separator className="h-1.5 bg-slate-800 hover:bg-indigo-600 transition-colors cursor-row-resize" />}
                {consoleOpen && (
                  <Panel defaultSize={30} minSize={10}>
                    <div className="h-full bg-slate-900 flex flex-col overflow-hidden">
                      {/* Console header */}
                      <div className="flex items-center gap-1 px-3 border-b border-slate-800 shrink-0 h-9">
                        <Terminal className="h-3.5 w-3.5 text-slate-500" />

                        {/* Tabs */}
                        <>
                          {(['cases', 'output'] as const).map(t => (
                            <button
                              key={t}
                              onClick={() => setConsoleTab(t)}
                              className={`px-3 py-1 text-[11px] font-semibold rounded-md transition-colors capitalize ${consoleTab === t
                                  ? 'bg-slate-700 text-slate-200'
                                  : 'text-slate-500 hover:text-slate-300'
                                }`}
                            >
                              {t === 'cases' ? 'Test Cases' : 'Output'}
                              {t === 'output' && runResults.length > 0 && (
                                <span className={`ml-1.5 text-[10px] font-bold ${runResults.every(r => r.passed) ? 'text-emerald-400' : 'text-red-400'
                                  }`}>
                                  {runResults.filter(r => r.passed).length}/{runResults.length}
                                </span>
                              )}
                            </button>
                          ))}
                        </>

                        <button
                          onClick={() => setConsoleOpen(false)}
                          className="ml-auto text-slate-500 hover:text-slate-300 transition-colors p-1"
                          title="Collapse console"
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Console body */}
                      <div className="flex-1 overflow-auto p-3 min-h-0">

                        {/* Test Cases tab */}
                        {consoleTab === 'cases' && (
                          <div className="space-y-2">
                            <div>
                              <label className="text-[10px] text-slate-500 font-semibold uppercase">Custom Input</label>
                              <textarea
                                value={customInput}
                                onChange={e => setCustomInput(e.target.value)}
                                rows={3}
                                className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                                placeholder="Enter custom input here…"
                              />
                            </div>
                            <button
                              onClick={handleRun}
                              disabled={running || submitting}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-slate-200 rounded-lg text-xs font-semibold transition-colors"
                            >
                              {running ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3 text-emerald-400" />}
                              Run Code
                            </button>
                          </div>
                        )}

                        {/* Output tab */}
                        {consoleTab === 'output' && (
                          <div className="space-y-2">
                            {running && (
                              <div className="flex items-center gap-2 text-slate-400 text-xs">
                                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Running…
                              </div>
                            )}
                            {!running && runResults.length === 0 && (
                              <p className="text-xs text-slate-500">Click <strong>Run</strong> to execute your code against the sample test cases.</p>
                            )}
                            {runResults.map((r, i) => (
                              <div key={i} className={`rounded-lg border p-3 text-xs space-y-1.5 font-mono ${r.passed
                                  ? 'border-emerald-700/50 bg-emerald-900/10'
                                  : 'border-red-700/50 bg-red-900/10'
                                }`}>
                                <div className="flex items-center gap-2 font-sans font-semibold mb-1">
                                  {r.passed
                                    ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                                    : <XCircle className="h-3.5 w-3.5 text-red-400" />}
                                  <span className={r.passed ? 'text-emerald-400' : 'text-red-400'}>
                                    Case {i + 1} — {r.passed ? 'Passed' : 'Failed'}
                                  </span>
                                </div>
                                <div><span className="text-slate-500">Input:    </span><span className="text-slate-300">{r.input.replace(/\n/g, ' | ')}</span></div>
                                {r.expected && <div><span className="text-slate-500">Expected: </span><span className="text-emerald-300">{r.expected}</span></div>}
                                <div><span className="text-slate-500">Output:   </span>
                                  <span className={r.passed ? 'text-emerald-300' : 'text-red-300'}>
                                    {r.actual || <em className="text-slate-500">(empty)</em>}
                                  </span>
                                </div>
                                {r.error && <div className="text-red-400 text-[11px] pt-1 border-t border-red-900/40">{r.error}</div>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Panel>
                )}
              </Group>
            </div>
          </Panel>
        </Group>
      </div>

      {!consoleOpen && (
        <div className="fixed bottom-0 right-0 left-0 bg-slate-900 border-t border-slate-700 px-4 h-9 flex items-center z-10">
          <button
            onClick={() => setConsoleOpen(true)}
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Terminal className="h-3.5 w-3.5" />
            Console
            <ChevronUp className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
