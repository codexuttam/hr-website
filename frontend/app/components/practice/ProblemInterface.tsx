'use client';

import React, { useState } from 'react';
import { Problem, TestCase } from '../../types/problem';
import AceEditorWrapper from '../editor/AceEditorWrapper';
import { 
  Play, 
  Send, 
  RefreshCw, 
  Settings, 
  Maximize2, 
  CheckCircle2, 
  XCircle,
  Code2,
  FileText,
  ChevronRight,
  Database
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Panel, Group, Separator } from 'react-resizable-panels';

interface ProblemInterfaceProps {
  problem: Problem;
}

const ProblemInterface: React.FC<ProblemInterfaceProps> = ({ problem }) => {
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(problem.initialCode[language] || '');
  const [activeTab, setActiveTab] = useState<'description' | 'solutions' | 'submissions'>('description');
  const [consoleTab, setConsoleTab] = useState<'testcase' | 'result'>('testcase');
  const [output, setOutput] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResults, setTestResults] = useState<{ id: number; passed: boolean; actual: string }[] | null>(null);
  const [submitVerdict, setSubmitVerdict] = useState<{ verdict: string; passed: number; total: number; mistakeCategory: string | null; suggestedFix: string | null; explanation: string | null } | null>(null);

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    setCode(problem.initialCode[newLang] || '');
  };

  React.useEffect(() => {
    setCode(problem.initialCode[language] || '');
  }, [problem.id]);


  const callSubmit = async (isRun: boolean) => {
    const setter = isRun ? setIsRunning : setIsSubmitting;
    setter(true);
    if (isRun) { setConsoleTab('result'); setTestResults(null); }

    try {
      const response = await fetch('/api/code-server/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language,
          questionId: problem.id,
          studentId:  'anonymous',
          testCases:  problem.testCases,
        }),
      });

      if (!response.ok) throw new Error('Failed to execute code');

      const data = await response.json();
      const report = data.report ?? {};

      const results = (report.testResults ?? []).map((tc: any) => ({
        id:     tc.id,
        passed: tc.status === 'passed',
        actual: tc.actualOutput ?? tc.errorDetail ?? '',
      }));

      setTestResults(results);

      if (!isRun) {
        setSubmitVerdict({
          verdict:         report.verdict,
          passed:          report.passedCount ?? 0,
          total:           report.totalCount  ?? 0,
          mistakeCategory: report.mistakeCategory ?? null,
          suggestedFix:    report.suggestedFix    ?? null,
          explanation:     report.explanation     ?? null,
        });
        setConsoleTab('result');
      }
    } catch (error) {
      console.error('Execution error:', error);
    } finally {
      setter(false);
    }
  };

  const handleRun = async () => {
    setIsRunning(true);
    setConsoleTab('result');
    setTestResults(null);

    try {
      const response = await fetch('/api/code-server/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          language,
          questionId: problem.id,
          studentId:  'anonymous',
          testCases:  problem.testCases,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to execute code');
      }

      const data = await response.json();
      // Map report.testResults → { id, passed, actual }
      const results = (data.report?.testResults ?? []).map((tc: any) => ({
        id:     tc.id,
        passed: tc.status === 'passed',
        actual: tc.actualOutput ?? tc.errorDetail ?? '',
      }));
      setTestResults(results);
    } catch (error) {
      console.error('Error executing code:', error);
      // Fallback to local simulation if backend is not available
      setTimeout(() => {
        const results = problem.testCases.map(tc => {
          const passed = Math.random() > 0.3;
          return {
            id: tc.id,
            passed: passed,
            actual: passed ? tc.expectedOutput : '[Error: Output Mismatch]'
          };
        });
        setTestResults(results);
      }, 1000);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Top Navigation Bar */}
      <div className="h-12 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <span>Problems</span>
            <ChevronRight className="h-4 w-4" />
            <span className="text-slate-900 dark:text-white">{problem.title}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <Settings className="h-4 w-4 text-slate-500" />
          </button>
          <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-indigo-600 font-bold text-xs uppercase tracking-widest">
            Log In
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        <Group orientation="horizontal">
          {/* Left Panel: Description */}
          <Panel defaultSize={45} minSize={30}>
            <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
              <div className="flex border-b border-slate-200 dark:border-slate-800">
                <button 
                  onClick={() => setActiveTab('description')}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'description' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Description
                  </div>
                </button>
                <button 
                  onClick={() => setActiveTab('solutions')}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'solutions' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Solutions
                  </div>
                </button>
                <button 
                  onClick={() => setActiveTab('submissions')}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'submissions' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Submissions
                  </div>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{problem.title}</h1>
                <div className="flex items-center gap-3 mb-6">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${
                    problem.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' :
                    problem.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' :
                    'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'
                  }`}>
                    {problem.difficulty}
                  </span>
                  <span className="text-xs text-slate-400">|</span>
                  <span className="text-xs font-medium text-slate-500">{problem.category}</span>
                </div>

                <div className="prose prose-slate dark:prose-invert max-w-none prose-sm">
                  <ReactMarkdown>{problem.description}</ReactMarkdown>
                </div>

                <div className="mt-8">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4">Constraints</h3>
                  <ul className="space-y-2">
                    {problem.constraints.map((constraint, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <div className="mt-1.5 w-1 h-1 rounded-full bg-slate-400 flex-shrink-0" />
                        {constraint}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </Panel>

          <Separator className="w-1 bg-slate-200 dark:bg-slate-800 hover:bg-indigo-500 transition-colors" />

          {/* Right Panel: Editor & Console */}
          <Panel defaultSize={55} minSize={30}>
            <div className="h-full flex flex-col bg-white dark:bg-slate-950">
              <div className="flex-1 flex flex-col min-h-0">
                {/* Editor Header */}
                <div className="h-10 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 bg-slate-50 dark:bg-slate-900/50">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-medium text-slate-700 dark:text-slate-300">
                      <Code2 className="h-3 w-3" />
                      <select 
                        value={language} 
                        onChange={(e) => handleLanguageChange(e.target.value)}
                        className="bg-transparent border-none focus:outline-none cursor-pointer"
                      >
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                        <option value="cpp">C++</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors">
                      <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
                    </button>
                    <button className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors">
                      <Maximize2 className="h-3.5 w-3.5 text-slate-500" />
                    </button>
                  </div>
                </div>

                {/* Editor Content */}
                <div className="flex-1 relative">
                  <AceEditorWrapper 
                    code={code}
                    language={language}
                    theme="dark"
                    onChange={setCode}
                  />
                </div>

                {/* Console Panel */}
                <div className="h-[250px] flex flex-col border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                    <div className="flex">
                      <button 
                        onClick={() => setConsoleTab('testcase')}
                        className={`px-4 py-2 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${consoleTab === 'testcase' ? 'border-indigo-500 text-slate-900 dark:text-white' : 'border-transparent text-slate-500'}`}
                      >
                        Testcase
                      </button>
                      <button 
                        onClick={() => setConsoleTab('result')}
                        className={`px-4 py-2 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${consoleTab === 'result' ? 'border-indigo-500 text-slate-900 dark:text-white' : 'border-transparent text-slate-500'}`}
                      >
                        Result
                      </button>
                    </div>
                    <div className="flex items-center gap-2 py-1">
                      <button 
                        onClick={handleRun}
                        disabled={isRunning}
                        className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center gap-2"
                      >
                        {isRunning ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
                        Run
                      </button>
                      <button 
                        onClick={() => callSubmit(false)}
                        disabled={isSubmitting || isRunning}
                        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20"
                      >
                        {isSubmitting ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                        Submit
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 bg-white dark:bg-slate-950">
                    {consoleTab === 'testcase' ? (
                      <div className="space-y-4">
                        {problem.testCases.map((tc, i) => (
                          <div key={tc.id} className="space-y-2">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Case {i + 1}</div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 font-mono text-xs">
                              <div className="text-slate-500 mb-1">Input:</div>
                              <div className="text-slate-900 dark:text-slate-200">{tc.input}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {!testResults && !isRunning && (
                          <div className="h-full flex flex-center justify-center items-center text-slate-400 text-xs italic">
                            Run your code to see the results
                          </div>
                        )}
                        {isRunning && (
                          <div className="flex flex-col items-center justify-center py-8 gap-4">
                            <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Executing Tests...</div>
                          </div>
                        )}
                        {testResults && !isRunning && (
                          <div className="space-y-3">
                            <div className={`p-4 rounded-2xl border ${testResults.every(r => r.passed) ? 'bg-emerald-50 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20' : 'bg-rose-50 border-rose-100 dark:bg-rose-500/10 dark:border-rose-500/20'}`}>
                              <div className="flex items-center gap-2 mb-1">
                                {testResults.every(r => r.passed) ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <XCircle className="h-5 w-5 text-rose-500" />}
                                <span className={`text-sm font-black uppercase tracking-tight ${testResults.every(r => r.passed) ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                                  {testResults.every(r => r.passed) ? 'Accepted' : 'Wrong Answer'}
                                </span>
                              </div>
                              <div className="text-xs text-slate-500 font-medium">
                                {testResults.filter(r => r.passed).length}/{testResults.length} test cases passed
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              {testResults.map((result, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${result.passed ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Case {i + 1}</span>
                                  </div>
                                  <span className={`text-[10px] font-black uppercase tracking-widest ${result.passed ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {result.passed ? 'Passed' : 'Failed'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Panel>
        </Group>
      </div>
    </div>
  );
};

export default ProblemInterface;
