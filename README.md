# AI Fake Job Detection Platform

A full-stack AI cybersecurity project that detects fraudulent job postings using natural language processing and modern deep learning models. The platform analyzes job descriptions and job URLs to generate a fraud risk score, readable risk signals, and clear safe/suspicious verdicts.

This repository contains:
- A React-based AI job detector interface
- A Node/Express backend API for URL fetching and model inference
- A RoBERTa-based model training pipeline using Hugging Face
- A standalone portfolio website showcasing the project

---

## 1. High-Level Overview

**Goal:** Help job seekers avoid recruitment scams by automatically scanning job descriptions and job posting URLs, then flagging potentially fake or risky jobs.

**Core capabilities:**
- Classify job postings as **safe** or **fraud/suspicious**
- Accept both **raw job text** and **job posting URLs**
- Extract web page content server-side for URL inputs
- Generate a **fraud risk score** and detailed **risk signals** (keywords, salary anomalies, email domains, etc.)
- Provide an **explainable AI** interface suitable for portfolio and real-world demos

---

## 2. Project Structure

- `ai-job-detector/`
  - React component (`ai-job-detector.jsx`) for the interactive AI detector UI
- `backend/`
  - Node/Express server exposing an `/analyze` endpoint
  - Handles URL fetching, HTML parsing, and Hugging Face model inference
- `model-training/`
  - Python training script to fine-tune a RoBERTa model for fake job detection
  - Example CSV format for labeled datasets
- `portfolio/`
  - Static portfolio website showcasing the project, workflow, features, and impact

---

## 3. Technology Stack

### Frontend (AI Job Detector UI)
- **React / JSX** UI component (modern SPA-style job scanner)
- **Modern CSS** with:
  - Dark `AI cybersecurity` visual theme
  - Electric blue / cyan / purple accents
  - Green for safe verdicts, red for fraud warnings
- Animated risk gauge, verdict cards, historical analysis table

### Backend API
- **Node.js + Express** REST API
- **jsdom** and **node-fetch** for:
  - Fetching job posting web pages
  - Extracting readable text from HTML
- Central `/analyze` endpoint that takes `{ text, url }` and returns:
  ```json
  {
    "verdict": "safe" | "fraud",
    "confidence": 0-100,
    "riskScore": 0-100,
    "signals": [ { "type": string, "text": string } ],
    "summary": string
  }
  ```

### AI / ML Layer
- **RoBERTa-base** (Hugging Face Transformers) as the backbone
- Fine-tuned classifier for **fake vs real job postings**
- Integration via **Hugging Face Inference API** using an HF model ID, e.g.:
  - `your-username/roberta-fake-job-detector`

### Model Training
- **Python 3 + Transformers + Datasets + scikit-learn**
- Training script:
  - Loads `train.csv` and `valid.csv`
  - Tokenizes using RoBERTa tokenizer
  - Fine-tunes a sequence classification head
  - Evaluates with accuracy and macro-F1
  - Optionally pushes the best model to Hugging Face Hub

### Portfolio Website
- Static **HTML + CSS** landing page in `portfolio/`
- Sections: Hero, Problem, Solution, System Workflow, Tech Stack, Key Features, Demo, Impact, Future Enhancements, Footer
- Designed as a professional AI product-style portfolio page

---

## 4. Running the Backend (API Server)

1. Go to the backend folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables (example for PowerShell on Windows):
   ```powershell
   $env:HF_API_KEY = "your_huggingface_token_here"
   $env:HF_MODEL_ID = "your-username/roberta-fake-job-detector"  # fine-tuned model ID
   ```

4. Start the server:
   ```bash
   npm start
   ```

The backend will listen on `http://localhost:5000/analyze` and expect a JSON body:

```json
{
  "text": "optional job description text",
  "url": "optional job posting URL"
}
```

If only `url` is provided, the backend will fetch the web page, extract text, and then run the model.

---

## 5. Using the AI Job Detector UI

The core UI is implemented in:
- `ai-job-detector/ai-job-detector.jsx`

You can integrate this file into a React project as the main `App` component or as a dedicated route:

1. Create or open a React app (Vite, CRA, etc.).
2. Copy the contents of `ai-job-detector.jsx` into your `src/App.jsx` (or import it there).
3. Ensure React hooks import is present at the top:
   ```js
   import React, { useState, useEffect, useRef } from "react";
   ```
4. Run your React dev server (e.g. `npm start` or `npm run dev`).

With the backend running on `localhost:5000`, the UI will:
- Accept a job description or job URL
- Call `/analyze`
- Display verdict, confidence, risk score, and risk signals
- Log each analysis in a history table

---

## 6. Training the RoBERTa Model

All training utilities live in `model-training/`.

### Folder contents
- `model-training/train_roberta_fake_jobs.py`  
  Training script for a RoBERTa-based fake job classifier.
- `model-training/data/example_train.csv`  
  Example of the expected CSV format.

### Dataset Format

Create two CSV files inside `model-training/data/`:
- `train.csv`
- `valid.csv`

Each with columns:
```csv
text,label
"Full job description here",0
"Suspicious job posting here",1
```

Where:
- `label = 0` → real / legitimate job
- `label = 1` → fake / scam job

### Install dependencies and run training

From `model-training/`:
```bash
pip install transformers datasets accelerate scikit-learn huggingface_hub
```

Update `HUB_MODEL_ID` in `train_roberta_fake_jobs.py` to your desired HF repo, then run:

```bash
python train_roberta_fake_jobs.py
```

The script will:
- Fine-tune RoBERTa on your dataset
- Report accuracy and macro-F1 on the validation set
- Push the best model to Hugging Face Hub (if configured)

Use that model ID in the backend via `HF_MODEL_ID`.

---

## 7. Portfolio Website

The portfolio landing page is in:
- `portfolio/index.html`
- `portfolio/styles.css`

Open `portfolio/index.html` in a browser (or serve the folder statically) to show:
- A dark, AI-themed hero section
- Problem, solution, workflow, and architecture
- Tech stack and key features
- Demo previews of the platform UI
- Impact and future enhancements

This page is ideal for sharing the project in a portfolio, presentation, or project report.

---

## 8. Possible Extensions

- Deploy backend and UI to a cloud platform (Render, Railway, Vercel, etc.)
- Package the analyzer as a **browser extension** for automatic scanning on job sites
- Add **multi-language support** and region-specific models
- Integrate with popular job boards and ATS systems via webhooks or APIs

---

## 9. Contact

For questions, improvements, or collaboration:
- Email: `your.email@example.com`
- GitHub: *link to your profile or repository here*

Feel free to fork this project, adapt it to new datasets, or extend it to other scam detection scenarios.
