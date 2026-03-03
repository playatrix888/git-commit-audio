const { formatConventionalCommit } = require('./cli');

// Helper for tests
async function testFormatting() {
  const tests = [
    { input: 'I added a new feature for login', expected: 'feat:' },
    { input: 'Fixed the broken bug in authentication', expected: 'fix:' },
    { input: 'Updated the README documentation', expected: 'docs:' },
    { input: 'Refactored the code structure', expected: 'refactor:' },
    { input: 'Added tests for the API', expected: 'test:' },
    { input: 'Updated dependencies', expected: 'chore:' },
  ];

  console.log('🧪 Testing conventional commit formatting...\n');
  let passed = 0;

  for (const test of tests) {
    const result = formatConventionalCommit(test.input);
    const passedThis = result.startsWith(test.expected);
    passed += passedThis ? 1 : 0;
    
    console.log(`${passedThis ? '✓' : '✗'} ${test.input}`);
    console.log(`  → ${result}`);
  }

  console.log(`\n${passed}/${tests.length} tests passed`);
  return passed === tests.length;
}

// Run tests
testFormatting().then(success => {
  process.exit(success ? 0 : 1);
});
