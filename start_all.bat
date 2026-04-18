@echo off
echo ========================================================
echo Starting FairGig Platform - Hackathon Demo Environment
echo ========================================================

echo 1. Starting Frontend...
cd frontend
start cmd /k "npm run dev"
cd ..

echo 2. Starting Node.js Services...
cd backend\grievance-service
start cmd /k "node index.js"
cd ..\..

cd backend\earnings-service
start cmd /k "node index.js"
cd ..\..

cd backend\certificate-service
start cmd /k "node index.js"
cd ..\..

echo 3. Starting Python Services...
echo Checking Python requirements for Anomaly Service...
cd backend\anomaly-service
pip install -r requirements.txt
start cmd /k "python -m uvicorn main:app --reload --port 8000"
cd ..\..

echo Checking Python requirements for Analytics Service...
cd backend\analytics-service
pip install -r requirements.txt
start cmd /k "python -m uvicorn main:app --reload --port 8001"
cd ..\..

echo ========================================================
echo All services started in separate windows!
echo Frontend is available at http://localhost:5173
echo ========================================================
pause
