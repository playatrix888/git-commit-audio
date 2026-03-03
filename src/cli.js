#!/usr/bin/env node

// Export only the format function for testing
exports.formatConventionalCommit = function(text) {
  const words = text.split(' ');
  let type = 'feat';
  const subject = words.join(' ');

  // Detect common patterns
  const patterns = {
    test: ['test', 'tests', 'spec', 'mock'],
    fix: ['fix', 'bug', 'broken', 'error', 'issue'],
    feat: ['add', 'new', 'feature', 'implement', 'create'],
    docs: ['doc', 'readme', 'document', 'comment'],
    style: ['style', 'format', 'indent', 'prettier'],
    refactor: ['refactor', 'clean', 'simplify', 'restructure'],
    chore: ['chore', 'build', 'dependency', 'update']
  };

  for (const [t, keywords] of Object.entries(patterns)) {
    if (keywords.some(k => text.toLowerCase().includes(k))) {
      type = t;
      break;
    }
  }

  return `${type}: ${subject}`;
};

// If run directly, execute CLI
if (require.main === module) {
  const { program } = require('commander');
  const simpleGit = require('simple-git');
  const OpenAI = require('openai');
  const { execSync } = require('child_process');
  const fs = require('fs');
  const path = require('path');
  const ora = require('ora');

  const git = simpleGit();

  program
    .name('gca')
    .description('Git Commit Audio - Voice notes for commits')
    .version('0.1.0');

  // Record voice note
  async function recordVoice(outputPath) {
    const spinner = ora('🎤 Recording... Press Ctrl+C to stop').start();

    try {
      const cmd = `arecord -f cd -t wav ${outputPath} 2>/dev/null`;
      execSync(cmd, { stdio: 'inherit' });
      spinner.succeed('✓ Voice recorded');
      return true;
    } catch (error) {
      spinner.fail('✗ Recording failed');
      console.error(error.message);
      return false;
    }
  }

  // Transcribe audio using Whisper API
  async function transcribeAudio(audioPath, apiKey) {
    const spinner = ora('🤖 Transcribing with Whisper...').start();

    try {
      const openai = new OpenAI({ apiKey });
      const audioFile = fs.createReadStream(audioPath);
      const transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
      });

      spinner.succeed('✓ Transcription complete');
      return transcription.text.trim();
    } catch (error) {
      spinner.fail('✗ Transcription failed');
      console.error(error.message);
      return null;
    }
  }

  // Save audio as git note
  async function saveAsGitNote(audioPath) {
    try {
      const content = fs.readFileSync(audioPath).toString('base64');
      const note = `🎤 Audio commit note:\n\nBase64: ${content.substring(0, 100)}...\n\nOriginal: ${audioPath}`;
      await git.addNote(note);
      return true;
    } catch (error) {
      console.warn('⚠ Could not save git note:', error.message);
      return false;
    }
  }

  // Main commit workflow
  program
    .command('commit')
    .description('Record voice and create commit')
    .option('-m, --message <msg>', 'Manual message fallback')
    .option('-k, --api-key <key>', 'OpenAI API key')
    .action(async (options) => {
      const apiKey = options.apiKey || process.env.OPENAI_API_KEY;

      if (!apiKey) {
        console.error('❌ OPENAI_API_KEY required. Set environment variable or use --api-key');
        process.exit(1);
      }

      const status = await git.status();
      if (status.files.length === 0) {
        console.log('ℹ Nothing to commit');
        return;
      }

      console.log(`\n📝 Found ${status.files.length} changed file(s)`);

      const audioPath = path.join(process.cwd(), '.gca_voice.wav');
      console.log('\n🎤 Speak your commit message...\n');
      const recorded = await recordVoice(audioPath);

      if (!recorded) {
        console.log('❌ Recording failed. Using fallback message.');
        const msg = options.message || 'chore: voice recording failed';
        await git.commit(msg);
        return;
      }

      const transcript = await transcribeAudio(audioPath, apiKey);
      if (!transcript) {
        console.log('❌ Transcription failed. Using fallback message.');
        const msg = options.message || 'chore: transcription failed';
        await git.commit(msg);
        fs.unlinkSync(audioPath);
        return;
      }

      const commitMsg = exports.formatConventionalCommit(transcript);
      console.log(`\n📋 Commit message: ${commitMsg}`);

      await saveAsGitNote(audioPath);
      await git.commit(commitMsg);
      console.log('\n✅ Commit created!');

      fs.unlinkSync(audioPath);
    });

  program.parse();
}
