import { useState, useEffect, useRef } from "react";

// Futuristic fonts for headings and body
const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=DM+Sans:wght@300;400;500&display=swap');`;

// Global styling: dark animated gradient, glows, glassmorphism components
const styles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg-midnight: #0B0F1A;
    --bg-charcoal: #0A0A0A;
    --bg-indigo: #111827;
    --accent-blue: #3B82F6;
    --accent-violet: #8B5CF6;
    --accent-blue-soft: rgba(59,130,246,0.3);
    --accent-violet-soft: rgba(139,92,246,0.3);
    --safe: #22C55E;
    --danger: #EF4444;
    --text-primary: #F9FAFB;
    --text-muted: #9CA3AF;
    --card-glass: rgba(15,23,42,0.78);
    --border-subtle: rgba(148,163,184,0.35);
    --border-strong: rgba(148,163,184,0.6);
    --shadow-soft: 0 24px 80px rgba(15,23,42,0.85);
  }

  body { font-family: 'DM Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #020617; color: var(--text-primary); min-height: 100vh; }
  h1,h2,h3,h4,h5 { font-family: 'Space Grotesk', system-ui, sans-serif; }

  .app-root { position: relative; min-height: 100vh; color: var(--text-primary); overflow: hidden; }

  /* Animated background gradient with subtle movement */
  .bg-gradient {
    position: fixed;
    inset: 0;
    background: radial-gradient(circle at top left, rgba(59,130,246,0.18), transparent 55%),
                radial-gradient(circle at bottom right, rgba(139,92,246,0.16), transparent 60%),
                linear-gradient(135deg, var(--bg-midnight), var(--bg-charcoal) 45%, var(--bg-indigo));
    background-size: 140% 140%;
    animation: bgShift 26s ease-in-out infinite;
    z-index: 0;
  }

  /* Asymmetric orbs for depth */
  .bg-orb {
    position: fixed;
    border-radius: 999px;
    filter: blur(40px);
    opacity: 0.55;
    pointer-events: none;
    z-index: 0;
  }
  .bg-orb.blue {
    width: 520px; height: 520px;
    top: -160px; left: -80px;
    background: radial-gradient(circle, rgba(59,130,246,0.42), transparent 70%);
  }
  .bg-orb.violet {
    width: 420px; height: 420px;
    bottom: -120px; right: -40px;
    background: radial-gradient(circle, rgba(139,92,246,0.5), transparent 72%);
  }

  /* Fine grain / noise texture overlay */
  .bg-noise {
    position: fixed;
    inset: 0;
    pointer-events: none;
    opacity: 0.08;
    mix-blend-mode: soft-light;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 160 160' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='noStitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.48'/%3E%3C/svg%3E");
    z-index: 1;
  }

  /* Subtle grid to hint at AI system */
  .bg-grid {
    position: fixed;
    inset: 0;
    pointer-events: none;
    opacity: 0.06;
    background-image:
      linear-gradient(to right, rgba(148,163,184,0.25) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(148,163,184,0.23) 1px, transparent 1px);
    background-size: 80px 80px;
    mask-image: radial-gradient(circle at center, black 0%, transparent 70%);
    z-index: 1;
  }

  /* Top navigation used on all views */
  .top-nav {
    position: relative;
    z-index: 3;
    padding: 1rem 3.5rem;    
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .top-nav-left {
    display: flex;
    align-items: center;
    gap: 0.85rem;
  }
  .brand-mark {
    width: 40px; height: 40px;
    border-radius: 1.1rem;
    background: conic-gradient(from 160deg, var(--accent-blue), var(--accent-violet), #22d3ee, var(--accent-blue));
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 0 1px rgba(15,23,42,0.9), 0 0 40px rgba(59,130,246,0.5);
    font-size: 18px;
  }
  .brand-text-main {
    font-weight: 700;
    letter-spacing: 0.08em;
    font-size: 0.95rem;
    text-transform: uppercase;
  }
  .brand-text-sub {
    font-size: 0.78rem;
    color: var(--text-muted);
  }
  .top-nav-right {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    font-size: 0.85rem;
  }
  .top-pill {
    padding: 4px 10px;
    border-radius: 999px;
    border: 1px solid rgba(148,163,184,0.35);
    background: linear-gradient(135deg, rgba(15,23,42,0.8), rgba(15,23,42,0.5));
    color: var(--text-muted);
  }
  .ghost-link {
    border: none;
    background: transparent;
    color: var(--text-muted);
    font-size: 0.85rem;
    cursor: pointer;
    padding: 6px 10px;
    border-radius: 999px;
    transition: background 0.2s, color 0.2s;
  }
  .ghost-link:hover {
    background: rgba(15,23,42,0.7);
    color: var(--text-primary);
  }

  .primary-pill {
    border-radius: 999px;
    border: none;
    padding: 8px 18px;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    background-image: linear-gradient(135deg, var(--accent-blue), var(--accent-violet));
    color: #0B1120;
    box-shadow: 0 0 0 1px rgba(15,23,42,0.8), 0 14px 40px rgba(59,130,246,0.55);
    transition: transform 0.16s ease, box-shadow 0.16s ease, filter 0.16s ease;
  }
  .primary-pill:hover {
    transform: translateY(-1px) scale(1.02);
    filter: brightness(1.06);
    box-shadow: 0 20px 60px rgba(59,130,246,0.75);
  }
  .primary-pill:active {
    transform: translateY(0) scale(0.99);
  }

  /* Shared layout wrappers */
  .view-shell {
    position: relative;
    z-index: 2;
    padding: 1.5rem 3.5rem 3.5rem;
  }

  /* Landing hero */
  .hero-shell {
    max-width: 1120px;
    margin: 2.2rem auto 0;
    display: grid;
    grid-template-columns: minmax(0,1.25fr) minmax(0,1fr);
    gap: 3.2rem;
    align-items: center;
  }
  .hero-kicker {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    padding: 5px 12px;
    border-radius: 999px;
    border: 1px solid rgba(148,163,184,0.55);
    background: radial-gradient(circle at top left, rgba(59,130,246,0.35), transparent 60%),
                radial-gradient(circle at bottom right, rgba(139,92,246,0.4), transparent 70%),
                rgba(15,23,42,0.8);
    font-size: 0.72rem;
    color: var(--text-muted);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 1.4rem;
    animation: fadeUp 0.7s ease both;
  }
  .hero-kicker-dot {
    width: 7px; height: 7px;
    border-radius: 999px;
    background: radial-gradient(circle, #22c55e, transparent 70%);
    box-shadow: 0 0 18px rgba(34,197,94,0.7);
  }
  .hero-title {
    font-size: clamp(2.4rem, 4vw, 3.4rem);
    line-height: 1.03;
    margin-bottom: 1rem;
    background: linear-gradient(120deg, var(--accent-blue), var(--accent-violet));
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: fadeUp 0.8s 0.05s ease both;
  }
  .hero-body {
    font-size: 1rem;
    color: var(--text-muted);
    max-width: 520px;
    line-height: 1.7;
    margin-bottom: 1.9rem;
    animation: fadeUp 0.8s 0.12s ease both;
  }
  .hero-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    align-items: center;
    margin-bottom: 2.2rem;
    animation: fadeUp 0.8s 0.18s ease both;
  }
  .hero-secondary {
    border-radius: 999px;
    padding: 9px 18px;
    font-size: 0.85rem;
    font-weight: 500;
    border: 1px solid rgba(148,163,184,0.55);
    background: rgba(15,23,42,0.72);
    color: var(--text-primary);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    transition: background 0.2s, border-color 0.2s, transform 0.16s;
  }
  .hero-secondary span.icon { opacity: 0.7; }
  .hero-secondary:hover {
    background: rgba(15,23,42,0.95);
    border-color: rgba(148,163,184,0.9);
    transform: translateY(-1px);
  }

  .hero-metadata {
    display: flex;
    flex-wrap: wrap;
    gap: 1.7rem;
    font-size: 0.78rem;
    color: var(--text-muted);
  }
  .hero-meta-item label {
    text-transform: uppercase;
    letter-spacing: 0.18em;
    font-size: 0.68rem;
    display: block;
    margin-bottom: 4px;
  }
  .hero-meta-item strong {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.95rem;
  }

  /* Right side hero visual: floating cards & mesh */
  .hero-visual {
    position: relative;
    min-height: 320px;
  }
  .hero-mesh {
    position: absolute;
    inset: 0;
    border-radius: 1.75rem;
    background: radial-gradient(circle at 10% 0%, rgba(59,130,246,0. 3), transparent 60%),
                radial-gradient(circle at 90% 100%, rgba(139,92,246,0.45), transparent 70%),
                linear-gradient(145deg, rgba(15,23,42,0.9), rgba(15,23,42,0.5));
    border: 1px solid rgba(148,163,184,0.45);
    backdrop-filter: blur(30px);
    overflow: hidden;
    box-shadow: var(--shadow-soft);
    mask-image: radial-gradient(circle at top left, black 0%, black 78%, transparent 100%);
  }
  .hero-mesh-lines {
    position: absolute;
    inset: 0;
    background-image:
      radial-gradient(circle at 10% 20%, rgba(59,130,246,0.3), transparent 55%),
      linear-gradient(to right, rgba(148,163,184,0.16) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(148,163,184,0.16) 1px, transparent 1px);
    background-size: auto, 34px 34px, 34px 34px;
    mix-blend-mode: screen;
    opacity: 0.75;
  }
  .hero-floating-card {
    position: absolute;
    right: 15%; top: 14%;
    padding: 1rem 1.1rem;
    border-radius: 1rem;
    background: rgba(15,23,42,0.96);
    border: 1px solid rgba(148,163,184,0.55);
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    width: 220px;
    animation: floatY 6s ease-in-out infinite;
  }
  .hero-floating-card h3 {
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: var(--text-muted);
  }
  .hero-floating-card strong {
    font-size: 1.4rem;
  }
  .hero-mini-tag {
    font-size: 0.68rem;
    padding: 2px 7px;
    border-radius: 999px;
    background: rgba(15,23,42,0.9);
    border: 1px solid rgba(148,163,184,0.7);
  }
  .hero-badge-strip {
    position: absolute;
    left: 10%; bottom: 10%;
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    padding: 7px 12px;
    border-radius: 999px;
    background: rgba(15,23,42,0.92);
    border: 1px solid rgba(148,163,184,0.55);
    font-size: 0.7rem;
    color: var(--text-muted);
    animation: floatY 7s 0.7s ease-in-out infinite;
  }

  /* AUTH / LOGIN VIEW */
  .auth-shell {
    max-width: 1120px;
    margin: 2.8rem auto 0;
    display: grid;
    grid-template-columns: minmax(0,1.1fr) minmax(0,0.9fr);
    gap: 2.6rem;
    align-items: stretch;
  }
  .auth-visual {
    position: relative;
    border-radius: 1.8rem;
    padding: 1.6rem 1.8rem;
    background: radial-gradient(circle at 0% 0%, rgba(59,130,246,0.4), transparent 55%),
                radial-gradient(circle at 100% 100%, rgba(139,92,246,0.55), transparent 60%),
                linear-gradient(145deg, rgba(15,23,42,0.96), rgba(15,23,42,0.75));
    border: 1px solid rgba(148,163,184,0.5);
    backdrop-filter: blur(30px);
    box-shadow: var(--shadow-soft);
    overflow: hidden;
  }
  .auth-visual-title {
    font-size: 1.45rem;
    margin-bottom: 0.6rem;
  }
  .auth-visual-sub {
    font-size: 0.9rem;
    color: var(--text-muted);
    max-width: 360px;
  }
  .auth-wave {
    position: absolute;
    inset: auto -40%;
    bottom: -60%;
    height: 260px;
    background: radial-gradient(circle at 0 0, rgba(59,130,246,0.45), transparent 70%),
                radial-gradient(circle at 100% 0, rgba(56,189,248,0.5), transparent 70%),
                radial-gradient(circle at 50% 100%, rgba(139,92,246,0.5), transparent 70%);
    opacity: 0.45;
    filter: blur(32px);
    animation: meshDrift 30s ease-in-out infinite alternate;
  }
  .auth-metric-row {
    display: flex;
    gap: 1.1rem;
    margin-top: 1.6rem;
    font-size: 0.8rem;
  }
  .auth-metric-card {
    flex: 1;
    padding: 0.9rem 1rem;
    border-radius: 1rem;
    background: rgba(15,23,42,0.9);
    border: 1px solid rgba(148,163,184,0.6);
  }
  .auth-metric-card label {
    display: block;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    color: var(--text-muted);
    margin-bottom: 4px;
  }
  .auth-metric-card strong {
    font-size: 1.1rem;
  }

  .auth-card {
    border-radius: 1.8rem;
    padding: 2rem 2.1rem 2.1rem;
    background: radial-gradient(circle at top, rgba(59,130,246,0.32), transparent 60%),
                radial-gradient(circle at bottom, rgba(139,92,246,0.34), transparent 60%),
                rgba(15,23,42,0.95);
    border: 1px solid rgba(148,163,184,0.7);
    box-shadow: var(--shadow-soft);
    backdrop-filter: blur(26px);
  }
  .auth-tag {
    font-size: 0.7rem;
    padding: 2px 9px;
    border-radius: 999px;
    background: rgba(15,23,42,0.8);
    border: 1px solid rgba(148,163,184,0.7);
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    margin-bottom: 0.8rem;
  }
  .auth-heading {
    font-size: 1.4rem;
    margin-bottom: 0.35rem;
  }
  .auth-sub {
    font-size: 0.88rem;
    color: var(--text-muted);
    margin-bottom: 1.4rem;
  }
  .field-label {
    font-size: 0.74rem;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--text-muted);
    margin-bottom: 0.4rem;
  }
  .text-field {
    width: 100%;
    border-radius: 0.9rem;
    border: 1px solid rgba(148,163,184,0.55);
    background: rgba(15,23,42,0.9);
    color: var(--text-primary);
    font-size: 0.88rem;
    padding: 0.7rem 0.9rem;
    outline: none;
    transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
  }
  .text-field:focus {
    border-color: var(--accent-blue);
    box-shadow: 0 0 0 1px rgba(59,130,246,0.75), 0 0 28px rgba(59,130,246,0.45);
    background: rgba(15,23,42,0.98);
  }
  .field-row {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    margin-bottom: 1rem;
  }
  .auth-footer-row {
    margin-top: 0.8rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.8rem;
    color: var(--text-muted);
  }
  .link-ghost {
    border: none;
    background: none;
    color: var(--accent-blue);
    font-size: 0.8rem;
    cursor: pointer;
  }
  .auth-error {
    color: var(--danger);
    font-size: 0.78rem;
    margin-top: 0.45rem;
  }

  .auth-button {
    margin-top: 0.4rem;
    width: 100%;
    padding: 0.8rem 1rem;
    border-radius: 999px;
    border: none;
    background-image: linear-gradient(135deg, var(--accent-blue), var(--accent-violet));
    color: #0B1120;
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.55rem;
    box-shadow: 0 15px 45px rgba(59,130,246,0.8);
    transition: transform 0.16s ease, box-shadow 0.16s ease, filter 0.16s ease;
  }
  .auth-button:hover { transform: translateY(-1px) scale(1.01); filter: brightness(1.05); }
  .auth-button:active { transform: translateY(0) scale(0.985); }
  .auth-button[disabled] { opacity: 0.65; cursor: not-allowed; box-shadow: none; }

  .auth-spinner {
    width: 16px; height: 16px;
    border-radius: 999px;
    border: 2px solid rgba(15,23,42,0.6);
    border-top-color: rgba(15,23,42,0.02);
    border-right-color: rgba(15,23,42,0.02);
    border-bottom-color: rgba(15,23,42,0.8);
    animation: spin 0.9s linear infinite;
  }

  /* DASHBOARD */
  .dashboard-shell {
    max-width: 1200px;
    margin: 1.4rem auto 0;
    display: grid;
    grid-template-columns: 240px minmax(0,1fr);
    gap: 1.8rem;
    align-items: flex-start;
  }
  .sidebar {
    border-radius: 1.6rem;
    padding: 1.4rem 1.1rem;
    background: rgba(15,23,42,0.9);
    border: 1px solid rgba(148,163,184,0.55);
    box-shadow: 0 20px 60px rgba(15,23,42,0.9);
    backdrop-filter: blur(24px);
  }
  .sidebar-label {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    color: var(--text-muted);
    margin-bottom: 0.9rem;
  }
  .sidebar-list {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }
  .sidebar-item {
    border-radius: 0.9rem;
    padding: 0.55rem 0.7rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.86rem;
    color: var(--text-muted);
    cursor: pointer;
    border: 1px solid transparent;
    transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease;
  }
  .sidebar-item span.icon { font-size: 1.05rem; }
  .sidebar-item:hover {
    background: rgba(15,23,42,0.96);
    border-color: rgba(148,163,184,0.6);
    color: var(--text-primary);
  }
  .sidebar-item.active {
    background: radial-gradient(circle at 0 0, rgba(59,130,246,0.32), transparent 70%),
                radial-gradient(circle at 100% 100%, rgba(139,92,246,0.42), transparent 70%),
                rgba(15,23,42,0.96);
    border-color: rgba(59,130,246,0.9);
    color: var(--text-primary);
    box-shadow: 0 12px 40px rgba(59,130,246,0.7);
    transform: translateY(-1px);
  }
  .sidebar-indicator {
    width: 6px; height: 6px;
    border-radius: 999px;
    background: radial-gradient(circle, var(--accent-blue), transparent 60%);
    box-shadow: 0 0 12px rgba(59,130,246,0.8);
  }

  .sidebar-footer {
    margin-top: 1.6rem;
    padding-top: 1rem;
    border-top: 1px dashed rgba(148,163,184,0.4);
    font-size: 0.72rem;
    color: var(--text-muted);
  }

  .dashboard-main {
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
  }
  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }
  .dashboard-header h2 {
    font-size: 1.35rem;
    margin-bottom: 0.2rem;
  }
  .dashboard-header p {
    font-size: 0.86rem;
    color: var(--text-muted);
  }
  .dashboard-badge {
    font-size: 0.7rem;
    padding: 3px 9px;
    border-radius: 999px;
    background: rgba(15,23,42,0.9);
    border: 1px solid rgba(148,163,184,0.7);
  }

  .card-glass {
    border-radius: 1.4rem;
    padding: 1.45rem 1.5rem 1.6rem;
    background: radial-gradient(circle at top left, rgba(59,130,246,0.28), transparent 60%),
                radial-gradient(circle at bottom right, rgba(139,92,246,0.3), transparent 60%),
                rgba(15,23,42,0.96);
    border: 1px solid rgba(148,163,184,0.7);
    box-shadow: var(--shadow-soft);
    backdrop-filter: blur(26px);
  }

  .card-title-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  .card-title-row h3 {
    font-size: 0.98rem;
  }
  .card-subtitle {
    font-size: 0.8rem;
    color: var(--text-muted);
  }

  /* Form styles reused in dashboard */
  .section-label {
    font-size: 0.74rem;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    color: var(--text-muted);
    margin-bottom: 0.4rem;
  }
  textarea, .url-input {
    width: 100%;
    border-radius: 0.9rem;
    border: 1px solid rgba(148,163,184,0.55);
    background: rgba(15,23,42,0.9);
    color: var(--text-primary);
    font-size: 0.86rem;
    padding: 0.75rem 0.9rem;
    outline: none;
    resize: vertical;
    min-height: 150px;
    transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
  }
  textarea:focus, .url-input:focus {
    border-color: var(--accent-blue);
    box-shadow: 0 0 0 1px rgba(59,130,246,0.7), 0 0 30px rgba(59,130,246,0.45);
    background: rgba(15,23,42,0.98);
  }
  .url-input {
    min-height: auto;
  }
  .or-divider {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    font-size: 0.76rem;
    color: var(--text-muted);
    margin: 1rem 0;
  }
  .or-divider::before, .or-divider::after {
    content: "";
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(148,163,184,0.7), transparent);
  }

  .analyze-btn {
    width: 100%;
    margin-top: 1.2rem;
    padding: 0.85rem 1rem;
    border-radius: 999px;
    border: none;
    background-image: linear-gradient(135deg, var(--accent-blue), var(--accent-violet));
    color: #020617;
    font-weight: 600;
    font-size: 0.94rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    box-shadow: 0 14px 45px rgba(59,130,246,0.85);
    transition: transform 0.16s ease, box-shadow 0.16s ease, filter 0.16s ease;
  }
  .analyze-btn:hover { transform: translateY(-1px) scale(1.01); filter: brightness(1.04); }
  .analyze-btn:active { transform: translateY(0) scale(0.985); }
  .analyze-btn:disabled { opacity: 0.65; cursor: not-allowed; box-shadow: none; }

  .btn-spinner-small {
    width: 16px; height: 16px;
    border-radius: 999px;
    border: 2px solid rgba(15,23,42,0.6);
    border-top-color: rgba(15,23,42,0.05);
    border-right-color: rgba(15,23,42,0.05);
    border-bottom-color: rgba(15,23,42,0.95);
    animation: spin 0.9s linear infinite;
  }

  /* Scanning state */
  .scan-panel {
    margin-top: 1rem;
    border-radius: 1.3rem;
    padding: 1.6rem 1.4rem;
    background: rgba(15,23,42,0.95);
    border: 1px solid rgba(148,163,184,0.7);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.7rem;
    animation: slideUp 0.4s ease both;
  }
  .scan-ring {
    width: 82px; height: 82px;
    border-radius: 999px;
    border: 2px solid rgba(148,163,184,0.5);
    border-top-color: var(--accent-blue);
    border-right-color: var(--accent-violet);
    animation: spin 1.1s linear infinite;
  }
  .scan-text {
    font-size: 0.86rem;
    color: var(--text-muted);
    animation: pulse 1.4s ease-in-out infinite;
  }
  .scan-dots {
    display: flex;
    gap: 0.35rem;
  }
  .scan-dot {
    width: 6px; height: 6px;
    border-radius: 999px;
    background: radial-gradient(circle, var(--accent-blue), transparent 60%);
    opacity: 0.6;
    animation: dotPulse 1.4s ease-in-out infinite;
  }
  .scan-dot:nth-child(2) { animation-delay: 0.18s; }
  .scan-dot:nth-child(3) { animation-delay: 0.36s; }

  /* Result panel */
  .result-panel {
    margin-top: 1.4rem;
    border-radius: 1.4rem;
    overflow: hidden;
    background: rgba(15,23,42,0.98);
    border: 1px solid rgba(148,163,184,0.75);
    box-shadow: 0 20px 70px rgba(15,23,42,0.95);
    animation: slideUp 0.45s ease both;
  }
  .result-header {
    padding: 1.4rem 1.7rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .result-header.safe {
    background: radial-gradient(circle at 0 0, rgba(34,197,94,0.16), transparent 70%), rgba(15,23,42,0.98);
    border-bottom: 1px solid rgba(34,197,94,0.45);
  }
  .result-header.fraud {
    background: radial-gradient(circle at 100% 0, rgba(239,68,68,0.18), transparent 70%), rgba(15,23,42,0.98);
    border-bottom: 1px solid rgba(239,68,68,0.5);
  }
  .verdict {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  .verdict-icon {
    width: 44px; height: 44px;
    border-radius: 999px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.15rem;
  }
  .verdict-icon.safe { background: rgba(34,197,94,0.16); color: var(--safe); }
  .verdict-icon.fraud { background: rgba(239,68,68,0.18); color: var(--danger); }
  .verdict-title {
    font-size: 1.1rem;
    font-weight: 600;
  }
  .verdict-title.safe { color: var(--safe); }
  .verdict-title.fraud { color: var(--danger); }
  .verdict-sub {
    font-size: 0.8rem;
    color: var(--text-muted);
    margin-top: 3px;
    max-width: 420px;
  }
  .result-header-right {
    text-align: right;
  }
  .confidence-label {
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    color: var(--text-muted);
    margin-bottom: 3px;
  }
  .confidence-value {
    font-size: 1.5rem;
    font-weight: 700;
  }

  .result-body {
    padding: 1.5rem 1.7rem 1.6rem;
  }
  .metrics-grid {
    display: grid;
    grid-template-columns: minmax(0,1.1fr) minmax(0,1fr);
    gap: 1.1rem;
    margin-bottom: 1.5rem;
  }
  .metric-card {
    border-radius: 1rem;
    padding: 1rem 1.1rem 1.05rem;
    background: rgba(15,23,42,0.96);
    border: 1px solid rgba(148,163,184,0.6);
  }
  .metric-label {
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: var(--text-muted);
    margin-bottom: 0.35rem;
  }
  .metric-value {
    font-size: 1.6rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }
  .progress-bar {
    position: relative;
    height: 7px;
    border-radius: 999px;
    background: rgba(15,23,42,1);
    overflow: hidden;
  }
  .progress-track-glow {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 0 50%, rgba(59,130,246,0.35), transparent 60%);
    opacity: 0.7;
  }
  .progress-fill {
    position: relative;
    height: 100%;
    border-radius: inherit;
    width: 0;
    transition: width 1.2s cubic-bezier(0.4,0,0.2,1);
  }
  .gauge-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .signals-title {
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    color: var(--text-muted);
    margin-bottom: 0.5rem;
  }
  .signals-list {
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
  }
  .signal-card {
    display: flex;
    align-items: flex-start;
    gap: 0.55rem;
    border-radius: 0.8rem;
    padding: 0.65rem 0.75rem;
    background: rgba(15,23,42,0.96);
    border: 1px solid rgba(148,163,184,0.65);
    font-size: 0.84rem;
    color: var(--text-muted);
    animation: fadeIn 0.4s ease both;
  }
  .signal-icon {
    font-size: 0.9rem;
    margin-top: 1px;
    flex-shrink: 0;
  }
  .signal-text strong { color: var(--text-primary); font-weight: 500; }

  /* History table */
  .history-card {
    margin-top: 0.6rem;
  }
  .history-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.82rem;
  }
  .history-table th {
    text-align: left;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    color: var(--text-muted);
    padding: 0 0.8rem 0.7rem;
    border-bottom: 1px solid rgba(148,163,184,0.55);
  }
  .history-table td {
    padding: 0.65rem 0.8rem;
    border-bottom: 1px solid rgba(15,23,42,0.9);
    vertical-align: middle;
  }
  .snippet {
    max-width: 260px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--text-muted);
  }
  .badge-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    padding: 3px 9px;
    border-radius: 999px;
    font-size: 0.72rem;
    font-weight: 600;
  }
  .badge-pill.safe {
    background: rgba(34,197,94,0.12);
    color: var(--safe);
    border: 1px solid rgba(34,197,94,0.5);
  }
  .badge-pill.fraud {
    background: rgba(239,68,68,0.12);
    color: var(--danger);
    border: 1px solid rgba(239,68,68,0.6);
  }
  .score-pill {
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 700;
    font-size: 0.82rem;
  }
  .empty-state {
    text-align: center;
    padding: 2.4rem 1rem;
    color: var(--text-muted);
    font-size: 0.86rem;
  }
  .empty-icon {
    font-size: 2.4rem;
    margin-bottom: 0.6rem;
    opacity: 0.7;
  }

  /* Report scam */
  .report-card {
    margin-top: 0.6rem;
  }
  .form-group { margin-bottom: 1rem; }
  .submit-btn {
    padding: 0.78rem 1.3rem;
    border-radius: 999px;
    border: none;
    background-image: linear-gradient(135deg, var(--danger), #F97316);
    color: #FEF2F2;
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    box-shadow: 0 16px 50px rgba(239,68,68,0.85);
    transition: transform 0.16s ease, box-shadow 0.16s ease, filter 0.16s ease;
  }
  .submit-btn:hover { transform: translateY(-1px) scale(1.01); filter: brightness(1.03); }
  .submit-btn:active { transform: translateY(0) scale(0.985); }
  .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; box-shadow: none; }

  .success-msg {
    border-radius: 1.3rem;
    padding: 1.6rem 1.5rem 1.7rem;
    background: radial-gradient(circle at 0 0, rgba(34,197,94,0.16), transparent 70%), rgba(15,23,42,0.98);
    border: 1px solid rgba(34,197,94,0.6);
    text-align: center;
    animation: scaleIn 0.45s ease both;
  }
  .success-icon {
    font-size: 2.3rem;
    margin-bottom: 0.4rem;
  }
  .success-title {
    font-size: 1.05rem;
    font-weight: 600;
    color: var(--safe);
    margin-bottom: 0.2rem;
  }
  .success-sub {
    font-size: 0.85rem;
    color: var(--text-muted);
  }

  .error-text {
    color: var(--danger);
    font-size: 0.8rem;
    margin-top: 0.45rem;
  }

  /* Animations */
  @keyframes bgShift {
    0% { background-position: 0% 0%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 0%; }
  }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes scaleIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }
  @keyframes dotPulse { 0%,80%,100% { transform: scale(0.7); opacity: 0.4; } 40% { transform: scale(1); opacity: 1; } }
  @keyframes floatY { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
  @keyframes meshDrift { 0% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(-4%, -6%,0) scale(1.03); } 100% { transform: translate3d(3%, 4%,0) scale(1.01); } }

  /* Responsive adjustments */
  @media (max-width: 1024px) {
    .top-nav { padding: 0.9rem 1.6rem 0.7rem; }
    .view-shell { padding: 1.5rem 1.6rem 3rem; }
    .hero-shell { grid-template-columns: minmax(0,1.1fr); gap: 2.4rem; }
    .hero-visual { order: -1; min-height: 260px; }
    .auth-shell { grid-template-columns: minmax(0,1.05fr); }
    .auth-visual { display: none; }
  }
  @media (max-width: 800px) {
    .dashboard-shell { grid-template-columns: minmax(0,1fr); }
  }
  @media (max-width: 640px) {
    .top-nav { padding-inline: 1.1rem; }
    .view-shell { padding-inline: 1.1rem; }
    .hero-shell { margin-top: 1.5rem; }
  }
`;

// Circular risk gauge component
function RiskGauge({ score }) {
  const r = 48;
  const circumference = Math.PI * r;
  const pct = Math.max(0, Math.min(1, score / 100));
  const dashOffset = circumference * (1 - pct);

  let color = "#FACC15";
  if (score < 35) color = "#22C55E";
  else if (score > 70) color = "#EF4444";

  return (
    <svg width="120" height="80" viewBox="0 0 120 80" className="gauge-svg">
      <defs>
        <linearGradient id="gaugeTrack" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(148,163,184,0.2)" />
          <stop offset="100%" stopColor="rgba(30,64,175,0.5)" />
        </linearGradient>
      </defs>
      <path
        d={`M 12 60 A ${r} ${r} 0 0 1 108 60`}
        fill="none"
        stroke="url(#gaugeTrack)"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path
        d={`M 12 60 A ${r} ${r} 0 0 1 108 60`}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1), stroke 0.5s" }}
      />
      <text
        x="60"
        y="54"
        textAnchor="middle"
        fill={color}
        fontSize="20"
        fontFamily="Space Grotesk, system-ui, sans-serif"
        fontWeight="700"
      >
        {score}
      </text>
      <text x="60" y="70" textAnchor="middle" fill="#9CA3AF" fontSize="9">
        RISK SCORE
      </text>
    </svg>
  );
}

function SignalCard({ type, text }) {
  const icons = { warning: "⚠", keyword: "🔍", salary: "💸", email: "📧", info: "ℹ" };
  const palette = {
    warning: "#EF4444",
    keyword: "#FACC15",
    salary: "#F97316",
    email: "#8B5CF6",
    info: "#3B82F6",
  };

  return (
    <div className="signal-card">
      <span className="signal-icon" style={{ color: palette[type] || palette.info }}>
        {icons[type] || icons.info}
      </span>
      <span className="signal-text" dangerouslySetInnerHTML={{ __html: text }} />
    </div>
  );
}

const sampleHistory = [
  {
    id: 1,
    snippet: "Work from home $500/day no experience required...",
    result: "fraud",
    confidence: 97,
    time: "2 min ago",
  },
  {
    id: 2,
    snippet: "Senior Software Engineer at Stripe, 5+ years...",
    result: "safe",
    confidence: 94,
    time: "1 hr ago",
  },
  {
    id: 3,
    snippet: "Earn money fast! No skills needed, just pay...",
    result: "fraud",
    confidence: 99,
    time: "3 hr ago",
  },
  {
    id: 4,
    snippet: "Marketing Manager, hybrid role, competitive...",
    result: "safe",
    confidence: 88,
    time: "Yesterday",
  },
];

async function analyzeWithBackend(text, url) {
  const res = await fetch("/analyze", {
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
  const [view, setView] = useState("landing");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dashboardTab, setDashboardTab] = useState("analyze");

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

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const scanSteps = [
    "Parsing job description...",
    "Scanning for red flags...",
    "Checking salary claims...",
    "Verifying employer signals...",
    "Generating report...",
  ];
  const [scanStep, setScanStep] = useState(0);

  useEffect(() => {
    if (result && progressRef.current) {
      setTimeout(() => {
        if (progressRef.current) {
          progressRef.current.style.width = `${result.confidence}%`;
        }
      }, 100);
    }
  }, [result]);

  useEffect(() => {
    if (!loading) {
      setScanStep(0);
      return;
    }
    const interval = setInterval(() => setScanStep((s) => (s + 1) % scanSteps.length), 900);
    return () => clearInterval(interval);
  }, [loading]);

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
      setHistory((h) => [
        { id: Date.now(), snippet, result: data.verdict, confidence: data.confidence, time: "Just now" },
        ...h,
      ]);
    } catch (e) {
      const msg = e && e.message ? e.message : "Analysis failed. Please check your input and try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleReport = () => {
    setReported(true);
    setHistory((h) => [
      {
        id: Date.now(),
        snippet: (reportText || reportUrl).substring(0, 60) + "...",
        result: "fraud",
        confidence: 85,
        time: "Just now",
      },
      ...h,
    ]);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError("Enter your email and password to continue.");
      return;
    }
    setLoginError("");
    setLoginLoading(true);
    setTimeout(() => {
      setLoginLoading(false);
      setIsAuthenticated(true);
      setView("dashboard");
    }, 900);
  };

  const goToDashboardAnalyze = () => {
    if (!isAuthenticated) {
      setView("login");
      return;
    }
    setView("dashboard");
    setDashboardTab("analyze");
  };

  return (
    <div className="app-root">
      <style>{FONTS}{styles}</style>
      <div className="bg-gradient" />
      <div className="bg-orb blue" />
      <div className="bg-orb violet" />
      <div className="bg-grid" />
      <div className="bg-noise" />

      {/* Top navigation */}
      <header className="top-nav">
        <div className="top-nav-left">
          <div className="brand-mark">🛡</div>
          <div>
            <div className="brand-text-main">AI FAKE JOB DETECTION</div>
            <div className="brand-text-sub">Real-time risk scoring for job seekers</div>
          </div>
        </div>
        <div className="top-nav-right">
          <span className="top-pill">Model-backed · /analyze endpoint live</span>
          {isAuthenticated && (
            <button className="ghost-link" onClick={() => setView("dashboard")}>
              Dashboard
            </button>
          )}
          <button
            className="primary-pill"
            onClick={() => setView(view === "login" && !isAuthenticated ? "landing" : "login")}
          >
            {isAuthenticated ? "Switch account" : "Sign in"}
          </button>
        </div>
      </header>

      {/* LANDING */}
      {view === "landing" && (
        <main className="view-shell">
          <section className="hero-shell">
            <div>
              <div className="hero-kicker">
                <span className="hero-kicker-dot" />
                Trusted AI for safe job hunting
              </div>
              <h1 className="hero-title">Detect fake job postings before they reach your inbox.</h1>
              <p className="hero-body">
                Paste any job description or URL. Our AI engine scans for fraud signals, salary anomalies, and
                social-engineering patterns in seconds—so you only spend time on genuine opportunities.
              </p>
              <div className="hero-actions">
                <button className="primary-pill" onClick={goToDashboardAnalyze}>
                  Analyze a job now
                </button>
                <button className="hero-secondary" onClick={() => setView("login")}>
                  <span className="icon">▶</span>
                  Live demo dashboard
                </button>
              </div>
              <div className="hero-metadata">
                <div className="hero-meta-item">
                  <label>Detection accuracy</label>
                  <strong>98.7%</strong>
                </div>
                <div className="hero-meta-item">
                  <label>Jobs analyzed</label>
                  <strong>2.3M+</strong>
                </div>
                <div className="hero-meta-item">
                  <label>Average response</label>
                  <strong>{"< 3s"}</strong>
                </div>
              </div>
            </div>

            <div className="hero-visual">
              <div className="hero-mesh">
                <div className="hero-mesh-lines" />
              </div>
              <div className="hero-floating-card">
                <h3>Live fraud risk</h3>
                <strong>82</strong>
                <span style={{ fontSize: "0.78rem", color: "#9CA3AF" }}>
                  High-risk work-from-home listing flagged
                </span>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.35rem" }}>
                  <span className="hero-mini-tag">Gift cards</span>
                  <span className="hero-mini-tag">Crypto payout</span>
                </div>
              </div>
              <div className="hero-badge-strip">
                <span style={{ width: 8, height: 8, borderRadius: 999, background: "#22C55E" }} />
                <span>Realtime AI scanning · Noise-aware salary checks</span>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* LOGIN */}
      {view === "login" && (
        <main className="view-shell">
          <section className="auth-shell">
            <aside className="auth-visual">
              <h2 className="auth-visual-title">An AI console for every job seeker.</h2>
              <p className="auth-visual-sub">
                Monitor risk scores, scan questionable offers, and share scam reports with a single, streamlined
                workspace.
              </p>
              <div className="auth-metric-row">
                <div className="auth-metric-card">
                  <label>Weekly scans</label>
                  <strong>120K+</strong>
                </div>
                <div className="auth-metric-card">
                  <label>False positive rate</label>
                  <strong>1.3%</strong>
                </div>
              </div>
              <div className="auth-wave" />
            </aside>

            <section className="auth-card">
              <div className="auth-tag">
                <span style={{ width: 8, height: 8, borderRadius: 999, background: "#22C55E" }} />
                Secure AI workspace
              </div>
              <h2 className="auth-heading">Sign in to your risk dashboard</h2>
              <p className="auth-sub">No password reset needed—this is a demo workspace for exploration.</p>

              <form onSubmit={handleLogin}>
                <div className="field-row">
                  <label className="field-label">Work email</label>
                  <input
                    className="text-field"
                    type="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                </div>
                <div className="field-row">
                  <label className="field-label">Access code</label>
                  <input
                    className="text-field"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                </div>
                {loginError && <div className="auth-error">{loginError}</div>}

                <button className="auth-button" type="submit" disabled={loginLoading}>
                  {loginLoading ? (
                    <>
                      <div className="auth-spinner" />
                      Authenticating workspace...
                    </>
                  ) : (
                    <>Continue to dashboard</>
                  )}
                </button>
              </form>

              <div className="auth-footer-row">
                <span>Demo only—no data is permanently stored.</span>
                <button className="link-ghost" type="button" onClick={() => setView("landing")}>
                  Back to overview
                </button>
              </div>
            </section>
          </section>
        </main>
      )}

      {/* DASHBOARD */}
      {view === "dashboard" && (
        <main className="view-shell">
          <section className="dashboard-shell">
            <aside className="sidebar">
              <div className="sidebar-label">Console</div>
              <div className="sidebar-list">
                <button
                  type="button"
                  className={`sidebar-item ${dashboardTab === "analyze" ? "active" : ""}`}
                  onClick={() => setDashboardTab("analyze")}
                >
                  <span className="sidebar-indicator" />
                  <span className="icon">🔍</span>
                  <span>Job Analysis</span>
                </button>
                <button
                  type="button"
                  className={`sidebar-item ${dashboardTab === "history" ? "active" : ""}`}
                  onClick={() => setDashboardTab("history")}
                >
                  <span className="sidebar-indicator" />
                  <span className="icon">📊</span>
                  <span>Analysis History</span>
                </button>
                <button
                  type="button"
                  className={`sidebar-item ${dashboardTab === "report" ? "active" : ""}`}
                  onClick={() => setDashboardTab("report")}
                >
                  <span className="sidebar-indicator" />
                  <span className="icon">⚠</span>
                  <span>Report Scam</span>
                </button>
              </div>

              <div className="sidebar-footer">
                <div>Signed in · demo environment</div>
                <div>Backend: POST /analyze</div>
              </div>
            </aside>

            <section className="dashboard-main">
              <header className="dashboard-header">
                <div>
                  <h2>
                    {dashboardTab === "analyze" && "Job Analysis Module"}
                    {dashboardTab === "history" && "Recent risk decisions"}
                    {dashboardTab === "report" && "Community scam reporting"}
                  </h2>
                  <p>
                    {dashboardTab === "analyze" &&
                      "Submit a job description or URL. The platform calls your /analyze backend and visualizes the verdict."}
                    {dashboardTab === "history" &&
                      "Review previous analyses and compare confidence scores across job postings."}
                    {dashboardTab === "report" &&
                      "Share suspicious listings to help protect other applicants in your network."}
                  </p>
                </div>
                <span className="dashboard-badge">Risk engine · live</span>
              </header>

              {dashboardTab === "analyze" && (
                <>
                  <div className="card-glass">
                    <div className="card-title-row">
                      <h3>Job posting input</h3>
                      <span className="card-subtitle">Text or URL · processed in real time</span>
                    </div>
                    <div>
                      <div className="section-label">Job description</div>
                      <textarea
                        placeholder="Paste the full job description, including responsibilities, requirements, and contact details."
                        value={jobText}
                        onChange={(e) => setJobText(e.target.value)}
                      />
                      <div className="or-divider">or</div>
                      <div className="section-label">Job posting URL</div>
                      <input
                        className="url-input"
                        type="url"
                        placeholder="https://example.com/job/senior-engineer"
                        value={jobUrl}
                        onChange={(e) => setJobUrl(e.target.value)}
                      />
                      {error && <div className="error-text">{error}</div>}
                      <button className="analyze-btn" onClick={handleAnalyze} disabled={loading}>
                        {loading ? (
                          <>
                            <div className="btn-spinner-small" />
                            Analyzing posting...
                          </>
                        ) : (
                          <>
                            <span>🔍</span>
                            Analyze job posting
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {loading && (
                    <div className="scan-panel">
                      <div className="scan-ring" />
                      <div className="scan-text">{scanSteps[scanStep]}</div>
                      <div className="scan-dots">
                        <div className="scan-dot" />
                        <div className="scan-dot" />
                        <div className="scan-dot" />
                      </div>
                    </div>
                  )}

                  {result && !loading && (
                    <div className="result-panel">
                      <div className={`result-header ${result.verdict}`}>
                        <div className="verdict">
                          <div className={`verdict-icon ${result.verdict}`}>
                            {result.verdict === "safe" ? "✓" : "⚠"}
                          </div>
                          <div>
                            <div className={`verdict-title ${result.verdict}`}>
                              {result.verdict === "safe" ? "Likely genuine" : "Potentially fraudulent"}
                            </div>
                            <div className="verdict-sub">{result.summary}</div>
                          </div>
                        </div>
                        <div className="result-header-right">
                          <div className="confidence-label">AI confidence</div>
                          <div
                            className="confidence-value"
                            style={{ color: result.verdict === "safe" ? "#22C55E" : "#EF4444" }}
                          >
                            {result.confidence}%
                          </div>
                        </div>
                      </div>

                      <div className="result-body">
                        <div className="metrics-grid">
                          <div className="metric-card">
                            <div className="metric-label">Confidence score</div>
                            <div
                              className="metric-value"
                              style={{ color: result.verdict === "safe" ? "#22C55E" : "#EF4444" }}
                            >
                              {result.confidence}%
                            </div>
                            <div className="progress-bar">
                              <div className="progress-track-glow" />
                              <div
                                className="progress-fill"
                                ref={progressRef}
                                style={{
                                  background:
                                    result.verdict === "safe"
                                      ? "linear-gradient(90deg, rgba(34,197,94,0.5), #22C55E)"
                                      : "linear-gradient(90deg, rgba(239,68,68,0.5), #EF4444)",
                                }}
                              />
                            </div>
                          </div>
                          <div className="metric-card">
                            <div className="metric-label">Fraud risk meter</div>
                            <div className="gauge-wrap">
                              <RiskGauge score={result.riskScore} />
                            </div>
                          </div>
                        </div>

                        {result.signals?.length > 0 && (
                          <>
                            <div className="signals-title">Detected risk signals</div>
                            <div className="signals-list">
                              {result.signals.map((s, i) => (
                                <div key={i} style={{ animationDelay: `${i * 0.08}s` }}>
                                  <SignalCard type={s.type} text={s.text} />
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              {dashboardTab === "history" && (
                <div className="card-glass history-card">
                  {history.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">📋</div>
                      No history yet. Run an analysis to populate your dashboard.
                    </div>
                  ) : (
                    <table className="history-table">
                      <thead>
                        <tr>
                          <th>Job snippet</th>
                          <th>Result</th>
                          <th>Confidence</th>
                          <th>Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.map((h) => (
                          <tr key={h.id}>
                            <td className="snippet">{h.snippet}</td>
                            <td>
                              <span className={`badge-pill ${h.result}`}>
                                {h.result === "safe" ? "✓ Genuine" : "⚠ Suspicious"}
                              </span>
                            </td>
                            <td>
                              <span
                                className="score-pill"
                                style={{ color: h.result === "safe" ? "#22C55E" : "#EF4444" }}
                              >
                                {h.confidence}%
                              </span>
                            </td>
                            <td style={{ color: "#9CA3AF", fontSize: "0.78rem" }}>{h.time}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {dashboardTab === "report" && (
                <div className="card-glass report-card">
                  {reported ? (
                    <div className="success-msg">
                      <div className="success-icon">✅</div>
                      <div className="success-title">Report submitted</div>
                      <div className="success-sub">
                        Thank you for contributing signals. This listing will help the model better protect other
                        applicants.
                      </div>
                      <button
                        className="analyze-btn"
                        style={{ width: "auto", marginTop: "1rem", paddingInline: "1.4rem" }}
                        onClick={() => {
                          setReported(false);
                          setReportText("");
                          setReportUrl("");
                          setReportMsg("");
                        }}
                      >
                        Submit another report
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="card-title-row">
                        <h3>Flag a suspicious opportunity</h3>
                        <span className="card-subtitle">Signals are anonymized and used for training only.</span>
                      </div>
                      <div className="form-group">
                        <div className="section-label">Suspicious job description</div>
                        <textarea
                          placeholder="Paste the full job description you believe may be a scam."
                          value={reportText}
                          onChange={(e) => setReportText(e.target.value)}
                          style={{ minHeight: 140 }}
                        />
                      </div>
                      <div className="form-group">
                        <div className="section-label">Job posting URL (optional)</div>
                        <input
                          className="url-input"
                          type="url"
                          placeholder="https://suspicious-site.com/job/..."
                          value={reportUrl}
                          onChange={(e) => setReportUrl(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <div className="section-label">Additional notes (optional)</div>
                        <textarea
                          placeholder="Describe what felt off about this listing—payment method, interview flow, domain, etc."
                          value={reportMsg}
                          onChange={(e) => setReportMsg(e.target.value)}
                          style={{ minHeight: 80 }}
                        />
                      </div>
                      <button
                        className="submit-btn"
                        onClick={handleReport}
                        disabled={!reportText.trim() && !reportUrl.trim()}
                      >
                        ⚠ Submit scam report
                      </button>
                    </>
                  )}
                </div>
              )}
            </section>
          </section>
        </main>
      )}
    </div>
  );
}
