const { JUDGE0_URL, LANGUAGE_MAP, RUN_TIMEOUT_MS, MEMORY_LIMIT } = require('../config/judge0Config');

/**
 * Execute code via Judge0 CE (synchronous submission).
 * Returns { stdout, stderr, compileError, exitCode, timedOut }
 */
async function executeCode(code, language, stdin = '') {
  const langConfig = LANGUAGE_MAP[language];
  if (!langConfig) {
    return {
      stdout: '', stderr: '',
      compileError: `Unsupported language: ${language}`,
      exitCode: 1, timedOut: false,
    };
  }

  const res = await fetch(`${JUDGE0_URL}/submissions?base64_encoded=false&wait=true`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      language_id:        langConfig.id,
      source_code:        code,
      stdin:              stdin || '',
      cpu_time_limit:     RUN_TIMEOUT_MS,
      memory_limit:       MEMORY_LIMIT,
    }),
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok) {
    throw new Error(`Judge0 API error: ${res.status} ${res.statusText}`);
  }

  const result = await res.json();

  /*
   * Judge0 status IDs:
   *  1 = In Queue, 2 = Processing
   *  3 = Accepted
   *  4 = Wrong Answer (won't happen here — we compare ourselves)
   *  5 = Time Limit Exceeded
   *  6 = Compilation Error
   *  7-12 = Runtime errors (SIGSEGV, SIGXFSZ, SIGFPE, SIGABRT, NZEC, Other)
   *  13 = Internal Error
   */
  const statusId = result.status?.id ?? 0;

  if (statusId === 6) {
    return {
      stdout: '', stderr: result.compile_output || '',
      compileError: result.compile_output || 'Compilation error',
      exitCode: 1, timedOut: false,
    };
  }

  if (statusId === 5) {
    return {
      stdout: result.stdout || '', stderr: '',
      compileError: null,
      exitCode: 1, timedOut: true,
    };
  }

  const isRuntimeError = statusId >= 7 && statusId <= 12;

  return {
    stdout:       (result.stdout || '').trim(),
    stderr:       (result.stderr || result.message || '').trim(),
    compileError: null,
    exitCode:     isRuntimeError ? 1 : 0,
    timedOut:     false,
  };
}

module.exports = { executeCode };
