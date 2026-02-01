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
    StartupInput, RoadmapResults, AnalysisResult, AgentRoadmap,
    AgentStatus, PipelineStatus
)
from main import prepare_inputs
from crew import BoardPanelCrew

app = FastAPI(
    title="Board Panel - Roadmap API",
    description="AI-powered startup advisory - NEXT MONTH ROADMAP with sequential pipeline execution",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware, 
    allow_origins=["*"], 
    allow_credentials=True, 
    allow_methods=["*"], 
    allow_headers=["*"]
)

# In-memory storage for analysis results and pipeline status
analysis_results: Dict[str, AnalysisResult] = {}
pipeline_statuses: Dict[str, PipelineStatus] = {}

# Pipeline configuration
COOLDOWN_SECONDS = 15  # Mandatory cooldown between agents
MAX_RETRIES_PER_AGENT = 1  # Single retry after cooldown

# Agent execution order with display names
AGENT_PIPELINE = [
    {"agent": "finance_advisor", "task": "finance_analysis_task", "display": "Finance Roadmap", "result_key": "finance_roadmap"},
    {"agent": "marketing_advisor", "task": "marketing_analysis_task", "display": "Marketing Roadmap", "result_key": "marketing_roadmap"},
    {"agent": "tech_lead", "task": "tech_analysis_task", "display": "Tech Roadmap", "result_key": "tech_roadmap"},
    {"agent": "org_hr_strategist", "task": "org_hr_analysis_task", "display": "Org/HR Roadmap", "result_key": "org_hr_roadmap"},
    {"agent": "competitive_analyst", "task": "competitive_analysis_task", "display": "Competitive Roadmap", "result_key": "competitive_roadmap"},
]


class AnalysisRequest(BaseModel):
    startup_data: StartupInput


class AnalysisResponse(BaseModel):
    analysis_id: str
    status: str
    message: str


def extract_json_from_text(text: str) -> dict:
    """Extract JSON from text using multiple strategies."""
    # Strategy 1: Try direct JSON parse
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    
    # Strategy 2: Extract JSON from markdown code blocks
    json_pattern = r'```(?:json)?\s*(\{.*?\})\s*```'
    matches = re.findall(json_pattern, text, re.DOTALL)
    if matches:
        try:
            return json.loads(matches[0])
        except json.JSONDecodeError:
            pass
    
    # Strategy 3: Find JSON object in text
    json_pattern = r'\{[^{}]*"agent_name"[^{}]*"next_month_roadmap"[^{}]*\}'
    matches = re.findall(json_pattern, text, re.DOTALL)
    if matches:
        try:
            return json.loads(matches[0])
        except json.JSONDecodeError:
            pass
    
    # Strategy 4: Extract roadmap items from text
    roadmap_items = []
    for line in text.split('\n'):
        if any(week in line.lower() for week in ['week 1', 'week 2', 'week 3', 'week 4', 'sprint 1', 'sprint 2', 'sprint 3', 'sprint 4', 'days 1-7', 'days 8-14', 'days 15-21', 'days 22-30']):
            cleaned_line = re.sub(r'^[\d\-\*\•\s]+', '', line).strip()
            if cleaned_line:
                roadmap_items.append(cleaned_line)
    
    if roadmap_items:
        return {
            "agent_name": "Unknown Agent",
            "next_month_roadmap": roadmap_items[:4]  # Ensure only 4 items
        }
    
    # Fallback
    return {
        "agent_name": "Unknown Agent",
        "next_month_roadmap": ["Week 1: Analysis in progress", "Week 2: Implementation", "Week 3: Review", "Week 4: Optimization"]
    }


def parse_agent_output_to_pydantic(output: str) -> AgentRoadmap:
    """Parse agent output to Pydantic model using structured extraction."""
    try:
        data = extract_json_from_text(str(output))
        return AgentRoadmap(**data)
    except Exception as e:
        # Fallback to default structure
        return AgentRoadmap(
            agent_name="Unknown Agent",
            next_month_roadmap=["Week 1: Analysis in progress", "Week 2: Implementation", "Week 3: Review", "Week 4: Optimization"]
        )


def initialize_pipeline_status(analysis_id: str) -> PipelineStatus:
    """Initialize pipeline status with all agents in pending state."""
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
    """
    Run a single agent with controlled retry logic.
    
    Returns the agent output or None if failed after retries.
    No exponential backoff - just a single retry after cooldown.
    """
    for attempt in range(1, MAX_RETRIES_PER_AGENT + 2):  # 1 initial + 1 retry
        agent_status.attempt = attempt
        agent_status.status = "running" if attempt == 1 else "retrying"
        agent_status.started_at = datetime.now().isoformat()
        
        try:
            print(f"\n{'='*60}")
            print(f"[PIPELINE] Running {agent_info['display']} (Attempt {attempt})")
            print(f"{'='*60}")
            
            # Run the agent task - this is synchronous, run in thread pool
            result = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: crew.run_single_task(
                    agent_info["agent"],
                    agent_info["task"],
                    inputs
                )
            )
            
            # Success!
            agent_status.status = "completed"
            agent_status.completed_at = datetime.now().isoformat()
            
            # Parse the result
            if hasattr(result, 'tasks_output') and result.tasks_output:
                output = str(result.tasks_output[0])
            else:
                output = str(result)
            
            parsed = parse_agent_output_to_pydantic(output)
            agent_status.result = parsed.next_month_roadmap
            
            print(f"[PIPELINE] ✓ {agent_info['display']} completed successfully")
            return output
            
        except Exception as e:
            error_msg = str(e)
            print(f"[PIPELINE] ✗ {agent_info['display']} failed: {error_msg[:200]}")
            
            if attempt <= MAX_RETRIES_PER_AGENT:
                # Will retry after cooldown
                agent_status.error = f"Attempt {attempt} failed, will retry after cooldown"
                print(f"[PIPELINE] Will retry after {COOLDOWN_SECONDS}s cooldown...")
            else:
                # Final failure
                agent_status.status = "failed"
                agent_status.error = error_msg[:500]
                agent_status.completed_at = datetime.now().isoformat()
                print(f"[PIPELINE] ✗ {agent_info['display']} failed after {attempt} attempts")
                return None
    
    return None


async def run_cooldown(analysis_id: str, agent_status: AgentStatus):
    """Run mandatory cooldown period with status updates."""
    agent_status.status = "cooling_down"
    
    for remaining in range(COOLDOWN_SECONDS, 0, -1):
        agent_status.cooldown_remaining = remaining
        
        # Update pipeline status
        if analysis_id in pipeline_statuses:
            pipeline_statuses[analysis_id].current_phase = "cooling_down"
        
        await asyncio.sleep(1)
    
    agent_status.cooldown_remaining = 0


async def run_sequential_pipeline(analysis_id: str, startup_data: StartupInput):
    """
    Sequential agent pipeline with mandatory cooldown between agents.
    
    This is the core execution logic:
    1. Run each agent one at a time
    2. Wait 15 seconds between agents
    3. Single retry on failure (after cooldown)
    4. No parallel execution, no exponential backoff
    """
    try:
        # Initialize
        pipeline = pipeline_statuses[analysis_id]
        pipeline.pipeline_status = "running"
        pipeline.started_at = datetime.now().isoformat()
        
        analysis_results[analysis_id].status = "processing"
        
        inputs = prepare_inputs(startup_data)
        crew = BoardPanelCrew()
        
        # Results collection
        roadmap_data = {
            "marketing_roadmap": [],
            "tech_roadmap": [],
            "org_hr_roadmap": [],
            "competitive_roadmap": [],
            "finance_roadmap": []
        }
        
        # Run each agent sequentially
        for i, agent_info in enumerate(AGENT_PIPELINE):
            agent_status = pipeline.agents[i]
            pipeline.current_agent = agent_info["display"]
            pipeline.current_phase = "running"
            
            print(f"\n{'#'*60}")
            print(f"[PIPELINE] Starting Agent {i+1}/{len(AGENT_PIPELINE)}: {agent_info['display']}")
            print(f"{'#'*60}")
            
            # Run the agent with retry logic
            output = await run_single_agent_with_retry(crew, agent_info, inputs, agent_status)
            
            # Store result if successful
            if output and agent_status.result:
                roadmap_data[agent_info["result_key"]] = agent_status.result
            
            # Mandatory cooldown (except for last agent)
            if i < len(AGENT_PIPELINE) - 1:
                print(f"\n[PIPELINE] ⏳ Starting {COOLDOWN_SECONDS}s cooldown...")
                await run_cooldown(analysis_id, agent_status)
                print(f"[PIPELINE] ✓ Cooldown complete, proceeding to next agent\n")
        
        # Pipeline complete
        pipeline.pipeline_status = "completed"
        pipeline.completed_at = datetime.now().isoformat()
        pipeline.current_agent = None
        pipeline.current_phase = None
        
        # Create final result
        results = RoadmapResults(**roadmap_data)
        
        # Check if any agents succeeded
        completed_agents = [a for a in pipeline.agents if a.status == "completed"]
        failed_agents = [a for a in pipeline.agents if a.status == "failed"]
        
        if len(completed_agents) > 0:
            analysis_results[analysis_id].status = "completed"
            analysis_results[analysis_id].result = results
            analysis_results[analysis_id].completed_at = datetime.now().isoformat()
            
            if failed_agents:
                analysis_results[analysis_id].error = f"{len(failed_agents)} agent(s) failed, partial results available"
        else:
            analysis_results[analysis_id].status = "failed"
            analysis_results[analysis_id].error = "All agents failed"
            analysis_results[analysis_id].completed_at = datetime.now().isoformat()
        
        analysis_results[analysis_id].pipeline = pipeline
        
        print(f"\n{'='*60}")
        print(f"[PIPELINE] Complete! {len(completed_agents)}/{len(AGENT_PIPELINE)} agents succeeded")
        print(f"{'='*60}")
        
    except Exception as e:
        print(f"[PIPELINE] Fatal error: {str(e)}")
        pipeline_statuses[analysis_id].pipeline_status = "failed"
        analysis_results[analysis_id].status = "failed"
        analysis_results[analysis_id].error = str(e)
        analysis_results[analysis_id].completed_at = datetime.now().isoformat()


@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze(request: AnalysisRequest, background_tasks: BackgroundTasks):
    """Start a new roadmap analysis with sequential pipeline."""
    analysis_id = str(uuid.uuid4())
    
    # Initialize pipeline status
    pipeline = initialize_pipeline_status(analysis_id)
    pipeline_statuses[analysis_id] = pipeline
    
    # Initialize result object
    analysis_results[analysis_id] = AnalysisResult(
        analysis_id=analysis_id,
        status="queued",
        submitted_at=datetime.now().isoformat(),
        pipeline=pipeline
    )
    
    # Queue the sequential pipeline
    background_tasks.add_task(run_sequential_pipeline, analysis_id, request.startup_data)
    
    return AnalysisResponse(
        analysis_id=analysis_id,
        status="queued",
        message="Sequential pipeline queued. Check /api/stream/{analysis_id} for real-time progress."
    )


@app.get("/api/stream/{analysis_id}")
async def stream_progress(analysis_id: str):
    """
    Server-Sent Events endpoint for real-time pipeline progress.
    
    Streams JSON events with current pipeline status including:
    - Current agent being executed
    - Cooldown countdown
    - Per-agent status and results
    """
    if analysis_id not in pipeline_statuses:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    async def event_generator():
        while True:
            if analysis_id not in pipeline_statuses:
                break
            
            pipeline = pipeline_statuses[analysis_id]
            
            # Send current status
            yield f"data: {pipeline.model_dump_json()}\n\n"
            
            # Check if pipeline is complete
            if pipeline.pipeline_status in ["completed", "failed"]:
                # Send final status and close
                await asyncio.sleep(0.5)
                yield f"data: {pipeline.model_dump_json()}\n\n"
                break
            
            await asyncio.sleep(1)
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )


@app.get("/api/results/{analysis_id}", response_model=AnalysisResult)
async def get_results(analysis_id: str):
    """Get the results of an analysis."""
    if analysis_id not in analysis_results:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    return analysis_results[analysis_id]


@app.get("/api/pipeline/{analysis_id}", response_model=PipelineStatus)
async def get_pipeline_status(analysis_id: str):
    """Get the current pipeline status for an analysis."""
    if analysis_id not in pipeline_statuses:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    return pipeline_statuses[analysis_id]


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
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
    uvicorn.run(app, host="0.0.0.0", port=8001)
