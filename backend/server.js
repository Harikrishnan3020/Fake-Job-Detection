import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import { JSDOM } from "jsdom";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 5000;

// Configure your Hugging Face model here
const HF_MODEL_ID = process.env.HF_MODEL_ID || "roberta-base"; // ideally your fine-tuned fake-job detector
// Use the new Hugging Face router endpoint (api-inference.huggingface.co is deprecated)
const HF_API_URL = `https://router.huggingface.co/models/${HF_MODEL_ID}`;
const HF_API_KEY = process.env.HF_API_KEY || "";

// Resolve portfolio static directory (../portfolio relative to this file)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORTFOLIO_DIR = path.join(__dirname, "..", "portfolio");
const DASHBOARD_DIR = path.join(__dirname, "..", "ai-job-detector");

app.use(cors());
app.use(express.json({ limit: "1mb" }));

// Serve portfolio static site from the backend
app.use(express.static(PORTFOLIO_DIR));

// Serve AI dashboard assets from ai-job-detector folder
app.use("/ai-job-detector", express.static(DASHBOARD_DIR));

// Default route serves the portfolio index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(PORTFOLIO_DIR, "index.html"));
});

function generateSignals(text, verdict) {
  const t = (text || "").toLowerCase();
  const signals = [];

  if (/whatsapp|telegram|signal/.test(t)) {
    signals.push({
      type: "warning",
      text: "Job asks to continue conversation over <strong>WhatsApp/Telegram</strong>, which is a common scam pattern.",
    });
  }

  if (/gift card|crypto|bitcoin|wire transfer|western union/.test(t)) {
    signals.push({
      type: "warning",
      text: "Mentions of <strong>gift cards, crypto, or wire transfers</strong> are strong fraud indicators.",
    });
  }

  if (/no experience required|no skills needed|work from home/i.test(text || "")) {
    signals.push({
      type: "keyword",
      text: "Phrases like <strong>no experience required</strong> often appear in misleading job ads.",
    });
  }

  const salaryMatch = text.match(/\$\s?([0-9]{3,6})/);
  if (salaryMatch) {
    const amount = parseInt(salaryMatch[1], 10);
    if (amount && amount > 1000 && /per day|daily|a day/i.test(text)) {
      signals.push({
        type: "salary",
        text: "Unusually high <strong>daily salary</strong> for unspecified work can indicate a scam.",
      });
    }
  }

  if (/gmail\.com|outlook\.com|yahoo\.com/.test(t)) {
    signals.push({
      type: "email",
      text: "Uses a <strong>personal email domain</strong> instead of an official company address.",
    });
  }

  if (signals.length === 0) {
    signals.push({
      type: "info",
      text: "No obvious textual red flags detected. Still verify company details independently.",
    });
  }

  return signals.slice(0, 5);
}

// Fallback, rule-based classifier used when Hugging Face
// is unavailable or returns an unexpected response.
function classifyLocally(text) {
  const t = (text || "").toLowerCase();

  let fraudScore = 0;
  if (/no experience required|no skills needed|work from home/.test(t)) {
    fraudScore += 0.2;
  }
  if (/gift card|crypto|bitcoin|wire transfer|western union/.test(t)) {
    fraudScore += 0.3;
  }
  if (/whatsapp|telegram|signal/.test(t)) {
    fraudScore += 0.3;
  }
  if (/gmail\.com|outlook\.com|yahoo\.com/.test(t)) {
    fraudScore += 0.2;
  }

  fraudScore = Math.max(0, Math.min(1, fraudScore));

  const isFraud = fraudScore >= 0.45;
  const verdict = isFraud ? "fraud" : "safe";

  const confidence = Math.round((isFraud ? fraudScore : 1 - fraudScore) * 100) || 70;
  const baseRisk = Math.round(fraudScore * 100);
  const riskScore = isFraud
    ? Math.min(99, Math.max(50, baseRisk || 70))
    : Math.max(5, Math.min(35, baseRisk || 10));

  const signals = generateSignals(text, verdict);

  const summary = isFraud
    ? "This job posting shows multiple heuristic indicators of a potential scam."
    : "This job posting appears mostly legitimate based on heuristic checks, but you should still verify details independently.";

  return { verdict, confidence, riskScore, signals, summary };
}

// High-risk classification used when the job URL itself
// looks suspicious or cannot be reached (e.g. DNS failure).
function classifyUrlFallback(url, reason) {
  let host = url;
  try {
    host = new URL(url).hostname;
  } catch {
    // keep raw url as host label
  }

  // Run our heuristic classifier on the URL text itself so we can
  // pick up patterns like "work-from-home", large salaries, etc.
  const base = classifyLocally(String(url || ""));

  const summary =
    base.verdict === "fraud"
      ? "This job URL could not be reached and the address plus wording look consistent with known scam patterns."
      : "This job URL could not be reached. Even if the wording looks normal, treat this listing as high risk unless you can verify it from the official company site.";

  const extraSignals = [
    {
      type: "warning",
      text: "Job URL could not be reached or resolved (DNS / network error).",
    },
    {
      type: "warning",
      text: `Domain appears unusual for a legitimate employer: <strong>${host}</strong>. Verify this address from the official company website.`,
    },
  ];

  return {
    verdict: "fraud",
    confidence: Math.max(base.confidence || 80, 80),
    riskScore: Math.max(base.riskScore || 90, 90),
    signals: [...extraSignals, ...(base.signals || [])],
    summary,
  };
}

async function extractTextFromUrl(jobUrl) {
  const url = jobUrl.trim();
  try {
    const res = await fetch(url);
    if (!res.ok) {
      const err = new Error("Unable to fetch content from the URL.");
      err.type = "URL_FETCH_FAILED";
      err.url = url;
      err.status = res.status;
      throw err;
    }
    const html = await res.text();
    const dom = new JSDOM(html);
    const bodyText = dom.window.document.body.textContent || "";
    const content = bodyText.trim();
    if (!content) {
      const err = new Error("Could not extract meaningful text from the URL.");
      err.type = "URL_FETCH_FAILED";
      err.url = url;
      throw err;
    }
    return content;
  } catch (e) {
    if (e && e.type === "URL_FETCH_FAILED") {
      throw e;
    }
    const err = new Error("Unable to fetch content from the URL.");
    err.type = "URL_FETCH_FAILED";
    err.url = url;
    err.cause = e;
    throw err;
  }
}

// Prefer the local Python risk engine (FastAPI in model-training/api_server.py)
// if it is running on localhost:8080. Falls back to HF / heuristics otherwise.
async function classifyWithRiskEngine(text, url) {
  const payload = {
    text,
    language: "auto",
    url: url || null,
    recruiter_email: null,
    annual_salary: null,
  };

  const response = await fetch("http://localhost:8080/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Risk engine HTTP error ${response.status}`);
  }

  const data = await response.json();

  const rawRisk = typeof data.overall_risk_score === "number" ? data.overall_risk_score : 0;
  const riskPercent = Math.round(Math.max(0, Math.min(1, rawRisk)) * 100);

  let verdict;
  if (data.verdict === "high_risk") verdict = "fraud";
  else if (data.verdict === "safe") verdict = "safe";
  else verdict = "fraud"; // treat "review" as suspicious

  const confidence = riskPercent;
  const riskScore = riskPercent;

  const components = Array.isArray(data.components) ? data.components : [];
  const signals = components.map((c) => {
    let type = "info";
    if (c.name === "salary") type = "salary";
    else if (c.name === "phishing") type = "warning";
    else if (c.name === "keywords" || c.name === "xlmr_text") type = "keyword";
    return {
      type,
      text: c.explanation || "",
    };
  });

  let summary;
  if (data.verdict === "high_risk") {
    summary = "Model predicts this posting as high risk based on multiple signals.";
  } else if (data.verdict === "review") {
    summary = "Model recommends manual review; some risk factors were detected.";
  } else {
    summary = "Model predicts this posting as likely legitimate with no strong fraud signals.";
  }

  return { verdict, confidence, riskScore, signals, summary };
}

async function classifyText(content, url) {
  let text = (content || "").trim();
  if (!text) {
    throw new Error("No job content provided.");
  }
  if (text.length > 4000) {
    text = text.substring(0, 4000);
  }
  try {
    // First, try the local Python risk engine if available.
    return await classifyWithRiskEngine(text, url);
  } catch (riskErr) {
    console.error("Risk engine call failed, falling back", riskErr);
  }

  // If there is no HF_API_KEY configured, skip remote inference
  // and fall back to a heuristic classifier.
  if (!HF_API_KEY) {
    return classifyLocally(text);
  }

  try {
    const response = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${HF_API_KEY}`,
      },
      body: JSON.stringify({ inputs: text }),
    });

    let data;
    try {
      data = await response.json();
    } catch (parseErr) {
      throw new Error("Unexpected response from Hugging Face inference API.");
    }

    if (!response.ok || data.error) {
      const message = data.error || `Hugging Face API error: ${response.status}`;
      throw new Error(message);
    }

    const preds = Array.isArray(data)
      ? (Array.isArray(data[0]) ? data[0] : data)
      : [];

    const top = preds[0] || { label: "unknown", score: 0.5 };
    const label = String(top.label || "").toLowerCase();
    const score = typeof top.score === "number" ? top.score : 0.5;

    const isFraud = /fake|fraud|scam|spam|malicious/.test(label) || label === "1";
    const verdict = isFraud ? "fraud" : "safe";

    const confidence = Math.round(score * 100);
    const riskScore = isFraud
      ? Math.min(99, Math.max(50, Math.round(50 + score * 49)))
      : Math.max(5, Math.min(35, Math.round((1 - score) * 30 + 5)));

    const signals = generateSignals(text, verdict);

    const summary = isFraud
      ? "This job posting shows multiple indicators of a potential scam."
      : "This job posting appears mostly legitimate, with no strong fraud signals detected.";

    return { verdict, confidence, riskScore, signals, summary };
  } catch (err) {
    console.error("HF inference failed, falling back to heuristic classifier", err);
    return classifyLocally(text);
  }
}

app.post("/analyze", async (req, res) => {
  try {
    const { text, url } = req.body || {};
    const content = (text || "").trim();
    const urlTrimmed = url && typeof url === "string" ? url.trim() : "";

    if (!content && !urlTrimmed) {
      return res.status(400).json({ error: "No job content found. Provide text or a valid URL." });
    }

    const primaryText = content || urlTrimmed;

    const result = await classifyText(primaryText, urlTrimmed || null);
    res.json(result);
  } catch (err) {
    console.error("/analyze error", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Fake job backend listening on port ${PORT}`);
});
