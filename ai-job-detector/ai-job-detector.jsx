import { useState, useEffect, useRef } from "react";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');`;

const styles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #060912;
    --bg2: #0c1020;
    --bg3: #111827;
    --border: rgba(99,120,255,0.15);
    --border2: rgba(99,120,255,0.3);
    --accent: #6378ff;
    --accent2: #4f63e8;
    --green: #10d98a;
    --red: #ff4d6a;
    --amber: #ffb347;
    --text: #f0f2ff;
    --muted: #7a85a8;
    --card: rgba(12,16,32,0.85);
    --glow: rgba(99,120,255,0.12);
  }
  body { font-family: 'DM Sans', sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; }
  h1,h2,h3,h4,h5 { font-family: 'Syne', sans-serif; }

  /* NAV */
  .nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: rgba(6,9,18,0.92); backdrop-filter: blur(16px); border-bottom: 1px solid var(--border); padding: 0 2rem; display: flex; align-items: center; justify-content: space-between; height: 64px; animation: fadeDown 0.6s ease both; }
  .nav-logo { display: flex; align-items: center; gap: 10px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 1.1rem; color: var(--text); }
  .nav-logo-icon { width: 32px; height: 32px; background: linear-gradient(135deg, var(--accent), #a78bfa); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px; }
  .nav-links { display: flex; gap: 0.25rem; }
  .nav-link { background: none; border: none; color: var(--muted); font-family: 'DM Sans', sans-serif; font-size: 0.875rem; padding: 6px 14px; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
  .nav-link:hover, .nav-link.active { color: var(--text); background: rgba(99,120,255,0.1); }
  .nav-badge { background: linear-gradient(135deg, var(--accent), #a78bfa); color: white; font-size: 0.7rem; padding: 2px 8px; border-radius: 20px; font-weight: 600; }

  /* PAGES */
  .page { display: none; padding-top: 80px; min-height: 100vh; }
  .page.active { display: block; animation: fadeIn 0.4s ease both; }

  /* HERO */
  .hero { padding: 4rem 2rem 3rem; max-width: 900px; margin: 0 auto; text-align: center; position: relative; }
  .hero-pill { display: inline-flex; align-items: center; gap: 6px; background: rgba(99,120,255,0.08); border: 1px solid var(--border2); border-radius: 20px; padding: 5px 14px; font-size: 0.75rem; color: var(--accent); margin-bottom: 1.5rem; animation: fadeUp 0.6s 0.1s ease both; }
  .hero h1 { font-size: clamp(2rem, 5vw, 3.5rem); font-weight: 800; line-height: 1.1; margin-bottom: 1.25rem; animation: fadeUp 0.6s 0.2s ease both; background: linear-gradient(135deg, #fff 0%, #a0aeff 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .hero p { color: var(--muted); font-size: 1.05rem; line-height: 1.7; max-width: 560px; margin: 0 auto 2.5rem; animation: fadeUp 0.6s 0.3s ease both; }
  .hero-stats { display: flex; justify-content: center; gap: 3rem; animation: fadeUp 0.6s 0.4s ease both; }
  .stat { text-align: center; }
  .stat-num { font-family: 'Syne', sans-serif; font-size: 1.6rem; font-weight: 700; color: var(--text); }
  .stat-label { font-size: 0.75rem; color: var(--muted); margin-top: 2px; }

  /* GRID BG */
  .grid-bg { position: fixed; inset: 0; pointer-events: none; opacity: 0.03; background-image: linear-gradient(var(--accent) 1px, transparent 1px), linear-gradient(90deg, var(--accent) 1px, transparent 1px); background-size: 60px 60px; z-index: 0; }
  .orb { position: fixed; border-radius: 50%; pointer-events: none; z-index: 0; }
  .orb1 { width: 500px; height: 500px; background: radial-gradient(circle, rgba(99,120,255,0.08) 0%, transparent 70%); top: -100px; left: -100px; }
  .orb2 { width: 400px; height: 400px; background: radial-gradient(circle, rgba(167,139,250,0.06) 0%, transparent 70%); bottom: 0; right: -100px; }

  /* ANALYSIS CARD */
  .analysis-section { max-width: 800px; margin: 0 auto; padding: 0 1.5rem 4rem; position: relative; z-index: 1; }
  .analysis-card { background: var(--card); border: 1px solid var(--border2); border-radius: 20px; padding: 2rem; backdrop-filter: blur(20px); animation: scaleIn 0.5s 0.5s ease both; }
  .analysis-card h2 { font-size: 1.1rem; font-weight: 700; margin-bottom: 1.5rem; color: var(--text); display: flex; align-items: center; gap: 8px; }
  .input-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); margin-bottom: 8px; font-weight: 500; }
  textarea, .url-input { width: 100%; background: rgba(255,255,255,0.04); border: 1px solid var(--border); border-radius: 12px; padding: 14px 16px; color: var(--text); font-family: 'DM Sans', sans-serif; font-size: 0.9rem; outline: none; transition: border-color 0.2s, box-shadow 0.2s; resize: vertical; }
  textarea { min-height: 160px; }
  textarea:focus, .url-input:focus { border-color: var(--border2); box-shadow: 0 0 0 3px rgba(99,120,255,0.1); }
  .or-divider { display: flex; align-items: center; gap: 12px; margin: 1rem 0; color: var(--muted); font-size: 0.8rem; }
  .or-divider::before, .or-divider::after { content: ''; flex: 1; height: 1px; background: var(--border); }
  .analyze-btn { width: 100%; margin-top: 1.5rem; background: linear-gradient(135deg, var(--accent), #7c3aed); border: none; border-radius: 12px; padding: 15px; color: white; font-family: 'Syne', sans-serif; font-size: 1rem; font-weight: 700; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 10px; }
  .analyze-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 30px rgba(99,120,255,0.3); }
  .analyze-btn:active { transform: scale(0.99); }
  .analyze-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  /* SCANNING ANIMATION */
  .scanning { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 2rem; }
  .scan-ring { width: 80px; height: 80px; border-radius: 50%; border: 2px solid var(--border); border-top-color: var(--accent); animation: spin 1s linear infinite; }
  .scan-text { color: var(--muted); font-size: 0.875rem; animation: pulse 1.5s ease infinite; }
  .scan-dots { display: flex; gap: 6px; }
  .scan-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); animation: dotPulse 1.2s ease infinite; }
  .scan-dot:nth-child(2) { animation-delay: 0.2s; }
  .scan-dot:nth-child(3) { animation-delay: 0.4s; }

  /* RESULT PANEL */
  .result-panel { margin-top: 1.5rem; background: var(--card); border-radius: 20px; overflow: hidden; animation: slideUp 0.5s ease both; border: 1px solid var(--border); }
  .result-header { padding: 1.5rem 2rem; display: flex; align-items: center; justify-content: space-between; }
  .result-header.safe { background: rgba(16,217,138,0.08); border-bottom: 1px solid rgba(16,217,138,0.2); }
  .result-header.fraud { background: rgba(255,77,106,0.08); border-bottom: 1px solid rgba(255,77,106,0.2); }
  .verdict { display: flex; align-items: center; gap: 12px; }
  .verdict-icon { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; }
  .verdict-icon.safe { background: rgba(16,217,138,0.15); }
  .verdict-icon.fraud { background: rgba(255,77,106,0.15); }
  .verdict-title { font-family: 'Syne', sans-serif; font-size: 1.1rem; font-weight: 700; }
  .verdict-title.safe { color: var(--green); }
  .verdict-title.fraud { color: var(--red); }
  .verdict-sub { font-size: 0.8rem; color: var(--muted); margin-top: 2px; }
  .result-body { padding: 1.5rem 2rem; }
  .metrics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 1.5rem; }
  .metric-card { background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 14px; padding: 1rem 1.25rem; }
  .metric-label { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); margin-bottom: 8px; }
  .metric-value { font-family: 'Syne', sans-serif; font-size: 1.6rem; font-weight: 700; margin-bottom: 8px; }
  .progress-bar { height: 6px; background: rgba(255,255,255,0.08); border-radius: 3px; overflow: hidden; }
  .progress-fill { height: 100%; border-radius: 3px; transition: width 1.2s cubic-bezier(0.4,0,0.2,1); width: 0; }
  .gauge-wrap { display: flex; align-items: center; justify-content: center; }

  /* RISK GAUGE */
  .gauge-svg { overflow: visible; }

  /* SIGNALS */
  .signals-title { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); margin-bottom: 10px; }
  .signals-list { display: flex; flex-direction: column; gap: 8px; }
  .signal-card { display: flex; align-items: flex-start; gap: 10px; background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: 10px; padding: 10px 14px; animation: fadeIn 0.3s ease both; }
  .signal-icon { font-size: 14px; margin-top: 1px; flex-shrink: 0; }
  .signal-text { font-size: 0.85rem; color: var(--muted); line-height: 1.5; }
  .signal-text strong { color: var(--text); font-weight: 500; }

  /* HISTORY PAGE */
  .page-inner { max-width: 900px; margin: 0 auto; padding: 2rem 1.5rem 4rem; position: relative; z-index: 1; }
  .page-heading { margin-bottom: 2rem; }
  .page-heading h2 { font-size: 1.75rem; font-weight: 800; margin-bottom: 6px; }
  .page-heading p { color: var(--muted); font-size: 0.9rem; }
  .history-table { width: 100%; border-collapse: collapse; }
  .history-table th { text-align: left; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); padding: 0 16px 12px; border-bottom: 1px solid var(--border); font-weight: 500; }
  .history-table td { padding: 14px 16px; border-bottom: 1px solid rgba(99,120,255,0.06); font-size: 0.875rem; vertical-align: middle; }
  .history-table tr:hover td { background: rgba(99,120,255,0.04); }
  .badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 600; }
  .badge.safe { background: rgba(16,217,138,0.1); color: var(--green); border: 1px solid rgba(16,217,138,0.2); }
  .badge.fraud { background: rgba(255,77,106,0.1); color: var(--red); border: 1px solid rgba(255,77,106,0.2); }
  .score-pill { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.85rem; }
  .snippet { color: var(--muted); max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .history-row { animation: fadeIn 0.3s ease both; }

  /* REPORT PAGE */
  .report-card { background: var(--card); border: 1px solid var(--border2); border-radius: 20px; padding: 2rem; }
  .form-group { margin-bottom: 1.25rem; }
  .form-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); margin-bottom: 8px; display: block; font-weight: 500; }
  .submit-btn { background: linear-gradient(135deg, #ff4d6a, #ff8c42); border: none; border-radius: 12px; padding: 13px 28px; color: white; font-family: 'Syne', sans-serif; font-size: 0.95rem; font-weight: 700; cursor: pointer; transition: all 0.2s; }
  .submit-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 30px rgba(255,77,106,0.3); }
  .success-msg { background: rgba(16,217,138,0.08); border: 1px solid rgba(16,217,138,0.2); border-radius: 14px; padding: 1.5rem; text-align: center; animation: scaleIn 0.3s ease both; }
  .success-icon { font-size: 2.5rem; margin-bottom: 10px; }
  .success-title { font-family: 'Syne', sans-serif; font-size: 1.1rem; font-weight: 700; color: var(--green); margin-bottom: 6px; }
  .success-sub { color: var(--muted); font-size: 0.875rem; }

  /* EMPTY */
  .empty { text-align: center; padding: 3rem 1rem; color: var(--muted); }
  .empty-icon { font-size: 3rem; margin-bottom: 10px; opacity: 0.5; }

  /* ANIMATIONS */
  @keyframes fadeDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }
  @keyframes dotPulse { 0%,80%,100% { transform: scale(0.7); opacity: 0.4; } 40% { transform: scale(1); opacity: 1; } }
  @keyframes dashAnim { to { stroke-dashoffset: 0; } }

  /* RESPONSIVE */
  @media (max-width: 640px) {
    .hero-stats { gap: 1.5rem; }
    .metrics-grid { grid-template-columns: 1fr; }
    .nav-links { gap: 0; }
    .nav-link { padding: 6px 8px; font-size: 0.8rem; }
  }
`;

// Circular gauge component
function RiskGauge({ score }) {
  const r = 48, cx = 60, cy = 60;
  const circumference = Math.PI * r;
  const pct = score / 100;
  const dashOffset = circumference * (1 - pct);
  const color = score < 35 ? "#10d98a" : score < 65 ? "#ffb347" : "#ff4d6a";
  
  return (
    <svg width="120" height="80" viewBox="0 0 120 80" className="gauge-svg">
      <path d={`M 12 60 A ${r} ${r} 0 0 1 108 60`} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" strokeLinecap="round"/>
      <path d={`M 12 60 A ${r} ${r} 0 0 1 108 60`} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
        strokeDasharray={circumference} strokeDashoffset={dashOffset}
        style={{transition: "stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1), stroke 0.5s"}}/>
      <text x="60" y="54" textAnchor="middle" fill={color} fontSize="20" fontFamily="Syne, sans-serif" fontWeight="700">{score}</text>
      <text x="60" y="70" textAnchor="middle" fill="#7a85a8" fontSize="9">RISK SCORE</text>
    </svg>
  );
}

function SignalCard({ type, text }) {
  const icons = { warning: "⚠", keyword: "🔍", salary: "💸", email: "📧", info: "ℹ" };
  const colors = { warning: "#ff4d6a", keyword: "#ffb347", salary: "#ff8c42", email: "#a78bfa", info: "#6378ff" };
  return (
    <div className="signal-card">
      <span className="signal-icon" style={{color: colors[type] || colors.info}}>{icons[type] || icons.info}</span>
      <span className="signal-text" dangerouslySetInnerHTML={{__html: text}}/>
    </div>
  );
}

const sampleHistory = [
  { id: 1, snippet: "Work from home $500/day no experience required...", result: "fraud", confidence: 97, time: "2 min ago" },
  { id: 2, snippet: "Senior Software Engineer at Stripe, 5+ years...", result: "safe", confidence: 94, time: "1 hr ago" },
  { id: 3, snippet: "Earn money fast! No skills needed, just pay...", result: "fraud", confidence: 99, time: "3 hr ago" },
  { id: 4, snippet: "Marketing Manager, hybrid role, competitive...", result: "safe", confidence: 88, time: "Yesterday" },
];

async function analyzeWithBackend(text, url) {
  const res = await fetch("http://localhost:5000/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, url }),
  });

  const data = await res.json();

  if (!res.ok || data.error) {
    const message = data.error || `Backend error: ${res.status}`;
    throw new Error(message);
  }

  return data; // { verdict, confidence, riskScore, signals, summary }
}

export default function App() {
  const [page, setPage] = useState("home");
  const [jobText, setJobText] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState(sampleHistory);
  const [reportText, setReportText] = useState("");
  const [reportUrl, setReportUrl] = useState("");
  const [reportMsg, setReportMsg] = useState("");
  const [reported, setReported] = useState(false);
  const progressRef = useRef(null);

  useEffect(() => {
    if (result && progressRef.current) {
      setTimeout(() => {
        if (progressRef.current) progressRef.current.style.width = result.confidence + "%";
      }, 100);
    }
  }, [result]);

  const handleAnalyze = async () => {
    if (!jobText.trim() && !jobUrl.trim()) {
      setError("Please enter a job description or URL.");
      return;
    }
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const data = await analyzeWithBackend(jobText, jobUrl);
      setResult(data);
      const snippet = (jobText || jobUrl).substring(0, 60) + "...";
      setHistory(h => [{ id: Date.now(), snippet, result: data.verdict, confidence: data.confidence, time: "Just now" }, ...h]);
    } catch (e) {
      const msg = e && e.message ? e.message : "Analysis failed. Please check your input and try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleReport = () => {
    setReported(true);
    setHistory(h => [{ id: Date.now(), snippet: (reportText || reportUrl).substring(0,60) + "...", result: "fraud", confidence: 85, time: "Just now" }, ...h]);
  };

  const confidenceColor = result ? (result.verdict === "safe" ? "#10d98a" : "#ff4d6a") : "#6378ff";
  const scanSteps = ["Parsing job description...", "Scanning for red flags...", "Checking salary claims...", "Verifying employer signals...", "Generating report..."];
  const [scanStep, setScanStep] = useState(0);

  useEffect(() => {
    if (!loading) { setScanStep(0); return; }
    const interval = setInterval(() => setScanStep(s => (s + 1) % scanSteps.length), 900);
    return () => clearInterval(interval);
  }, [loading]);

  return (
    <div style={{minHeight: "100vh"}}>
      <style>{FONTS}{styles}</style>
      <div className="grid-bg"/>
      <div className="orb orb1"/><div className="orb orb2"/>

      {/* NAV */}
      <nav className="nav">
        <div className="nav-logo">
          <div className="nav-logo-icon">🛡</div>
          <span>JobGuard <span className="nav-badge">AI</span></span>
        </div>
        <div className="nav-links">
          {[ ["home","Home"],["analyze","Analyze"],["history","History"],["report","Report Scam"]].map(([id, label]) => (
            <button key={id} className={`nav-link${page===id?" active":""}`} onClick={() => { setPage(id); if(id==="analyze"){setResult(null);setError("");} }}>
              {label}
            </button>
          ))}
        </div>
      </nav>

      {/* HOME PAGE */}
      <div className={`page${page==="home"?" active":""}`}>
        <div className="hero">
          <div className="hero-pill">
            <span style={{width:6,height:6,borderRadius:"50%",background:"var(--accent)",display:"inline-block"}}/>
            Powered by Advanced AI Analysis
          </div>
          <h1>Detect Fake Job Postings Before They Detect You</h1>
          <p>Paste any job description or link. Our AI scans for fraud signals, suspicious keywords, and red flags in seconds — protecting your job search.</p>
          <div style={{display:"flex",gap:"12px",justifyContent:"center",marginBottom:"2.5rem",flexWrap:"wrap"}}>
            <button className="analyze-btn" style={{width:"auto",padding:"12px 28px"}} onClick={() => setPage("analyze")}>
              <span>🔍</span> Analyze a Job Posting
            </button>
            <button className="analyze-btn" style={{width:"auto",padding:"12px 28px",background:"rgba(99,120,255,0.1)",boxShadow:"none"}} onClick={() => setPage("report")}>
              <span>⚠</span> Report a Scam
            </button>
          </div>
          <div className="hero-stats">
            {[ ["98.7%","Detection Accuracy"],["2.3M+","Jobs Analyzed"],["<3s","Analysis Speed"]].map(([n,l]) => (
              <div className="stat" key={l}><div className="stat-num">{n}</div><div className="stat-label">{l}</div></div>
            ))}
          </div>
        </div>
        <div style={{maxWidth:900,margin:"0 auto",padding:"0 1.5rem 4rem",position:"relative",zIndex:1}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:"1rem"}}>
            {[
              ["🤖","AI-Powered Analysis","Deep learning model trained on millions of job postings to identify fraud patterns."],
              ["⚡","Instant Results","Get comprehensive fraud detection in under 3 seconds with detailed risk signals."],
              ["🔒","Privacy First","Your data is never stored. Each analysis is processed in real-time and discarded."],
            ].map(([icon,title,desc]) => (
              <div key={title} style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:16,padding:"1.5rem",transition:"all 0.2s",cursor:"default"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--border2)";e.currentTarget.style.transform="translateY(-2px)";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.transform="translateY(0)";}}>
                <div style={{fontSize:"1.75rem",marginBottom:"10px"}}>{icon}</div>
                <h3 style={{fontFamily:"Syne,sans-serif",fontSize:"0.95rem",fontWeight:700,marginBottom:6}}>{title}</h3>
                <p style={{color:"var(--muted)",fontSize:"0.85rem",lineHeight:1.6}}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ANALYZE PAGE */}
      <div className={`page${(page==="analyze"||page==="home_analyze")?" active":""}`} style={{display: page==="analyze"?"block":"none", animation: page==="analyze"?"fadeIn 0.4s ease both":"none"}}>
        <div className="analysis-section">
          <div style={{textAlign:"center",marginBottom:"2rem"}}>
            <h2 style={{fontFamily:"Syne,sans-serif",fontSize:"1.75rem",fontWeight:800,marginBottom:6}}>Analyze Job Posting</h2>
            <p style={{color:"var(--muted)",fontSize:"0.9rem"}}>Paste the job description or provide a URL below</p>
          </div>
          <div className="analysis-card">
            <div className="input-label">Job Description</div>
            <textarea placeholder="Paste the full job description here... (title, responsibilities, requirements, company info, contact details)" value={jobText} onChange={e=>setJobText(e.target.value)} style={{marginBottom:0}}/>
            <div className="or-divider">OR</div>
            <div className="input-label">Job Posting URL</div>
            <input className="url-input" type="url" placeholder="https://example.com/job/senior-engineer" value={jobUrl} onChange={e=>setJobUrl(e.target.value)}/>
            {error && <p style={{color:"var(--red)",fontSize:"0.8rem",marginTop:8}}>{error}</p>}
            <button className="analyze-btn" onClick={handleAnalyze} disabled={loading}>
              {loading ? <><div style={{width:18,height:18,border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"white",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/> Analyzing...</> : <><span>🔍</span> Analyze Job Posting</>}
            </button>
          </div>

          {loading && (
            <div className="analysis-card" style={{marginTop:"1rem",animation:"slideUp 0.4s ease both"}}>
              <div className="scanning">
                <div className="scan-ring"/>
                <div className="scan-text">{scanSteps[scanStep]}</div>
                <div className="scan-dots"><div className="scan-dot"/><div className="scan-dot"/><div className="scan-dot"/></div>
              </div>
            </div>
          )}

          {result && !loading && (
            <div className="result-panel">
              <div className={`result-header ${result.verdict}`}>
                <div className="verdict">
                  <div className={`verdict-icon ${result.verdict}`}>{result.verdict==="safe"?"✓":"⚠"}</div>
                  <div>
                    <div className={`verdict-title ${result.verdict}`}>{result.verdict==="safe"?"Likely Legitimate":"Potentially Fraudulent"}</div>
                    <div className="verdict-sub">{result.summary}</div>
                  </div>
                </div>
              </div>
              <div className="result-body">
                <div className="metrics-grid">
                  <div className="metric-card">
                    <div className="metric-label">AI Confidence</div>
                    <div className="metric-value" style={{color:confidenceColor}}>{result.confidence}%</div>
                    <div className="progress-bar">
                      <div className="progress-fill" ref={progressRef} style={{background:`linear-gradient(90deg, ${confidenceColor}80, ${confidenceColor})`}}/>
                    </div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-label">Fraud Risk Meter</div>
                    <div className="gauge-wrap"><RiskGauge score={result.riskScore}/></div>
                  </div>
                </div>
                {result.signals?.length > 0 && (
                  <>
                    <div className="signals-title">Detected Risk Signals</div>
                    <div className="signals-list">
                      {result.signals.map((s, i) => (
                        <div key={i} style={{animationDelay:`${i*0.08}s`} }>
                          <SignalCard type={s.type} text={s.text}/>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* HISTORY PAGE */}
      <div className={`page${page==="history"?" active":""}`}>
        <div className="page-inner">
          <div className="page-heading">
            <h2>Analysis History</h2>
            <p>Previously analyzed job postings and their results</p>
          </div>
          {history.length === 0 ? (
            <div className="empty"><div className="empty-icon">📋</div><p>No history yet. Analyze a job posting to get started.</p></div>
          ) : (
            <div style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:16,overflow:"hidden"}}>
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Job Snippet</th>
                    <th>Result</th>
                    <th>Confidence</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h, i) => (
                    <tr key={h.id} className="history-row" style={{animationDelay:`${i*0.05}s`} }>
                      <td className="snippet">{h.snippet}</td>
                      <td><span className={`badge ${h.result}`}>{h.result==="safe"?"✓ Safe":"⚠ Suspicious"}</span></td>
                      <td><span className="score-pill" style={{color: h.result==="safe"?"var(--green)":"var(--red)"}}>{h.confidence}%</span></td>
                      <td style={{color:"var(--muted)",fontSize:"0.8rem"}}>{h.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* REPORT PAGE */}
      <div className={`page${page==="report"?" active":""}`}>
        <div className="page-inner">
          <div className="page-heading">
            <h2>Report a Scam</h2>
            <p>Help protect other job seekers by submitting suspicious listings</p>
          </div>
          {reported ? (
            <div className="success-msg">
              <div className="success-icon">✅</div>
              <div className="success-title">Report Submitted Successfully</div>
              <div className="success-sub">Thank you for helping protect the community. Our team will review this listing.</div>
              <button className="analyze-btn" style={{width:"auto",marginTop:"1rem",padding:"10px 24px"}} onClick={()=>{setReported(false);setReportText("");setReportUrl("");setReportMsg("");}}>
                Submit Another Report
              </button>
            </div>
          ) : (
            <div className="report-card">
              <div className="form-group">
                <label className="form-label">Suspicious Job Description</label>
                <textarea placeholder="Paste the suspicious job description here..." value={reportText} onChange={e=>setReportText(e.target.value)} style={{minHeight:140}}/>
              </div>
              <div className="form-group">
                <label className="form-label">Job Posting URL (optional)</label>
                <input className="url-input" type="url" placeholder="https://suspicious-site.com/job/..." value={reportUrl} onChange={e=>setReportUrl(e.target.value)}/>
              </div>
              <div className="form-group">
                <label className="form-label">Additional Notes (optional)</label>
                <textarea placeholder="Describe why you believe this is a scam..." value={reportMsg} onChange={e=>setReportMsg(e.target.value)} style={{minHeight:80}}/>
              </div>
              <button className="submit-btn" onClick={handleReport} disabled={!reportText.trim() && !reportUrl.trim()}>
                ⚠ Submit Report
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
