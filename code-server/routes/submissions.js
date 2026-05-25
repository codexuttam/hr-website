const { Router } = require('express');
const { supabase } = require('../db/supabase');

const router = Router();

// GET /api/submissions?studentUid=...&studentEmail=...&problemId=...&limit=20
router.get('/', async (req, res) => {
  const { studentUid, studentEmail, problemId, limit = 20 } = req.query;

  let resolvedUid = studentUid;

  // 1. If email is provided, resolve it to a UID
  if (studentEmail) {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('user_uid')
      .eq('email', studentEmail)
      .maybeSingle();
    
    if (userError) return res.status(500).json({ error: userError.message });
    if (!userData) return res.json({ submissions: [] }); // Email not found
    resolvedUid = userData.user_uid;
  }

  // 2. Build the submissions query
  let query = supabase
    .from('submissions')
    .select('id, student_uid, problem_id, language, verdict, passed_count, total_count, submitted_at, problems(slug, title)')
    .order('submitted_at', { ascending: false })
    .limit(Number(limit));

  if (resolvedUid) query = query.eq('student_uid', resolvedUid);
  if (problemId)   query = query.eq('problem_id', problemId);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });

  // 3. (Optional) Enhance with user info if possible
  // If we had a foreign key, we'd do it in the join. For now, let's just return what we have.
  res.json({ submissions: data });
});

// GET /api/submissions/:id — single submission with full test results
router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('submissions')
    .select('*, problems(slug, title, difficulty)')
    .eq('id', req.params.id)
    .single();

  if (error || !data) return res.status(404).json({ error: 'Submission not found' });

  res.json({ submission: data });
});

module.exports = router;
