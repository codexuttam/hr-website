const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');

const supabaseUrl = process.env.SUPABASE_URL             || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

let supabase = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    realtime: {
      transport: ws,
    },
  });
} else {
  console.warn('[db] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set — DB features disabled');
}

module.exports = { supabase };
