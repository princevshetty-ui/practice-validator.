# Smart Pitch Validator

Single-page React app (Vite) + Express backend that transforms a raw project idea into a polished hackathon pitch aligned to SDGs.

## Features

- Input a project idea in a modern glassmorphism UI.
- Validate with Gemini-powered pitch analysis.
- Output:
	- The Hook: 1-sentence professional summary
	- SDG Alignment: 1-2 relevant goals
	- Innovation Score: 1-100
- Framer Motion animations for entrance, loading pulse, and staggered results.

## Tech Stack

- Frontend: React + Vite + Tailwind CSS
- Motion/UI: Framer Motion + Lucide React
- Backend: Express (`server.js`)
- AI SDK: `@google/generative-ai`
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

3. Run backend + frontend in two terminals:

Backend API:

```bash
npm start
```

Frontend app:

```bash
npm run dev
```

Or run both together:

```bash
npm run dev:all
```

4. Open Vite URL shown in terminal (usually):

```text
http://localhost:5173
```