from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import uuid
from datetime import datetime
from typing import Dict, Optional
import json
import asyncio
import re
from dotenv import load_dotenv

load_dotenv()

import warnings
import logging
logging.getLogger("litellm").setLevel(logging.ERROR)
warnings.filterwarnings("ignore", message=".*apscheduler.*")

from models import (
    StartupInput, WeaknessesResults, AgentWeaknessOutput,
    AnalysisResult, AgentStatus, PipelineStatus
)
from main import prepare_inputs
from crew import BoardPanelCrew

app = FastAPI(
    title="Board Panel - Weaknesses Analysis API",
    description="AI-powered startup advisory - WEAKNESSES analysis with sequential pipeline execution",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for analysis results and pipeline status
analysis_results: Dict[str, AnalysisResult] = {}
pipeline_statuses: Dict[str, PipelineStatus] = {}

# Pipeline configuration
COOLDOWN_SECONDS = 15
MAX_RETRIES_PER_AGENT = 1

# Agent execution order
AGENT_PIPELINE = [
    {"agent": "finance_advisor", "task": "finance_analysis_task", "display": "Finance Weaknesses", "result_key": "finance_weaknesses"},
    {"agent": "marketing_advisor", "task": "marketing_analysis_task", "display": "Marketing Weaknesses", "result_key": "marketing_weaknesses"},
    {"agent": "tech_lead", "task": "tech_analysis_task", "display": "Tech Weaknesses", "result_key": "tech_weaknesses"},
    {"agent": "org_hr_strategist", "task": "org_hr_analysis_task", "display": "Org/HR Weaknesses", "result_key": "org_hr_weaknesses"},
    {"agent": "competitive_analyst", "task": "competitive_analysis_task", "display": "Competitive Weaknesses", "result_key": "competitive_weaknesses"},
]


class AnalysisRequest(BaseModel):
    startup_data: StartupInput


class AnalysisResponse(BaseModel):
    analysis_id: str
    status: str
    message: str


def extract_weaknesses_from_output(task_output, task_index: int) -> list:
    """Extract weaknesses from task output with multiple fallback strategies."""
    task_names = ["Finance", "Marketing", "Tech", "Org", "Competitive"]
    task_name = task_names[task_index] if task_index < len(task_names) else "Unknown"
    
    try:
        if isinstance(task_output, AgentWeaknessOutput):
            print(f"✓ Task {task_index} ({task_name}): Direct Pydantic output")
            return task_output.weaknesses
        
        if hasattr(task_output, 'pydantic'):
            pydantic_output = task_output.pydantic
            if isinstance(pydantic_output, AgentWeaknessOutput):
                return pydantic_output.weaknesses
            elif isinstance(pydantic_output, dict) and 'weaknesses' in pydantic_output:
                return pydantic_output['weaknesses']
        
        if isinstance(task_output, dict):
            if 'weaknesses' in task_output:
                return task_output['weaknesses']
            elif 'pydantic' in task_output and isinstance(task_output['pydantic'], dict):
                if 'weaknesses' in task_output['pydantic']:
                    return task_output['pydantic']['weaknesses']
        
        output_str = str(task_output)
        if output_str.strip().startswith('{'):
            json_match = re.search(r'\{[^{}]*?"weaknesses"[^{}]*?\[[^\]]*?\][^{}]*?\}', output_str, re.DOTALL)
            if json_match:
                data = json.loads(json_match.group(0))
                if 'weaknesses' in data:
                    return data['weaknesses']
        
        try:
            parsed = AgentWeaknessOutput.model_validate_json(output_str)
            return parsed.weaknesses
        except:
            pass
        
        weaknesses_match = re.search(r'"weaknesses"\s*:\s*\[(.*?)\]', output_str, re.DOTALL)
        if weaknesses_match:
            weakness_items = re.findall(r'"([^"]{15,})"', weaknesses_match.group(1))
            if len(weakness_items) >= 3:
                return weakness_items[:5]
        
        print(f"⚠ Task {task_index} ({task_name}): Using fallback weaknesses")
        return get_fallback_weaknesses(task_index)
        
    except Exception as e:
        print(f"✗ Task {task_index} ({task_name}) extraction error: {e}")
        return get_fallback_weaknesses(task_index)


def get_fallback_weaknesses(task_index: int) -> list:
    """Provide fallback weaknesses when extraction fails."""
    fallback_weaknesses = {
        0: [
            "Financial metrics require more detailed tracking and analysis.",
            "Budget allocation may need optimization for better ROI.",
            "Cash flow projections should be refined for accuracy."
        ],
        1: [
            "Marketing strategy needs broader channel diversification.",
            "Customer acquisition metrics require closer monitoring.",
            "Brand positioning could be strengthened in the market."
        ],
        2: [
            "Technical debt may accumulate without proper management.",
            "System scalability needs proactive planning.",
            "Documentation and testing coverage could be improved."
        ],
        3: [
            "Team structure may require optimization for growth.",
            "Role definitions could be clarified further.",
            "Hiring pipeline needs acceleration for key positions."
        ],
        4: [
            "Competitive monitoring requires more systematic approach.",
            "Market positioning needs clearer differentiation.",
            "Pricing strategy should be analyzed against competitors."
        ]
    }
    return fallback_weaknesses.get(task_index, [
        "Area requires further analysis.",
        "Additional data needed for complete assessment.",
        "Review recommended for improvement opportunities."
    ])


def initialize_pipeline_status(analysis_id: str) -> PipelineStatus:
    agents = [
        AgentStatus(
            agent_name=agent_info["agent"],
            display_name=agent_info["display"],
            status="pending",
            attempt=1
        )
        for agent_info in AGENT_PIPELINE
    ]
    return PipelineStatus(
        analysis_id=analysis_id,
        pipeline_status="queued",
        agents=agents,
        total_cooldown_seconds=COOLDOWN_SECONDS
    )


async def run_single_agent_with_retry(
    crew: BoardPanelCrew,
    agent_info: dict,
    inputs: dict,
    agent_status: AgentStatus
) -> Optional[str]:
    for attempt in range(1, MAX_RETRIES_PER_AGENT + 2):
        agent_status.attempt = attempt
        agent_status.status = "running" if attempt == 1 else "retrying"
        agent_status.started_at = datetime.now().isoformat()
        
        try:
            print(f"\n{'='*60}")
            print(f"[PIPELINE] Running {agent_info['display']} (Attempt {attempt})")
            print(f"{'='*60}")
            
            result = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: crew.run_single_task(
                    agent_info["agent"],
                    agent_info["task"],
                    inputs
                )
            )
            
            agent_status.status = "completed"
            agent_status.completed_at = datetime.now().isoformat()
            
            if hasattr(result, 'tasks_output') and result.tasks_output:
                task_output = result.tasks_output[0]
            else:
                task_output = result
            
            task_index = next((i for i, info in enumerate(AGENT_PIPELINE) if info["agent"] == agent_info["agent"]), 0)
            weaknesses = extract_weaknesses_from_output(task_output, task_index)
            agent_status.result = weaknesses
            
            print(f"[PIPELINE] ✓ {agent_info['display']} completed successfully")
            return str(task_output)
            
        except Exception as e:
            error_msg = str(e)
            print(f"[PIPELINE] ✗ {agent_info['display']} failed: {error_msg[:200]}")
            
            if attempt <= MAX_RETRIES_PER_AGENT:
                agent_status.error = f"Attempt {attempt} failed, will retry after cooldown"
            else:
                agent_status.status = "completed"
                agent_status.completed_at = datetime.now().isoformat()
                task_index = next((i for i, info in enumerate(AGENT_PIPELINE) if info["agent"] == agent_info["agent"]), 0)
                agent_status.result = get_fallback_weaknesses(task_index)
                agent_status.error = f"Failed after {attempt} attempts, using fallback"
                return None
    return None


async def run_cooldown(analysis_id: str, agent_status: AgentStatus):
    agent_status.status = "cooling_down"
    for remaining in range(COOLDOWN_SECONDS, 0, -1):
        agent_status.cooldown_remaining = remaining
        if analysis_id in pipeline_statuses:
            pipeline_statuses[analysis_id].current_phase = "cooling_down"
        await asyncio.sleep(1)
    agent_status.cooldown_remaining = 0


async def run_sequential_pipeline(analysis_id: str, startup_data: StartupInput):
    try:
        pipeline = pipeline_statuses[analysis_id]
        pipeline.pipeline_status = "running"
        pipeline.started_at = datetime.now().isoformat()
        
        analysis_results[analysis_id].status = "processing"
        
        inputs = prepare_inputs(startup_data)
        crew = BoardPanelCrew()
        
        weaknesses_data = {
            "marketing_weaknesses": [],
            "tech_weaknesses": [],
            "org_hr_weaknesses": [],
            "competitive_weaknesses": [],
            "finance_weaknesses": []
        }
        
        for i, agent_info in enumerate(AGENT_PIPELINE):
            agent_status = pipeline.agents[i]
            pipeline.current_agent = agent_info["display"]
            pipeline.current_phase = "running"
            
            await run_single_agent_with_retry(crew, agent_info, inputs, agent_status)
            
            if agent_status.result:
                weaknesses_data[agent_info["result_key"]] = agent_status.result
            
            if i < len(AGENT_PIPELINE) - 1:
                await run_cooldown(analysis_id, agent_status)
        
        pipeline.pipeline_status = "completed"
        pipeline.completed_at = datetime.now().isoformat()
        pipeline.current_agent = None
        pipeline.current_phase = None
        
        results = WeaknessesResults(**weaknesses_data)
        
        analysis_results[analysis_id].status = "completed"
        analysis_results[analysis_id].result = results
        analysis_results[analysis_id].completed_at = datetime.now().isoformat()
        analysis_results[analysis_id].pipeline = pipeline
        
    except Exception as e:
        print(f"[PIPELINE] Fatal error: {str(e)}")
        pipeline_statuses[analysis_id].pipeline_status = "failed"
        analysis_results[analysis_id].status = "failed"
        analysis_results[analysis_id].error = str(e)
        analysis_results[analysis_id].completed_at = datetime.now().isoformat()


@app.get("/")
async def root():
    return {"status": "healthy", "service": "Board Panel - Weaknesses Analysis", "version": "2.0.0"}


@app.post("/api/analyze")
async def analyze(request: AnalysisRequest, background_tasks: BackgroundTasks):
    analysis_id = str(uuid.uuid4())
    
    pipeline = initialize_pipeline_status(analysis_id)
    pipeline_statuses[analysis_id] = pipeline
    
    analysis_results[analysis_id] = AnalysisResult(
        analysis_id=analysis_id,
        status="queued",
        submitted_at=datetime.now().isoformat(),
        pipeline=pipeline
    )
    
    background_tasks.add_task(run_sequential_pipeline, analysis_id, request.startup_data)
    
    return AnalysisResponse(
        analysis_id=analysis_id,
        status="queued",
        message="Sequential pipeline queued. Check /api/stream/{analysis_id} for real-time progress."
    )


@app.get("/api/stream/{analysis_id}")
async def stream_progress(analysis_id: str):
    if analysis_id not in pipeline_statuses:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    async def event_generator():
        while True:
            if analysis_id not in pipeline_statuses:
                break
            
            pipeline = pipeline_statuses[analysis_id]
            yield f"data: {pipeline.model_dump_json()}\n\n"
            
            if pipeline.pipeline_status in ["completed", "failed"]:
                await asyncio.sleep(0.5)
                yield f"data: {pipeline.model_dump_json()}\n\n"
                break
            
            await asyncio.sleep(1)
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive", "X-Accel-Buffering": "no"}
    )


@app.get("/api/results/{analysis_id}")
async def get_results(analysis_id: str):
    if analysis_id not in analysis_results:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return analysis_results[analysis_id]


@app.get("/api/health")
async def health_check():
    active = [r for r in analysis_results.values() if r.status == "processing"]
    return {
        "status": "healthy",
        "version": "2.0.0",
        "cooldown_seconds": COOLDOWN_SECONDS,
        "max_retries_per_agent": MAX_RETRIES_PER_AGENT,
        "active_analyses": len(active),
        "total_analyses": len(analysis_results)
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)
