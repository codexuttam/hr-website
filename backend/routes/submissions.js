const { Router } = require('express');
const { supabase } = require('../db/supabase');

const router = Router();

// GET /api/submissions?studentUid=...&studentEmail=...&studentName=...&search=...&problemId=...&limit=20
router.get('/', async (req, res) => {
  const { studentUid, studentEmail, studentName, search, problemId, limit = 20 } = req.query;

  let resolvedUids = null;

  // 1. Resolve student UID from email, name, or general search query
  if (studentEmail || studentName || search) {
    let userQuery = supabase.from('users').select('user_id');

    if (search) {
      userQuery = userQuery.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    } else {
      if (studentEmail) userQuery = userQuery.eq('email', studentEmail);
      if (studentName) userQuery = userQuery.ilike('name', `%${studentName}%`);
    }

    const { data: usersData, error: userError } = await userQuery;
    if (userError) return res.status(500).json({ error: userError.message });
    if (!usersData || usersData.length === 0) return res.json({ submissions: [] }); // No matching users found

    resolvedUids = usersData.map(u => String(u.user_id)).filter(Boolean);
    if (resolvedUids.length === 0) return res.json({ submissions: [] });
  }

  // 2. Build the submissions query
  let query = supabase
    .from('submissions')
    .select('id, student_uid, problem_id, language, verdict, passed_count, total_count, submitted_at, problems(slug, title)')
    .order('submitted_at', { ascending: false })
    .limit(Number(limit));

  if (studentUid) {
    query = query.eq('student_uid', studentUid);
  } else if (resolvedUids) {
    query = query.in('student_uid', resolvedUids);
  }

  if (problemId) query = query.eq('problem_id', problemId);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });

  // 3. Enhance submissions list with user profile info (name and email)
  if (data && data.length > 0) {
    const uids = [...new Set(data.map(s => Number(s.student_uid)).filter(Boolean))];
    if (uids.length > 0) {
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('user_id, name, email')
        .in('user_id', uids);

      if (!usersError && users) {
        const userMap = {};
        users.forEach(u => {
          userMap[String(u.user_id)] = u;
        });

        data.forEach(s => {
          s.user = userMap[s.student_uid] || { name: 'Unknown Student', email: '' };
        });
      }
    }
  }

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

  // Also fetch and attach user details to the single submission
  if (data.student_uid) {
    const { data: userData } = await supabase
      .from('users')
      .select('name, email')
      .eq('user_id', Number(data.student_uid))
      .maybeSingle();

    if (userData) {
      data.user = userData;
    }
  }

  res.json({ submission: data });
});

module.exports = router;
