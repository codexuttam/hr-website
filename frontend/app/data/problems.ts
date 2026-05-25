import { Problem } from '../types/problem';

export const PROBLEMS: Record<string, Problem> = {
  'two-sum': {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    category: 'Arrays',
    description: `
Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.

### Example 1:
**Input:** nums = [2,7,11,15], target = 9
**Output:** [0,1]
**Explanation:** Because nums[0] + nums[1] == 9, we return [0, 1].

### Example 2:
**Input:** nums = [3,2,4], target = 6
**Output:** [1,2]

### Example 3:
**Input:** nums = [3,3], target = 6
**Output:** [0,1]
    `,
    initialCode: {
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    
};`,
      python: `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        pass`,
      java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        
    }
}`,
      cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        
    }
};`,
    },
    testCases: [
      { id: 1, input: 'nums = [2,7,11,15], target = 9', expectedOutput: '[0,1]' },
      { id: 2, input: 'nums = [3,2,4], target = 6', expectedOutput: '[1,2]' },
      { id: 3, input: 'nums = [3,3], target = 6', expectedOutput: '[0,1]' },
    ],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.'
    ],
  },
  'reverse-integer': {
    id: 'reverse-integer',
    title: 'Reverse Integer',
    difficulty: 'Medium',
    category: 'Math',
    description: `
Given a signed 32-bit integer \`x\`, return \`x\` with its digits reversed. If reversing \`x\` causes the value to go outside the signed 32-bit integer range \`[-2^31, 2^31 - 1]\`, then return 0.

**Assume the environment does not allow you to store 64-bit integers (signed or unsigned).**

### Example 1:
**Input:** x = 123
**Output:** 321

### Example 2:
**Input:** x = -123
**Output:** -321

### Example 3:
**Input:** x = 120
**Output:** 21
    `,
    initialCode: {
      javascript: `/**
 * @param {number} x
 * @return {number}
 */
var reverse = function(x) {
    
};`,
      python: `class Solution:
    def reverse(self, x: int) -> int:
        pass`,
      java: `class Solution {
    public int reverse(int x) {
        
    }
}`,
      cpp: `class Solution {
public:
    int reverse(int x) {
        
    }
};`,
    },
    testCases: [
      { id: 1, input: 'x = 123', expectedOutput: '321' },
      { id: 2, input: 'x = -123', expectedOutput: '-321' },
      { id: 3, input: 'x = 120', expectedOutput: '21' },
    ],
    constraints: [
      '-2^31 <= x <= 2^31 - 1'
    ],
  }
};
