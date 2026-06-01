'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Plus, Trash2, Edit2, ChevronDown, ChevronUp, Search,
  Save, X, TestTube2, EyeOff, Eye, ArrowLeft, Loader2, History, RefreshCw, Filter
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';

type Difficulty = 'Easy' | 'Medium' | 'Hard';

interface TestCase {
  id: string;
  input: string;
  expected_output: string;
  is_hidden: boolean;
  order_index: number;
}

interface Problem {
  id: string;
  slug: string;
  title: string;
  difficulty: Difficulty;
  category: string;
  created_at: string;
}

const API = '/api/code-server';
const DIFF_COLOR: Record<string, string> = {
  Easy:   'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  Medium: 'text-yellow-400  bg-yellow-500/10  border-yellow-500/30',
  Hard:   'text-red-400     bg-red-500/10     border-red-500/30',
};

// ---- Blank problem form state ----
const BLANK_FORM = {
  slug: '', title: '', difficulty: 'Easy' as Difficulty, description: '',
  category: 'Array', constraints: '', examples: '',
  starter_python: '', starter_javascript: '', starter_java: '', starter_cpp: '',
};

export default function AdminProblemsPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 className="animate-spin text-indigo-500" /></div>}>
      <AdminProblemsContent />
    </React.Suspense>
  );
}

function AdminProblemsContent() {
  const [problems, setProblems]         = useState<Problem[]>([]);
  const [loadingList, setLoadingList]   = useState(true);

  // Panel state
  const [panel, setPanel]               = useState<'list' | 'create' | 'edit' | 'submissions'>('list');
  const [editSlug, setEditSlug]         = useState<string | null>(null);
  const [form, setForm]                 = useState({ ...BLANK_FORM });
  const [saving, setSaving]             = useState(false);
  const [formError, setFormError]       = useState<string | null>(null);

  // Test-case drawer
  const [tcSlug, setTcSlug]             = useState<string | null>(null);
  const [testCases, setTestCases]       = useState<TestCase[]>([]);
  const [tcLoading, setTcLoading]       = useState(false);
  const [newTc, setNewTc]               = useState({ input: '', expected_output: '', is_hidden: false });
  const [addingTc, setAddingTc]         = useState(false);

  // Submissions state
  const [subsProblemId, setSubsProblemId] = useState<string | null>(null);
  const [subsProblemTitle, setSubsProblemTitle] = useState<string>('');
  const [problemSubmissions, setProblemSubmissions] = useState<any[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
  const [selectedSubData, setSelectedSubData] = useState<any | null>(null);
  const [loadingSubData, setLoadingSubData] = useState(false);

  // Filter state
  const [subFilterEmail, setSubFilterEmail] = useState('');
  const [subSearchInput, setSubSearchInput] = useState('');
  const [subFilterProblemId, setSubFilterProblemId] = useState<string>('');

  const searchParams = useSearchParams();

  const fetchProblems = useCallback(async () => {
    setLoadingList(true);
    const res = await fetch(`${API}/problems`);
    const { problems: list } = await res.json();
    setProblems(list ?? []);
    setLoadingList(false);
  }, []);

  useEffect(() => { fetchProblems(); }, [fetchProblems]);

  useEffect(() => {
    const p = searchParams.get('panel');
    if (p === 'submissions') {
      setPanel('submissions');
    }
  }, [searchParams]);

  // Open edit panel
  const openEdit = async (slug: string) => {
    setFormError(null);
    const res = await fetch(`${API}/problems/${slug}`);
    const { problem: p, testCases: tc } = await res.json();
    setForm({
      slug:              p.slug,
      title:             p.title,
      difficulty:        p.difficulty,
      description:       p.description,
      category:          p.category,
      constraints:       (p.constraints as string[]).join('\n'),
      examples:          JSON.stringify(p.examples, null, 2),
      starter_python:    (p.starter_code as any)?.python     ?? '',
      starter_javascript:(p.starter_code as any)?.javascript ?? '',
      starter_java:      (p.starter_code as any)?.java       ?? '',
      starter_cpp:       (p.starter_code as any)?.cpp        ?? '',
    });
    setTestCases(tc ?? []);
    setEditSlug(slug);
    setTcSlug(slug);
    setPanel('edit');
  };

  const openCreate = () => {
    setForm({ ...BLANK_FORM });
    setEditSlug(null);
    setTcSlug(null);
    setTestCases([]);
    setFormError(null);
    setPanel('create');
  };

  const openSubmissions = async (id: string | null = null, title: string | null = null) => {
    setSubsProblemId(id);
    setSubFilterProblemId(id || '');
    if (title) setSubsProblemTitle(title);
    setSelectedSubId(null);
    setSelectedSubData(null);
    setSubSearchInput('');
    setSubFilterEmail('');
    setPanel('submissions');
  };

  const fetchSubmissions = async () => {
    setLoadingSubs(true);
    try {
      let url = `${API}/submissions?limit=50`;
      if (subFilterProblemId) url += `&problemId=${subFilterProblemId}`;
      if (subFilterEmail) url += `&search=${encodeURIComponent(subFilterEmail)}`;
      
      const res = await fetch(url);
      const data = await res.json();
      setProblemSubmissions(data.submissions || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSubs(false);
    }
  };

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSubFilterEmail(subSearchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [subSearchInput]);

  // Auto-fetch submissions when filters change
  useEffect(() => {
    if (panel === 'submissions') {
      fetchSubmissions();
    }
  }, [subFilterEmail, subFilterProblemId, panel]);

  const viewFullSubmission = async (subId: string) => {
    setSelectedSubId(subId);
    setLoadingSubData(true);
    try {
      const res = await fetch(`${API}/submissions/${subId}`);
      const data = await res.json();
      setSelectedSubData(data.submission);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSubData(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setFormError(null);
    try {
      const payload = {
        slug:         form.slug,
        title:        form.title,
        difficulty:   form.difficulty,
        description:  form.description,
        category:     form.category,
        constraints:  form.constraints.split('\n').map(s => s.trim()).filter(Boolean),
        examples:     JSON.parse(form.examples || '[]'),
        starter_code: {
          python:     form.starter_python,
          javascript: form.starter_javascript,
          java:       form.starter_java,
          cpp:        form.starter_cpp,
        },
      };

      const url    = panel === 'edit' ? `${API}/problems/${editSlug}` : `${API}/problems`;
      const method = panel === 'edit' ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to save');

      if (panel === 'create') {
        setTcSlug(data.problem.slug);
        setEditSlug(data.problem.slug);
        setPanel('edit');
      }
      await fetchProblems();
    } catch (e: any) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm(`Delete problem "${slug}"? (soft-delete)`)) return;
    await fetch(`${API}/problems/${slug}`, { method: 'DELETE' });
    await fetchProblems();
  };

  // Test cases
  const loadTestCases = async (slug: string) => {
    setTcLoading(true);
    const res = await fetch(`${API}/problems/${slug}/test-cases`);
    const { testCases: list } = await res.json();
    setTestCases(list ?? []);
    setTcLoading(false);
  };

  const addTestCase = async () => {
    if (!tcSlug) return;
    setAddingTc(true);
    await fetch(`${API}/problems/${tcSlug}/test-cases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newTc, order_index: testCases.length }),
    });
    setNewTc({ input: '', expected_output: '', is_hidden: false });
    await loadTestCases(tcSlug);
    setAddingTc(false);
  };

  const deleteTestCase = async (id: string) => {
    if (!tcSlug) return;
    await fetch(`${API}/problems/${tcSlug}/test-cases/${id}`, { method: 'DELETE' });
    setTestCases(prev => prev.filter(tc => tc.id !== id));
  };

  const toggleHidden = async (tc: TestCase) => {
    if (!tcSlug) return;
    await fetch(`${API}/problems/${tcSlug}/test-cases/${tc.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_hidden: !tc.is_hidden }),
    });
    setTestCases(prev => prev.map(t => t.id === tc.id ? { ...t, is_hidden: !t.is_hidden } : t));
  };

  const field = (key: keyof typeof form, label: string, multiline = false) => (
    <div>
      <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">{label}</label>
      {multiline ? (
        <textarea
          value={form[key]}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          rows={6}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
        />
      ) : (
        <input
          value={form[key]}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="text-slate-400 hover:text-slate-200 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Problem Manager</h1>
            <p className="text-slate-400 text-sm mt-0.5">Create and manage coding challenge problems</p>
          </div>
          <button
            onClick={openCreate}
            className="ml-auto flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-colors"
          >
            <Plus className="h-4 w-4" /> New Problem
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ---- Problem List ---- */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Problems ({problems.length})</h2>
            {loadingList ? (
              <div className="flex items-center gap-2 text-slate-500 text-sm py-6">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading…
              </div>
            ) : problems.length === 0 ? (
              <div className="text-slate-500 text-sm py-6 text-center">No problems yet. Create one →</div>
            ) : problems.map(p => (
              <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-white text-sm">{p.title}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${DIFF_COLOR[p.difficulty]}`}>
                      {p.difficulty}
                    </span>
                    <span className="text-xs text-slate-500">{p.category}</span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{p.slug}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openSubmissions(p.id, p.title)}
                    title="View Submissions Logs"
                    className="p-2 text-slate-400 hover:text-emerald-400 transition-colors rounded-lg hover:bg-slate-800"
                  >
                    <History className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => openEdit(p.slug)}
                    title="Edit Problem"
                    className="p-2 text-slate-400 hover:text-indigo-400 transition-colors rounded-lg hover:bg-slate-800"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(p.slug)}
                    title="Delete Problem"
                    className="p-2 text-slate-400 hover:text-red-400 transition-colors rounded-lg hover:bg-slate-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ---- Create / Edit Panel ---- */}
          {(panel === 'create' || panel === 'edit') && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-white">{panel === 'create' ? 'New Problem' : 'Edit Problem'}</h2>
                <button onClick={() => setPanel('list')} className="text-slate-500 hover:text-slate-300">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {field('slug',  'Slug (e.g. two-sum)')}
              {field('title', 'Title')}

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Difficulty</label>
                <select
                  value={form.difficulty}
                  onChange={e => setForm(f => ({ ...f, difficulty: e.target.value as Difficulty }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {['Easy', 'Medium', 'Hard'].map(d => <option key={d}>{d}</option>)}
                </select>
              </div>

              {field('category',    'Category (e.g. Array, DP)')}
              {field('description', 'Description (Markdown)', true)}
              {field('constraints', 'Constraints (one per line)', true)}

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">
                  Examples (JSON array)
                </label>
                <textarea
                  value={form.examples}
                  onChange={e => setForm(f => ({ ...f, examples: e.target.value }))}
                  rows={4}
                  placeholder={'[{"input":"...","output":"...","explanation":"..."}]'}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
                />
              </div>

              <details className="group">
                <summary className="cursor-pointer text-xs font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  Starter Code
                  <ChevronDown className="h-3.5 w-3.5 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="mt-3 space-y-3">
                  {field('starter_python',     'Python',     true)}
                  {field('starter_javascript', 'JavaScript', true)}
                  {field('starter_java',       'Java',       true)}
                  {field('starter_cpp',        'C++',        true)}
                </div>
              </details>

              {formError && <p className="text-red-400 text-xs">{formError}</p>}

              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? 'Saving…' : 'Save Problem'}
              </button>

              {/* ---- Test Cases Section ---- */}
              {tcSlug && (
                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <div className="flex items-center gap-2">
                    <TestTube2 className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-bold text-slate-300">Test Cases</span>
                    {tcLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-500" />}
                  </div>

                  {/* Existing test cases */}
                  <div className="space-y-2">
                    {testCases.map((tc, i) => (
                      <div key={tc.id} className="bg-slate-800/60 rounded-xl p-3 flex items-start gap-3">
                        <span className="text-xs text-slate-500 font-mono pt-0.5">#{i + 1}</span>
                        <div className="flex-1 min-w-0 font-mono text-xs space-y-1">
                          <div><span className="text-slate-500">in:  </span><span className="text-slate-300">{tc.input.replace('\n', '↵')}</span></div>
                          <div><span className="text-slate-500">out: </span><span className="text-emerald-300">{tc.expected_output}</span></div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => toggleHidden(tc)}
                            title={tc.is_hidden ? 'Hidden (click to show)' : 'Visible (click to hide)'}
                            className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                          >
                            {tc.is_hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                          <button
                            onClick={() => deleteTestCase(tc.id)}
                            className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {testCases.length === 0 && !tcLoading && (
                      <p className="text-xs text-slate-500 py-2 text-center">No test cases yet</p>
                    )}
                  </div>

                  {/* Add new test case */}
                  <div className="bg-slate-800/40 rounded-xl p-3 space-y-2">
                    <p className="text-xs font-semibold text-slate-400">Add Test Case</p>
                    <div>
                      <label className="text-[11px] text-slate-500 uppercase">Input (use \\n for newline)</label>
                      <textarea
                        value={newTc.input}
                        onChange={e => setNewTc(t => ({ ...t, input: e.target.value }))}
                        rows={2}
                        placeholder="e.g. 2 7 11 15\n9"
                        className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-500 uppercase">Expected Output</label>
                      <input
                        value={newTc.expected_output}
                        onChange={e => setNewTc(t => ({ ...t, expected_output: e.target.value }))}
                        placeholder="e.g. 0 1"
                        className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newTc.is_hidden}
                        onChange={e => setNewTc(t => ({ ...t, is_hidden: e.target.checked }))}
                        className="rounded"
                      />
                      Hidden (not shown to students)
                    </label>
                    <button
                      onClick={addTestCase}
                      disabled={addingTc || !newTc.input || !newTc.expected_output}
                      className="flex items-center gap-2 px-4 py-1.5 bg-emerald-700 hover:bg-emerald-600 disabled:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors"
                    >
                      {addingTc ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                      Add Test Case
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ---- Submissions Panel ---- */}
          {panel === 'submissions' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col max-h-[800px]">
              <div className="flex items-center justify-between mb-6 shrink-0 border-b border-slate-800 pb-4">
                <div>
                  <h2 className="font-bold text-white text-lg">Student Submissions</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    {subsProblemId ? (
                      <>Logs for: <span className="font-semibold text-slate-300">{subsProblemTitle}</span></>
                    ) : (
                      "Browse all student activity"
                    )}
                  </p>
                </div>
                <button onClick={() => { setPanel('list'); setSubsProblemId(null); setSubFilterProblemId(''); setSubFilterEmail(''); setSubSearchInput(''); }} className="text-slate-500 hover:text-slate-300 bg-slate-800/50 p-2 rounded-lg">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Filters Bar */}
              {!selectedSubId && (
                <div className="flex flex-col md:flex-row gap-3 mb-6 bg-slate-800/30 p-3 rounded-xl border border-slate-800/50">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                    <input 
                      type="text"
                      placeholder="Filter by Student Name or Email..."
                      value={subSearchInput}
                      onChange={(e) => setSubSearchInput(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="w-full md:w-48 relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                    <select
                      value={subFilterProblemId}
                      onChange={(e) => setSubFilterProblemId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 appearance-none"
                    >
                      <option value="">All Problems</option>
                      {problems.map(p => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                    </select>
                  </div>
                  <button 
                    onClick={() => fetchSubmissions()}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-2 justify-center"
                  >
                    <RefreshCw className={`w-3 h-3 ${loadingSubs ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>
              )}

              {loadingSubs ? (
                <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
              ) : selectedSubId ? (
                <div className="flex-1 overflow-auto flex flex-col bg-slate-950 rounded-xl border border-slate-800 shadow-inner">
                   <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 shrink-0 sticky top-0 backdrop-blur-sm z-10">
                      <button onClick={() => { setSelectedSubId(null); setSelectedSubData(null); }} className="text-xs font-semibold flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 transition-colors">
                        <ArrowLeft className="w-3.5 h-3.5" /> Back to list
                      </button>
                      <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">{selectedSubData?.language}</span>
                   </div>
                   {loadingSubData ? (
                      <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
                   ) : (
                      <div className="p-4 space-y-5">
                        <div className="flex items-center justify-between">
                          <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wide border ${selectedSubData?.verdict === 'Accepted' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                            {selectedSubData?.verdict}
                          </span>
                          <span className="text-xs text-slate-400 font-medium" title={`UID: ${selectedSubData?.student_uid}`}>
                            {selectedSubData?.user?.name || 'Unknown Student'} ({selectedSubData?.user?.email || selectedSubData?.student_uid?.slice(0, 8)})
                          </span>
                        </div>
                        
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Submitted Code</p>
                          <div className="bg-[#0d1117] p-4 rounded-xl border border-slate-800 overflow-x-auto shadow-inner">
                             <pre className="text-[13px] leading-relaxed font-mono text-slate-300 whitespace-pre">{selectedSubData?.code}</pre>
                          </div>
                        </div>

                        {selectedSubData?.mistake_category && (
                           <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-xl p-4">
                             <h4 className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                               <TestTube2 className="w-3.5 h-3.5" />
                               AI Report ({selectedSubData.mistake_category})
                             </h4>
                             <p className="text-sm text-indigo-200/80 leading-relaxed">{selectedSubData.explanation}</p>
                           </div>
                        )}
                      </div>
                   )}
                </div>
              ) : (
                <div className="flex-1 overflow-auto space-y-2.5 pr-2 custom-scrollbar">
                  {problemSubmissions.length === 0 ? (
                    <div className="text-center py-12 border border-slate-800 border-dashed rounded-xl bg-slate-900/30">
                      <History className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-400 text-sm font-medium">
                        {subSearchInput ? "User not found or no matching submissions." : "No submissions recorded yet."}
                      </p>
                    </div>
                  ) : problemSubmissions.map(sub => (
                    <div 
                      key={sub.id} 
                      onClick={() => viewFullSubmission(sub.id)} 
                      className="group bg-slate-800/40 hover:bg-slate-800 cursor-pointer rounded-xl p-4 border border-slate-700/50 hover:border-indigo-500/30 flex items-center justify-between transition-all"
                    >
                      <div>
                        <div className="text-sm font-bold text-slate-200 group-hover:text-indigo-400 transition-colors flex items-center gap-2">
                           <span title={`${sub.user?.name || 'Unknown Student'} (${sub.user?.email || sub.student_uid})`}>
                             {sub.user?.name || `User: ${sub.student_uid.slice(0, 8)}...`}
                           </span>
                           {sub.problems && (
                              <span className="text-[10px] font-medium bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded">
                                {sub.problems.title}
                              </span>
                           )}
                        </div>
                        <div className="text-xs text-slate-500 mt-1 font-medium">{new Date(sub.submitted_at).toLocaleString()}</div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border ${sub.verdict === 'Accepted' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                          {sub.verdict}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">{sub.language}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
