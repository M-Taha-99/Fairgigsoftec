from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import numpy as np

app = FastAPI(title="Anomaly Detection Service", description="Detects anomalies in gig worker earnings.")

class EarningLog(BaseModel):
    shift_date: str
    platform: str
    gross_earned: float
    platform_deductions: float
    net_received: float

class AnomalyRequest(BaseModel):
    worker_id: str
    recent_earnings: List[EarningLog]

class AnomalyResponse(BaseModel):
    has_anomaly: bool
    flags: List[str]
    human_readable_explanation: str

@app.post("/api/anomaly/detect", response_model=AnomalyResponse)
def detect_anomaly(request: AnomalyRequest):
    if not request.recent_earnings:
        return AnomalyResponse(has_anomaly=False, flags=[], human_readable_explanation="No recent earnings to analyze.")

    flags = []
    explanations = []

    # Calculate effective commission rates
    commission_rates = []
    net_earnings = []
    
    for log in request.recent_earnings:
        if log.gross_earned > 0:
            rate = log.platform_deductions / log.gross_earned
            commission_rates.append(rate)
        net_earnings.append(log.net_received)
    
    if commission_rates:
        recent_rate = commission_rates[-1]
        mean_rate = np.mean(commission_rates[:-1]) if len(commission_rates) > 1 else 0
        std_rate = np.std(commission_rates[:-1]) if len(commission_rates) > 2 else 0

        # Anomaly 1: Sudden spike in platform commission
        if len(commission_rates) > 2 and recent_rate > (mean_rate + 2 * std_rate) and recent_rate > 0.25:
            flags.append("HIGH_DEDUCTION_SPIKE")
            explanations.append(f"Your latest shift had a deduction rate of {recent_rate:.0%}, which is statistically unusual compared to your average of {mean_rate:.0%}.")

    if net_earnings:
        recent_net = net_earnings[-1]
        mean_net = np.mean(net_earnings[:-1]) if len(net_earnings) > 1 else 0
        
        # Anomaly 2: Sudden drop in net income
        if len(net_earnings) > 1 and recent_net < (mean_net * 0.5):
            flags.append("SUDDEN_INCOME_DROP")
            explanations.append("Your net income for the last shift was less than half of your usual average.")

    has_anomaly = len(flags) > 0
    explanation = " ".join(explanations) if has_anomaly else "Your recent earnings appear to be within normal expected ranges."

    return AnomalyResponse(
        has_anomaly=has_anomaly,
        flags=flags,
        human_readable_explanation=explanation
    )

# Run with: uvicorn main:app --reload --port 8000
