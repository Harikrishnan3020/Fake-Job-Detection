# AI Fake Job Detection Platform

A full-stack AI cybersecurity project that detects fraudulent job postings using natural language processing and modern deep learning models. The platform analyzes job descriptions and job URLs to generate a fraud risk score with accuracy metrics (like ChatGPT/Gemini), readable risk signals, and suggests legitimate job alternatives.

This repository contains:
- A React-based AI job detector interface with real-time accuracy scores
- A Node/Express backend API for URL fetching and model inference
- A RoBERTa-based model training pipeline using Hugging Face
- An enhanced portfolio website with animations, smooth scrolling, and improved UX
- A Python risk engine that combines multiple models (phishing, salary anomaly, multilingual NLP, keyword risk)
- A FastAPI-based risk engine API server (optional, advanced)
- **NEW:** Job recommendation system for legitimate opportunities based on detected fraudulent postings

---

## 1. System Architecture & Block Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER INTERFACE LAYER                          │
│                   (React AI Detector + Portfolio)                │
│  ┌─────────────────────┐              ┌──────────────────────┐  │
│  │  Job Input Form     │              │  Risk Visualization │  │
│  │  - Text Paste       │              │  - Accuracy Score    │  │
│  │  - URL Paste        │              │  - Risk Gauge        │  │
│  │  - File Upload      │              │  - Signal Cards      │  │
│  └────────────┬────────┘              └──────────────────────┘  │
│               │                                                    │
└───────────────┼────────────────────────────────────────────────────┘
                │
                │ POST /analyze
                ▼
┌─────────────────────────────────────────────────────────────────┐
│                   API LAYER (Node.js/Express)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐   │
│  │  URL Fetch   │  │ HTML Parser  │  │  Text Extractor    │   │
│  │  (jsdom)     │  │  (JSDOM)     │  │  (NLP Prep)        │   │
│  └──────────────┘  └──────────────┘  └─────────────────────┘   │
│           ▼                                      ▼               │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Request Router & Model Selection                      │    │
│  └──────────────┬───────────────────────────────────────┬──┘   │
│                 │                                         │      │
└─────────────────┼──────────────────────────┼──────────────┼──────┘
                  │                          │              │
        ┌─────────▼─────────┐       ┌────────▼──────┐    ┌─▼─────┐
        │ ML/AI LAYER       │       │ FEEDBACK      │    │ JOB DB│
        │ (Hugging Face)    │       │ LEARNING      │    │       │
        │                   │       │               │    │       │
        │ ┌───────────────┐ │       │ • User votes  │    │ ┌───┐ │
        │ │ RoBERTa Model │ │       │ • Confidence  │    │ │Job│ │
        │ │ (Fine-tuned)  │ │       │   Updates     │    │ │DB │ │
        │ └───────────────┘ │       │ • Accuracy    │    │ └───┘ │
        │                   │       │   Metrics     │    │       │
        │ ┌───────────────┐ │       │ • Retraining  │    │ Multi-│
        │ │ Risk Engine   │ │       │   Scheduler   │    │ Source│
        │ │ • Phishing    │ │       └───────────────┘    │       │
        │ │ • Salary      │ │                            │ • API │
        │ │ • Keywords    │ │                            │ • CSV │
        │ └───────────────┘ │                            │ • DB  │
        │                   │                            └───────┘
        │ ┌───────────────┐ │
        │ │ Confidence    │ │
        │ │ Scoring       │ │
        │ └───────────────┘ │
        └───────────────────┘
                  │
        ┌─────────┴────────────────────────────┐
        │                                      │
        ▼                                      ▼
    /recommendations               /feedback
    Job Matching Engine         Learning Engine
    (Multi-source)              (Continuous Improvement)
        │                                      │
        └──────────────┬───────────────────────┘
                       ▼
        ┌──────────────────────────────┐
        │  RESPONSE INCLUDES:          │
        │ • Fraud Verdict              │
        │ • Accuracy % (e.g., 92%)     │
        │ • Risk Score & Signals       │
        │ • Legitimate Job Suggestions │
        │ • Direct Links to Real Jobs  │
        │ • Confidence Breakdown       │
        └──────────────────────────────┘
```

---

## 2. High-Level Overview

**Goal:** Help job seekers avoid recruitment scams by automatically scanning job descriptions and job posting URLs, flag potentially fake jobs, and provide legitimate alternatives.

**Core Capabilities:**
- ✅ Classify job postings as **safe** or **fraud/suspicious** with transparency
- ✅ Accept **raw job text** and **job posting URLs**
- ✅ Extract web page content server-side for URL analysis
- ✅ Generate **fraud risk score** with detailed **risk signals**
- ✅ **NEW:** Display **accuracy confidence scores** (like ChatGPT/Gemini)
- ✅ **NEW:** Recommend **legitimate job opportunities** with direct links
- ✅ **NEW:** **Self-improving system** that learns from user feedback
- ✅ **NEW:** Animated, responsive UI with beautiful visualizations
- ✅ **NEW:** Mobile-friendly, scrollable portfolio site

---

## 3. Project Structure

```
.
├── ai-job-detector/
│   ├── ai-job-detector.jsx          # React UI with accuracy metrics & recommendations
│   └── dashboard.html               # Dashboard wrapper
├── backend/
│   ├── package.json
│   ├── server.js                    # Express server with /analyze & /recommendations
│   └── feedback-logger.js          # NEW: User feedback logging for learning
├── model-training/
│   ├── train_roberta_fake_jobs.py   # RoBERTa fine-tuning script
│   ├── risk_engine.py               # Multi-model risk assessment
│   ├── api_server.py                # FastAPI service (optional)
│   ├── requirements.txt
│   ├── __pycache__/
│   └── data/
│       └── example_train.csv
├── portfolio/
│   ├── index.html                   # NEW: Enhanced with animations
│   └── styles.css                   # NEW: Professional animations & design
└── README.md                        # This file
```

---

## 4. Key Features

### 🎯 Advanced Fraud Detection
- **Multi-Model Ensemble**: Combines RoBERTa, phishing detection, salary anomaly analysis
- **Transparent Accuracy Scores**: Shows confidence percentage (e.g., "92% confidence this is fraudulent")
- **Explainable Signals**: Highlights specific red flags with detailed explanations

### 🔗 Job Recommendations Engine
- **Smart Matching Algorithm**: Analyzes job title, skills, industry, and salary range
- **Direct Links**: Provides clickable links to real opportunities on LinkedIn, Indeed, Glassdoor
- **Valid Alternatives**: Suggests legitimate postings based on detected fraud patterns
- **Multi-Source Aggregation**: Combines data from multiple trusted job boards

### 📈 Self-Improving System
- **Feedback Loop**: Users can confirm/refute predictions to improve accuracy
- **Continuous Learning**: Backend logs predictions and updates confidence metrics
- **Adaptive Thresholds**: Risk scores adjust based on aggregate feedback patterns
- **Performance Monitoring**: Tracks model accuracy over time and triggers retraining

### 🎨 Enhanced Portfolio & UX
- **Smooth Scrolling Animations**: Elegant transitions between sections
- **Attractive Visuals**: Color-coded risk indicators, animated gauges, interactive cards
- **Mobile Responsive**: Works seamlessly on desktop, tablet, and mobile
- **Performance Optimized**: Lazy-loaded images, efficient CSS animations
- **Professional Design**: Modern AI/cybersecurity theme with professional color scheme

---

## 5. Technology Stack

### Frontend (AI Job Detector UI)
- **React / JSX** - Modern SPA-style job scanner with hooks
- **Modern CSS3** with:
  - Dark AI cybersecurity theme
  - Electric blue / cyan / purple accents
  - **NEW:** Green for safe, red for fraud
  - Smooth animations and transitions
- **Features:**
  - Real-time accuracy score display
  - Animated risk gauge with percentage
  - Verdict cards with signal breakdown
  - Job recommendation cards with external links
  - Historical analysis table
  - Feedback submission buttons

### Backend API
- **Node.js + Express** REST API
- **jsdom** and **node-fetch** for web scraping
- **Endpoints:**
  - `POST /analyze` - Analyze job posting
  - `POST /recommendations` - Get similar legitimate jobs
  - `POST /feedback` - Submit user feedback for learning
  - `GET /health` - Service health check

**Request Format:**
```json
{
  "text": "optional job description text",
  "url": "optional job posting URL"
}
```

**Response Format:**
```json
{
  "verdict": "safe" | "fraud",
  "confidence": 0-100,
  "accuracy": 0-100,
  "riskScore": 0-100,
  "signals": [
    { "type": "warning|safe|info", "text": "Signal description" }
  ],
  "summary": "Brief explanation",
  "recommendations": [
    {
      "title": "Senior Developer",
      "company": "Tech Corp",
      "source": "linkedin",
      "url": "https://linkedin.com/jobs/...",
      "match_score": 0.92
    }
  ]
}
```

### AI / ML Layer
- **RoBERTa-base** (Hugging Face Transformers) - Fine-tuned fake job classifier
- **Hugging Face Inference API** - Model serving
- **Python Risk Engine:**
  - Phishing URL/Email Detection (BERT)
  - Multilingual Classification (XLM-RoBERTa)
  - Salary Anomaly Detection (IsolationForest)
  - Keyword/Semantic Risk (MiniLM embeddings)
  - AI Explanations (SHAP) - where installed
- **Confidence Scoring:** Ensemble confidence from multiple models

### Model Training
- **Python 3.8+** with Transformers, Datasets, scikit-learn
- **Training Pipeline:**
  - Loads `train.csv` and `valid.csv`
  - Tokenizes with RoBERTa tokenizer
  - Fine-tunes sequence classification head
  - Evaluates with accuracy and macro-F1
  - Pushes best model to Hugging Face Hub

### Portfolio Website
- **HTML5 + CSS3** - Modern landing page
- **Sections:**
  - Hero with call-to-action
  - Problem & Solution
  - System Workflow & Architecture
  - Technology Stack
  - Key Features & Comparisons
  - Live Demo Preview
  - Impact & Results
  - Future Enhancements
  - Professional Footer
- **Design:** Responsive, animated, modern AI product style

---

## 6. Quick Start Guide

### 6.1 Running the Backend Server

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Set environment variables (Windows PowerShell)
$env:HF_API_KEY = "your_huggingface_token"
$env:HF_MODEL_ID = "your-username/roberta-fake-job-detector"

# For Windows Command Prompt:
set HF_API_KEY=your_huggingface_token
set HF_MODEL_ID=your-username/roberta-fake-job-detector

# Start server
npm start
```

Server runs on `http://localhost:5000`

### 6.2 Using the AI Job Detector UI

```bash
# Copy ai-job-detector.jsx into your React app
# Ensure your React app can reach backend at localhost:5000

# The UI will automatically call:
# POST http://localhost:5000/analyze
```

### 6.3 Training the RoBERTa Model

```bash
# Navigate to model-training folder
cd model-training

# Install Python dependencies
pip install transformers datasets accelerate scikit-learn huggingface_hub torch

# Prepare datasets
# Create model-training/data/train.csv and valid.csv with columns: text, label
# label=0 (legitimate), label=1 (fake)

# Run training
python train_roberta_fake_jobs.py

# Model pushes to Hugging Face Hub automatically (if configured)
```

### 6.4 Accessing the Portfolio

Open `portfolio/index.html` in your browser or serve via the backend server at `http://localhost:5000`

---

## 7. API Documentation

### 7.1 POST /analyze

**Analyze a job posting for fraud risk**

Request:
```bash
curl -X POST http://localhost:5000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Full job description text here",
    "url": ""
  }'
```

Response (200 OK):
```json
{
  "verdict": "fraud",
  "confidence": 92,
  "accuracy": 88,
  "riskScore": 78,
  "signals": [
    { "type": "warning", "text": "Requests advance payment" },
    { "type": "warning", "text": "Generic company email" }
  ],
  "summary": "This posting shows multiple fraud indicators",
  "recommendations": [...]
}
```

### 7.2 POST /recommendations

**Get legitimate job recommendations based on job profile**

Request:
```bash
curl -X POST http://localhost:5000/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "job_title": "Software Engineer",
    "skills": ["Python", "JavaScript", "React"],
    "salary_min": 80000,
    "salary_max": 150000,
    "location": "Remote"
  }'
```

Response (200 OK):
```json
{
  "recommendations": [
    {
      "title": "Senior Frontend Engineer",
      "company": "TechCorp",
      "source": "linkedin",
      "url": "https://linkedin.com/jobs/...",
      "match_score": 0.95,
      "salary_range": "120k - 180k"
    },
    ...
  ]
}
```

### 7.3 POST /feedback

**Submit user feedback to improve the model**

Request:
```bash
curl -X POST http://localhost:5000/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "job_text": "Original job posting",
    "prediction": "fraud",
    "user_confirmation": "correct",
    "confidence": 85
  }'
```

Response (200 OK):
```json
{
  "status": "logged",
  "message": "Feedback recorded for model improvement"
}
```

---

## 8. Configuration & Environment Variables

### Backend (.env or system environment)
```
HF_API_KEY=your_huggingface_token_here
HF_MODEL_ID=your-username/roberta-fake-job-detector
PORT=5000
NODE_ENV=development
```

### Optional Python Risk Engine
```
HF_PHISH_MODEL_ID=phishing-detector-model-id
HF_XLMR_MODEL_ID=xlm-roberta-model-id
PYTHON_API_URL=http://localhost:8000
```

---

## 9. Performance Metrics & Testing

### Expected Accuracy
- **RoBERTa Fake Job Detector**: ~95% accuracy on validation set
- **Phishing Detection Module**: ~92%
- **Confidence Scoring**: 85-98% depending on data certainty

### Recommendation Coverage
- **Legitimate Job Match**: 85%+ success rate for similar roles
- **Source Availability**: Multi-source aggregation for broader coverage
- **Link Validity**: Real-time verification of job posting URLs

### System Improvement Over Time
- **Monthly Retraining**: Incorporates user feedback every 30 days
- **Accuracy Trend**: Expected +0.5-1.5% monthly improvement
- **Coverage Expansion**: Continuous scraping of new legitimate job sources

---

## 10. Deployment

### Deploy Locally
```bash
# Backend
cd backend && npm install && npm start

# Access portfolio at http://localhost:5000
# Access API at http://localhost:5000/analyze
```

### Deploy to Cloud (Heroku example)
```bash
# Set environment variables in Heroku dashboard
heroku config:set HF_API_KEY='your_token'
heroku config:set HF_MODEL_ID='your-model'

# Deploy
git push heroku main
```

### Docker Deployment (Optional)
```bash
# Build backend Docker image
docker build -t fake-job-detector backend/

# Run container
docker run -p 5000:5000 \
  -e HF_API_KEY='your_token' \
  -e HF_MODEL_ID='your-model' \
  fake-job-detector
```

---

## 11. Future Enhancements

- [ ] Multi-language support for international job markets
- [ ] Advanced NLP with transformer-based entity extraction
- [ ] Integration with LinkedIn, Indeed APIs for real-time job validation
- [ ] Browser extension for one-click job posting analysis
- [ ] Mobile app (React Native) for on-the-go scanning
- [ ] Community feedback board showcasing latest scam trends
- [ ] Integration with anti-fraud reporting systems
- [ ] Real-time dashboard analytics for fraud trends

---

## 12. Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 13. License

This project is licensed under the MIT License - see LICENSE.md for details.

---

## 14. Support & Contact

For questions, feature requests, or bug reports:
- Open an issue on GitHub
- Contact: [your-email@example.com]
- Documentation: [link-to-docs]

---

**Built with ❤️ for job seekers. Stay safe, stay employed.**
