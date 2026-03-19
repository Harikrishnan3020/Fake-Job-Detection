# 🎯 API Reference Card - Quick Guide

## All Endpoints at a Glance

### 1. POST /analyze (Enhanced)
**Analyze job posting for fraud**
```bash
curl -X POST http://localhost:5000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Job posting text",
    "url": "Optional URL"
  }'
```

**Response:**
```json
{
  "verdict": "fraud|safe",
  "confidence": 92,
  "accuracy": 88,
  "riskScore": 78,
  "signals": [
    {"type": "warning", "text": "Description"}
  ],
  "summary": "Plain English explanation",
  "recommendations": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "source": "linkedin|indeed|glassdoor",
      "url": "https://...",
      "match_score": 95,
      "salary_range": "100k - 200k"
    }
  ]
}
```

---

### 2. POST /recommendations (NEW)
**Get legitimate job suggestions**
```bash
curl -X POST http://localhost:5000/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "job_text": "Full job description",
    "min_count": 3
  }'
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "recommendations": [
    {
      "id": 1,
      "title": "Senior Engineer",
      "company": "TechCorp",
      "source": "linkedin",
      "url": "https://...",
      "salary_min": 150000,
      "salary_max": 250000,
      "skills": ["Python", "JavaScript"],
      "match_score": 94
    }
  ]
}
```

---

### 3. POST /feedback (NEW)
**Submit feedback for model improvement**
```bash
curl -X POST http://localhost:5000/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "prediction": {
      "verdict": "fraud",
      "confidence": 90
    },
    "user_confirmation": "correct",
    "job_text": "Original job posting",
    "feedback_text": "Great detection!"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Feedback recorded for model improvement",
  "logged": {
    "timestamp": "2026-03-19T10:30:00Z",
    "prediction": {"verdict": "fraud", "confidence": 90},
    "user_confirmation": "correct"
  }
}
```

---

### 4. GET /stats (NEW)
**View model performance statistics**
```bash
curl http://localhost:5000/stats
```

**Response:**
```json
{
  "success": true,
  "model_performance": {
    "total": 1250,
    "accuracy": "94.2%",
    "correct_predictions": 1177,
    "recent_records": [
      {
        "timestamp": "2026-03-19T10:30:00Z",
        "prediction": {"verdict": "fraud", "confidence": 92},
        "user_confirmation": "correct"
      }
    ]
  }
}
```

---

## Feature Quick Reference

| Feature | Endpoint | Method |
|---------|----------|--------|
| Fraud Detection | /analyze | POST |
| Job Recommendations | /recommendations | POST |
| User Feedback | /feedback | POST |
| Model Stats | /stats | GET |

---

## Response Fields Explained

### verdict
- **"fraud"** = Posting appears to be fraudulent
- **"safe"** = Posting appears legitimate
- **"review"** = Manual review recommended

### confidence (0-100)
- Higher = More certain about prediction
- Used as accuracy confidence score
- Like ChatGPT/Gemini confidence

### accuracy (0-100)
- Historical model accuracy
- Based on validation dataset
- Updated monthly with feedback

### riskScore (0-100)
- 0-35 = Low risk (safe)
- 35-65 = Medium risk (review)
- 65-100 = High risk (fraud)

### signals
Array of detected indicators:
- **type**: "warning", "safe", "info", "salary", "email", "keyword"
- **text**: Human-readable explanation

### match_score (0-100)
- How similar to recommended job
- 90+ = Excellent match
- 70-90 = Good match
- <70 = Decent match

---

## Common Scenarios

### Scenario 1: Check Suspicious Job
```bash
curl -X POST http://localhost:5000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "text": "WORK FROM HOME! Easy money. No experience. Send $50 processing fee."
  }'
```

Expected: fraud verdict, ~95% confidence, recommendations included

---

### Scenario 2: User Confirms Prediction
```bash
# First, get prediction
RESULT=$(curl -X POST http://localhost:5000/analyze ...)

# Then, send feedback
curl -X POST http://localhost:5000/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "prediction": {"verdict": "fraud", "confidence": 92},
    "user_confirmation": "correct"
  }'
```

---

### Scenario 3: Monitor Model Improvement
```bash
# Check stats daily
curl http://localhost:5000/stats

# Expected output shows increasing accuracy over time
{
  "total": 1250,
  "accuracy": "94.2%",  # Should trend upward
  "correct_predictions": 1177
}
```

---

## Error Responses

### Missing Parameters
```json
{
  "error": "Please provide either text or url."
}
```

### Server Error
```json
{
  "error": "Error analyzing job posting",
  "message": "Detailed error message"
}
```

---

## Testing Commands

### Test 1: Basic Fraud Detection
```bash
curl -X POST http://localhost:5000/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "Free money! Western Union required!"}'
```

### Test 2: Safe Job
```bash
curl -X POST http://localhost:5000/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "Senior Engineer at Google. $200k-300k. Contact: careers@google.com"}'
```

### Test 3: Get Recommendations
```bash
curl -X POST http://localhost:5000/recommendations \
  -H "Content-Type: application/json" \
  -d '{"job_text": "Python Developer wanted. 5+ years experience."}'
```

### Test 4: Submit Feedback
```bash
curl -X POST http://localhost:5000/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "prediction": {"verdict": "fraud", "confidence": 85},
    "user_confirmation": "correct",
    "feedback_text": "Good detection"
  }'
```

### Test 5: Check Stats
```bash
curl http://localhost:5000/stats | jq .
```

---

## HTTP Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Result ready |
| 400 | Bad Request | Check parameters |
| 500 | Server Error | Check logs |

---

## Request Body Validation

### /analyze
```javascript
{
  text?: string (optional, max 4000 chars),
  url?: string (optional, valid URL)
}
// At least one of text or url required
```

### /recommendations
```javascript
{
  job_text?: string,
  job_title?: string,
  min_count?: number (default: 3, max: 10)
}
// At least one of job_text or job_title required
```

### /feedback
```javascript
{
  prediction: {
    verdict: "fraud" | "safe",
    confidence: number (0-100)
  },
  user_confirmation: "correct" | "incorrect" | "unsure",
  job_text?: string,
  feedback_text?: string
}
```

### /stats
```javascript
// No parameters, just GET request
```

---

## Response Time Averages

| Endpoint | Time | Notes |
|----------|------|-------|
| /analyze | 200-500ms | Includes ML inference |
| /recommendations | 50-100ms | Database lookup |
| /feedback | 10-20ms | File write |
| /stats | 50-200ms | File read & parse |

---

## Configuration Reference

### Environment Variables
```bash
HF_API_KEY=your_huggingface_token
HF_MODEL_ID=your-username/model-name
PORT=5000
NODE_ENV=development
```

### Data Files
```
feedback_log.jsonl    # Feedback storage (auto-created)
LEGITIMATE_JOBS_DB    # Job database (in enhancements.js)
```

---

## Integration Example (JavaScript/Node.js)

```javascript
// Analyze a job
const analysisResult = await fetch('http://localhost:5000/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: jobText })
}).then(r => r.json());

// Get recommendations
if (analysisResult.verdict === 'fraud') {
  const recommendations = await fetch('/recommendations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ job_text: jobText })
  }).then(r => r.json());
  console.log(recommendations.recommendations);
}

// Send feedback
await fetch('/feedback', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prediction: analysisResult,
    user_confirmation: 'correct'
  })
});
```

---

## Integration Example (React)

```jsx
function JobAnalyzer() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeJob = async (jobText) => {
    setLoading(true);
    const res = await fetch('http://localhost:5000/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: jobText })
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <div>
      <input onChange={(e) => analyzeJob(e.target.value)} />
      {loading && <p>Analyzing...</p>}
      {result && (
        <div>
          <p>Verdict: {result.verdict}</p>
          <p>Confidence: {result.confidence}%</p>
          {result.recommendations && (
            <ul>
              {result.recommendations.map(job => (
                <li key={job.id}>
                  {job.title} at {job.company} ({job.match_score}% match)
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
```

---

## Helpful Links

- **Full Documentation:** [ENHANCEMENTS.md](ENHANCEMENTS.md)
- **Setup Instructions:** [SETUP_GUIDE.md](SETUP_GUIDE.md)
- **Architecture:** [README.md](README.md#1-system-architecture--block-diagram)
- **Summary:** [ENHANCEMENT_SUMMARY.md](ENHANCEMENT_SUMMARY.md)

---

## Need Help?

1. **Understanding features** → Read ENHANCEMENTS.md
2. **Setting up** → Follow SETUP_GUIDE.md
3. **API details** → See this reference card
4. **Architecture** → Check block diagram in README.md
5. **Troubleshooting** → See SETUP_GUIDE.md troubleshooting section

---

**Keep this card handy for quick API reference! 📋**
