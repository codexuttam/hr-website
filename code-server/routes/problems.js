const { Router } = require('express');
const { supabase } = require('../db/supabase');

const router = Router();

const dbCheck = (res) => {
  if (!supabase) { res.status(503).json({ error: 'Database not configured (SUPABASE_URL missing)' }); return false; }
  return true;
};

// GET /api/problems — list all active problems
router.get('/', async (req, res) => {
  if (!dbCheck(res)) return;
  const { category, difficulty } = req.query;

  let query = supabase
    .from('problems')
    .select('id, slug, title, difficulty, category, created_at')
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (category)   query = query.eq('category', category);
  if (difficulty) query = query.eq('difficulty', difficulty);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });

  res.json({ problems: data });
});

// GET /api/problems/:slug — single problem + its test cases
router.get('/:slug', async (req, res) => {
  if (!dbCheck(res)) return;
  const { slug } = req.params;

  const { data: problem, error: pErr } = await supabase
    .from('problems')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (pErr || !problem) return res.status(404).json({ error: 'Problem not found' });

  const { data: testCases, error: tcErr } = await supabase
    .from('test_cases')
    .select('id, input, expected_output, is_hidden, order_index')
    .eq('problem_id', problem.id)
    .order('order_index', { ascending: true });

  if (tcErr) return res.status(500).json({ error: tcErr.message });

  res.json({ problem, testCases: testCases ?? [] });
});

// POST /api/problems — create a new problem
router.post('/', async (req, res) => {
  if (!dbCheck(res)) return;
  const { slug, title, difficulty, description, category, constraints, examples, starter_code } = req.body;

  if (!slug || !title || !difficulty || !description) {
    return res.status(400).json({ error: 'slug, title, difficulty, and description are required' });
  }
  if (!['Easy', 'Medium', 'Hard'].includes(difficulty)) {
    return res.status(400).json({ error: 'difficulty must be Easy, Medium, or Hard' });
  }

  const { data, error } = await supabase
    .from('problems')
    .insert({ slug, title, difficulty, description, category, constraints, examples, starter_code })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  res.status(201).json({ problem: data });
});

// PATCH /api/problems/:slug — update a problem
router.patch('/:slug', async (req, res) => {
  if (!dbCheck(res)) return;
  const { slug } = req.params;
  const updates = req.body;

  const { data, error } = await supabase
    .from('problems')
    .update(updates)
    .eq('slug', slug)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  res.json({ problem: data });
});

// DELETE /api/problems/:slug — soft-delete (set is_active = false)
router.delete('/:slug', async (req, res) => {
  if (!dbCheck(res)) return;
  const { slug } = req.params;

  const { error } = await supabase
    .from('problems')
    .update({ is_active: false })
    .eq('slug', slug);

  if (error) return res.status(500).json({ error: error.message });

  res.json({ success: true });
});

module.exports = router;
