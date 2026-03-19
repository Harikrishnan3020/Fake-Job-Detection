# 🚀 Quick Setup Guide - Enhanced Features

## Files Modified/Created

### 📄 Updated Files
1. **README.md** - Now includes block diagram and feature overview
2. **portfolio/styles-enhanced.css** - New animated CSS with professional styling
3. **backend/enhancements.js** - Job recommendations & feedback system

### 📋 Documentation Added
- **ENHANCEMENTS.md** - Comprehensive feature guide
- **SETUP_GUIDE.md** - This file

---

## Installation Steps

### Step 1: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies (if not already done)
npm install

# The new enhancements.js contains the functions to add to server.js
```

### Step 2: Add New Routes to Backend

Open `backend/server.js` and add these routes before the final `app.listen()`:

```javascript
// Import the new functions from enhancements.js
import { 
  findJobRecommendations, 
  logFeedback, 
  getFeedbackStats,
  extractJobTitle,
  extractSalaryRange 
} from './enhancements.js';

// ============ NEW ROUTES ============

// Job Recommendations
app.post("/recommendations", (req, res) => {
  try {
    const { job_text, job_title, min_count = 3 } = req.body;
    
    if (!job_text && !job_title) {
      return res.status(400).json({
        error: "Please provide either job_text or job_title"
      });
    }
    
    const textToAnalyze = job_text || job_title;
    const recommendations = findJobRecommendations(textToAnalyze, min_count);
    
    return res.json({
      success: true,
      count: recommendations.length,
      recommendations
    });
  } catch (error) {
    console.error("Recommendations error:", error);
    return res.status(500).json({
      error: "Error generating recommendations",
      message: error.message
    });
  }
});

// User Feedback Logging
app.post("/feedback", (req, res) => {
  try {
    const { prediction, user_confirmation, job_text, confidence, risk_score, feedback_text } = req.body;
    
    if (!prediction || !user_confirmation) {
      return res.status(400).json({
        error: "prediction and user_confirmation are required"
      });
    }
    
    const logged = logFeedback(prediction, user_confirmation, job_text || "", {
      confidence,
      risk_score,
      feedback: feedback_text
    });
    
    return res.json({
      success: true,
      message: "Feedback recorded for model improvement",
      logged
    });
  } catch (error) {
    console.error("Feedback error:", error);
    return res.status(500).json({
      error: "Error processing feedback",
      message: error.message
    });
  }
});

// Model Performance Statistics
app.get("/stats", (req, res) => {
  try {
    const stats = getFeedbackStats();
    return res.json({
      success: true,
      model_performance: stats
    });
  } catch (error) {
    console.error("Stats error:", error);
    return res.status(500).json({
      error: "Error retrieving stats",
      message: error.message
    });
  }
});

// Enhanced /analyze endpoint with recommendations
// Update the existing /analyze endpoint to include recommendations:
// After the classification, add:
// const recommendations = findJobRecommendations(content, 3);
// return res.json({ ...result, recommendations });
```

### Step 3: Update Portfolio Styles

```bash
# Backup current styles
cp portfolio/styles.css portfolio/styles-backup.css

# Copy enhanced styles to replace
cp portfolio/styles-enhanced.css portfolio/styles.css
```

### Step 4: Test the Backend

```bash
# Start the server
npm start

# In another terminal, test the endpoints:

# Test fraud detection
curl -X POST http://localhost:5000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "text": "URGENT! Earn $5000 daily! No experience required. Send gift cards to get started."
  }'

# Test recommendations
curl -X POST http://localhost:5000/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "job_text": "Senior Python Engineer - $150k-200k/year, remote position"
  }'

# Test feedback logging
curl -X POST http://localhost:5000/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "prediction": {"verdict": "fraud", "confidence": 92},
    "user_confirmation": "correct",
    "job_text": "Test job posting",
    "feedback_text": "This was definitely a scam"
  }'

# Check model stats
curl http://localhost:5000/stats
```

---

## Feature Highlights

### ✅ Accuracy Confidence Scores
- Displays percentage confidence (0-100%)
- Based on ensemble of models
- Shows how certain the AI is about its prediction

**Example Response:**
```json
{
  "verdict": "fraud",
  "confidence": 92,
  "riskScore": 78,
  "accuracy": 85
}
```

### ✅ Job Recommendations
- Suggests legitimate alternatives
- Direct links to real job postings
- Match score for each recommendation
- Based on: title, salary, and skills

**Example Response:**
```json
{
  "recommendations": [
    {
      "title": "Senior Software Engineer",
      "company": "Google",
      "source": "linkedin",
      "url": "https://linkedin.com/jobs/...",
      "match_score": 95,
      "salary_range": "150k - 250k"
    }
  ]
}
```

### ✅ Self-Improving System
- Logs user feedback automatically
- Tracks prediction accuracy
- Monthly performance reporting
- Scheduled retraining

**Feedback Loop:**
```
User Analyzes Job → Feedback Provided → Logged to feedback_log.jsonl 
→ Monthly Analysis → Model Retraining → Accuracy Improves
```

### ✅ Enhanced Portfolio
- Smooth scroll animations
- Professional color scheme
- Responsive mobile design
- Attractive UI with hover effects
- Custom scrollbars
- Glowing effects and transitions

---

## API Documentation Summary

### POST /analyze
**Enhanced job fraud detection with recommendations**
```javascript
Request: { text, url }
Response: { verdict, confidence, riskScore, signals, summary, recommendations }
```

### POST /recommendations
**Get legitimate job suggestions**
```javascript
Request: { job_text, job_title, min_count }
Response: { count, recommendations: [{ title, company, url, match_score }] }
```

### POST /feedback
**Submit feedback for model improvement**
```javascript
Request: { prediction, user_confirmation, job_text, feedback_text }
Response: { success, message, logged }
```

### GET /stats
**View model performance statistics**
```javascript
Response: { model_performance: { total, accuracy, recent_records } }
```

---

## Configuration

### Environment Variables

Add to your `.env` file or system environment:

```bash
# Hugging Face Configuration
HF_API_KEY=your_huggingface_token_here
HF_MODEL_ID=your-username/roberta-fake-job-detector

# Server Configuration
PORT=5000
NODE_ENV=development

# Optional: Python Risk Engine
PYTHON_API_URL=http://localhost:8000
```

### Feedback Storage

Feedback is automatically logged to `./feedback_log.jsonl` in the backend directory.

To analyze feedback:
```bash
# Count total feedback entries
wc -l feedback_log.jsonl

# View last 10 entries
tail -10 feedback_log.jsonl

# Parse and analyze with jq (if installed)
cat feedback_log.jsonl | jq '.user_confirmation' | sort | uniq -c
```

---

## Testing Scenarios

### Scenario 1: Obvious Fraud Detection
```bash
curl -X POST http://localhost:5000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "text": "WORK FROM HOME! Earn $50,000 per month! No qualifications needed. Send payment via Western Union to confirm."
  }'
```

Expected: High confidence fraud prediction (90%+)

### Scenario 2: Legitimate Job with Recommendations
```bash
curl -X POST http://localhost:5000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Senior Full Stack Engineer. Tech company based in San Francisco. Salary: $140,000-$180,000. Must have 5+ years experience with React, Node.js, and AWS. Contact: careers@techcorp.com"
  }'
```

Expected: Low fraud prediction with legitimate job recommendations

### Scenario 3: Feedback Loop
```bash
# Step 1: Get a prediction
curl -X POST http://localhost:5000/analyze \
  -H "Content-Type: application/json" \
  -d '{"text":"Test job posting"}'

# Step 2: User provides feedback
curl -X POST http://localhost:5000/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "prediction": {"verdict":"fraud","confidence":85},
    "user_confirmation":"correct"
  }'

# Step 3: Check improved stats
curl http://localhost:5000/stats
```

---

## Troubleshooting

### Issue: "Cannot find module 'enhancements.js'"
**Solution:** Make sure you've saved `backend/enhancements.js` and the import path is correct

### Issue: Portfolio styles not loading
**Solution:** 
```bash
# Make sure you're serving the correct CSS file
# In server.js, ensure: app.use(express.static(PORTFOLIO_DIR));
```

### Issue: Recommendations endpoint returns empty array
**Solution:** Add more jobs to `LEGITIMATE_JOBS_DB` in `enhancements.js`

### Issue: Feedback not being logged
**Solution:** 
- Check that the backend has write permissions to the directory
- Verify `feedback_log.jsonl` is being created
- Check Docker permissions if running in container

---

## Performance Optimization

### Frontend Performance
- CSS animations use `transform` and `opacity` for smooth 60fps
- Scrollbars use native browser rendering
- Images lazy-loaded where applicable

### Backend Performance
- Feedback logged asynchronously
- Job matching uses simple scoring (O(n) complexity)
- Stats calculation cached where possible

### Database Performance
- Consider migrating from JSONL to proper database for production
- Add indexes on feedback timestamps
- Implement data retention policy

---

## Next Steps

1. ✅ Test all endpoints locally
2. ✅ Verify portfolio displays correctly
3. ✅ Collect initial feedback from users
4. ✅ Monitor model accuracy via `/stats`
5. ✅ Deploy to production server
6. ✅ Set up scheduled retraining
7. ✅ Integrate with job board APIs
8. ✅ A/B test UI changes

---

## Support

For issues or questions:
1. Check `ENHANCEMENTS.md` for detailed feature docs
2. Review test scenarios above
3. Check feedback logs: `cat feedback_log.jsonl`
4. Run diagnostics: `curl http://localhost:5000/stats`

---

**Happy detecting! Let's make job searching safer. 🛡️**
