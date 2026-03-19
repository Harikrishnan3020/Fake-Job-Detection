// Enhanced Backend with Job Recommendations and Feedback Learning
// Append these functions to your existing server.js file

import fs from "fs";

// ============================================================================
// JOB RECOMMENDATIONS ENGINE
// ============================================================================

// Sample legitimate job database (in production, connect to real job APIs)
const LEGITIMATE_JOBS_DB = [
  {
    id: 1,
    title: "Senior Software Engineer",
    company: "Google",
    source: "linkedin",
    url: "https://linkedin.com/jobs/senior-software-engineer-google",
    salary_min: 150000,
    salary_max: 250000,
    skills: ["Python", "JavaScript", "System Design", "Cloud Computing"],
    description: "Build scalable systems that impact billions of users."
  },
  {
    id: 2,
    title: "Full Stack Developer",
    company: "Microsoft",
    source: "indeed",
    url: "https://indeed.com/jobs/fullstack-developer-microsoft",
    salary_min: 120000,
    salary_max: 200000,
    skills: ["React", "Node.js", "TypeScript", "AWS"],
    description: "Work on cloud-native applications with cutting-edge tech stack."
  },
  {
    id: 3,
    title: "Data Science Engineer",
    company: "Meta",
    source: "linkedin",
    url: "https://linkedin.com/jobs/data-scientist-meta",
    salary_min: 140000,
    salary_max: 230000,
    skills: ["Python", "Machine Learning", "SQL", "Statistics"],
    description: "Apply ML to solve real-world problems affecting users worldwide."
  },
  {
    id: 4,
    title: "DevOps Engineer",
    company: "Amazon",
    source: "aws-jobs",
    url: "https://aws.amazon.com/careers/devops-engineer",
    salary_min: 130000,
    salary_max: 210000,
    skills: ["Kubernetes", "Docker", "AWS", "Linux", "Python"],
    description: "Manage infrastructure for the world's largest cloud platform."
  },
  {
    id: 5,
    title: "Frontend Engineer",
    company: "Apple",
    source: "apple-careers",
    url: "https://apple.com/careers/frontend-engineer",
    salary_min: 140000,
    salary_max: 220000,
    skills: ["Swift", "JavaScript", "React", "Web Technologies"],
    description: "Create experiences that delight millions of users every day."
  },
  {
    id: 6,
    title: "Machine Learning Engineer",
    company: "OpenAI",
    source: "openai-careers",
    url: "https://openai.com/careers/ml-engineer",
    salary_min: 160000,
    salary_max: 240000,
    skills: ["Python", "Deep Learning", "Transformers", "CUDA"],
    description: "Work on AI systems that are advancing human capabilities."
  }
];

// Extract job title from text
function extractJobTitle(text) {
  const titleMatch = text.match(/(?:job title|position|role|title)[\s:]*([^\n\r,]+)/i);
  if (titleMatch) {
    return titleMatch[1].trim();
  }
  
  // Look for common title patterns
  const titleKeywords = ["engineer", "developer", "scientist", "manager", "analyst", "designer", "architect"];
  const words = text.split(/\s+/).slice(0, 20);
  for (const word of words) {
    if (titleKeywords.some(k => word.toLowerCase().includes(k))) {
      return words.slice(Math.max(0, words.indexOf(word) - 1), words.indexOf(word) + 2).join(" ");
    }
  }
  
  return "Job Opportunity";
}

// Extract salary range from text
function extractSalaryRange(text) {
  const salaryMatch = text.match(/\$?\s?(\d{3,6})\s*[kKmM]?\s*-\s*\$?\s?(\d{3,6})\s*[kKmM]?/);
  if (salaryMatch) {
    const min = parseInt(salaryMatch[1]);
    const max = parseInt(salaryMatch[2]);
    
    // Normalize thousands notation
    if (salaryMatch[0].includes("k") || salaryMatch[0].includes("K")) {
      return { min: min * 1000, max: max * 1000 };
    }
    if (salaryMatch[0].includes("m") || salaryMatch[0].includes("M")) {
      return { min: min * 1000000, max: max * 1000000 };
    }
    return { min, max };
  }
  return null;
}

// Calculate match score between suspicious job and legitimate opportunities
function calculateMatchScore(suspiciousJob, legitimateJob) {
  let score = 0.5; // Base score
  
  // Title similarity
  const suspTitle = suspiciousJob.title?.toLowerCase() || "";
  const legTitle = legitimateJob.title?.toLowerCase() || "";
  if (suspTitle.includes("engineer") && legTitle.includes("engineer")) {
    score += 0.15;
  }
  if (suspTitle.includes("developer") && legTitle.includes("developer")) {
    score += 0.15;
  }
  if (suspTitle.includes("scientist") && legTitle.includes("scientist")) {
    score += 0.15;
  }
  
  // Salary range overlap
  if (suspiciousJob.salary && legitimateJob.salary_min) {
    const minOverlap = suspiciousJob.salary.min >= legitimateJob.salary_min * 0.8;
    const maxOverlap = suspiciousJob.salary.max <= legitimateJob.salary_max * 1.2;
    if (minOverlap && maxOverlap) {
      score += 0.2;
    }
  }
  
  // Skills match
  if (suspiciousJob.skills && legitimateJob.skills) {
    const matchingSkills = suspiciousJob.skills.filter(skill =>
      legitimateJob.skills.some(ls => ls.toLowerCase().includes(skill.toLowerCase()))
    );
    score += (matchingSkills.length / Math.max(1, suspiciousJob.skills.length)) * 0.2;
  }
  
  return Math.min(1.0, score);
}

// Find recommendations based on suspicious job analysis
function findJobRecommendations(suspiciousJobText, count = 3) {
  // Parse the suspicious job
  const suspiciousJob = {
    title: extractJobTitle(suspiciousJobText),
    salary: extractSalaryRange(suspiciousJobText),
    skills: extractSkills(suspiciousJobText),
    description: suspiciousJobText
  };
  
  // Calculate match scores
  const scored = LEGITIMATE_JOBS_DB.map(job => ({
    ...job,
    match_score: calculateMatchScore(suspiciousJob, job)
  }));
  
  // Sort by score and return top N
  return scored
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, count)
    .map(({ match_score, ...job }) => ({
      ...job,
      match_score: Math.round(match_score * 100)
    }));
}

// Extract skills from job text
function extractSkills(text) {
  const skillKeywords = [
    "python", "javascript", "java", "c++", "node.js", "react", "angular", "vue",
    "aws", "azure", "gcp", "kubernetes", "docker", "sql", "machine learning",
    "data science", "devops", "firebase", "mongodb", "typescript"
  ];
  
  const found = [];
  for (const skill of skillKeywords) {
    if (text.toLowerCase().includes(skill)) {
      found.push(skill.charAt(0).toUpperCase() + skill.slice(1));
    }
  }
  
  return found;
}

// ============================================================================
// FEEDBACK & LEARNING SYSTEM
// ============================================================================

const FEEDBACK_LOG_FILE = "./feedback_log.jsonl";

// Log user feedback for model improvement
function logFeedback(prediction, userConfirmation, jobText, config = {}) {
  const feedback = {
    timestamp: new Date().toISOString(),
    prediction,
    user_confirmation: userConfirmation, // "correct", "incorrect", or "unsure"
    job_text_length: jobText.length,
    confidence: config.confidence || null,
    risk_score: config.risk_score || null,
    verdict_was: prediction.verdict,
    user_feedback: config.feedback || null
  };
  
  // Append to feedback log
  try {
    fs.appendFileSync(FEEDBACK_LOG_FILE, JSON.stringify(feedback) + "\n");
    console.log("Feedback logged successfully");
  } catch (err) {
    console.error("Error logging feedback:", err);
  }
  
  return feedback;
}

// Get feedback statistics for model performance monitoring
function getFeedbackStats() {
  try {
    if (!fs.existsSync(FEEDBACK_LOG_FILE)) {
      return { total: 0, accuracy: 0, records: [] };
    }
    
    const data = fs.readFileSync(FEEDBACK_LOG_FILE, "utf-8");
    const records = data.trim().split("\n").map(line => JSON.parse(line));
    
    const correct = records.filter(r => r.user_confirmation === "correct").length;
    const accuracy = records.length > 0 ? (correct / records.length * 100).toFixed(2) : 0;
    
    return {
      total: records.length,
      accuracy,
      correct_predictions: correct,
      recent_records: records.slice(-10)
    };
  } catch (err) {
    console.error("Error reading feedback stats:", err);
    return { total: 0, accuracy: 0, records: [] };
  }
}

// ============================================================================
// Express Routes (Add these to your server.js)
// ============================================================================

/*
// Add these route handlers to your Express app:

// /recommendations endpoint - Get legitimate job suggestions
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

// /feedback endpoint - Submit user feedback for model improvement
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

// /stats endpoint - Get model performance statistics
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
app.post("/analyze", async (req, res) => {
  const { text, url } = req.body;

  if (!text && !url) {
    return res.status(400).json({
      error: "Please provide either text or url.",
    });
  }

  let content = text;
  if (url && !text) {
    try {
      content = await extractTextFromUrl(url);
    } catch (err) {
      if (err.type === "URL_FETCH_FAILED") {
        const fallback = classifyUrlFallback(url, err.message);
        return res.json(fallback);
      }
      return res.status(400).json({ error: err.message });
    }
  }

  try {
    const result = await classifyText(content, url);
    
    // Add job recommendations
    const recommendations = findJobRecommendations(content, 3);
    
    return res.json({
      ...result,
      recommendations
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: "Error analyzing job posting",
      message: err.message,
    });
  }
});
*/

// Export functions for use in main server.js
export {
  findJobRecommendations,
  extractJobTitle,
  extractSalaryRange,
  logFeedback,
  getFeedbackStats
};
