# PowerShell script to start the local Multimodal RAG server
# This script activates the virtual environment and starts the FastAPI server

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting Local Multimodal RAG Server..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Navigate to RAG directory
Set-Location -Path "AI_local_files\multimodal-RAG"

# Check if virtual environment exists
if (-Not (Test-Path "myvenv\Scripts\Activate.ps1")) {
    Write-Host "ERROR: Virtual environment not found!" -ForegroundColor Red
    Write-Host "Please ensure myvenv exists in AI_local_files\multimodal-RAG" -ForegroundColor Yellow
    exit 1
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Green
& ".\myvenv\Scripts\Activate.ps1"

# Check if .env file exists
if (-Not (Test-Path ".env")) {
    Write-Host "WARNING: .env file not found!" -ForegroundColor Yellow
    Write-Host "Creating .env file with GROQ_API_KEY..." -ForegroundColor Yellow
    "GROQ_API_KEY=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" | Out-File -FilePath ".env" -Encoding UTF8
}

# Start FastAPI server
Write-Host "Starting FastAPI server on http://localhost:8000..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

& ".\myvenv\Scripts\python.exe" -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
