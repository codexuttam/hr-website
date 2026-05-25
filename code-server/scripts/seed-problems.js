/**
 * Run: node scripts/seed-problems.js
 * Seeds classic LeetCode-style problems into Supabase.
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// ─────────────────────────────────────────────────────────────────────────────
// PROBLEM DEFINITIONS
// All code uses stdin/stdout so Piston can execute them directly.
// ─────────────────────────────────────────────────────────────────────────────
const PROBLEMS = [

  // ── 1. TWO SUM ─────────────────────────────────────────────────────────────
  {
    slug: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    category: 'Array',
    description: `Given an array of integers \`nums\` and an integer \`target\`, return the **indices** of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

Return the answer in any order.`,
    constraints: [
      '2 ≤ nums.length ≤ 10⁴',
      '-10⁹ ≤ nums[i] ≤ 10⁹',
      'Only one valid answer exists.',
    ],
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'nums[0] + nums[1] = 9' },
      { input: 'nums = [3,2,4], target = 6',     output: '[1,2]' },
    ],
    starter_code: {
      python: `import sys
def two_sum(nums, target):
    # Write your code here
    pass

data = sys.stdin.read().split()
if data:
    nums, target = list(map(int, data[:-1])), int(data[-1])
    print(' '.join(map(str, two_sum(nums, target))))
`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');
if (lines.length >= 2) {
  const nums = lines[0].split(' ').map(Number), target = Number(lines[1]);
  function twoSum(nums, target) {
    // Write your code here
  }
  console.log(twoSum(nums, target).join(' '));
}
`,
      java: `import java.util.*;
public class Main {
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    if (!sc.hasNextLine()) return;
    int[] nums = Arrays.stream(sc.nextLine().trim().split(" ")).mapToInt(Integer::parseInt).toArray();
    int target = sc.nextInt();
    // Write your code here
  }
}`,
      cpp: `#include<bits/stdc++.h>
using namespace std;
int main(){
  string line; getline(cin,line);
  istringstream ss(line); int x; vector<int> nums;
  while(ss>>x) nums.push_back(x);
  int target; cin>>target;
  // Write your code here
}`,
    },
    test_cases: [
      { input: '2 7 11 15\n9',  expected_output: '0 1', is_hidden: false },
      { input: '3 2 4\n6',      expected_output: '1 2', is_hidden: false },
      { input: '3 3\n6',        expected_output: '0 1', is_hidden: true  },
      { input: '1 5 3 2\n4',    expected_output: '2 3', is_hidden: true  },
    ],
  },

  // ── 2. VALID PARENTHESES ────────────────────────────────────────────────────
  {
    slug: 'valid-parentheses',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    category: 'Stack',
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
- Open brackets must be closed by the same type of brackets.
- Open brackets must be closed in the correct order.
- Every close bracket has a corresponding open bracket of the same type.`,
    constraints: [
      '1 ≤ s.length ≤ 10⁴',
      's consists of parentheses only \'()[]{}\''
    ],
    examples: [
      { input: 's = "()"',    output: 'true'  },
      { input: 's = "()[]{}"', output: 'true'  },
      { input: 's = "(]"',    output: 'false' },
    ],
    starter_code: {
      python: `import sys
def is_valid(s):
    # Write your code here
    pass

s = sys.stdin.read().strip()
print(str(is_valid(s)).lower())
`,
      javascript: `const s = require('fs').readFileSync('/dev/stdin','utf8').trim();
function isValid(s) {
  // Write your code here
}
console.log(isValid(s).toString());
`,
      java: `import java.util.*;
public class Main {
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    if (!sc.hasNextLine()) return;
    String s = sc.nextLine().trim();
    // Write your code here
  }
}`,
      cpp: `#include<bits/stdc++.h>
using namespace std;
int main(){
  string s; cin>>s;
  // Write your code here
}`,
    },
    test_cases: [
      { input: '()',       expected_output: 'true',  is_hidden: false },
      { input: '()[]{}',  expected_output: 'true',  is_hidden: false },
      { input: '(]',      expected_output: 'false', is_hidden: false },
      { input: '([)]',    expected_output: 'false', is_hidden: true  },
      { input: '{[]}',    expected_output: 'true',  is_hidden: true  },
      { input: ']',       expected_output: 'false', is_hidden: true  },
    ],
  },

  // ── 3. PALINDROME NUMBER ────────────────────────────────────────────────────
  {
    slug: 'palindrome-number',
    title: 'Palindrome Number',
    difficulty: 'Easy',
    category: 'Math',
    description: `Given an integer \`x\`, return \`true\` if \`x\` is a **palindrome**, and \`false\` otherwise.

An integer is a palindrome when it reads the same forward and backward.
- For example, \`121\` is a palindrome while \`123\` is not.

**Follow up:** Could you solve it without converting the integer to a string?`,
    constraints: [
      '-2³¹ ≤ x ≤ 2³¹ - 1',
    ],
    examples: [
      { input: 'x = 121',  output: 'true',  explanation: '121 reads as 121 from left to right and from right to left.' },
      { input: 'x = -121', output: 'false', explanation: 'From left to right, it reads -121. From right to left, it reads 121-.' },
      { input: 'x = 10',   output: 'false', explanation: 'Reads 01 from right to left.' },
    ],
    starter_code: {
      python: `import sys
def is_palindrome(x):
    # Write your code here
    pass

input_data = sys.stdin.read().strip()
if input_data:
    x = int(input_data)
    print(str(is_palindrome(x)).lower())
`,
      javascript: `const input = require('fs').readFileSync('/dev/stdin','utf8').trim();
if (input) {
  const x = parseInt(input);
  function isPalindrome(x) {
    // Write your code here
  }
  console.log(isPalindrome(x).toString());
}
`,
      java: `import java.util.*;
public class Main {
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    if (!sc.hasNextInt()) return;
    int x = sc.nextInt();
    // Write your code here
  }
}`,
      cpp: `#include<bits/stdc++.h>
using namespace std;
int main(){
  int x; 
  if(!(cin>>x)) return 0;
  // Write your code here
}`,
    },
    test_cases: [
      { input: '121',       expected_output: 'true',  is_hidden: false },
      { input: '-121',      expected_output: 'false', is_hidden: false },
      { input: '10',        expected_output: 'false', is_hidden: false },
      { input: '0',         expected_output: 'true',  is_hidden: true  },
      { input: '1221',      expected_output: 'true',  is_hidden: true  },
      { input: '1000021',   expected_output: 'false', is_hidden: true  },
    ],
  },

  // ── 4. CLIMBING STAIRS ──────────────────────────────────────────────────────
  {
    slug: 'climbing-stairs',
    title: 'Climbing Stairs',
    difficulty: 'Easy',
    category: 'Dynamic Programming',
    description: `You are climbing a staircase. It takes \`n\` steps to reach the top.

Each time you can either climb **1** or **2** steps. In how many distinct ways can you climb to the top?`,
    constraints: ['1 ≤ n ≤ 45'],
    examples: [
      { input: 'n = 2', output: '2', explanation: 'Two ways: 1+1 or 2.' },
      { input: 'n = 3', output: '3', explanation: 'Three ways: 1+1+1, 1+2, 2+1.' },
    ],
    starter_code: {
      python: `import sys
def climb(n):
    # Write your code here
    pass

input_data = sys.stdin.read().strip()
if input_data:
    print(climb(int(input_data)))
`,
      javascript: `const input = require('fs').readFileSync('/dev/stdin','utf8').trim();
if (input) {
  const n = parseInt(input);
  function climbStairs(n) {
    // Write your code here
  }
  console.log(climbStairs(n));
}
`,
      java: `import java.util.*;
public class Main {
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    if (!sc.hasNextInt()) return;
    int n = sc.nextInt();
    // Write your code here
  }
}`,
      cpp: `#include<bits/stdc++.h>
using namespace std;
int main(){
  int n; 
  if(!(cin>>n)) return 0;
  // Write your code here
}`,
    },
    test_cases: [
      { input: '2',  expected_output: '2',    is_hidden: false },
      { input: '3',  expected_output: '3',    is_hidden: false },
      { input: '1',  expected_output: '1',    is_hidden: true  },
      { input: '5',  expected_output: '8',    is_hidden: true  },
      { input: '10', expected_output: '89',   is_hidden: true  },
      { input: '45', expected_output: '1836311903', is_hidden: true },
    ],
  },

  // ── 5. BEST TIME TO BUY AND SELL STOCK ─────────────────────────────────────
  {
    slug: 'best-time-to-buy-sell-stock',
    title: 'Best Time to Buy and Sell Stock',
    difficulty: 'Easy',
    category: 'Array',
    description: `You are given an array \`prices\` where \`prices[i]\` is the price of a given stock on the \`i-th\` day.

You want to maximize your profit by choosing a **single day** to buy one stock and choosing a **different day in the future** to sell that stock.

Return the **maximum profit** you can achieve from this transaction. If you cannot achieve any profit, return \`0\`.`,
    constraints: [
      '1 ≤ prices.length ≤ 10⁵',
      '0 ≤ prices[i] ≤ 10⁴',
    ],
    examples: [
      { input: 'prices = [7,1,5,3,6,4]', output: '5', explanation: 'Buy on day 2 (price=1), sell on day 5 (price=6), profit = 5.' },
      { input: 'prices = [7,6,4,3,1]',   output: '0', explanation: 'Prices only decrease, no transaction gives profit.' },
    ],
    starter_code: {
      python: `import sys
def max_profit(prices):
    # Write your code here
    pass

data = sys.stdin.read().split()
if data:
    prices = list(map(int, data))
    print(max_profit(prices))
`,
      javascript: `const input = require('fs').readFileSync('/dev/stdin','utf8').trim();
if (input) {
  const prices = input.split(' ').map(Number);
  function maxProfit(prices) {
    // Write your code here
  }
  console.log(maxProfit(prices));
}
`,
      java: `import java.util.*;
public class Main {
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    if (!sc.hasNextLine()) return;
    int[] prices = Arrays.stream(sc.nextLine().trim().split(" ")).mapToInt(Integer::parseInt).toArray();
    // Write your code here
  }
}`,
      cpp: `#include<bits/stdc++.h>
using namespace std;
int main(){
  vector<int> p; int x;
  while(cin>>x) p.push_back(x);
  // Write your code here
}`,
    },
    test_cases: [
      { input: '7 1 5 3 6 4', expected_output: '5', is_hidden: false },
      { input: '7 6 4 3 1',   expected_output: '0', is_hidden: false },
      { input: '1 2',         expected_output: '1', is_hidden: true  },
      { input: '2 4 1 7',     expected_output: '6', is_hidden: true  },
      { input: '3 3 3 3',     expected_output: '0', is_hidden: true  },
    ],
  },

  // ── 6. MAXIMUM SUBARRAY ─────────────────────────────────────────────────────
  {
    slug: 'maximum-subarray',
    title: 'Maximum Subarray',
    difficulty: 'Medium',
    category: 'Dynamic Programming',
    description: `Given an integer array \`nums\`, find the **subarray** with the largest sum, and return its sum.

A **subarray** is a contiguous non-empty sequence of elements within an array.`,
    constraints: [
      '1 ≤ nums.length ≤ 10⁵',
      '-10⁴ ≤ nums[i] ≤ 10⁴',
    ],
    examples: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'Subarray [4,-1,2,1] has the largest sum = 6.' },
      { input: 'nums = [1]',                       output: '1' },
      { input: 'nums = [5,4,-1,7,8]',              output: '23' },
    ],
    starter_code: {
      python: `import sys
def max_sub_array(nums):
    # Write your code here
    pass

data = sys.stdin.read().split()
if data:
    nums = list(map(int, data))
    print(max_sub_array(nums))
`,
      javascript: `const input = require('fs').readFileSync('/dev/stdin','utf8').trim();
if (input) {
  const nums = input.split(' ').map(Number);
  function maxSubArray(nums) {
    // Write your code here
  }
  console.log(maxSubArray(nums));
}
`,
      java: `import java.util.*;
public class Main {
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    if (!sc.hasNextLine()) return;
    int[] nums = Arrays.stream(sc.nextLine().trim().split(" ")).mapToInt(Integer::parseInt).toArray();
    // Write your code here
  }
}`,
      cpp: `#include<bits/stdc++.h>
using namespace std;
int main(){
  vector<int> nums; int x;
  while(cin>>x) nums.push_back(x);
  // Write your code here
}`,
    },
    test_cases: [
      { input: '-2 1 -3 4 -1 2 1 -5 4', expected_output: '6',  is_hidden: false },
      { input: '1',                       expected_output: '1',  is_hidden: false },
      { input: '5 4 -1 7 8',             expected_output: '23', is_hidden: false },
      { input: '-3 -2 -1',               expected_output: '-1', is_hidden: true  },
      { input: '1 2 3 4 5',              expected_output: '15', is_hidden: true  },
      { input: '-2 -3 4 -1 -2 1 5 -3',  expected_output: '7',  is_hidden: true  },
    ],
  },

  // ── 7. BINARY SEARCH ────────────────────────────────────────────────────────
  {
    slug: 'binary-search',
    title: 'Binary Search',
    difficulty: 'Easy',
    category: 'Binary Search',
    description: `Given an array of integers \`nums\` which is sorted in **ascending order**, and an integer \`target\`, write a function to search \`target\` in \`nums\`.

If \`target\` exists, return its index. Otherwise, return \`-1\`.

You must write an algorithm with **O(log n)** runtime complexity.`,
    constraints: [
      '1 ≤ nums.length ≤ 10⁴',
      '-10⁴ < nums[i], target < 10⁴',
      'All the integers in nums are unique.',
      'nums is sorted in ascending order.',
    ],
    examples: [
      { input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4', explanation: '9 exists in nums and its index is 4.' },
      { input: 'nums = [-1,0,3,5,9,12], target = 2', output: '-1', explanation: '2 does not exist in nums.' },
    ],
    starter_code: {
      python: `import sys
def search(nums, target):
    # Write your code here
    pass

data = sys.stdin.read().split()
if data:
    nums = list(map(int, data[:-1]))
    target = int(data[-1])
    print(search(nums, target))
`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');
if (lines.length >= 2) {
  const nums = lines[0].split(' ').map(Number), target = Number(lines[1]);
  function search(nums, target) {
    // Write your code here
  }
  console.log(search(nums, target));
}
`,
      java: `import java.util.*;
public class Main {
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    if (!sc.hasNextLine()) return;
    int[] nums = Arrays.stream(sc.nextLine().trim().split(" ")).mapToInt(Integer::parseInt).toArray();
    int target = sc.nextInt();
    // Write your code here
  }
}`,
      cpp: `#include<bits/stdc++.h>
using namespace std;
int main(){
  string line; getline(cin,line);
  istringstream ss(line); int x; vector<int> nums;
  while(ss>>x) nums.push_back(x);
  int target; cin>>target;
  // Write your code here
}`,
    },
    test_cases: [
      { input: '-1 0 3 5 9 12\n9',  expected_output: '4',  is_hidden: false },
      { input: '-1 0 3 5 9 12\n2',  expected_output: '-1', is_hidden: false },
      { input: '5\n5',              expected_output: '0',  is_hidden: true  },
      { input: '1 3 5 7 9\n7',      expected_output: '3',  is_hidden: true  },
      { input: '1 3 5 7 9\n6',      expected_output: '-1', is_hidden: true  },
    ],
  },

  // ── 8. SINGLE NUMBER ────────────────────────────────────────────────────────
  {
    slug: 'single-number',
    title: 'Single Number',
    difficulty: 'Easy',
    category: 'Bit Manipulation',
    description: `Given a **non-empty** array of integers \`nums\`, every element appears **twice** except for one. Find that single one.

You must implement a solution with **linear runtime complexity** and use only **constant extra space**.`,
    constraints: [
      '1 ≤ nums.length ≤ 3 × 10⁴',
      '-3 × 10⁴ ≤ nums[i] ≤ 3 × 10⁴',
      'Each element appears twice except for exactly one element.',
    ],
    examples: [
      { input: 'nums = [2,2,1]',         output: '1' },
      { input: 'nums = [4,1,2,1,2]',     output: '4' },
      { input: 'nums = [1]',             output: '1' },
    ],
    starter_code: {
      python: `import sys
# Write your code here to find the single number
data = sys.stdin.read().split()
if data:
    nums = list(map(int, data))
`,
      javascript: `const input = require('fs').readFileSync('/dev/stdin','utf8').trim();
if (input) {
  const nums = input.split(' ').map(Number);
  // Write your code here
}
`,
      java: `import java.util.*;
public class Main {
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    if (!sc.hasNextLine()) return;
    // Write your code here
  }
}`,
      cpp: `#include<bits/stdc++.h>
using namespace std;
int main(){ 
  // Write your code here
}`,
    },
    test_cases: [
      { input: '2 2 1',         expected_output: '1', is_hidden: false },
      { input: '4 1 2 1 2',     expected_output: '4', is_hidden: false },
      { input: '1',             expected_output: '1', is_hidden: true  },
      { input: '0 1 0',         expected_output: '1', is_hidden: true  },
      { input: '-1 -1 -2',      expected_output: '-2',is_hidden: true  },
    ],
  },

  // ── 9. MISSING NUMBER ───────────────────────────────────────────────────────
  {
    slug: 'missing-number',
    title: 'Missing Number',
    difficulty: 'Easy',
    category: 'Math',
    description: `Given an array \`nums\` containing \`n\` distinct numbers in the range \`[0, n]\`, return the **only number in the range that is missing** from the array.`,
    constraints: [
      'n == nums.length',
      '1 ≤ n ≤ 10⁴',
      '0 ≤ nums[i] ≤ n',
      'All numbers in nums are unique.',
    ],
    examples: [
      { input: 'nums = [3,0,1]',   output: '2', explanation: 'n = 3. Numbers 0,1,3 present. 2 is missing.' },
      { input: 'nums = [0,1]',     output: '2' },
      { input: 'nums = [9,6,4,2,3,5,7,0,1]', output: '8' },
    ],
    starter_code: {
      python: `import sys
# Write your code here
data = sys.stdin.read().split()
if data:
    nums = list(map(int, data))
`,
      javascript: `const input = require('fs').readFileSync('/dev/stdin','utf8').trim();
if (input) {
  const nums = input.split(' ').map(Number);
  // Write your code here
}
`,
      java: `import java.util.*;
public class Main {
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    if (!sc.hasNextLine()) return;
    // Write your code here
  }
}`,
      cpp: `#include<bits/stdc++.h>
using namespace std;
int main(){
  // Write your code here
}`,
    },
    test_cases: [
      { input: '3 0 1',             expected_output: '2', is_hidden: false },
      { input: '0 1',               expected_output: '2', is_hidden: false },
      { input: '9 6 4 2 3 5 7 0 1', expected_output: '8', is_hidden: false },
      { input: '0',                 expected_output: '1', is_hidden: true  },
      { input: '1',                 expected_output: '0', is_hidden: true  },
    ],
  },

  // ── 10. LONGEST COMMON PREFIX ───────────────────────────────────────────────
  {
    slug: 'longest-common-prefix',
    title: 'Longest Common Prefix',
    difficulty: 'Easy',
    category: 'String',
    description: `Write a function to find the **longest common prefix** string amongst an array of strings.

If there is no common prefix, return an empty string \`""\`.`,
    constraints: [
      '1 ≤ strs.length ≤ 200',
      '0 ≤ strs[i].length ≤ 200',
      'strs[i] consists of only lowercase English letters.',
    ],
    examples: [
      { input: 'strs = ["flower","flow","flight"]', output: '"fl"' },
      { input: 'strs = ["dog","racecar","car"]',    output: '""', explanation: 'No common prefix.' },
    ],
    starter_code: {
      python: `import sys
# Write your code here
data = sys.stdin.read().split()
if data:
    words = data
`,
      javascript: `const input = require('fs').readFileSync('/dev/stdin','utf8').trim();
if (input) {
  const words = input.split(' ');
  // Write your code here
}
`,
      java: `import java.util.*;
public class Main {
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    if (!sc.hasNextLine()) return;
    String[] words = sc.nextLine().trim().split(" ");
    // Write your code here
  }
}`,
      cpp: `#include<bits/stdc++.h>
using namespace std;
int main(){
  // Write your code here
}`,
    },
    test_cases: [
      { input: 'flower flow flight', expected_output: 'fl',     is_hidden: false },
      { input: 'dog racecar car',    expected_output: '',       is_hidden: false },
      { input: 'interview inter',    expected_output: 'inter',  is_hidden: true  },
      { input: 'abc abc abc',        expected_output: 'abc',    is_hidden: true  },
      { input: 'a',                  expected_output: 'a',      is_hidden: true  },
    ],
  },

  // ── 11. LONGEST SUBSTRING WITHOUT REPEATING CHARACTERS ─────────────────────
  {
    slug: 'longest-substring-without-repeating',
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    category: 'Sliding Window',
    description: `Given a string \`s\`, find the length of the **longest substring** without repeating characters.`,
    constraints: [
      '0 ≤ s.length ≤ 5 × 10⁴',
      's consists of English letters, digits, symbols and spaces.',
    ],
    examples: [
      { input: 's = "abcabcbb"', output: '3', explanation: 'The answer is "abc", with the length of 3.' },
      { input: 's = "bbbbb"',    output: '1', explanation: 'The answer is "b", with the length of 1.' },
      { input: 's = "pwwkew"',   output: '3', explanation: 'The answer is "wke", with the length of 3.' },
    ],
    starter_code: {
      python: `import sys
def length_of_longest(s):
    # Write your code here
    pass

s = sys.stdin.read().strip()
print(length_of_longest(s))
`,
      javascript: `const s = require('fs').readFileSync('/dev/stdin','utf8').trim();
function lengthOfLongest(s) {
  // Write your code here
}
console.log(lengthOfLongest(s));
`,
      java: `import java.util.*;
public class Main {
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    if (!sc.hasNextLine()) return;
    String s = sc.nextLine();
    // Write your code here
  }
}`,
      cpp: `#include<bits/stdc++.h>
using namespace std;
int main(){
  string s; getline(cin,s);
  // Write your code here
}`,
    },
    test_cases: [
      { input: 'abcabcbb', expected_output: '3', is_hidden: false },
      { input: 'bbbbb',    expected_output: '1', is_hidden: false },
      { input: 'pwwkew',   expected_output: '3', is_hidden: false },
      { input: '',         expected_output: '0', is_hidden: true  },
      { input: 'au',       expected_output: '2', is_hidden: true  },
      { input: 'aab',      expected_output: '2', is_hidden: true  },
    ],
  },

  // ── 12. TRAPPING RAIN WATER ─────────────────────────────────────────────────
  {
    slug: 'trapping-rain-water',
    title: 'Trapping Rain Water',
    difficulty: 'Hard',
    category: 'Two Pointers',
    description: `Given \`n\` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.`,
    constraints: [
      'n == height.length',
      '1 ≤ n ≤ 2 × 10⁴',
      '0 ≤ height[i] ≤ 10⁵',
    ],
    examples: [
      { input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]', output: '6', explanation: 'The elevation map traps 6 units of rain water.' },
      { input: 'height = [4,2,0,3,2,5]',              output: '9' },
    ],
    starter_code: {
      python: `import sys
def trap(height):
    left, right = 0, len(height) - 1
    left_max = right_max = water = 0
    while left < right:
        if height[left] < height[right]:
            if height[left] >= left_max: left_max = height[left]
            else: water += left_max - height[left]
            left += 1
        else:
            if height[right] >= right_max: right_max = height[right]
            else: water += right_max - height[right]
            right -= 1
    return water

height = list(map(int, sys.stdin.read().split()))
print(trap(height))
`,
      javascript: `const height = require('fs').readFileSync('/dev/stdin','utf8').trim().split(' ').map(Number);
function trap(h) {
  let l=0, r=h.length-1, lm=0, rm=0, w=0;
  while(l<r){
    if(h[l]<h[r]){ if(h[l]>=lm)lm=h[l]; else w+=lm-h[l]; l++; }
    else{ if(h[r]>=rm)rm=h[r]; else w+=rm-h[r]; r--; }
  }
  return w;
}
console.log(trap(height));
`,
      java: `import java.util.*;
public class Main {
  public static void main(String[] args) {
    int[] h = Arrays.stream(new Scanner(System.in).nextLine().trim().split(" ")).mapToInt(Integer::parseInt).toArray();
    int l=0,r=h.length-1,lm=0,rm=0,w=0;
    while(l<r){
      if(h[l]<h[r]){if(h[l]>=lm)lm=h[l];else w+=lm-h[l];l++;}
      else{if(h[r]>=rm)rm=h[r];else w+=rm-h[r];r--;}
    }
    System.out.println(w);
  }
}`,
      cpp: `#include<bits/stdc++.h>
using namespace std;
int main(){
  vector<int> h; int x;
  while(cin>>x) h.push_back(x);
  int l=0,r=(int)h.size()-1,lm=0,rm=0,w=0;
  while(l<r){
    if(h[l]<h[r]){if(h[l]>=lm)lm=h[l];else w+=lm-h[l];l++;}
    else{if(h[r]>=rm)rm=h[r];else w+=rm-h[r];r--;}
  }
  cout<<w;
}`,
    },
    test_cases: [
      { input: '0 1 0 2 1 0 1 3 2 1 2 1', expected_output: '6',  is_hidden: false },
      { input: '4 2 0 3 2 5',             expected_output: '9',  is_hidden: false },
      { input: '3 0 3',                   expected_output: '3',  is_hidden: true  },
      { input: '1 0 1',                   expected_output: '1',  is_hidden: true  },
      { input: '0 0 0',                   expected_output: '0',  is_hidden: true  },
      { input: '5 4 1 2',                 expected_output: '1',  is_hidden: true  },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// SEED
// ─────────────────────────────────────────────────────────────────────────────
async function seed() {
  console.log(`Seeding ${PROBLEMS.length} problems...\n`);
  let inserted = 0, skipped = 0, failed = 0;

  for (const p of PROBLEMS) {
    process.stdout.write(`  ${p.slug.padEnd(45)}`);

    // Upsert problem
    const { data: problem, error: pErr } = await supabase
      .from('problems')
      .upsert(
        {
          slug:         p.slug,
          title:        p.title,
          difficulty:   p.difficulty,
          category:     p.category,
          description:  p.description,
          constraints:  p.constraints,
          examples:     p.examples,
          starter_code: p.starter_code,
          is_active:    true,
        },
        { onConflict: 'slug' }
      )
      .select('id, slug')
      .single();

    if (pErr) {
      console.log(`FAILED — ${pErr.message}`);
      failed++;
      continue;
    }

    // Delete existing test cases and re-insert (clean slate)
    await supabase.from('test_cases').delete().eq('problem_id', problem.id);

    const rows = p.test_cases.map((tc, i) => ({
      problem_id:      problem.id,
      input:           tc.input,
      expected_output: tc.expected_output,
      is_hidden:       tc.is_hidden,
      order_index:     i,
    }));

    const { error: tcErr } = await supabase.from('test_cases').insert(rows);
    if (tcErr) {
      console.log(`problem OK but test cases FAILED — ${tcErr.message}`);
      failed++;
      continue;
    }

    console.log(`OK  (${rows.length} test cases)`);
    inserted++;
  }

  console.log(`\nDone: ${inserted} upserted, ${skipped} skipped, ${failed} failed.`);
}

seed().catch(err => { console.error(err); process.exit(1); });
