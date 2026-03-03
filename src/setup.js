const fs = require('fs');
const path = require('path');

// Create .env.example if not exists
const envExample = path.join(__dirname, '.env.example');
if (!fs.existsSync(envExample)) {
  fs.writeFileSync(envExample, 'OPENAI_API_KEY=sk-your-key-here\n');
}

// Create pre-commit hook
const hooksDir = path.join(__dirname, '.husky');
const hookFile = path.join(hooksDir, 'pre-commit');

if (!fs.existsSync(hooksDir)) {
  fs.mkdirSync(hooksDir, { recursive: true });
}

const hookContent = `#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Git Commit Audio hook
npx gca commit
`;
fs.writeFileSync(hookFile, hookContent);

// Make executable
try {
  fs.chmodSync(hookFile, 0o755);
} catch (e) {
  // Skip on Windows
}

console.log('✓ Git Commit Audio setup complete');
console.log('  - Set OPENAI_API_KEY in .env or environment');
console.log('  - Run: npx gca commit (or use git commit for pre-commit)');
