import os
from fastapi import FastAPI
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Analytics Service", description="Calculates aggregate KPIs for the platform.")

url: str = os.environ.get("SUPABASE_URL", "https://mock.supabase.co")
key: str = os.environ.get("SUPABASE_KEY", "mock-key")
try:
    supabase: Client = create_client(url, key)
except Exception:
    supabase = None

@app.get("/api/analytics/medians")
def get_city_medians():
    if not supabase:
        return {"category": "all", "median_hourly_rate": 450}

    # Fetch last 100 earnings
    response = supabase.table("earnings").select("gross_earned, hours_worked").limit(100).execute()
    
    if response.data:
        rates = []
        for e in response.data:
            if e['hours_worked'] > 0:
                rates.append(e['gross_earned'] / e['hours_worked'])
        
        if rates:
            rates.sort()
            mid = len(rates) // 2
            median = (rates[mid] + rates[~mid]) / 2.0
            return {"category": "all", "median_hourly_rate": round(median, 0)}

    return {"category": "all", "median_hourly_rate": 460}

@app.get("/api/analytics/dashboard")
def get_advocate_dashboard():
    if not supabase:
        return {
            "commission_trends": [{"platform": "Uber", "avg_rate": 0.25}],
            "vulnerability_flags": 15,
            "total_complaints_this_week": 42
        }

    # Mock aggregation for hackathon
    # In production, use database views or RPCs
    response = supabase.table("earnings").select("platform, gross_earned, platform_deductions").limit(200).execute()
    
    trends = {}
    if response.data:
        for e in response.data:
            p = e['platform']
            if e['gross_earned'] > 0:
                rate = e['platform_deductions'] / e['gross_earned']
                if p not in trends:
                    trends[p] = []
                trends[p].append(rate)
    
    commission_trends = []
    for p, rates in trends.items():
        avg = sum(rates) / len(rates)
        commission_trends.append({"platform": p, "avg_rate": round(avg, 2)})

    return {
        "commission_trends": commission_trends,
        "vulnerability_flags": 8, # Mocked
        "total_complaints_this_week": 24 # Mocked
    }

# Run with: uvicorn main:app --reload --port 8001
