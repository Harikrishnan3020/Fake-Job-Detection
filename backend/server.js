import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import { JSDOM } from "jsdom";

const app = express();
const PORT = process.env.PORT || 5000;

// Configure your Hugging Face model here
const HF_MODEL_ID = process.env.HF_MODEL_ID || "roberta-base"; // ideally your fine-tuned fake-job detector
const HF_API_URL = `https://api-inference.huggingface.co/models/${HF_MODEL_ID}`;
const HF_API_KEY = process.env.HF_API_KEY || "";

app.use(cors());
app.use(express.json({ limit: "1mb" }));

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

async function extractTextFromUrl(jobUrl) {
  const url = jobUrl.trim();
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Unable to fetch content from the URL.");
  }
  const html = await res.text();
  const dom = new JSDOM(html);
  const bodyText = dom.window.document.body.textContent || "";
  const content = bodyText.trim();
  if (!content) {
    throw new Error("Could not extract meaningful text from the URL.");
  }
  return content;
}

async function classifyText(content) {
  let text = (content || "").trim();
  if (!text) {
    throw new Error("No job content provided.");
  }
  if (text.length > 4000) {
    text = text.substring(0, 4000);
  }

  const response = await fetch(HF_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(HF_API_KEY ? { Authorization: `Bearer ${HF_API_KEY}` } : {}),
    },
    body: JSON.stringify({ inputs: text }),
  });

  const data = await response.json();

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
}

app.post("/analyze", async (req, res) => {
  try {
    const { text, url } = req.body || {};
    let content = (text || "").trim();

    if (!content && url && url.trim()) {
      content = await extractTextFromUrl(url);
    }

    if (!content) {
      return res.status(400).json({ error: "No job content found. Provide text or a valid URL." });
    }

    const result = await classifyText(content);
    res.json(result);
  } catch (err) {
    console.error("/analyze error", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Fake job backend listening on port ${PORT}`);
});
