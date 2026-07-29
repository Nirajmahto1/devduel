/**
 * DevDuel Seed Data: Starter Problems and Test Cases
 */
exports.seed = async function (knex) {
  // Clear existing records
  await knex('test_cases').del();
  await knex('submissions').del();
  await knex('matches').del();
  await knex('problems').del();

  const problemsData = [
    {
      title: 'Two Sum',
      description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

Output the 0-indexed indices separated by space.`,
      difficulty: 'easy',
      tags: ['arrays', 'hash-table'],
      input_format: 'First line: space-separated integers for array.\nSecond line: target integer.',
      output_format: 'Two space-separated indices (e.g. 0 1)',
      constraints: '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9',
      sample_input: '2 7 11 15\n9',
      sample_output: '0 1',
      time_limit_ms: 2000,
      memory_limit_kb: 256000,
      is_active: true,
      testCases: [
        { input: '2 7 11 15\n9', expected_output: '0 1', is_sample: true, order: 0 },
        { input: '3 2 4\n6', expected_output: '1 2', is_sample: true, order: 1 },
        { input: '3 3\n6', expected_output: '0 1', is_sample: false, order: 2 },
        { input: '1 5 8 11 14 20\n25', expected_output: '3 4', is_sample: false, order: 3 },
      ],
    },
    {
      title: 'Reverse String',
      description: `Write a function that reverses a given string.

Input string will contain printable ASCII characters. Print the reversed string.`,
      difficulty: 'easy',
      tags: ['strings', 'two-pointers'],
      input_format: 'A single line containing the string.',
      output_format: 'The reversed string.',
      constraints: '1 <= string.length <= 10^5',
      sample_input: 'hello',
      sample_output: 'olleh',
      time_limit_ms: 2000,
      memory_limit_kb: 256000,
      is_active: true,
      testCases: [
        { input: 'hello', expected_output: 'olleh', is_sample: true, order: 0 },
        { input: 'DevDuel', expected_output: 'leuDevD', is_sample: true, order: 1 },
        { input: 'racecar', expected_output: 'racecar', is_sample: false, order: 2 },
        { input: 'a', expected_output: 'a', is_sample: false, order: 3 },
      ],
    },
    {
      title: 'Fibonacci Number',
      description: `The Fibonacci numbers, commonly denoted \`F(n)\`, form a sequence called the Fibonacci sequence, such that each number is the sum of the two preceding ones, starting from \`0\` and \`1\`.

Calculate \`F(n)\` for a given non-negative integer \`n\`.`,
      difficulty: 'easy',
      tags: ['math', 'dynamic-programming', 'recursion'],
      input_format: 'Single integer n.',
      output_format: 'Single integer representing F(n).',
      constraints: '0 <= n <= 30',
      sample_input: '4',
      sample_output: '3',
      time_limit_ms: 2000,
      memory_limit_kb: 256000,
      is_active: true,
      testCases: [
        { input: '0', expected_output: '0', is_sample: true, order: 0 },
        { input: '4', expected_output: '3', is_sample: true, order: 1 },
        { input: '10', expected_output: '55', is_sample: false, order: 2 },
        { input: '20', expected_output: '6765', is_sample: false, order: 3 },
      ],
    },
    {
      title: 'Valid Parentheses',
      description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.

Print \`true\` if valid, or \`false\` otherwise.`,
      difficulty: 'easy',
      tags: ['stack', 'strings'],
      input_format: 'Single string s.',
      output_format: 'true or false',
      constraints: '1 <= s.length <= 10^4',
      sample_input: '()[]{}',
      sample_output: 'true',
      time_limit_ms: 2000,
      memory_limit_kb: 256000,
      is_active: true,
      testCases: [
        { input: '()[]{}', expected_output: 'true', is_sample: true, order: 0 },
        { input: '(]', expected_output: 'false', is_sample: true, order: 1 },
        { input: '({[]})', expected_output: 'true', is_sample: false, order: 2 },
        { input: '([)]', expected_output: 'false', is_sample: false, order: 3 },
      ],
    },
    {
      title: 'Palindrome Number',
      description: `Given an integer \`x\`, print \`true\` if \`x\` is a palindrome, and \`false\` otherwise.

An integer is a palindrome when it reads the same backward as forward.`,
      difficulty: 'easy',
      tags: ['math'],
      input_format: 'Single integer x.',
      output_format: 'true or false',
      constraints: '-2^31 <= x <= 2^31 - 1',
      sample_input: '121',
      sample_output: 'true',
      time_limit_ms: 2000,
      memory_limit_kb: 256000,
      is_active: true,
      testCases: [
        { input: '121', expected_output: 'true', is_sample: true, order: 0 },
        { input: '-121', expected_output: 'false', is_sample: true, order: 1 },
        { input: '10', expected_output: 'false', is_sample: false, order: 2 },
        { input: '12321', expected_output: 'true', is_sample: false, order: 3 },
      ],
    },
    {
      title: 'Maximum Subarray Sum',
      description: `Given an integer array \`nums\`, find the subarray with the largest sum, and print its sum. (Kadane's Algorithm)`,
      difficulty: 'medium',
      tags: ['arrays', 'dynamic-programming', 'divide-and-conquer'],
      input_format: 'Space-separated integers representing nums.',
      output_format: 'Single integer (maximum subarray sum).',
      constraints: '1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4',
      sample_input: '-2 1 -3 4 -1 2 1 -5 4',
      sample_output: '6',
      time_limit_ms: 2000,
      memory_limit_kb: 256000,
      is_active: true,
      testCases: [
        { input: '-2 1 -3 4 -1 2 1 -5 4', expected_output: '6', is_sample: true, order: 0 },
        { input: '1', expected_output: '1', is_sample: true, order: 1 },
        { input: '5 4 -1 7 8', expected_output: '23', is_sample: false, order: 2 },
        { input: '-5 -2 -3 -1', expected_output: '-1', is_sample: false, order: 3 },
      ],
    },
    {
      title: 'Binary Search',
      description: `Given a sorted array of distinct integers \`nums\` and a \`target\`, write a function to search \`target\` in \`nums\`. If \`target\` exists, return its index. Otherwise, return \`-1\`.`,
      difficulty: 'easy',
      tags: ['arrays', 'binary-search'],
      input_format: 'First line: space-separated sorted integers.\nSecond line: target integer.',
      output_format: 'Single integer index or -1.',
      constraints: '1 <= nums.length <= 10^4\n-10^4 <= nums[i], target <= 10^4',
      sample_input: '-1 0 3 5 9 12\n9',
      sample_output: '4',
      time_limit_ms: 2000,
      memory_limit_kb: 256000,
      is_active: true,
      testCases: [
        { input: '-1 0 3 5 9 12\n9', expected_output: '4', is_sample: true, order: 0 },
        { input: '-1 0 3 5 9 12\n2', expected_output: '-1', is_sample: true, order: 1 },
        { input: '5\n5', expected_output: '0', is_sample: false, order: 2 },
        { input: '2 4 6 8 10 12 14 16\n14', expected_output: '6', is_sample: false, order: 3 },
      ],
    },
    {
      title: 'Contains Duplicate',
      description: `Given an integer array \`nums\`, return \`true\` if any value appears at least twice in the array, and return \`false\` if every element is distinct.`,
      difficulty: 'easy',
      tags: ['arrays', 'hash-table', 'sorting'],
      input_format: 'Space-separated integers.',
      output_format: 'true or false',
      constraints: '1 <= nums.length <= 10^5',
      sample_input: '1 2 3 1',
      sample_output: 'true',
      time_limit_ms: 2000,
      memory_limit_kb: 256000,
      is_active: true,
      testCases: [
        { input: '1 2 3 1', expected_output: 'true', is_sample: true, order: 0 },
        { input: '1 2 3 4', expected_output: 'false', is_sample: true, order: 1 },
        { input: '1 1 1 3 3 4 3 2 4 2', expected_output: 'true', is_sample: false, order: 2 },
      ],
    },
    {
      title: 'Move Zeroes',
      description: `Given an integer array \`nums\`, move all \`0\`'s to the end of it while maintaining the relative order of the non-zero elements.

Output the modified array elements separated by spaces.`,
      difficulty: 'easy',
      tags: ['arrays', 'two-pointers'],
      input_format: 'Space-separated integers.',
      output_format: 'Space-separated modified integers.',
      constraints: '1 <= nums.length <= 10^4',
      sample_input: '0 1 0 3 12',
      sample_output: '1 3 12 0 0',
      time_limit_ms: 2000,
      memory_limit_kb: 256000,
      is_active: true,
      testCases: [
        { input: '0 1 0 3 12', expected_output: '1 3 12 0 0', is_sample: true, order: 0 },
        { input: '0', expected_output: '0', is_sample: true, order: 1 },
        { input: '4 2 4 0 0 3 0 5 1 0', expected_output: '4 2 4 3 5 1 0 0 0 0', is_sample: false, order: 2 },
      ],
    },
    {
      title: 'FizzBuzz Classic',
      description: `Given an integer \`n\`, print space-separated answers for 1 to n where:
- answer[i] == "FizzBuzz" if i is divisible by 3 and 5.
- answer[i] == "Fizz" if i is divisible by 3.
- answer[i] == "Buzz" if i is divisible by 5.
- answer[i] == i (as a string) if none of the above conditions are true.`,
      difficulty: 'easy',
      tags: ['math', 'strings'],
      input_format: 'Single integer n.',
      output_format: 'Space-separated output tokens.',
      constraints: '1 <= n <= 10^4',
      sample_input: '5',
      sample_output: '1 2 Fizz 4 Buzz',
      time_limit_ms: 2000,
      memory_limit_kb: 256000,
      is_active: true,
      testCases: [
        { input: '5', expected_output: '1 2 Fizz 4 Buzz', is_sample: true, order: 0 },
        { input: '15', expected_output: '1 2 Fizz 4 Buzz Fizz 7 8 Fizz Buzz 11 Fizz 13 14 FizzBuzz', is_sample: true, order: 1 },
      ],
    },
  ];

  for (const item of problemsData) {
    const { testCases, ...problemFields } = item;
    const [insertedProblem] = await knex('problems').insert(problemFields).returning('id');
    const problemId = insertedProblem.id || insertedProblem;

    const testCaseRows = testCases.map((tc) => ({
      ...tc,
      problem_id: problemId,
    }));

    await knex('test_cases').insert(testCaseRows);
  }
};
