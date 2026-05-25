const { Router } = require('express');
const submitRouter      = require('./submit');
const healthRouter      = require('./health');
const problemsRouter    = require('./problems');
const testCasesRouter   = require('./testCases');
const submissionsRouter = require('./submissions');
const executeRouter     = require('./execute');

const router = Router();

router.use('/execute',                   executeRouter);
router.use('/submit',                    submitRouter);
router.use('/health',                    healthRouter);
router.use('/problems',                  problemsRouter);
router.use('/problems/:slug/test-cases', testCasesRouter);
router.use('/submissions',               submissionsRouter);

module.exports = router;