function validateSubmission(req, res, next) {
  const { code, language, questionId, problemSlug, studentId } = req.body;

  if (!code || typeof code !== 'string' || !code.trim()) {
    return res.status(400).json({ error: 'code is required' });
  }
  if (!language || typeof language !== 'string') {
    return res.status(400).json({ error: 'language is required' });
  }
  if (!questionId && !problemSlug) {
    return res.status(400).json({ error: 'questionId or problemSlug is required' });
  }

  const testCases = req.body.testCases;
  if (testCases !== undefined && !Array.isArray(testCases)) {
    return res.status(400).json({ error: 'testCases must be an array' });
  }

  next();
}

module.exports = { validateSubmission };
