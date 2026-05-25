const { Router } = require('express');
const { supabase } = require('../db/supabase');

const router = Router({ mergeParams: true }); // inherit :slug from parent

async function resolveProblemId(slug) {
  const { data } = await supabase
    .from('problems')
    .select('id')
    .eq('slug', slug)
    .single();
  return data?.id ?? null;
}

// GET /api/problems/:slug/test-cases — list all test cases (including hidden, for admin)
router.get('/', async (req, res) => {
  const problemId = await resolveProblemId(req.params.slug);
  if (!problemId) return res.status(404).json({ error: 'Problem not found' });

  const { data, error } = await supabase
    .from('test_cases')
    .select('*')
    .eq('problem_id', problemId)
    .order('order_index', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });

  res.json({ testCases: data });
});

// POST /api/problems/:slug/test-cases — add one or more test cases
router.post('/', async (req, res) => {
  const problemId = await resolveProblemId(req.params.slug);
  if (!problemId) return res.status(404).json({ error: 'Problem not found' });

  const cases = Array.isArray(req.body) ? req.body : [req.body];

  if (cases.some(tc => !tc.input || tc.expected_output === undefined)) {
    return res.status(400).json({ error: 'Each test case needs input and expected_output' });
  }

  const rows = cases.map((tc, i) => ({
    problem_id:      problemId,
    input:           tc.input,
    expected_output: tc.expected_output,
    is_hidden:       tc.is_hidden ?? false,
    order_index:     tc.order_index ?? i,
  }));

  const { data, error } = await supabase.from('test_cases').insert(rows).select();
  if (error) return res.status(500).json({ error: error.message });

  res.status(201).json({ testCases: data });
});

// PATCH /api/problems/:slug/test-cases/:id — update a test case
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const problemId = await resolveProblemId(req.params.slug);
  if (!problemId) return res.status(404).json({ error: 'Problem not found' });

  const { data, error } = await supabase
    .from('test_cases')
    .update(req.body)
    .eq('id', id)
    .eq('problem_id', problemId)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  res.json({ testCase: data });
});

// DELETE /api/problems/:slug/test-cases/:id — delete a test case
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const problemId = await resolveProblemId(req.params.slug);
  if (!problemId) return res.status(404).json({ error: 'Problem not found' });

  const { error } = await supabase
    .from('test_cases')
    .delete()
    .eq('id', id)
    .eq('problem_id', problemId);

  if (error) return res.status(500).json({ error: error.message });

  res.json({ success: true });
});

module.exports = router;
