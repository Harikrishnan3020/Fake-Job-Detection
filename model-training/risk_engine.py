from __future__ import annotations

import os
from dataclasses import dataclass, asdict
from typing import List, Dict, Any, Optional

import numpy as np

from transformers import AutoTokenizer, AutoModelForSequenceClassification
from sentence_transformers import SentenceTransformer
from sklearn.ensemble import IsolationForest
import joblib

try:
    import shap  # type: ignore
except ImportError:  # SHAP is optional at import time
    shap = None


# Environment-configurable model identifiers (defaults set to widely available public models)
HF_PHISH_MODEL_ID = os.getenv("HF_PHISH_MODEL_ID", "bert-base-uncased")
HF_XLMR_MODEL_ID = os.getenv("HF_XLMR_MODEL_ID", "xlm-roberta-base")
HF_KEYWORD_EMB_MODEL_ID = os.getenv("HF_KEYWORD_EMB_MODEL_ID", "sentence-transformers/all-MiniLM-L6-v2")

SALARY_MODEL_PATH = os.getenv("SALARY_MODEL_PATH", "salary_iforest.pkl")


@dataclass
class JobInput:
    text: str
    language: str = "auto"  # e.g. "en", "fr", "auto"
    url: Optional[str] = None
    recruiter_email: Optional[str] = None
    annual_salary: Optional[float] = None  # normalized to yearly base


@dataclass
class RiskComponentScore:
    name: str
    score: float  # 0-1 risk
    explanation: str


@dataclass
class RiskAnalysisResult:
    overall_risk_score: float  # 0-1
    verdict: str  # "safe", "review", "high_risk"
    components: List[RiskComponentScore]
    shap_summary: Optional[Dict[str, Any]] = None

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class RiskEngine:
    """Composite risk engine using the models specified by the user.

    Components:
    - Phishing URL / email detector: BERT-style classifier.
    - Multi-language job text classifier: XLM-RoBERTa.
    - Salary anomaly detector: Isolation Forest.
    - Keyword / semantic risk: MiniLM sentence embeddings.
    - Explanation: SHAP (where feasible).
    """

    def __init__(self) -> None:
        # Phishing URL / email model
        self.phish_tokenizer = AutoTokenizer.from_pretrained(HF_PHISH_MODEL_ID)
        self.phish_model = AutoModelForSequenceClassification.from_pretrained(HF_PHISH_MODEL_ID)

        # Multi-language classifier (XLM-RoBERTa)
        self.xlmr_tokenizer = AutoTokenizer.from_pretrained(HF_XLMR_MODEL_ID)
        self.xlmr_model = AutoModelForSequenceClassification.from_pretrained(HF_XLMR_MODEL_ID)

        # Keyword / semantic risk model (MiniLM)
        self.keyword_model = SentenceTransformer(HF_KEYWORD_EMB_MODEL_ID)
        self.risky_templates = self._build_risky_templates()
        self.risky_template_embeddings = self.keyword_model.encode(self.risky_templates, convert_to_tensor=True)

        # Salary anomaly model (Isolation Forest)
        self.salary_model = self._load_salary_model()

    @staticmethod
    def _build_risky_templates() -> List[str]:
        return [
            "We will never ask you to pay any fees to apply or start work.",
            "High daily earnings with no experience required.",
            "Job requires payment for training materials.",
            "Contact us only via WhatsApp or Telegram.",
            "Send us your banking details to receive your first salary.",
        ]

    @staticmethod
    def _load_salary_model() -> IsolationForest:
        if os.path.exists(SALARY_MODEL_PATH):
            return joblib.load(SALARY_MODEL_PATH)

        # Fallback: simple IsolationForest trained on a synthetic "normal" salary range.
        rng = np.random.RandomState(42)
        normal_salaries = rng.normal(loc=60000, scale=15000, size=(2000, 1))
        model = IsolationForest(contamination=0.05, random_state=42)
        model.fit(normal_salaries)
        return model

    def analyze(self, job: JobInput) -> RiskAnalysisResult:
        components: List[RiskComponentScore] = []

        # 1) URL / email phishing risk
        phish_risk = self._score_phishing(job)
        components.append(phish_risk)

        # 2) Multi-language job text classifier risk
        xlmr_risk = self._score_xlmr(job)
        components.append(xlmr_risk)

        # 3) Salary anomaly risk
        if job.annual_salary is not None:
            salary_risk = self._score_salary(job)
            components.append(salary_risk)

        # 4) Keyword / semantic risk
        keyword_risk = self._score_keywords(job)
        components.append(keyword_risk)

        # Aggregate overall risk as a weighted average
        weights = {
            "phishing": 0.3,
            "xlmr_text": 0.35,
            "salary": 0.15,
            "keywords": 0.2,
        }

        total_weight = 0.0
        weighted_sum = 0.0
        for c in components:
            w = weights.get(c.name, 0.0)
            total_weight += w
            weighted_sum += w * c.score

        overall_risk = weighted_sum / total_weight if total_weight > 0 else 0.0

        if overall_risk < 0.3:
            verdict = "safe"
        elif overall_risk < 0.7:
            verdict = "review"
        else:
            verdict = "high_risk"

        shap_summary = self._explain_with_shap(job) if shap is not None else None

        return RiskAnalysisResult(
            overall_risk_score=float(overall_risk),
            verdict=verdict,
            components=components,
            shap_summary=shap_summary,
        )

    def _score_phishing(self, job: JobInput) -> RiskComponentScore:
        text_parts = []
        if job.url:
            text_parts.append(job.url)
        if job.recruiter_email:
            text_parts.append(job.recruiter_email)
        if not text_parts:
            return RiskComponentScore(
                name="phishing",
                score=0.0,
                explanation="No URL or recruiter email provided for phishing analysis.",
            )

        joined = " \n ".join(text_parts)
        tokens = self.phish_tokenizer(joined, return_tensors="pt", truncation=True)
        outputs = self.phish_model(**tokens)
        scores = outputs.logits.softmax(dim=-1).detach().cpu().numpy()[0]
        # Assume label 1 = phishing/high-risk
        risk = float(scores[1]) if scores.size > 1 else 0.0

        explanation = "Phishing model flagged the provided URL/email as high risk." if risk > 0.5 else (
            "Phishing model did not find strong phishing indicators in the URL/email."
        )

        return RiskComponentScore(name="phishing", score=risk, explanation=explanation)

    def _score_xlmr(self, job: JobInput) -> RiskComponentScore:
        text = (job.text or "").strip()
        if not text:
            return RiskComponentScore(
                name="xlmr_text",
                score=0.0,
                explanation="No job description text provided for multi-language analysis.",
            )

        tokens = self.xlmr_tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
        outputs = self.xlmr_model(**tokens)
        probs = outputs.logits.softmax(dim=-1).detach().cpu().numpy()[0]
        # Assume binary: label 1 = fraudulent / high risk
        risk = float(probs[1]) if probs.size > 1 else 0.0

        explanation = "XLM-RoBERTa model predicts this posting as high risk." if risk > 0.5 else (
            "XLM-RoBERTa model predicts this posting as likely legitimate."
        )

        return RiskComponentScore(name="xlmr_text", score=risk, explanation=explanation)

    def _score_salary(self, job: JobInput) -> RiskComponentScore:
        assert job.annual_salary is not None
        salary_arr = np.array([[job.annual_salary]], dtype=float)
        pred = self.salary_model.decision_function(salary_arr)[0]
        # IsolationForest: lower score = more anomalous. Map to 0-1 risk.
        # Shift to positive and invert.
        norm = (pred - (-0.5)) / (0.5 - (-0.5))  # assume typical range [-0.5, 0.5]
        norm = np.clip(norm, 0.0, 1.0)
        risk = float(1.0 - norm)

        if risk > 0.7:
            explanation = "Salary appears highly anomalous compared to typical ranges."
        elif risk > 0.4:
            explanation = "Salary is somewhat unusual; manual review is recommended."
        else:
            explanation = "Salary falls within an expected range for typical roles."

        return RiskComponentScore(name="salary", score=risk, explanation=explanation)

    def _score_keywords(self, job: JobInput) -> RiskComponentScore:
        text = (job.text or "").strip()
        if not text:
            return RiskComponentScore(
                name="keywords",
                score=0.0,
                explanation="No text available for keyword/semantic risk analysis.",
            )

        job_emb = self.keyword_model.encode([text], convert_to_tensor=True)
        # cosine similarities with risky templates
        from torch import nn

        cos = nn.CosineSimilarity(dim=1)
        sims = cos(job_emb, self.risky_template_embeddings).detach().cpu().numpy()
        max_sim = float(sims.max()) if sims.size > 0 else 0.0

        # Map similarity [0, 1] to risk [0, 1]
        risk = max(0.0, min(1.0, max_sim))

        if risk > 0.7:
            explanation = "Text is semantically very similar to known scam language patterns."
        elif risk > 0.4:
            explanation = "Text partially overlaps with risky patterns; proceed with caution."
        else:
            explanation = "No strong semantic match with known scam keywords was found."

        return RiskComponentScore(name="keywords", score=risk, explanation=explanation)

    def _explain_with_shap(self, job: JobInput) -> Optional[Dict[str, Any]]:
        """Placeholder for SHAP-based explanations.

        SHAP is optional and can be computationally heavy or fragile across
        environments. For this runtime setup we simply skip SHAP and return
        no explanation data.
        """
        return None


if __name__ == "__main__":
    # Simple manual test stub (won't run during normal project use)
    engine = RiskEngine()
    sample = JobInput(
        text="Work from home and earn $500 per day, no experience required. Contact us on WhatsApp only.",
        language="en",
        url="http://example-suspicious-job.com",
        recruiter_email="fake.recruiter@gmail.com",
        annual_salary=180000,
    )
    result = engine.analyze(sample)
    print(result.to_dict())
