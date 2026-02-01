# ================================================================
# StartupAI - Start All Local Servers
# ================================================================
# Run this script to start ALL local AI servers at once.
# Each server runs in a new terminal window.
#
# Usage: Right-click -> Run with PowerShell
#        OR: powershell -ExecutionPolicy Bypass -File start-all-servers.ps1
# ================================================================

$BaseDir = $PSScriptRoot

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  StartupAI - Starting All Local Servers" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Define all servers with their configurations
$servers = @(
    @{
        Name = "Multimodal RAG"
        Port = 8000
        Dir = "AI_local_files\multimodal-RAG"
        VenvPath = "myvenv\Scripts\Activate.ps1"
        StartCmd = "uvicorn main:app --host 0.0.0.0 --port 8000 --reload"
    },
    @{
        Name = "CrewAI Roadmap"
        Port = 8001
        Dir = "AI_local_files\Crew_AI\next-month-roadmap\src"
        VenvPath = "..\.venv\Scripts\Activate.ps1"
        StartCmd = "uvicorn api:app --host 0.0.0.0 --port 8001 --reload"
    },
    @{
        Name = "CrewAI Strengths"
        Port = 8002
        Dir = "AI_local_files\Crew_AI\Strengths_Agent\src"
        VenvPath = "..\myvenv\Scripts\Activate.ps1"
        StartCmd = "uvicorn api:app --host 0.0.0.0 --port 8002 --reload"
    },
    @{
        Name = "CrewAI Weaknesses"
        Port = 8003
        Dir = "AI_local_files\Crew_AI\Weakness_Agent\src"
        VenvPath = "..\myvenv\Scripts\Activate.ps1"
        StartCmd = "uvicorn api:app --host 0.0.0.0 --port 8003 --reload"
    },
    @{
        Name = "CrewAI Suggestions"
        Port = 8004
        Dir = "AI_local_files\Crew_AI\suggestions\src"
        VenvPath = "..\myvenv\Scripts\Activate.ps1"
        StartCmd = "uvicorn api:app --host 0.0.0.0 --port 8004 --reload"
    },
    @{
        Name = "Enhancer Agent"
        Port = 8005
        Dir = "AI_local_files\ENHANCER_AGENT"
        VenvPath = "myvenv\Scripts\Activate.ps1"
        StartCmd = "uvicorn main:app --host 0.0.0.0 --port 8005 --reload"
    },
    @{
        Name = "Predictor"
        Port = 8006
        Dir = "AI_local_files\Predictor"
        VenvPath = $null  # No venv, uses global Python
        StartCmd = "uvicorn main:app --host 0.0.0.0 --port 8006 --reload"
    },
    @{
        Name = "Pitcher Agent"
        Port = 8007
        Dir = "AI_local_files\Pitcher_Agent"
        VenvPath = "myvenv\Scripts\Activate.ps1"
        StartCmd = "uvicorn main:app --host 0.0.0.0 --port 8007 --reload"
    }
)

# Start each server in a new terminal
foreach ($server in $servers) {
    $serverDir = Join-Path $BaseDir $server.Dir
    
    if (Test-Path $serverDir) {
        Write-Host "[STARTING] $($server.Name) on port $($server.Port)..." -ForegroundColor Yellow
        
        # Build the command to run in new terminal
        if ($server.VenvPath) {
            $venvFull = Join-Path $serverDir $server.VenvPath
            $cmd = "cd '$serverDir'; & '$venvFull'; $($server.StartCmd)"
        } else {
            $cmd = "cd '$serverDir'; $($server.StartCmd)"
        }
        
        # Start in new terminal window with title
        Start-Process powershell -ArgumentList "-NoExit", "-Command", $cmd -WindowStyle Normal
        
        Write-Host "[OK] $($server.Name) started!" -ForegroundColor Green
        Start-Sleep -Milliseconds 500
    } else {
        Write-Host "[SKIP] $($server.Name) - Directory not found: $serverDir" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "================================================================" -ForegroundColor Green
Write-Host "  All servers are starting!" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Active Ports:" -ForegroundColor Cyan
Write-Host "  8000 - Multimodal RAG" -ForegroundColor White
Write-Host "  8001 - CrewAI Roadmap" -ForegroundColor White
Write-Host "  8002 - CrewAI Strengths" -ForegroundColor White
Write-Host "  8003 - CrewAI Weaknesses" -ForegroundColor White
Write-Host "  8004 - CrewAI Suggestions" -ForegroundColor White
Write-Host "  8005 - Enhancer Agent" -ForegroundColor White
Write-Host "  8006 - Predictor" -ForegroundColor White
Write-Host "  8007 - Pitcher Agent" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to close this window..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
