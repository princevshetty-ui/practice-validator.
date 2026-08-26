# Smart Pitch Validator

> **Status: Unfinished / experimental project**

Smart Pitch Validator is an early-stage AI-assisted hackathon practice application that takes a raw project idea and turns it into a more structured pitch aligned with relevant Sustainable Development Goals (SDGs).

Development was paused during an earlier project phase, so this repository should not be considered a finished product.

## What It Does

The intended workflow is:

1. Enter a project idea.
2. Send the idea to an AI-powered analysis backend.
3. Generate a polished one-sentence project hook.
4. Identify relevant SDG alignment.
5. Produce an innovation score.

## Tech Stack

- **Frontend:** React, Vite
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Backend:** Express.js
- **AI:** Google Gemini API
- **Configuration:** dotenv

## Current Status

This project is **unfinished**. It was created as a hackathon/practice experiment and development was paused before the application was taken to a final production-ready state.

The existing implementation is retained as a reference and can be resumed or expanded later.

## Local Development

Install dependencies:

```bash
npm install
```

Configure a Gemini API key in `.env`:

```env
GEMINI_API_KEY=your_actual_key_here
```

Run the backend:

```bash
npm start
```

Run the frontend in a second terminal:

```bash
npm run dev
```

Or run both together:

```bash
npm run dev:all
```

## Future Direction

If development resumes, the project could be expanded with stronger pitch evaluation, structured feedback, additional scoring criteria, improved error handling, and a more complete hackathon idea validation workflow.
