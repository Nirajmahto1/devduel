const {
  LANGUAGE_IDS,
  normalizeOutput,
  mapJudge0StatusToVerdict,
  runSampleTests,
  submitFullTests,
} = require('../src/services/judge0.service');

describe('Judge0 Service', () => {

  describe('Language Mapping', () => {
    it('should support C++, Python, Java, and JavaScript', () => {
      expect(LANGUAGE_IDS['cpp']).toBe(54);
      expect(LANGUAGE_IDS['python']).toBe(71);
      expect(LANGUAGE_IDS['java']).toBe(62);
      expect(LANGUAGE_IDS['javascript']).toBe(63);
    });
  });

  describe('Output Normalization', () => {
    it('should strip trailing spaces and normalize CRLF to LF', () => {
      const input = 'hello world   \r\nline two \r\n';
      const expected = 'hello world\nline two';
      expect(normalizeOutput(input)).toBe(expected);
    });

    it('should handle empty or null string', () => {
      expect(normalizeOutput(null)).toBe('');
      expect(normalizeOutput('')).toBe('');
    });
  });

  describe('Status Mapping', () => {
    it('should map Status 3 to AC when stdout matches expected', () => {
      expect(mapJudge0StatusToVerdict(3, '0 1\n', '0 1')).toBe('AC');
    });

    it('should map Status 3 to WA when stdout does not match expected', () => {
      expect(mapJudge0StatusToVerdict(3, '0 2\n', '0 1')).toBe('WA');
    });

    it('should map Status 4 to WA', () => {
      expect(mapJudge0StatusToVerdict(4, 'wrong', 'right')).toBe('WA');
    });

    it('should map Status 5 to TLE', () => {
      expect(mapJudge0StatusToVerdict(5, '', '')).toBe('TLE');
    });

    it('should map Status 6 to CE', () => {
      expect(mapJudge0StatusToVerdict(6, '', '')).toBe('CE');
    });

    it('should map Status 7..12 to RE', () => {
      expect(mapJudge0StatusToVerdict(7, '', '')).toBe('RE');
      expect(mapJudge0StatusToVerdict(11, '', '')).toBe('RE');
    });
  });

  describe('Sample & Full Test Suite Evaluation', () => {
    const sampleCases = [
      { id: 1, input: '2 7 11 15\n9', expected_output: '0 1', is_sample: true },
      { id: 2, input: '3 2 4\n6', expected_output: '1 2', is_sample: true },
    ];

    it('should evaluate sample tests correctly', async () => {
      const code = 'const input = require("fs").readFileSync("/dev/stdin", "utf-8"); console.log("0 1");';
      const result = await runSampleTests('javascript', code, sampleCases, 2000, 256000);

      expect(result).toHaveProperty('verdict');
      expect(result).toHaveProperty('testsPassed');
      expect(result).toHaveProperty('testsTotal', 2);
    });

    it('should detect simulated compilation error', async () => {
      const code = 'compile_error_code_SYNTAX_ERROR';
      const result = await submitFullTests('javascript', code, sampleCases, 2000, 256000);

      expect(result.verdict).toBe('CE');
      expect(result.testsPassed).toBe(0);
    });
  });

});
