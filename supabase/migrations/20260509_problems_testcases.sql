-- ============================================================
-- Problems, Test Cases, and Submissions tables
-- Run this in the Supabase SQL editor
-- ============================================================

-- Problems
CREATE TABLE IF NOT EXISTS problems (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT UNIQUE NOT NULL,
  title         TEXT NOT NULL,
  difficulty    TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  description   TEXT NOT NULL,
  category      TEXT NOT NULL DEFAULT 'Array',
  constraints   JSONB NOT NULL DEFAULT '[]',
  examples      JSONB NOT NULL DEFAULT '[]',
  starter_code  JSONB NOT NULL DEFAULT '{}',
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Test Cases (hidden flag lets admins hide expected outputs from students)
CREATE TABLE IF NOT EXISTS test_cases (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id      UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  input           TEXT NOT NULL,
  expected_output TEXT NOT NULL,
  is_hidden       BOOLEAN NOT NULL DEFAULT FALSE,
  order_index     INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Submissions
CREATE TABLE IF NOT EXISTS submissions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_uid   TEXT NOT NULL,
  problem_id    UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  language      TEXT NOT NULL,
  code          TEXT NOT NULL,
  verdict       TEXT NOT NULL CHECK (verdict IN ('accepted','wrong_answer','runtime_error','compilation_error','time_limit_exceeded')),
  passed_count  INT NOT NULL DEFAULT 0,
  total_count   INT NOT NULL DEFAULT 0,
  test_results  JSONB NOT NULL DEFAULT '[]',
  submitted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_test_cases_problem_id  ON test_cases (problem_id, order_index);
CREATE INDEX IF NOT EXISTS idx_submissions_student_uid ON submissions (student_uid);
CREATE INDEX IF NOT EXISTS idx_submissions_problem_id  ON submissions (problem_id);

-- Trigger to auto-update updated_at on problems
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_problems_updated_at ON problems;
CREATE TRIGGER trg_problems_updated_at
  BEFORE UPDATE ON problems
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Seed: Two Sum problem
-- ============================================================
INSERT INTO problems (slug, title, difficulty, description, category, constraints, examples, starter_code)
VALUES (
  'two-sum',
  'Two Sum',
  'Easy',
  'Given an array of integers `nums` and an integer `target`, return the **indices** of the two numbers such that they add up to `target`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

Return the answer in any order.',
  'Array',
  '["2 ≤ nums.length ≤ 10⁴", "-10⁹ ≤ nums[i] ≤ 10⁹", "Only one valid answer exists."]',
  '[{"input":"nums = [2,7,11,15], target = 9","output":"[0,1]","explanation":"nums[0] + nums[1] = 2 + 7 = 9"},{"input":"nums = [3,2,4], target = 6","output":"[1,2]","explanation":"nums[1] + nums[2] = 2 + 4 = 6"}]',
  '{
    "python": "import sys\n\ndef two_sum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        complement = target - n\n        if complement in seen:\n            return [seen[complement], i]\n        seen[n] = i\n    return []\n\ndata = sys.stdin.read().split()\nnums = list(map(int, data[:-1]))\ntarget = int(data[-1])\nresult = two_sum(nums, target)\nprint('' ''.join(map(str, result)))\n",
    "javascript": "const readline = require(''readline'');\nconst rl = readline.createInterface({ input: process.stdin });\nconst lines = [];\nrl.on(''line'', l => lines.push(l.trim()));\nrl.on(''close'', () => {\n  const nums = lines[0].split('' '').map(Number);\n  const target = Number(lines[1]);\n  function twoSum(nums, target) {\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n      const comp = target - nums[i];\n      if (map.has(comp)) return [map.get(comp), i];\n      map.set(nums[i], i);\n    }\n    return [];\n  }\n  console.log(twoSum(nums, target).join('' ''));\n});\n",
    "java": "import java.util.*;\npublic class Main {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    String[] parts = sc.nextLine().trim().split(\" \");\n    int[] nums = Arrays.stream(parts).mapToInt(Integer::parseInt).toArray();\n    int target = sc.nextInt();\n    Map<Integer,Integer> map = new HashMap<>();\n    for (int i = 0; i < nums.length; i++) {\n      int comp = target - nums[i];\n      if (map.containsKey(comp)) { System.out.println(map.get(comp) + \" \" + i); return; }\n      map.put(nums[i], i);\n    }\n  }\n}",
    "cpp": "#include <bits/stdc++.h>\nusing namespace std;\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        unordered_map<int, int> mp;\n        for (int i = 0; i < (int)nums.size(); i++) {\n            int need = target - nums[i];\n            if (mp.find(need) != mp.end()) return {mp[need], i};\n            mp[nums[i]] = i;\n        }\n        return {};\n    }\n};\nint main() {\n    ios::sync_with_stdio(false); cin.tie(nullptr);\n    vector<int> nums; string line; getline(cin, line);\n    istringstream ss(line); int x;\n    while (ss >> x) nums.push_back(x);\n    int target; cin >> target;\n    Solution sol; auto res = sol.twoSum(nums, target);\n    for (int i = 0; i < (int)res.size(); i++) { if (i) cout << '' ''; cout << res[i]; }\n    cout << endl; return 0;\n}"
  }'
)
ON CONFLICT (slug) DO NOTHING;

-- Seed test cases for Two Sum
INSERT INTO test_cases (problem_id, input, expected_output, is_hidden, order_index)
SELECT id, '2 7 11 15' || chr(10) || '9', '0 1', FALSE, 1 FROM problems WHERE slug = 'two-sum'
ON CONFLICT DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected_output, is_hidden, order_index)
SELECT id, '3 2 4' || chr(10) || '6', '1 2', FALSE, 2 FROM problems WHERE slug = 'two-sum'
ON CONFLICT DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected_output, is_hidden, order_index)
SELECT id, '3 3' || chr(10) || '6', '0 1', TRUE, 3 FROM problems WHERE slug = 'two-sum'
ON CONFLICT DO NOTHING;

-- RLS policies (enable RLS on all tables)
ALTER TABLE problems    ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_cases  ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can read active problems and their non-hidden test cases
CREATE POLICY "problems_read" ON problems    FOR SELECT USING (is_active = TRUE);
CREATE POLICY "test_cases_read" ON test_cases FOR SELECT USING (is_hidden = FALSE);

-- Authenticated users can insert their own submissions
CREATE POLICY "submissions_insert" ON submissions FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "submissions_select" ON submissions FOR SELECT USING (student_uid = auth.uid()::TEXT);