require("dotenv").config();

const express = require("express");
const fs = require("fs");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ENABLE_LOCAL_FALLBACK = String(process.env.ENABLE_LOCAL_FALLBACK || "false").toLowerCase() === "true";
const MODEL_CANDIDATES = [
  process.env.GEMINI_MODEL,
  "gemini-2.0-flash",
  "gemini-1.5-flash-latest",
  "gemini-1.5-pro-latest",
].filter(Boolean);
const DIST_DIR = path.join(__dirname, "dist");
const DIST_INDEX = path.join(DIST_DIR, "index.html");

app.use(express.json({ limit: "1mb" }));
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
}

function extractJson(text) {
  const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  return JSON.parse(cleaned);
}

function buildLocalFallbackValidation(idea) {
  const normalized = String(idea || "").replace(/\s+/g, " ").trim();
  const shortIdea = normalized.length > 140 ? `${normalized.slice(0, 137)}...` : normalized;
  const lower = normalized.toLowerCase();

  const sdgRules = [
    { pattern: /health|clinic|medical|telemedicine|wellness|hospital/, sdg: "SDG 3: Good Health and Well-Being" },
    { pattern: /school|education|learning|student|teacher|literacy/, sdg: "SDG 4: Quality Education" },
    { pattern: /water|irrigation|sanitation|hygiene/, sdg: "SDG 6: Clean Water and Sanitation" },
    { pattern: /energy|solar|battery|electric|renewable/, sdg: "SDG 7: Affordable and Clean Energy" },
    { pattern: /jobs|workforce|small business|msme|employment/, sdg: "SDG 8: Decent Work and Economic Growth" },
    { pattern: /ai|iot|platform|infrastructure|automation|data/, sdg: "SDG 9: Industry, Innovation and Infrastructure" },
    { pattern: /inequality|inclusion|accessibility|women|rural|underserved/, sdg: "SDG 10: Reduced Inequalities" },
    { pattern: /city|urban|mobility|transport|housing/, sdg: "SDG 11: Sustainable Cities and Communities" },
    { pattern: /climate|carbon|emissions|sustainability|recycling|waste/, sdg: "SDG 13: Climate Action" },
    { pattern: /agri|farm|food|nutrition|crop/, sdg: "SDG 2: Zero Hunger" },
  ];

  const selected = [];
  for (const rule of sdgRules) {
    if (rule.pattern.test(lower) && !selected.includes(rule.sdg)) {
      selected.push(rule.sdg);
    }
    if (selected.length === 2) {
      break;
    }
  }

  const defaults = [
    "SDG 9: Industry, Innovation and Infrastructure",
    "SDG 8: Decent Work and Economic Growth",
    "SDG 10: Reduced Inequalities",
  ];
  while (selected.length < 2) {
    const candidate = defaults[selected.length];
    if (!selected.includes(candidate)) {
      selected.push(candidate);
    }
  }

  const wordCount = normalized ? normalized.split(" ").length : 0;
  const technicalMatches = (lower.match(/ai|ml|blockchain|hardware|sensor|api|platform|integration|automation|deep tech/g) || []).length;
  const impactMatches = (lower.match(/climate|health|education|farm|jobs|poverty|water|energy|inclusion/g) || []).length;
  const innovationScore = Math.max(1, Math.min(100, 45 + technicalMatches * 9 + impactMatches * 5 + Math.floor(wordCount / 8)));

  return {
    hook: `This solution turns ${shortIdea} into a credible, high-impact hackathon pitch with clear user value and scalable execution potential.`,
    sdgs: selected,
    innovationScore,
  };
}

async function generateWithModelFallback(genAI, prompt) {
  let lastError;

  for (const modelName of MODEL_CANDIDATES) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      lastError = error;

      // Try next candidate when model is not available in this API/account.
      if (error && error.status === 404) {
        continue;
      }

      throw error;
    }
  }

  throw lastError || new Error("No compatible Gemini model found.");
}

app.post("/api/validate", async (req, res) => {
  const idea = req.body?.idea?.trim();

  if (!idea) {
    return res.status(400).json({ error: "Please enter a project idea." });
  }

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: "Missing GEMINI_API_KEY in .env." });
  }

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

    const prompt = [
        "You are an expert startup mentor helping hackathon teams craft investor-ready pitches.",
      "Analyze this project idea and return only valid JSON with this exact shape:",
        '{"hook":"string","sdgs":["string","string"],"innovationScore":number}',
      "Rules:",
        "- hook must be exactly one sentence and sound professional.",
        "- sdgs must contain 1 to 2 Sustainable Development Goals as strings formatted like 'SDG X: Name'.",
        "- innovationScore must be an integer between 1 and 100.",
      "- Do not include markdown, explanations, or code fences.",
      "",
      `Project idea: ${idea}`,
    ].join("\n");

    const raw = await generateWithModelFallback(genAI, prompt);

    const parsed = extractJson(raw);

    const responsePayload = {
        hook: String(parsed.hook || "").trim(),
        sdgs: Array.isArray(parsed.sdgs) ? parsed.sdgs.slice(0, 2).map((s) => String(s).trim()) : [],
        innovationScore: Number(parsed.innovationScore),
    };

      if (!responsePayload.hook || responsePayload.sdgs.length < 1 || responsePayload.sdgs.length > 2 || !Number.isFinite(responsePayload.innovationScore)) {
      throw new Error("Model response format validation failed.");
    }

      responsePayload.innovationScore = Math.max(1, Math.min(100, Math.round(responsePayload.innovationScore)));

    return res.json(responsePayload);
  } catch (error) {
    console.error("Validation error:", error);

    if (error && error.status === 429) {
      if (ENABLE_LOCAL_FALLBACK) {
        return res.json({
          ...buildLocalFallbackValidation(idea),
          note: "Gemini quota exceeded, so this is a local fallback validation.",
        });
      }

      return res.status(429).json({
        error: "Gemini API quota exceeded for this key. Check quota/billing or try again later.",
      });
    }

    if (error && (error.status === 401 || error.status === 403)) {
      return res.status(401).json({
        error: "Gemini API key is invalid or lacks permission. Verify GEMINI_API_KEY.",
      });
    }

    if (error && error.status === 404) {
      return res.status(500).json({
        error: "No compatible Gemini model was available for this API key/project.",
      });
    }

    return res.status(500).json({ error: "Could not validate the idea right now. Please try again." });
  }
});

app.get("*", (req, res) => {
  if (fs.existsSync(DIST_INDEX)) {
    return res.sendFile(DIST_INDEX);
  }

  return res.status(404).send("Frontend build not found. Run npm run dev for local development or npm run build for production assets.");
});

const server = app.listen(PORT, () => {
  console.log(`Smart Pitch Validator API running at http://localhost:${PORT}`);
});

server.on("error", (error) => {
  if (error && error.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use.`);
    console.error("Stop the existing server process or run with a different port, e.g. PORT=3001 npm start");
    process.exit(1);
  }

  console.error("Server failed to start:", error);
  process.exit(1);
});
