import type { Problem } from '../../types';

export const problems: Problem[] = [
    {
        id: 'palindrome-check',
        title: 'Palindrome Check',
        difficulty: 'easy',
        tier: 1,
        languages: ['python', 'javascript', 'cpp'],
        description: `**Description**
Determine whether a given string is a palindrome.

**Output**
- Print \`True\` (Python) or \`true\` (JS/C++) if palindrome.`,
        examples: [{ input: 's = "racecar"', output: 'True' }],
        hints: ['Compare the string with its reverse.'],
        solution: {
            python: `def is_palindrome(s):
    return s == s[::-1]`,
            javascript: `function isPalindrome(s) {
    return s === s.split("").reverse().join("");
}`,
            cpp: `bool isPalindrome(string s) {
    string r = s;
    reverse(r.begin(), r.end());
    return s == r;
}`
        },
        explanation: 'Reverse the string and compare.',
        starterCode: {
            python: `def is_palindrome(s):
    # Write your code here
    pass

print(is_palindrome("racecar"))`,
            javascript: `function isPalindrome(s) {
    // Write your code here
}

console.log(isPalindrome("racecar"));`,
            cpp: `#include <iostream>
#include <algorithm>
using namespace std;

bool isPalindrome(string s) {
    // Write your code here
    return false;
}

int main() {
    cout << (isPalindrome("racecar") ? "true" : "false") << endl;
    return 0;
}`
        },
        testCases: {
            python: [{ input: 'racecar', expectedOutput: 'True' }],
            javascript: [{ input: 'racecar', expectedOutput: 'true' }],
            cpp: [{ input: 'racecar', expectedOutput: 'true' }]
        },
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
Write a function that reverses a string.

**Output**
- Print the reversed string.`,
        examples: [{ input: 's = "hello"', output: 'olleh' }],
        hints: ['Use slicing in Python: s[::-1]'],
        solution: {
            python: `def reverse_string(s):
    return s[::-1]`,
            javascript: `function reverseString(s) {
    return s.split("").reverse().join("");
}`,
            cpp: `string reverseString(string s) {
    reverse(s.begin(), s.end());
    return s;
}`
        },
        explanation: 'Reverse using built-in methods.',
        starterCode: {
            python: `def reverse_string(s):
    # Write your code here
    pass

print(reverse_string("hello"))`,
            javascript: `function reverseString(s) {
    // Write your code here
}

console.log(reverseString("hello"));`,
            cpp: `#include <iostream>
#include <algorithm>
using namespace std;

string reverseString(string s) {
    // Write your code here
    return "";
}

int main() {
    cout << reverseString("hello") << endl;
    return 0;
}`
        },
        testCases: {
            python: [{ input: 'hello', expectedOutput: 'olleh' }],
            javascript: [{ input: 'hello', expectedOutput: 'olleh' }],
            cpp: [{ input: 'hello', expectedOutput: 'olleh' }]
        },
        xpReward: 50,
        tags: ['String']
    },
    {
        id: 'fizzbuzz',
        title: 'FizzBuzz',
        difficulty: 'easy',
        tier: 1,
        languages: ['python', 'javascript', 'cpp'],
        description: `**Description**
Print numbers 1 to n. For multiples of 3 print "Fizz", for 5 print "Buzz", for both print "FizzBuzz".`,
        examples: [{ input: 'n = 5', output: '1\\n2\\nFizz\\n4\\nBuzz' }],
        hints: ['Check divisibility by 15 first.'],
        solution: {
            python: `def fizzbuzz(n):
    for i in range(1, n+1):
        if i % 15 == 0: print("FizzBuzz")
        elif i % 3 == 0: print("Fizz")
        elif i % 5 == 0: print("Buzz")
        else: print(i)`,
            javascript: `function fizzbuzz(n) {
    for(let i = 1; i <= n; i++) {
        if(i % 15 === 0) console.log("FizzBuzz");
        else if(i % 3 === 0) console.log("Fizz");
        else if(i % 5 === 0) console.log("Buzz");
        else console.log(i);
    }
}`,
            cpp: `void fizzbuzz(int n) {
    for(int i = 1; i <= n; i++) {
        if(i % 15 == 0) cout << "FizzBuzz" << endl;
        else if(i % 3 == 0) cout << "Fizz" << endl;
        else if(i % 5 == 0) cout << "Buzz" << endl;
        else cout << i << endl;
    }
}`
        },
        explanation: 'Check divisibility conditions.',
        starterCode: {
            python: `def fizzbuzz(n):
    # Print 1 to n with FizzBuzz rules
    pass

fizzbuzz(5)`,
            javascript: `function fizzbuzz(n) {
    // Print 1 to n with FizzBuzz rules
}

fizzbuzz(5);`,
            cpp: `#include <iostream>
using namespace std;

void fizzbuzz(int n) {
    // Print 1 to n with FizzBuzz rules
}

int main() {
    fizzbuzz(5);
    return 0;
}`
        },
        testCases: {
            python: [{ input: '5', expectedOutput: 'Fizz' }],
            javascript: [{ input: '5', expectedOutput: 'Fizz' }],
            cpp: [{ input: '5', expectedOutput: 'Fizz' }]
        },
        xpReward: 50,
        tags: ['Math']
    },
    {
        id: 'two-sum',
        title: 'Two Sum',
        difficulty: 'easy',
        tier: 2,
        languages: ['python', 'javascript', 'cpp'],
        description: `**Description**
Find two numbers in array that add up to target. Print their indices.`,
        examples: [{ input: 'nums = [2,7,11,15], target = 9', output: '[0, 1]' }],
        hints: ['Use a hash map.'],
        solution: {
            python: `def two_sum(nums, target):
    seen = {}
    for i, n in enumerate(nums):
        if target - n in seen:
            return [seen[target-n], i]
        seen[n] = i`,
            javascript: `function twoSum(nums, target) {
    const map = new Map();
    for(let i = 0; i < nums.length; i++) {
        if(map.has(target - nums[i])) return [map.get(target - nums[i]), i];
        map.set(nums[i], i);
    }
}`,
            cpp: `vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> m;
    for(int i = 0; i < nums.size(); i++) {
        if(m.count(target - nums[i])) return {m[target - nums[i]], i};
        m[nums[i]] = i;
    }
    return {};
}`
        },
        explanation: 'Hash map for O(n) lookup.',
        starterCode: {
            python: `def two_sum(nums, target):
    # Return indices of two numbers
    pass

print(two_sum([2, 7, 11, 15], 9))`,
            javascript: `function twoSum(nums, target) {
    // Return indices of two numbers
}

console.log(twoSum([2, 7, 11, 15], 9));`,
            cpp: `#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    return {};
}

int main() {
    vector<int> nums = {2, 7, 11, 15};
    auto r = twoSum(nums, 9);
    cout << "[" << r[0] << ", " << r[1] << "]" << endl;
    return 0;
}`
        },
        testCases: {
            python: [{ input: '[2,7,11,15], 9', expectedOutput: '[0, 1]' }],
            javascript: [{ input: '[2,7,11,15], 9', expectedOutput: '[ 0, 1 ]' }],
            cpp: [{ input: '[2,7,11,15], 9', expectedOutput: '[0, 1]' }]
        },
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
Find index of target in sorted array, or -1 if not found.`,
        examples: [{ input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4' }],
        hints: ['Compare middle element with target.'],
        solution: {
            python: `def binary_search(nums, target):
    l, r = 0, len(nums) - 1
    while l <= r:
        mid = (l + r) // 2
        if nums[mid] == target: return mid
        elif nums[mid] < target: l = mid + 1
        else: r = mid - 1
    return -1`,
            javascript: `function binarySearch(nums, target) {
    let l = 0, r = nums.length - 1;
    while(l <= r) {
        const mid = Math.floor((l + r) / 2);
        if(nums[mid] === target) return mid;
        if(nums[mid] < target) l = mid + 1;
        else r = mid - 1;
    }
    return -1;
}`,
            cpp: `int binarySearch(vector<int>& nums, int target) {
    int l = 0, r = nums.size() - 1;
    while(l <= r) {
        int mid = l + (r - l) / 2;
        if(nums[mid] == target) return mid;
        if(nums[mid] < target) l = mid + 1;
        else r = mid - 1;
    }
    return -1;
}`
        },
        explanation: 'Divide and conquer O(log n).',
        starterCode: {
            python: `def binary_search(nums, target):
    # Return index or -1
    pass

print(binary_search([-1, 0, 3, 5, 9, 12], 9))`,
            javascript: `function binarySearch(nums, target) {
    // Return index or -1
}

console.log(binarySearch([-1, 0, 3, 5, 9, 12], 9));`,
            cpp: `#include <iostream>
#include <vector>
using namespace std;

int binarySearch(vector<int>& nums, int target) {
    return -1;
}

int main() {
    vector<int> nums = {-1, 0, 3, 5, 9, 12};
    cout << binarySearch(nums, 9) << endl;
    return 0;
}`
        },
        testCases: {
            python: [{ input: '[-1,0,3,5,9,12], 9', expectedOutput: '4' }],
            javascript: [{ input: '[-1,0,3,5,9,12], 9', expectedOutput: '4' }],
            cpp: [{ input: '[-1,0,3,5,9,12], 9', expectedOutput: '4' }]
        },
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
Find the contiguous subarray with the largest sum.`,
        examples: [{ input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6' }],
        hints: ['Use Kadane Algorithm.'],
        solution: {
            python: `def max_subarray(nums):
    max_sum = cur_sum = nums[0]
    for n in nums[1:]:
        cur_sum = max(n, cur_sum + n)
        max_sum = max(max_sum, cur_sum)
    return max_sum`,
            javascript: `function maxSubarray(nums) {
    let maxSum = nums[0], curSum = nums[0];
    for(let i = 1; i < nums.length; i++) {
        curSum = Math.max(nums[i], curSum + nums[i]);
        maxSum = Math.max(maxSum, curSum);
    }
    return maxSum;
}`,
            cpp: `int maxSubarray(vector<int>& nums) {
    int maxSum = nums[0], curSum = nums[0];
    for(int i = 1; i < nums.size(); i++) {
        curSum = max(nums[i], curSum + nums[i]);
        maxSum = max(maxSum, curSum);
    }
    return maxSum;
}`
        },
        explanation: 'Kadane algorithm O(n).',
        starterCode: {
            python: `def max_subarray(nums):
    # Return max sum
    pass

print(max_subarray([-2, 1, -3, 4, -1, 2, 1, -5, 4]))`,
            javascript: `function maxSubarray(nums) {
    // Return max sum
}

console.log(maxSubarray([-2, 1, -3, 4, -1, 2, 1, -5, 4]));`,
            cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int maxSubarray(vector<int>& nums) {
    return 0;
}

int main() {
    vector<int> nums = {-2, 1, -3, 4, -1, 2, 1, -5, 4};
    cout << maxSubarray(nums) << endl;
    return 0;
}`
        },
        testCases: {
            python: [{ input: '[-2,1,-3,4,-1,2,1,-5,4]', expectedOutput: '6' }],
            javascript: [{ input: '[-2,1,-3,4,-1,2,1,-5,4]', expectedOutput: '6' }],
            cpp: [{ input: '[-2,1,-3,4,-1,2,1,-5,4]', expectedOutput: '6' }]
        },
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
Check if any value appears at least twice.`,
        examples: [{ input: 'nums = [1,2,3,1]', output: 'True' }],
        hints: ['Use a set.'],
        solution: {
            python: `def contains_duplicate(nums):
    return len(nums) != len(set(nums))`,
            javascript: `function containsDuplicate(nums) {
    return new Set(nums).size !== nums.length;
}`,
            cpp: `bool containsDuplicate(vector<int>& nums) {
    unordered_set<int> s(nums.begin(), nums.end());
    return s.size() != nums.size();
}`
        },
        explanation: 'Set comparison.',
        starterCode: {
            python: `def contains_duplicate(nums):
    pass

print(contains_duplicate([1, 2, 3, 1]))`,
            javascript: `function containsDuplicate(nums) {
}

console.log(containsDuplicate([1, 2, 3, 1]));`,
            cpp: `#include <iostream>
#include <vector>
#include <unordered_set>
using namespace std;

bool containsDuplicate(vector<int>& nums) {
    return false;
}

int main() {
    vector<int> nums = {1, 2, 3, 1};
    cout << (containsDuplicate(nums) ? "true" : "false") << endl;
    return 0;
}`
        },
        testCases: {
            python: [{ input: '[1,2,3,1]', expectedOutput: 'True' }],
            javascript: [{ input: '[1,2,3,1]', expectedOutput: 'true' }],
            cpp: [{ input: '[1,2,3,1]', expectedOutput: 'true' }]
        },
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
Check if two strings are anagrams.`,
        examples: [{ input: 's = "anagram", t = "nagaram"', output: 'True' }],
        hints: ['Sort both strings.'],
        solution: {
            python: `def is_anagram(s, t):
    return sorted(s) == sorted(t)`,
            javascript: `function isAnagram(s, t) {
    return s.split("").sort().join("") === t.split("").sort().join("");
}`,
            cpp: `bool isAnagram(string s, string t) {
    sort(s.begin(), s.end());
    sort(t.begin(), t.end());
    return s == t;
}`
        },
        explanation: 'Sort and compare.',
        starterCode: {
            python: `def is_anagram(s, t):
    pass

print(is_anagram("anagram", "nagaram"))`,
            javascript: `function isAnagram(s, t) {
}

console.log(isAnagram("anagram", "nagaram"));`,
            cpp: `#include <iostream>
#include <algorithm>
using namespace std;

bool isAnagram(string s, string t) {
    return false;
}

int main() {
    cout << (isAnagram("anagram", "nagaram") ? "true" : "false") << endl;
    return 0;
}`
        },
        testCases: {
            python: [{ input: 'anagram, nagaram', expectedOutput: 'True' }],
            javascript: [{ input: 'anagram, nagaram', expectedOutput: 'true' }],
            cpp: [{ input: 'anagram, nagaram', expectedOutput: 'true' }]
        },
        xpReward: 50,
        tags: ['String', 'Sorting']
    },
    {
        id: 'valid-parentheses',
        title: 'Valid Parentheses',
        difficulty: 'medium',
        tier: 3,
        languages: ['python', 'javascript', 'cpp'],
        description: `**Description**
Check if parentheses string is valid.`,
        examples: [{ input: 's = "()"', output: 'True' }],
        hints: ['Use a stack.'],
        solution: {
            python: `def is_valid(s):
    stack = []
    pairs = {")": "(", "}": "{", "]": "["}
    for c in s:
        if c in pairs:
            if not stack or stack.pop() != pairs[c]:
                return False
        else:
            stack.append(c)
    return not stack`,
            javascript: `function isValid(s) {
    const stack = [];
    const map = {")": "(", "}": "{", "]": "["};
    for(const c of s) {
        if(map[c]) {
            if(stack.pop() !== map[c]) return false;
        } else {
            stack.push(c);
        }
    }
    return stack.length === 0;
}`,
            cpp: `bool isValid(string s) {
    stack<char> st;
    for(char c : s) {
        if(c == '(' || c == '{' || c == '[') st.push(c);
        else {
            if(st.empty()) return false;
            char top = st.top(); st.pop();
            if((c == ')' && top != '(') || (c == '}' && top != '{') || (c == ']' && top != '['))
                return false;
        }
    }
    return st.empty();
}`
        },
        explanation: 'Stack-based matching.',
        starterCode: {
            python: `def is_valid(s):
    pass

print(is_valid("()[]{}"))`,
            javascript: `function isValid(s) {
}

console.log(isValid("()[]{}"));`,
            cpp: `#include <iostream>
#include <stack>
using namespace std;

bool isValid(string s) {
    return false;
}

int main() {
    cout << (isValid("()[]{}") ? "true" : "false") << endl;
    return 0;
}`
        },
        testCases: {
            python: [{ input: '()[]{}', expectedOutput: 'True' }],
            javascript: [{ input: '()[]{}', expectedOutput: 'true' }],
            cpp: [{ input: '()[]{}', expectedOutput: 'true' }]
        },
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
Find length of longest substring without repeating characters.`,
        examples: [{ input: 's = "abcabcbb"', output: '3' }],
        hints: ['Use sliding window.'],
        solution: {
            python: `def length_of_longest(s):
    seen = set()
    l = res = 0
    for r in range(len(s)):
        while s[r] in seen:
            seen.remove(s[l])
            l += 1
        seen.add(s[r])
        res = max(res, r - l + 1)
    return res`,
            javascript: `function lengthOfLongest(s) {
    let l = 0, res = 0;
    const seen = new Set();
    for(let r = 0; r < s.length; r++) {
        while(seen.has(s[r])) { seen.delete(s[l]); l++; }
        seen.add(s[r]);
        res = Math.max(res, r - l + 1);
    }
    return res;
}`,
            cpp: `int lengthOfLongest(string s) {
    unordered_set<char> seen;
    int l = 0, res = 0;
    for(int r = 0; r < s.size(); r++) {
        while(seen.count(s[r])) { seen.erase(s[l]); l++; }
        seen.insert(s[r]);
        res = max(res, r - l + 1);
    }
    return res;
}`
        },
        explanation: 'Sliding window O(n).',
        starterCode: {
            python: `def length_of_longest(s):
    pass

print(length_of_longest("abcabcbb"))`,
            javascript: `function lengthOfLongest(s) {
}

console.log(lengthOfLongest("abcabcbb"));`,
            cpp: `#include <iostream>
#include <unordered_set>
using namespace std;

int lengthOfLongest(string s) {
    return 0;
}

int main() {
    cout << lengthOfLongest("abcabcbb") << endl;
    return 0;
}`
        },
        testCases: {
            python: [{ input: 'abcabcbb', expectedOutput: '3' }],
            javascript: [{ input: 'abcabcbb', expectedOutput: '3' }],
            cpp: [{ input: 'abcabcbb', expectedOutput: '3' }]
        },
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
Find two lines that form a container with most water.`,
        examples: [{ input: '[1,8,6,2,5,4,8,3,7]', output: '49' }],
        hints: ['Use two pointers.'],
        solution: {
            python: `def max_area(height):
    l, r = 0, len(height) - 1
    max_a = 0
    while l < r:
        max_a = max(max_a, (r - l) * min(height[l], height[r]))
        if height[l] < height[r]: l += 1
        else: r -= 1
    return max_a`,
            javascript: `function maxArea(height) {
    let l = 0, r = height.length - 1, maxA = 0;
    while(l < r) {
        maxA = Math.max(maxA, (r - l) * Math.min(height[l], height[r]));
        if(height[l] < height[r]) l++;
        else r--;
    }
    return maxA;
}`,
            cpp: `int maxArea(vector<int>& height) {
    int l = 0, r = height.size() - 1, maxA = 0;
    while(l < r) {
        maxA = max(maxA, (r - l) * min(height[l], height[r]));
        if(height[l] < height[r]) l++;
        else r--;
    }
    return maxA;
}`
        },
        explanation: 'Greedy two-pointer.',
        starterCode: {
            python: `def max_area(height):
    pass

print(max_area([1, 8, 6, 2, 5, 4, 8, 3, 7]))`,
            javascript: `function maxArea(height) {
}

console.log(maxArea([1, 8, 6, 2, 5, 4, 8, 3, 7]));`,
            cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int maxArea(vector<int>& height) {
    return 0;
}

int main() {
    vector<int> height = {1, 8, 6, 2, 5, 4, 8, 3, 7};
    cout << maxArea(height) << endl;
    return 0;
}`
        },
        testCases: {
            python: [{ input: '[1,8,6,2,5,4,8,3,7]', expectedOutput: '49' }],
            javascript: [{ input: '[1,8,6,2,5,4,8,3,7]', expectedOutput: '49' }],
            cpp: [{ input: '[1,8,6,2,5,4,8,3,7]', expectedOutput: '49' }]
        },
        xpReward: 125,
        tags: ['Two Pointers', 'Greedy']
    },
    {
        id: 'trapping-rain',
        title: 'Trapping Rain Water',
        difficulty: 'hard',
        tier: 5,
        languages: ['python', 'javascript', 'cpp'],
        description: `**Description**
Given elevation map, compute water trapped after raining.`,
        examples: [{ input: '[0,1,0,2,1,0,1,3,2,1,2,1]', output: '6' }],
        hints: ['Use two pointers.'],
        solution: {
            python: `def trap(height):
    if not height: return 0
    l, r = 0, len(height) - 1
    lmax, rmax, res = height[l], height[r], 0
    while l < r:
        if lmax < rmax:
            l += 1
            lmax = max(lmax, height[l])
            res += lmax - height[l]
        else:
            r -= 1
            rmax = max(rmax, height[r])
            res += rmax - height[r]
    return res`,
            javascript: `function trap(height) {
    let l = 0, r = height.length - 1;
    let lmax = 0, rmax = 0, res = 0;
    while(l < r) {
        if(height[l] < height[r]) {
            height[l] >= lmax ? (lmax = height[l]) : (res += lmax - height[l]);
            l++;
        } else {
            height[r] >= rmax ? (rmax = height[r]) : (res += rmax - height[r]);
            r--;
        }
    }
    return res;
}`,
            cpp: `int trap(vector<int>& height) {
    int l = 0, r = height.size() - 1;
    int lmax = 0, rmax = 0, res = 0;
    while(l < r) {
        if(height[l] < height[r]) {
            height[l] >= lmax ? (lmax = height[l]) : (res += lmax - height[l]);
            l++;
        } else {
            height[r] >= rmax ? (rmax = height[r]) : (res += rmax - height[r]);
            r--;
        }
    }
    return res;
}`
        },
        explanation: 'Two pointers O(n) O(1).',
        starterCode: {
            python: `def trap(height):
    pass

print(trap([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]))`,
            javascript: `function trap(height) {
}

console.log(trap([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]));`,
            cpp: `#include <iostream>
#include <vector>
using namespace std;

int trap(vector<int>& height) {
    return 0;
}

int main() {
    vector<int> height = {0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1};
    cout << trap(height) << endl;
    return 0;
}`
        },
        testCases: {
            python: [{ input: '[0,1,0,2,1,0,1,3,2,1,2,1]', expectedOutput: '6' }],
            javascript: [{ input: '[0,1,0,2,1,0,1,3,2,1,2,1]', expectedOutput: '6' }],
            cpp: [{ input: '[0,1,0,2,1,0,1,3,2,1,2,1]', expectedOutput: '6' }]
        },
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
Find shortest transformation from beginWord to endWord.`,
        examples: [{ input: 'hit -> cog', output: '5' }],
        hints: ['Use BFS.'],
        solution: {
            python: `from collections import deque
def ladder_length(begin, end, wordList):
    wordSet = set(wordList)
    if end not in wordSet: return 0
    q = deque([(begin, 1)])
    while q:
        word, length = q.popleft()
        if word == end: return length
        for i in range(len(word)):
            for c in "abcdefghijklmnopqrstuvwxyz":
                next_word = word[:i] + c + word[i+1:]
                if next_word in wordSet:
                    wordSet.remove(next_word)
                    q.append((next_word, length + 1))
    return 0`,
            javascript: `function ladderLength(beginWord, endWord, wordList) {
    const wordSet = new Set(wordList);
    if(!wordSet.has(endWord)) return 0;
    const queue = [[beginWord, 1]];
    while(queue.length) {
        const [word, len] = queue.shift();
        if(word === endWord) return len;
        for(let i = 0; i < word.length; i++) {
            for(let c = 97; c <= 122; c++) {
                const next = word.slice(0, i) + String.fromCharCode(c) + word.slice(i + 1);
                if(wordSet.has(next)) { wordSet.delete(next); queue.push([next, len + 1]); }
            }
        }
    }
    return 0;
}`
        },
        explanation: 'BFS shortest path.',
        starterCode: {
            python: `from collections import deque

def ladder_length(begin, end, wordList):
    pass

print(ladder_length("hit", "cog", ["hot", "dot", "dog", "lot", "log", "cog"]))`,
            javascript: `function ladderLength(beginWord, endWord, wordList) {
}

console.log(ladderLength("hit", "cog", ["hot", "dot", "dog", "lot", "log", "cog"]));`
        },
        testCases: {
            python: [{ input: 'hit, cog', expectedOutput: '5' }],
            javascript: [{ input: 'hit, cog', expectedOutput: '5' }]
        },
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
