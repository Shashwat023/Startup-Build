---
description: Start the local Multimodal RAG server
---

# Start Local RAG Server

This workflow starts the local FastAPI server for the Multimodal RAG system.

## Prerequisites

1. Virtual environment exists at `AI_local_files\multimodal-RAG\myvenv`
2. Requirements are installed in the virtual environment
3. `.env` file exists in `AI_local_files\multimodal-RAG` with `GROQ_API_KEY`

## Steps

### 1. Open a new terminal

Open a separate PowerShell terminal (don't use the terminal running `npm run dev`)

### 2. Navigate to project root

```powershell
cd "d:\codes\web dev\startup build"
```

### 3. Run the startup script

// turbo
```powershell
.\start-rag-server.ps1
```

### 4. Verify server is running

The server should start on `http://localhost:8000`. You should see:
- Startup messages indicating features are enabled
- Models being loaded (Whisper, CLIP, BLIP, etc.)
- "API is ready!" message

### 5. Test the health endpoint

In another terminal or browser, verify:
```powershell
curl http://localhost:8000
```

Expected response: JSON with service status and features

## Troubleshooting

### Virtual environment not found
```powershell
cd "AI_local_files\multimodal-RAG"
python -m venv myvenv
.\myvenv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Port already in use
Kill the process using port 8000:
```powershell
Get-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess | Stop-Process -Force
```

### Missing dependencies
```powershell
cd "AI_local_files\multimodal-RAG"
.\myvenv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## Stopping the Server

Press `Ctrl+C` in the terminal where the server is running.
