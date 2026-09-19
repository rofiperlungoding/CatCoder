export type ProblemTest = { input: string; expected: string }
export type BaseProblem = {
  id: string
  statement: string
  difficulty: number
  python: string
  javascript: string
  tests: ProblemTest[]
}

export const problems: BaseProblem[] = [
  {
    id: "sum-range",
    statement: "Implement solve(a, b) that returns the sum of all integers from a to b inclusive. Assume a is less than or equal to b.",
    difficulty: 1100,
    python: `def solve(a, b):\n    total = 0\n    for i in range(a, b + 1):\n        total += i\n    return total`,
    javascript: `function solve(a, b) {\n  let total = 0\n  for (let i = a; i <= b; i++) total += i\n  return total\n}`,
    tests: [
      { input: "[1, 5]", expected: "15" },
      { input: "[-3, 3]", expected: "0" },
      { input: "[5, 5]", expected: "5" },
      { input: "[0, 4]", expected: "10" },
      { input: "[-5, -1]", expected: "-15" },
    ],
  },
  {
    id: "is-palindrome",
    statement: "Implement solve(s) that returns true if s is a palindrome considering only alphanumeric characters and ignoring case, otherwise false.",
    difficulty: 1300,
    python: `def solve(s):\n    cleaned = [c.lower() for c in s if c.isalnum()]\n    return cleaned == cleaned[::-1]`,
    javascript: `function solve(s) {\n  const cleaned = [...s.toLowerCase()].filter((c) => /[a-z0-9]/.test(c))\n  return cleaned.join("") === cleaned.reverse().join("")\n}`,
    tests: [
      { input: "[\"A man, a plan, a canal: Panama\"]", expected: "true" },
      { input: "[\"race a car\"]", expected: "false" },
      { input: "[\"\"]", expected: "true" },
      { input: "[\"0P\"]", expected: "false" },
      { input: "[\"Able , was I ere I saw eLba\"]", expected: "true" },
    ],
  },
  {
    id: "find-max",
    statement: "Implement solve(nums) that returns the largest number in the non empty array nums. The array may contain negative numbers.",
    difficulty: 1200,
    python: `def solve(nums):\n    best = nums[0]\n    for n in nums[1:]:\n        if n > best:\n            best = n\n    return best`,
    javascript: `function solve(nums) {\n  let best = nums[0]\n  for (let i = 1; i < nums.length; i++) {\n    if (nums[i] > best) best = nums[i]\n  }\n  return best\n}`,
    tests: [
      { input: "[[3, 7, 2, 9, 4]]", expected: "9" },
      { input: "[[-5, -2, -9]]", expected: "-2" },
      { input: "[[42]]", expected: "42" },
      { input: "[[-1, 0, -3]]", expected: "0" },
      { input: "[[1, 1, 1]]", expected: "1" },
    ],
  },
  {
    id: "count-vowels",
    statement: "Implement solve(s) that returns the number of vowels in s. Vowels are a, e, i, o, u, case insensitive.",
    difficulty: 1100,
    python: `def solve(s):\n    return sum(1 for c in s.lower() if c in "aeiou")`,
    javascript: `function solve(s) {\n  return [...s.toLowerCase()].filter((c) => "aeiou".includes(c)).length\n}`,
    tests: [
      { input: "[\"Hello World\"]", expected: "3" },
      { input: "[\"xyzq\"]", expected: "0" },
      { input: "[\"AEIOU\"]", expected: "5" },
      { input: "[\"\"]", expected: "0" },
      { input: "[\"Programming\"]", expected: "3" },
    ],
  },
  {
    id: "binary-search",
    statement: "Implement solve(nums, target) that returns the index of target in the ascending sorted array nums using binary search, or -1 if it is not present.",
    difficulty: 1450,
    python: `def solve(nums, target):\n    lo, hi = 0, len(nums) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if nums[mid] == target:\n            return mid\n        if nums[mid] < target:\n            lo = mid + 1\n        else:\n            hi = mid - 1\n    return -1`,
    javascript: `function solve(nums, target) {\n  let lo = 0\n  let hi = nums.length - 1\n  while (lo <= hi) {\n    const mid = Math.floor((lo + hi) / 2)\n    if (nums[mid] === target) return mid\n    if (nums[mid] < target) lo = mid + 1\n    else hi = mid - 1\n  }\n  return -1\n}`,
    tests: [
      { input: "[[1, 3, 5, 7, 9], 5]", expected: "2" },
      { input: "[[1, 3, 5, 7, 9], 1]", expected: "0" },
      { input: "[[1, 3, 5, 7, 9], 9]", expected: "4" },
      { input: "[[1, 3, 5, 7, 9], 4]", expected: "-1" },
      { input: "[[], 3]", expected: "-1" },
      { input: "[[2], 2]", expected: "0" },
    ],
  },
  {
    id: "fizzbuzz",
    statement: "Implement solve(n) that returns FizzBuzz if n is divisible by both 3 and 5, Fizz if divisible by 3, Buzz if divisible by 5, otherwise the number as a string.",
    difficulty: 1150,
    python: `def solve(n):\n    if n % 15 == 0:\n        return "FizzBuzz"\n    if n % 3 == 0:\n        return "Fizz"\n    if n % 5 == 0:\n        return "Buzz"\n    return str(n)`,
    javascript: `function solve(n) {\n  if (n % 15 === 0) return "FizzBuzz"\n  if (n % 3 === 0) return "Fizz"\n  if (n % 5 === 0) return "Buzz"\n  return String(n)\n}`,
    tests: [
      { input: "[15]", expected: "\"FizzBuzz\"" },
      { input: "[9]", expected: "\"Fizz\"" },
      { input: "[10]", expected: "\"Buzz\"" },
      { input: "[7]", expected: "\"7\"" },
      { input: "[3]", expected: "\"Fizz\"" },
      { input: "[0]", expected: "\"FizzBuzz\"" },
    ],
  },
  {
    id: "dedupe",
    statement: "Implement solve(nums) that returns a new array with duplicates removed, preserving the order of first occurrence.",
    difficulty: 1300,
    python: `def solve(nums):\n    seen = set()\n    result = []\n    for n in nums:\n        if n not in seen:\n            seen.add(n)\n            result.append(n)\n    return result`,
    javascript: `function solve(nums) {\n  const seen = new Set()\n  const result = []\n  for (const n of nums) {\n    if (!seen.has(n)) {\n      seen.add(n)\n      result.push(n)\n    }\n  }\n  return result\n}`,
    tests: [
      { input: "[[1, 2, 2, 3, 1]]", expected: "[1,2,3]" },
      { input: "[[5, 5, 5]]", expected: "[5]" },
      { input: "[[]]", expected: "[]" },
      { input: "[[3, 1, 2, 1, 3]]", expected: "[3,1,2]" },
      { input: "[[9, 8, 7]]", expected: "[9,8,7]" },
    ],
  },
  {
    id: "fibonacci",
    statement: "Implement solve(n) that returns the nth Fibonacci number, zero indexed, where solve(0) is 0 and solve(1) is 1.",
    difficulty: 1350,
    python: `def solve(n):\n    a, b = 0, 1\n    for _ in range(n):\n        a, b = b, a + b\n    return a`,
    javascript: `function solve(n) {\n  let a = 0\n  let b = 1\n  for (let i = 0; i < n; i++) {\n    const next = a + b\n    a = b\n    b = next\n  }\n  return a\n}`,
    tests: [
      { input: "[0]", expected: "0" },
      { input: "[1]", expected: "1" },
      { input: "[2]", expected: "1" },
      { input: "[7]", expected: "13" },
      { input: "[10]", expected: "55" },
    ],
  },
]
