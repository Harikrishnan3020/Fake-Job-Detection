from __future__ import annotations

from typing import Optional, List

from fastapi import FastAPI
from pydantic import BaseModel

from risk_engine import RiskEngine, JobInput, RiskAnalysisResult, RiskComponentScore


app = FastAPI(title="AI Fake Job Risk Engine", version="0.1.0")
engine = RiskEngine()


class JobInputPayload(BaseModel):
    text: str
    language: Optional[str] = "auto"
    url: Optional[str] = None
    recruiter_email: Optional[str] = None
    annual_salary: Optional[float] = None


class RiskComponentPayload(BaseModel):
    name: str
    score: float
    explanation: str


class RiskAnalysisPayload(BaseModel):
    overall_risk_score: float
    verdict: str
    components: List[RiskComponentPayload]
    shap_summary: Optional[dict] = None


@app.post("/analyze", response_model=RiskAnalysisPayload)
async def analyze_job(payload: JobInputPayload) -> RiskAnalysisPayload:
    job = JobInput(
        text=payload.text,
        language=payload.language or "auto",
        url=payload.url,
        recruiter_email=payload.recruiter_email,
        annual_salary=payload.annual_salary,
    )

    result: RiskAnalysisResult = engine.analyze(job)

    return RiskAnalysisPayload(
        overall_risk_score=result.overall_risk_score,
        verdict=result.verdict,
        components=[
            RiskComponentPayload(name=c.name, score=c.score, explanation=c.explanation)
            for c in result.components
        ],
        shap_summary=result.shap_summary,
    )


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("api_server:app", host="0.0.0.0", port=8080, reload=True)
