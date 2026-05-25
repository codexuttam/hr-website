const { Router } = require('express');
const router = Router();

router.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'code-server', timestamp: new Date().toISOString() });
});

module.exports = router;