import type { Problem } from '../../types';

export const problems: Problem[] = [
    // ===== EASY PROBLEMS =====
    {
        id: 'palindrome-check',
        title: 'Palindrome Check',
        difficulty: 'easy',
        tier: 1,
        languages: ['python', 'javascript', 'cpp'],
        description: `**Description**
Determine whether a given string is a palindrome. A palindrome reads the same backward as forward.

**Input**
- A string \`s\` consisting of alphanumeric characters.

**Output**
- Return \`true\` if the string is a palindrome, otherwise \`false\`.

**Constraints**
- The string length will be between 1 and 1000.`,
        examples: [
            { input: 's = "racecar"', output: 'true', explanation: 'Reads the same forward and backward.' },
            { input: 's = "hello"', output: 'false', explanation: '"hello" backwards is "olleh".' }
        ],
        hints: ['Try comparing the string with its reverse.', 'You can also use two pointers, one at the start and one at the end.'],
        solution: {
            python: 'def solution(s):\n    return s == s[::-1]',
            javascript: 'function solution(s) {\n    return s === s.split("").reverse().join("");\n}',
            cpp: 'bool solution(string s) {\n    string r = s;\n    reverse(r.begin(), r.end());\n    return s == r;\n}'
        },
        explanation: 'The simplest approach is to reverse the string and compare it to the original.',
        testCases: [
            { input: 'racecar', expectedOutput: 'true' },
            { input: 'hello', expectedOutput: 'false' },
            { input: 'madam', expectedOutput: 'true' }
        ],
        xpReward: 50,
        tags: ['String']
    },
    {
        id: 'reverse-string',
        title: 'Reverse String',
        difficulty: 'easy',
        tier: 1,
        languages: ['python', 'javascript', 'cpp'],
        description: `**Description**
Write a function that reverses a string. You should do this by modifying the input array in-place with O(1) extra memory if possible (though for this exercise, returning a new string is acceptable).

**Input**
- A character array or string \`s\`.

**Output**
- Return the reversed string or array.

**Constraints**
- 1 <= s.length <= 10^5`,
        examples: [{ input: 's = ["h","e","l","l","o"]', output: '["o","l","l","e","h"]' }],
        hints: ['Use two pointers: one at the beginning, one at the end.', 'Swap elements and move pointers towards the center.'],
        solution: {
            python: 'def solution(s):\n    if isinstance(s, list): s.reverse(); return s\n    return s[::-1]',
            javascript: 'function solution(s) {\n    return s.slice().reverse();\n}',
            cpp: 'void solution(vector<char>& s) {\n    reverse(s.begin(), s.end());\n}'
        },
        explanation: 'Swapping characters from both ends towards the middle achieves the reverse effect.',
        testCases: [{ input: '["h","e","l","l","o"]', expectedOutput: '["o","l","l","e","h"]' }],
        xpReward: 50,
        tags: ['String', 'Two Pointers']
    },
    {
        id: 'fizzbuzz',
        title: 'FizzBuzz',
        difficulty: 'easy',
        tier: 1,
        languages: ['python', 'javascript', 'cpp'],
        description: `**Description**
Given an integer \`n\`, return a string array answer (1-indexed) where:
- \`answer[i] == "FizzBuzz"\` if \`i\` is divisible by 3 and 5.
- \`answer[i] == "Fizz"\` if \`i\` is divisible by 3.
- \`answer[i] == "Buzz"\` if \`i\` is divisible by 5.
- \`answer[i] == i\` (as a string) if none of the above conditions are true.

**Input**
- An integer \`n\`.

**Output**
- An array of strings representing the sequence from 1 to \`n\`.

**Constraints**
- 1 <= n <= 10^4`,
        examples: [{ input: 'n = 3', output: '["1","2","Fizz"]' }, { input: 'n = 5', output: '["1","2","Fizz","4","Buzz"]' }],
        hints: ['Check divisibility by 15 first, or check 3 and 5 separately.', 'Use the modulo operator %.'],
        solution: {
            python: 'def solution(n):\n    return ["FizzBuzz" if i%15==0 else "Fizz" if i%3==0 else "Buzz" if i%5==0 else str(i) for i in range(1, n+1)]',
            javascript: 'function solution(n) {\n    const res = [];\n    for(let i=1; i<=n; i++) {\n        if(i%15===0) res.push("FizzBuzz");\n        else if(i%3===0) res.push("Fizz");\n        else if(i%5===0) res.push("Buzz");\n        else res.push(String(i));\n    }\n    return res;\n}',
            cpp: 'vector<string> solution(int n) {\n    vector<string> r;\n    for(int i=1; i<=n; i++) {\n        if(i%15==0) r.push_back("FizzBuzz");\n        else if(i%3==0) r.push_back("Fizz");\n        else if(i%5==0) r.push_back("Buzz");\n        else r.push_back(to_string(i));\n    }\n    return r;\n}'
        },
        explanation: 'Iterate from 1 to n and apply the divisibility rules in order.',
        testCases: [{ input: '3', expectedOutput: '["1","2","Fizz"]' }],
        xpReward: 50,
        tags: ['Math', 'Simulation']
    },
    {
        id: 'two-sum',
        title: 'Two Sum',
        difficulty: 'easy',
        tier: 2,
        languages: ['python', 'javascript', 'cpp'],
        description: `**Description**
Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.
You may assume that each input would have exactly one solution, and you may not use the same element twice.

**Input**
- \`nums\`: An array of integers.
- \`target\`: The integer sum to find.

**Output**
- An array containing the two indices `[index1, index2]`.

**Constraints**
- 2 <= nums.length <= 10^4
- -10^9 <= nums[i] <= 10^9
- -10^9 <= target <= 10^9`,
        examples: [{ input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' }],
        hints: ['A brute force approach is O(n^2). Can you do better?', 'Use a hash map to store numbers you have seen so far.'],
        solution: {
            python: 'def solution(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        diff = target - n\n        if diff in seen:\n            return [seen[diff], i]\n        seen[n] = i\n    return []',
            javascript: 'function solution(nums, target) {\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const diff = target - nums[i];\n        if (map.has(diff)) return [map.get(diff), i];\n        map.set(nums[i], i);\n    }\n}',
            cpp: 'vector<int> solution(vector<int>& nums, int target) {\n    unordered_map<int, int> m;\n    for (int i = 0; i < nums.size(); i++) {\n        if (m.count(target - nums[i])) return {m[target - nums[i]], i};\n        m[nums[i]] = i;\n    }\n    return {};\n}'
        },
        explanation: 'We use a hash map to store values and their indices. For each number, checking if the complement exists in the map takes O(1).',
        testCases: [{ input: '[2,7,11,15], 9', expectedOutput: '[0,1]' }],
        xpReward: 50,
        tags: ['Array', 'Hash Table']
    },
    {
        id: 'binary-search',
        title: 'Binary Search',
        difficulty: 'easy',
        tier: 2,
        languages: ['python', 'javascript', 'cpp'],
        description: `**Description**
Given an array of integers \`nums\` which is sorted in ascending order, and an integer \`target\`, write a function to search \`target\` in \`nums\`. If \`target\` exists, then return its index. Otherwise, return \`-1\`.

**Input**
- \`nums\`: A sorted integer array.
- \`target\`: The value to search for.

**Output**
- Integer index of \`target\` or \`-1\`.

**Constraints**
- 1 <= nums.length <= 10^4
- All integers in \`nums\` are unique.
- \`nums\` is sorted in ascending order.`,
        examples: [{ input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4' }, { input: 'nums = [-1,0,3,5,9,12], target = 2', output: '-1' }],
        hints: ['Because the array is sorted, you can check the middle element.', 'If the target is smaller than the middle, verify the left half. Otherwise, verify the right half.'],
        solution: {
            python: 'def solution(nums, target):\n    l, r = 0, len(nums) - 1\n    while l <= r:\n        mid = (l + r) // 2\n        if nums[mid] == target: return mid\n        elif nums[mid] < target: l = mid + 1\n        else: r = mid - 1\n    return -1',
            javascript: 'function solution(nums, target) {\n    let l = 0, r = nums.length - 1;\n    while (l <= r) {\n        const mid = Math.floor((l + r) / 2);\n        if (nums[mid] === target) return mid;\n        if (nums[mid] < target) l = mid + 1;\n        else r = mid - 1;\n    }\n    return -1;\n}',
            cpp: 'int solution(vector<int>& nums, int target) {\n    int l = 0, r = nums.size() - 1;\n    while (l <= r) {\n        int mid = l + (r - l) / 2;\n        if (nums[mid] == target) return mid;\n        if (nums[mid] < target) l = mid + 1;\n        else r = mid - 1;\n    }\n    return -1;\n}'
        },
        explanation: 'We divide the search interval in half each time (Divide and Conquer). O(log n) time complexity.',
        testCases: [{ input: '[-1,0,3,5,9,12], 9', expectedOutput: '4' }],
        xpReward: 75,
        tags: ['Binary Search']
    },
    {
        id: 'max-subarray',
        title: 'Maximum Subarray',
        difficulty: 'easy',
        tier: 2,
        languages: ['python', 'javascript', 'cpp'],
        description: `**Description**
Given an integer array \`nums\`, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.

**Input**
- \`nums\`: An array of integers.

**Output**
- The maximum subarray sum (integer).

**Constraints**
- 1 <= nums.length <= 10^5
- -10^4 <= nums[i] <= 10^4`,
        examples: [{ input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'The subarray [4,-1,2,1] has the largest sum = 6.' }],
        hints: ['Kadanes Algorithm is the optimal approach.', 'Keep a running sum. If the running sum becomes negative, reset it to 0.'],
        solution: {
            python: 'def solution(nums):\n    max_sum = cur_sum = nums[0]\n    for n in nums[1:]:\n        cur_sum = max(n, cur_sum + n)\n        max_sum = max(max_sum, cur_sum)\n    return max_sum',
            javascript: 'function solution(nums) {\n    let maxSum = nums[0];\n    let curSum = nums[0];\n    for (let i = 1; i < nums.length; i++) {\n        curSum = Math.max(nums[i], curSum + nums[i]);\n        maxSum = Math.max(maxSum, curSum);\n    }\n    return maxSum;\n}',
            cpp: 'int solution(vector<int>& nums) {\n    int maxSum = nums[0], curSum = nums[0];\n    for (int i = 1; i < nums.size(); i++) {\n        curSum = max(nums[i], curSum + nums[i]);\n        maxSum = max(maxSum, curSum);\n    }\n    return maxSum;\n}'
        },
        explanation: 'We iterate through the array, deciding at each position whether to extend the current subarray or start a new one (Dynamic Programming).',
        testCases: [{ input: '[-2,1,-3,4,-1,2,1,-5,4]', expectedOutput: '6' }],
        xpReward: 75,
        tags: ['Array', 'DP']
    },
    {
        id: 'contains-duplicate',
        title: 'Contains Duplicate',
        difficulty: 'easy',
        tier: 1,
        languages: ['python', 'javascript', 'cpp'],
        description: `**Description**
Given an integer array \`nums\`, return \`true\` if any value appears at least twice in the array, and return \`false\` if every element is distinct.

**Input**
- \`nums\`: An array of integers.

**Output**
- Boolean \`true\` or \`false\`.

**Constraints**
- 1 <= nums.length <= 10^5`,
        examples: [{ input: 'nums = [1,2,3,1]', output: 'true' }, { input: 'nums = [1,2,3,4]', output: 'false' }],
        hints: ['Use a hash set to track elements you have already seen.'],
        solution: {
            python: 'def solution(nums):\n    return len(nums) != len(set(nums))',
            javascript: 'function solution(nums) {\n    return new Set(nums).size !== nums.length;\n}',
            cpp: 'bool solution(vector<int>& nums) {\n    unordered_set<int> s(nums.begin(), nums.end());\n    return s.size() != nums.size();\n}'
        },
        explanation: 'Comparing the size of the set (unique elements) with the array length reveals if duplicates existed.',
        testCases: [{ input: '[1,2,3,1]', expectedOutput: 'true' }],
        xpReward: 50,
        tags: ['Array', 'Hash Table']
    },
    {
        id: 'valid-anagram',
        title: 'Valid Anagram',
        difficulty: 'easy',
        tier: 1,
        languages: ['python', 'javascript', 'cpp'],
        description: `**Description**
Given two strings \`s\` and \`t\`, return \`true\` if \`t\` is an anagram of \`s\`, and \`false\` otherwise. An anagram is a word formed by rearranging the letters of another word.

**Input**
- \`s\`: Source string.
- \`t\`: Target string.

**Output**
- Boolean \`true\` or \`false\`.

**Constraints**
- 1 <= s.length, t.length <= 5 * 10^4
- Strings consist of lowercase English letters.`,
        examples: [{ input: 's = "anagram", t = "nagaram"', output: 'true' }, { input: 's = "rat", t = "car"', output: 'false' }],
        hints: ['Count the frequency of each char in both strings.', 'If lengths differ, they cannot be anagrams.'],
        solution: {
            python: 'def solution(s, t):\n    return sorted(s) == sorted(t)',
            javascript: 'function solution(s, t) {\n    return s.split("").sort().join("") === t.split("").sort().join("");\n}',
            cpp: 'bool solution(string s, string t) {\n    sort(s.begin(), s.end());\n    sort(t.begin(), t.end());\n    return s == t;\n}'
        },
        explanation: 'Sorting both strings determines if they contain the exact same characters.',
        testCases: [{ input: 'anagram, nagaram', expectedOutput: 'true' }],
        xpReward: 50,
        tags: ['String', 'Sorting']
    },

    // ===== MEDIUM PROBLEMS =====
    {
        id: 'valid-parentheses',
        title: 'Valid Parentheses',
        difficulty: 'medium',
        tier: 3,
        languages: ['python', 'javascript', 'cpp'],
        description: `**Description**
Given a string \`s\` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.
An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.

**Input**
- A string \`s\`.

**Output**
- Boolean \`true\` or \`false\`.

**Constraints**
- 1 <= s.length <= 10^4`,
        examples: [{ input: 's = "()[]{}"', output: 'true' }, { input: 's = "(]"', output: 'false' }],
        hints: ['Use a stack to keep track of opening brackets.', 'When you see a closing bracket, check if it matches the top of the stack.'],
        solution: {
            python: 'def solution(s):\n    stack = []\n    mapping = {")":"(", "}":"{", "]":"["}\n    for char in s:\n        if char in mapping:\n            top = stack.pop() if stack else "#"\n            if mapping[char] != top:\n                return False\n        else:\n            stack.append(char)\n    return not stack',
            javascript: 'function solution(s) {\n    const stack = [];\n    const map = {")":"(", "}":"{", "]":"["};\n    for(const c of s) {\n        if(map[c]) {\n            if(stack.pop() !== map[c]) return false;\n        } else stack.push(c);\n    }\n    return stack.length === 0;\n}',
            cpp: 'bool solution(string s) {\n    stack<char> st;\n    for(char c : s) {\n        if(c == \'(\' || c == \'{\' || c == \'[\') st.push(c);\n        else {\n            if(st.empty()) return false;\n            if(c == \')\' && st.top() != \'(\') return false;\n            if(c == \'}\' && st.top() != \'{\') return false;\n            if(c == \']\' && st.top() != \'[\') return false;\n            st.pop();\n        }\n    }\n    return st.empty();\n}'
        },
        explanation: 'Using a stack allows us to verify LIFO order validity.',
        testCases: [{ input: '()[]{}', expectedOutput: 'true' }],
        xpReward: 100,
        tags: ['Stack', 'String']
    },
    {
        id: 'longest-substring',
        title: 'Longest Substring Without Repeating',
        difficulty: 'medium',
        tier: 3,
        languages: ['python', 'javascript', 'cpp'],
        description: `**Description**
Given a string \`s\`, find the length of the longest substring without repeating characters.

**Input**
- A string \`s\`.

**Output**
- Integer length of the longest substring.

**Constraints**
- 0 <= s.length <= 5 * 10^4`,
        examples: [{ input: 's = "abcabcbb"', output: '3', explanation: 'The answer is "abc", with the length of 3.' }, { input: 's = "bbbbb"', output: '1' }],
        hints: ['Use a sliding window.', 'Keep a set or map of characters in the current window to detect duplicates.'],
        solution: {
            python: 'def solution(s):\n    l = 0\n    res = 0\n    seen = set()\n    for r in range(len(s)):\n        while s[r] in seen:\n            seen.remove(s[l])\n            l += 1\n        seen.add(s[r])\n        res = max(res, r - l + 1)\n    return res',
            javascript: 'function solution(s) {\n    let l = 0, res = 0;\n    const seen = new Set();\n    for(let r = 0; r < s.length; r++) {\n        while(seen.has(s[r])) {\n            seen.delete(s[l]);\n            l++;\n        }\n        seen.add(s[r]);\n        res = Math.max(res, r - l + 1);\n    }\n    return res;\n}',
            cpp: 'int solution(string s) {\n    int l = 0, res = 0;\n    unordered_set<char> seen;\n    for(int r = 0; r < s.size(); r++) {\n        while(seen.count(s[r])) {\n            seen.erase(s[l]);\n            l++;\n        }\n        seen.insert(s[r]);\n        res = max(res, r - l + 1);\n    }\n    return res;\n}'
        },
        explanation: 'The sliding window expands to the right and shrinks from the left whenever a duplicate is encountered.',
        testCases: [{ input: 'abcabcbb', expectedOutput: '3' }],
        xpReward: 150,
        tags: ['Sliding Window', 'Hash Table']
    },
    {
        id: 'container-water',
        title: 'Container With Most Water',
        difficulty: 'medium',
        tier: 3,
        languages: ['python', 'javascript', 'cpp'],
        description: `**Description**
You are given an integer array \`height\` of length \`n\`. There are \`n\` vertical lines drawn such that the two endpoints of the ith line are \`(i, 0)\` and \`(i, height[i])\`.
Find two lines that together with the x-axis form a container, such that the container contains the most water. Return the maximum amount of water a container can store.

**Input**
- \`height\`: Info array of integers.

**Output**
- Integer max area.

**Constraints**
- 2 <= height.length <= 10^5`,
        examples: [{ input: '[1,8,6,2,5,4,8,3,7]', output: '49' }],
        hints: ['The width is the distance between lines.', 'The height is limited by the shorter line.', 'Start with the widest container and shrink inwards.'],
        solution: {
            python: 'def solution(height):\n    l, r = 0, len(height) - 1\n    max_area = 0\n    while l < r:\n        w = r - l\n        h = min(height[l], height[r])\n        max_area = max(max_area, w * h)\n        if height[l] < height[r]:\n            l += 1\n        else:\n            r -= 1\n    return max_area',
            javascript: 'function solution(height) {\n    let l = 0, r = height.length - 1, maxArea = 0;\n    while(l < r) {\n        const w = r - l;\n        const h = Math.min(height[l], height[r]);\n        maxArea = Math.max(maxArea, w * h);\n        if(height[l] < height[r]) l++;\n        else r--;\n    }\n    return maxArea;\n}',
            cpp: 'int solution(vector<int>& height) {\n    int l = 0, r = height.size() - 1, maxArea = 0;\n    while(l < r) {\n        int w = r - l;\n        int h = min(height[l], height[r]);\n        maxArea = max(maxArea, w * h);\n        if(height[l] < height[r]) l++;\n        else r--;\n    }\n    return maxArea;\n}'
        },
        explanation: 'Greedy approach using two pointers from the outside in.',
        testCases: [{ input: '[1,8,6,2,5,4,8,3,7]', expectedOutput: '49' }],
        xpReward: 125,
        tags: ['Two Pointers', 'Greedy']
    },

    // ===== HARD PROBLEMS =====
    {
        id: 'trapping-rain',
        title: 'Trapping Rain Water',
        difficulty: 'hard',
        tier: 5,
        languages: ['python', 'javascript', 'cpp'],
        description: `**Description**
Given \`n\` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.

**Input**
- \`height\`: A list of non-negative integers.

**Output**
- Integer total water trapped.

**Constraints**
- 1 <= height.length <= 2 * 10^4`,
        examples: [{ input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]', output: '6' }],
        hints: ['For each element, find the max height to its left and right.', 'Water trapped at index i = min(maxLeft, maxRight) - height[i].', 'Can you optimize space usage with two pointers?'],
        solution: {
            python: 'def solution(height):\n    if not height: return 0\n    l, r = 0, len(height) - 1\n    leftMax, rightMax = height[l], height[r]\n    res = 0\n    while l < r:\n        if leftMax < rightMax:\n            l += 1\n            leftMax = max(leftMax, height[l])\n            res += leftMax - height[l]\n        else:\n            r -= 1\n            rightMax = max(rightMax, height[r])\n            res += rightMax - height[r]\n    return res',
            javascript: 'function solution(height) {\n    let l = 0, r = height.length - 1;\n    let leftMax = 0, rightMax = 0, res = 0;\n    while (l < r) {\n        if (height[l] < height[r]) {\n            height[l] >= leftMax ? (leftMax = height[l]) : (res += leftMax - height[l]);\n            l++;\n        } else {\n            height[r] >= rightMax ? (rightMax = height[r]) : (res += rightMax - height[r]);\n            r--;\n        }\n    }\n    return res;\n}',
            cpp: 'int solution(vector<int>& height) {\n    int l = 0, r = height.size() - 1;\n    int leftMax = 0, rightMax = 0, res = 0;\n    while (l < r) {\n        if (height[l] < height[r]) {\n            height[l] >= leftMax ? (leftMax = height[l]) : (res += leftMax - height[l]);\n            l++;\n        } else {\n            height[r] >= rightMax ? (rightMax = height[r]) : (res += rightMax - height[r]);\n            r--;\n        }\n    }\n    return res;\n}'
        },
        explanation: 'Using two pointers allows us to compute trapped water in one pass O(n) with O(1) space.',
        testCases: [{ input: '[0,1,0,2,1,0,1,3,2,1,2,1]', expectedOutput: '6' }],
        xpReward: 275,
        tags: ['Two Pointers', 'DP', 'Stack']
    },
    {
        id: 'word-ladder',
        title: 'Word Ladder',
        difficulty: 'hard',
        tier: 5,
        languages: ['python', 'javascript'],
        description: `**Description**
A transformation sequence from word \`beginWord\` to word \`endWord\` using a dictionary \`wordList\` is a sequence of words such that:
- Every adjacent pair differs by exactly one letter.
- Every intermediate word must exist in \`wordList\`.
- Return the number of words in the shortest transformation sequence, or 0 if no such sequence exists.

**Input**
- \`beginWord\`: String.
- \`endWord\`: String.
- \`wordList\`: List of strings.

**Output**
- Integer length of shortest sequence.

**Constraints**
- 1 <= wordList.length <= 5000`,
        examples: [{ input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]', output: '5', explanation: '"hit" -> "hot" -> "dot" -> "dog" -> "cog"' }],
        hints: ['This is a Shortest Path problem on a Graph.', 'Each word is a node, edges exist between words differing by 1 char.', 'Use BFS.'],
        solution: {
            python: 'from collections import deque\ndef solution(beginWord, endWord, wordList):\n    wordSet = set(wordList)\n    if endWord not in wordSet: return 0\n    q = deque([(beginWord, 1)])\n    while q:\n        word, length = q.popleft()\n        if word == endWord: return length\n        for i in range(len(word)):\n            for c in "abcdefghijklmnopqrstuvwxyz":\n                next_word = word[:i] + c + word[i+1:]\n                if next_word in wordSet:\n                    wordSet.remove(next_word)\n                    q.append((next_word, length + 1))\n    return 0',
            javascript: 'function solution(beginWord, endWord, wordList) {\n    const wordSet = new Set(wordList);\n    if (!wordSet.has(endWord)) return 0;\n    const queue = [[beginWord, 1]];\n    while (queue.length) {\n        const [word, len] = queue.shift();\n        if (word === endWord) return len;\n        for (let i = 0; i < word.length; i++) {\n            for (let c = 97; c <= 122; c++) {\n                const next = word.slice(0, i) + String.fromCharCode(c) + word.slice(i + 1);\n                if (wordSet.has(next)) {\n                    wordSet.delete(next);\n                    queue.push([next, len + 1]);\n                }\n            }\n        }\n    }\n    return 0;\n}',
            cpp: '// Simplified signature for demo\nint solution(string beginWord, string endWord, vector<string>& wordList) {\n    unordered_set<string> wordSet(wordList.begin(), wordList.end());\n    if (!wordSet.count(endWord)) return 0;\n    queue<pair<string, int>> q;\n    q.push({beginWord, 1});\n    while (!q.empty()) {\n        auto [word, len] = q.front(); q.pop();\n        if (word == endWord) return len;\n        for (int i = 0; i < word.size(); i++) {\n            char original = word[i];\n            for (char c = \'a\'; c <= \'z\'; c++) {\n                word[i] = c;\n                if (wordSet.count(word)) {\n                    wordSet.erase(word);\n                    q.push({word, len + 1});\n                }\n            }\n            word[i] = original;\n        }\n    }\n    return 0;\n}'
        },
        explanation: 'BFS is suitable for finding the shortest path in an unweighted graph where words are nodes.',
        testCases: [{ input: 'hit, cog, [hot,dot,dog,lot,log,cog]', expectedOutput: '5' }],
        xpReward: 300,
        tags: ['BFS', 'Graph']
    }
];

export const getProblemsByDifficulty = (d: string) => problems.filter(p => p.difficulty === d);
export const getProblemById = (id: string) => problems.find(p => p.id === id);
export const getProblemsByTier = (t: number) => problems.filter(p => p.tier === t);
export const getProblemCount = () => ({
    easy: problems.filter(p => p.difficulty === 'easy').length,
    medium: problems.filter(p => p.difficulty === 'medium').length,
    hard: problems.filter(p => p.difficulty === 'hard').length,
    total: problems.length
});
