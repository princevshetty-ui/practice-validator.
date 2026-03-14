# AI Idea Validator MVP

Single-file Node.js Express backend + simple Tailwind frontend for validating hackathon ideas with Gemini.

## Features

- Input a project idea in the browser.
- Click Validate to call Gemini.
- Get:
	- 1-sentence value proposition
	- 3 relevant SDGs
	- Complexity score (1-10)

## Tech Stack

- Backend: Express (`server.js`)
- AI SDK: `@google/generative-ai`
- Frontend: `public/index.html` + Tailwind via CDN
- Secrets: `.env`

## Setup

1. Install dependencies:

```bash
npm install
```

2. Add your Gemini API key in `.env`:

```env
GEMINI_API_KEY=your_actual_key_here

# Optional: keep demo working when Gemini quota is exceeded
# ENABLE_LOCAL_FALLBACK=true
```

3. Start the app:

```bash
npm start
```

4. Open:

```text
http://localhost:3000
```