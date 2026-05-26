const { executeCode } = require('./executor');

/**
 * Run code against an array of test cases.
 *
 * testCases: [{ id, input, expectedOutput }]
 *
 * Returns { testResults, errorType, errorLogs, passedCount, totalCount }
 *   errorType: 'accepted' | 'compilation_error' | 'runtime_error' | 'wrong_answer' | 'time_limit_exceeded'
 */
async function runTestCases(code, language, testCases = []) {
  const testResults = [];
  let errorType = 'accepted';
  const errorLogs = [];

  for (const tc of testCases) {
    let result;
    try {
      result = await executeCode(code, language, tc.input ?? '');
    } catch (err) {
      result = { stdout: '', stderr: err.message, compileError: null, exitCode: 1, timedOut: false };
    }

    const { stdout, stderr, compileError, exitCode, timedOut } = result;

    let status;
    let actualOutput = stdout;
    let errorDetail = null;

    if (compileError) {
      status = 'compilation_error';
      errorDetail = compileError;
      if (errorType === 'accepted') errorType = 'compilation_error';
    } else if (timedOut) {
      status = 'time_limit_exceeded';
      if (errorType === 'accepted') errorType = 'time_limit_exceeded';
    } else if (exitCode !== 0 || stderr) {
      status = 'runtime_error';
      errorDetail = stderr;
      if (errorType === 'accepted') errorType = 'runtime_error';
    } else {
      const expected = (tc.expectedOutput ?? '').trim();
      const actual   = stdout.trim();
      if (actual === expected) {
        status = 'passed';
      } else {
        status = 'wrong_answer';
        if (errorType === 'accepted') errorType = 'wrong_answer';
      }
    }

    if (errorDetail) errorLogs.push(`Test ${tc.id}: ${errorDetail}`);

    testResults.push({
      id:             tc.id,
      input:          tc.input ?? '',
      expectedOutput: tc.expectedOutput ?? '',
      actualOutput,
      status,
      errorDetail,
    });
  }

  const passedCount = testResults.filter(r => r.status === 'passed').length;

  return { testResults, errorType, errorLogs, passedCount, totalCount: testCases.length };
}

module.exports = { runTestCases };