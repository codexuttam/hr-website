const { Router } = require('express');
const { validateSubmission } = require('../middleware/validate');
const { runTestCases }       = require('../services/testRunner');
const { evaluateWithAgent }  = require('../services/agentService');
const { supabase }           = require('../db/supabase');

const router = Router();

router.post('/', validateSubmission, async (req, res) => {
  const {
    code,
    language,
    questionId,    // legacy: plain string id
    problemSlug,   // preferred: slug to fetch from DB
    studentId,
    testCases: inlineTestCases = [],
  } = req.body;

  try {
    // ----------------------------------------------------------------
    // 1. Resolve test cases — from DB (preferred) or inline payload
    // ----------------------------------------------------------------
    let testCasesToRun = inlineTestCases;
    let problemId      = null;

    if (problemSlug) {
      const { data: problem, error: pErr } = await supabase
        .from('problems')
        .select('id')
        .eq('slug', problemSlug)
        .eq('is_active', true)
        .single();

      if (!pErr && problem) {
        problemId = problem.id;

        const { data: dbCases } = await supabase
          .from('test_cases')
          .select('id, input, expected_output, order_index')
          .eq('problem_id', problemId)
          .order('order_index', { ascending: true });

        if (dbCases && dbCases.length > 0) {
          testCasesToRun = dbCases.map(tc => ({
            id:             tc.id,
            input:          tc.input,
            expectedOutput: tc.expected_output,
          }));
        }
      }
    }

    // ----------------------------------------------------------------
    // 2. Run code against all test cases via Piston API
    // ----------------------------------------------------------------
    const { testResults, errorType, errorLogs, passedCount, totalCount } =
      await runTestCases(code, language, testCasesToRun);

    // ----------------------------------------------------------------
    // 3. AI analysis on failure
    // ----------------------------------------------------------------
    let aiAnalysis = null;
    if (errorType !== 'accepted') {
      const failedCases = testResults.filter(r => r.status !== 'passed');
      aiAnalysis = await evaluateWithAgent({
        code,
        language,
        questionId: questionId ?? problemSlug,
        studentId: String(studentId ?? ''),
        errorType,
        errorLogs,
        failedTestCases: failedCases,
      });
    }

    // ----------------------------------------------------------------
    // 4. Save submission to Supabase
    // ----------------------------------------------------------------
    const submittedAt = new Date().toISOString();

    if (problemId && studentId) {
      await supabase.from('submissions').insert({
        student_uid:  String(studentId),
        problem_id:   problemId,
        language,
        code,
        verdict:      errorType,
        passed_count: passedCount,
        total_count:  totalCount,
        test_results: testResults,
        submitted_at: submittedAt,
      });
    }

    // ----------------------------------------------------------------
    // 5. Return report
    // ----------------------------------------------------------------
    const report = {
      questionId: questionId ?? problemSlug,
      studentId,
      language,
      submittedAt,
      verdict:          errorType,
      passedCount,
      totalCount,
      testResults,
      errorLogs,
      mistakeCategory:  aiAnalysis?.mistakeCategory  ?? null,
      suggestedFix:     aiAnalysis?.suggestedFix     ?? null,
      explanation:      aiAnalysis?.explanation      ?? null,
      severity:         aiAnalysis?.severity         ?? null,
    };

    return res.status(200).json({ success: true, report });
  } catch (err) {
    console.error('[submit] error:', err);
    return res.status(500).json({ error: 'Submission processing failed', details: err.message });
  }
});

module.exports = router;
