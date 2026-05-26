const { Router } = require('express');
const { JUDGE0_URL, LANGUAGE_MAP, RUN_TIMEOUT_MS, MEMORY_LIMIT } = require('../config/judge0Config');

const router = Router();

// POST /api/execute — run arbitrary code (used by the code playground)
router.post('/', async (req, res) => {
  const { code, language, customInput = '' } = req.body;

  if (!code || !language) {
    return res.status(400).json({ error: 'code and language are required' });
  }

  const langConfig = LANGUAGE_MAP[language];
  if (!langConfig) {
    return res.status(400).json({ error: `Language "${language}" is not supported` });
  }

  try {
    const j0Res = await fetch(`${JUDGE0_URL}/submissions?base64_encoded=false&wait=true`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language_id:    langConfig.id,
        source_code:    code,
        stdin:          customInput || '',
        cpu_time_limit: RUN_TIMEOUT_MS,
        memory_limit:   MEMORY_LIMIT,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!j0Res.ok) {
      throw new Error(`Judge0 API error: ${j0Res.status} ${j0Res.statusText}`);
    }

    const result = await j0Res.json();
    const statusId = result.status?.id ?? 0;

    if (statusId === 6) {
      return res.json({ output: undefined, error: result.compile_output || 'Compilation error' });
    }
    if (statusId === 5) {
      return res.json({ output: undefined, error: 'Time Limit Exceeded' });
    }

    return res.json({
      output: result.stdout   || undefined,
      error:  result.stderr   || result.message || undefined,
    });
  } catch (err) {
    console.error('[execute]', err.message);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
