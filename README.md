# Git Commit Audio 🎤

Voice-to-text git commits. Speak your rationale, get conventional commits.

## What It Does

- Records your voice note for commits
- Transcribes using OpenAI Whisper API
- Formats as conventional commits (feat:, fix:, chore:, etc.)
- Saves original audio in git notes

## Why?

Stop typing essay-length commit messages. Capture rich context in seconds.

## Installation

```bash
# Clone and install
git clone https://github.com/YOUR_USERNAME/git-commit-audio.git
cd git-commit-audio
npm install

# Set your OpenAI API key
export OPENAI_API_KEY=sk-your-key-here

# (Optional) Add to .env
echo "OPENAI_API_KEY=sk-your-key-here" > .env
```

## Usage

### As a CLI command

```bash
# Record voice and commit
npx gca commit

# With manual fallback message
npx gca commit -m "fallback message if recording fails"

# With explicit API key
npx gca commit -k sk-your-key-here
```

### As a pre-commit hook

```bash
# Run setup to install hooks
npm run postinstall

# Then just use git normally
git add .
git commit  # Will prompt you to speak
```

## How It Works

1. **Record** - Use your microphone to speak the commit message
2. **Transcribe** - Whisper API converts speech to text
3. **Format** - Auto-detects commit type (feat, fix, docs, etc.)
4. **Commit** - Creates conventional commit with audio attached

## Example

```
$ npx gca commit

📝 Found 3 changed file(s)

🎤 Speak your commit message...

🎤 Recording... Press Ctrl+C to stop
[You speak: "I added a new feature for user authentication with JWT tokens"]

🤖 Transcribing with Whisper...
✓ Transcription complete

📋 Commit message: feat: I added a new feature for user authentication with JWT tokens

✅ Commit created!
```

## Requirements

- Node.js 18+
- OpenAI API key
- Microphone
- Linux: `arecord` (ALSA)
- macOS: `sox` (via Homebrew)

### Install audio tools

```bash
# Linux (Ubuntu/Debian)
sudo apt-get install alsa-utils

# macOS
brew install sox
```

## Configuration

Set your OpenAI API key via:

```bash
# Environment variable (recommended)
export OPENAI_API_KEY=sk-your-key-here

# Or .env file
echo "OPENAI_API_KEY=sk-your-key-here" > .env
```

## License

MIT - GAMBLEG

## Roadmap

- [ ] Local Whisper support (no API key needed)
- [ ] Audio search in git notes
- [ ] Custom commit type detection rules
- [ ] Multi-language support
- [ ] Team features and sharing
