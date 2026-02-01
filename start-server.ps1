# ================================================================
# StartupAI - Start Individual Server
# ================================================================
# Usage: powershell -ExecutionPolicy Bypass -File start-server.ps1 <server-name>
#
# Available servers:
#   rag, roadmap, strengths, weaknesses, suggestions, enhancer, predictor, pitcher
#
# Examples:
#   .\start-server.ps1 rag
#   .\start-server.ps1 predictor
#   .\start-server.ps1 strengths
# ================================================================

param(
    [Parameter(Mandatory=$false)]
    [string]$ServerName
)

$BaseDir = $PSScriptRoot

# Define all servers
$servers = @{
    "rag" = @{
        Name = "Multimodal RAG"
        Port = 8000
        Dir = "AI_local_files\multimodal-RAG"
        VenvPath = "myvenv\Scripts\Activate.ps1"
        StartCmd = "uvicorn main:app --host 0.0.0.0 --port 8000 --reload"
    }
    "roadmap" = @{
        Name = "CrewAI Roadmap"
        Port = 8001
        Dir = "AI_local_files\Crew_AI\next-month-roadmap\src"
        VenvPath = "..\.venv\Scripts\Activate.ps1"
        StartCmd = "uvicorn api:app --host 0.0.0.0 --port 8001 --reload"
    }
    "strengths" = @{
        Name = "CrewAI Strengths"
        Port = 8002
        Dir = "AI_local_files\Crew_AI\Strengths_Agent\src"
        VenvPath = "..\myvenv\Scripts\Activate.ps1"
        StartCmd = "uvicorn api:app --host 0.0.0.0 --port 8002 --reload"
    }
    "weaknesses" = @{
        Name = "CrewAI Weaknesses"
        Port = 8003
        Dir = "AI_local_files\Crew_AI\Weakness_Agent\src"
        VenvPath = "..\myvenv\Scripts\Activate.ps1"
        StartCmd = "uvicorn api:app --host 0.0.0.0 --port 8003 --reload"
    }
    "suggestions" = @{
        Name = "CrewAI Suggestions"
        Port = 8004
        Dir = "AI_local_files\Crew_AI\suggestions\src"
        VenvPath = "..\myvenv\Scripts\Activate.ps1"
        StartCmd = "uvicorn api:app --host 0.0.0.0 --port 8004 --reload"
    }
    "enhancer" = @{
        Name = "Enhancer Agent"
        Port = 8005
        Dir = "AI_local_files\ENHANCER_AGENT"
        VenvPath = "myvenv\Scripts\Activate.ps1"
        StartCmd = "uvicorn main:app --host 0.0.0.0 --port 8005 --reload"
    }
    "predictor" = @{
        Name = "Predictor"
        Port = 8006
        Dir = "AI_local_files\Predictor"
        VenvPath = $null
        StartCmd = "uvicorn main:app --host 0.0.0.0 --port 8006 --reload"
    }
    "pitcher" = @{
        Name = "Pitcher Agent"
        Port = 8007
        Dir = "AI_local_files\Pitcher_Agent"
        VenvPath = "myvenv\Scripts\Activate.ps1"
        StartCmd = "uvicorn main:app --host 0.0.0.0 --port 8007 --reload"
    }
}

# Show help if no server specified
if (-not $ServerName) {
    Write-Host ""
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host "  StartupAI - Individual Server Launcher" -ForegroundColor Cyan
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage: .\start-server.ps1 <server-name>" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Available servers:" -ForegroundColor Cyan
    foreach ($key in $servers.Keys | Sort-Object) {
        $s = $servers[$key]
        Write-Host ("  {0,-12} - {1} (port {2})" -f $key, $s.Name, $s.Port) -ForegroundColor White
    }
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Cyan
    Write-Host "  .\start-server.ps1 rag" -ForegroundColor White
    Write-Host "  .\start-server.ps1 predictor" -ForegroundColor White
    Write-Host "  .\start-server.ps1 strengths" -ForegroundColor White
    Write-Host ""
    exit
}

# Check if server exists
$ServerName = $ServerName.ToLower()
if (-not $servers.ContainsKey($ServerName)) {
    Write-Host ""
    Write-Host "[ERROR] Unknown server: $ServerName" -ForegroundColor Red
    Write-Host ""
    Write-Host "Available servers: $($servers.Keys -join ', ')" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

$server = $servers[$ServerName]
$serverDir = Join-Path $BaseDir $server.Dir

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  Starting $($server.Name) on port $($server.Port)" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $serverDir)) {
    Write-Host "[ERROR] Directory not found: $serverDir" -ForegroundColor Red
    exit 1
}

# Change to server directory
Set-Location $serverDir

# Activate virtual environment if exists
if ($server.VenvPath) {
    $venvFull = Join-Path $serverDir $server.VenvPath
    if (Test-Path $venvFull) {
        Write-Host "[INFO] Activating virtual environment..." -ForegroundColor Yellow
        & $venvFull
    } else {
        Write-Host "[WARN] Virtual environment not found at: $venvFull" -ForegroundColor Yellow
    }
}

Write-Host "[INFO] Starting server..." -ForegroundColor Yellow
Write-Host ""

# Run the server (this will block)
Invoke-Expression $server.StartCmd
