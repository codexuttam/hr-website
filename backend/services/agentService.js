const AGENT_URL = process.env.AGENT_SERVICE_URL || 'http://localhost:5001';

/**
 * Send error context to the LangChain evaluation agent.
 * Returns { mistakeCategory, suggestedFix, explanation, severity }
 * Falls back gracefully if the agent service is unavailable.
 */
async function evaluateWithAgent(payload) {
  try {
    const res = await fetch(`${AGENT_URL}/api/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Agent service error ${res.status}: ${text}`);
    }

    return await res.json();
  } catch (err) {
    console.error('[agentService] evaluation failed:', err.message);
    return {
      mistakeCategory: 'Unknown',
      suggestedFix: 'Agent service unavailable. Please review the error logs manually.',
      explanation: err.message,
      severity: 'unknown',
    };
  }
}

module.exports = { evaluateWithAgent };