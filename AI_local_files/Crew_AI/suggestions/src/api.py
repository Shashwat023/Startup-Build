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
    StartupInput, SuggestionsResults,
    AnalysisResult, AgentStatus, PipelineStatus,
    MarketingSuggestions, TechSuggestions, OrgHRSuggestions,
    CompetitiveSuggestions, FinanceSuggestions
)
from main import prepare_inputs
from crew import BoardPanelCrew

app = FastAPI(
    title="Board Panel - Suggestions Analysis API",
    description="AI-powered startup advisory - SUGGESTIONS analysis with sequential pipeline execution",
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
COOLDOWN_SECONDS = 15  # Mandatory cooldown between agents
MAX_RETRIES_PER_AGENT = 1  # Single retry after cooldown

# Agent execution order with display names
AGENT_PIPELINE = [
    {"agent": "finance_advisor", "task": "finance_analysis_task", "display": "Finance Suggestions", "result_key": "finance_suggestions"},
    {"agent": "marketing_advisor", "task": "marketing_analysis_task", "display": "Marketing Suggestions", "result_key": "marketing_suggestions"},
    {"agent": "tech_lead", "task": "tech_analysis_task", "display": "Tech Suggestions", "result_key": "tech_suggestions"},
    {"agent": "org_hr_strategist", "task": "org_hr_analysis_task", "display": "Org/HR Suggestions", "result_key": "org_hr_suggestions"},
    {"agent": "competitive_analyst", "task": "competitive_analysis_task", "display": "Competitive Suggestions", "result_key": "competitive_suggestions"},
]

# Pydantic model mapping for each agent
PYDANTIC_MODELS = {
    "finance_advisor": FinanceSuggestions,
    "marketing_advisor": MarketingSuggestions,
    "tech_lead": TechSuggestions,
    "org_hr_strategist": OrgHRSuggestions,
    "competitive_analyst": CompetitiveSuggestions,
}


class AnalysisRequest(BaseModel):
    startup_data: StartupInput


class AnalysisResponse(BaseModel):
    analysis_id: str
    status: str
    message: str


def extract_suggestions_from_output(task_output, agent_name: str) -> list:
    """Extract suggestions from task output with multiple fallback strategies."""
    
    try:
        # Get the appropriate Pydantic model for this agent
        pydantic_model = PYDANTIC_MODELS.get(agent_name)
        
        # Strategy 1: Check if output is already a Pydantic model
        if pydantic_model and isinstance(task_output, pydantic_model):
            print(f"✓ {agent_name}: Direct Pydantic output")
            return task_output.suggestions
        
        # Strategy 2: Check if task_output has a pydantic attribute
        if hasattr(task_output, 'pydantic'):
            pydantic_output = task_output.pydantic
            if pydantic_model and isinstance(pydantic_output, pydantic_model):
                print(f"✓ {agent_name}: Pydantic from attribute")
                return pydantic_output.suggestions
            elif isinstance(pydantic_output, dict) and 'suggestions' in pydantic_output:
                print(f"✓ {agent_name}: Dict from pydantic attribute")
                return pydantic_output['suggestions']
        
        # Strategy 3: Check if it's a dict
        if isinstance(task_output, dict):
            if 'suggestions' in task_output:
                print(f"✓ {agent_name}: Direct dict with suggestions")
                return task_output['suggestions']
            elif 'pydantic' in task_output and isinstance(task_output['pydantic'], dict):
                if 'suggestions' in task_output['pydantic']:
                    print(f"✓ {agent_name}: Nested pydantic dict")
                    return task_output['pydantic']['suggestions']
        
        # Strategy 4: Try to parse as JSON string
        output_str = str(task_output)
        if output_str.strip().startswith('{'):
            json_match = re.search(r'\{[^{}]*?"suggestions"[^{}]*?\[[^\]]*?\][^{}]*?\}', output_str, re.DOTALL)
            if json_match:
                json_str = json_match.group(0)
                data = json.loads(json_str)
                if 'suggestions' in data:
                    print(f"✓ {agent_name}: Parsed from JSON string")
                    return data['suggestions']
        
        # Strategy 5: Parse using Pydantic validation
        if pydantic_model:
            try:
                parsed = pydantic_model.model_validate_json(output_str)
                print(f"✓ {agent_name}: Pydantic validation from string")
                return parsed.suggestions
            except:
                pass
        
        # Strategy 6: Extract from raw text
        suggestions_match = re.search(r'"suggestions"\s*:\s*\[(.*?)\]', output_str, re.DOTALL)
        if suggestions_match:
            suggestions_text = suggestions_match.group(1)
            suggestion_items = re.findall(r'"([^"]{15,})"', suggestions_text)
            if len(suggestion_items) >= 3:
                print(f"✓ {agent_name}: Regex extraction from text")
                return suggestion_items[:7]
        
        print(f"⚠ {agent_name}: Using fallback suggestions")
        return get_fallback_suggestions(agent_name)
        
    except Exception as e:
        print(f"✗ {agent_name} extraction error: {e}")
        return get_fallback_suggestions(agent_name)


def get_fallback_suggestions(agent_name: str) -> list:
    """Provide fallback suggestions when extraction fails."""
    fallback_map = {
        "finance_advisor": [
            "Monitor cash flow closely and maintain at least 6 months of runway.",
            "Explore multiple funding sources to diversify financial risk.",
            "Implement cost optimization measures to extend runway."
        ],
        "marketing_advisor": [
            "Diversify marketing channels to reduce dependency on single sources.",
            "Implement data-driven attribution to optimize marketing spend.",
            "Focus on retention strategies to improve customer lifetime value."
        ],
        "tech_lead": [
            "Ensure technical architecture is scalable for anticipated growth.",
            "Implement robust monitoring and error tracking systems.",
            "Maintain comprehensive documentation for critical systems."
        ],
        "org_hr_strategist": [
            "Clearly define roles and responsibilities to avoid overlaps.",
            "Invest in team development and training programs.",
            "Build a strong company culture aligned with business goals."
        ],
        "competitive_analyst": [
            "Continuously monitor competitive landscape and market trends.",
            "Strengthen unique value proposition to increase differentiation.",
            "Build defensible moats through network effects or proprietary technology."
        ]
    }
    
    return fallback_map.get(agent_name, [
        "Continue executing current strategy with regular reviews.",
        "Focus on core competencies and competitive advantages.",
        "Monitor key metrics and adjust approach as needed."
    ])


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
            
            # Extract suggestions using the comprehensive extraction logic
            if hasattr(result, 'tasks_output') and result.tasks_output:
                task_output = result.tasks_output[0]
            else:
                task_output = result
            
            suggestions = extract_suggestions_from_output(task_output, agent_info["agent"])
            agent_status.result = suggestions
            
            print(f"[PIPELINE] ✓ {agent_info['display']} completed successfully")
            return str(task_output)
            
        except Exception as e:
            error_msg = str(e)
            print(f"[PIPELINE] ✗ {agent_info['display']} failed: {error_msg[:200]}")
            
            if attempt <= MAX_RETRIES_PER_AGENT:
                # Will retry after cooldown
                agent_status.error = f"Attempt {attempt} failed, will retry after cooldown"
                print(f"[PIPELINE] Will retry after {COOLDOWN_SECONDS}s cooldown...")
            else:
                # Final failure - use fallback suggestions
                agent_status.status = "completed"  # Mark as completed to continue pipeline
                agent_status.completed_at = datetime.now().isoformat()
                fallback = get_fallback_suggestions(agent_info["agent"])
                agent_status.result = fallback
                agent_status.error = f"Failed after {attempt} attempts, using fallback suggestions"
                print(f"[PIPELINE] ⚠ {agent_info['display']} using fallback suggestions")
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
        suggestions_data = {
            "marketing_suggestions": [],
            "tech_suggestions": [],
            "org_hr_suggestions": [],
            "competitive_suggestions": [],
            "finance_suggestions": []
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
            
            # Store result (either from success or fallback)
            if agent_status.result:
                suggestions_data[agent_info["result_key"]] = agent_status.result
            
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
        results = SuggestionsResults(**suggestions_data)
        
        # Check if any agents succeeded
        completed_agents = [a for a in pipeline.agents if a.status == "completed"]
        
        analysis_results[analysis_id].status = "completed"
        analysis_results[analysis_id].result = results
        analysis_results[analysis_id].completed_at = datetime.now().isoformat()
        analysis_results[analysis_id].pipeline = pipeline
        
        print(f"\n{'='*60}")
        print(f"[PIPELINE] Complete! {len(completed_agents)}/{len(AGENT_PIPELINE)} agents completed")
        print(f"{'='*60}")
        
    except Exception as e:
        print(f"[PIPELINE] Fatal error: {str(e)}")
        pipeline_statuses[analysis_id].pipeline_status = "failed"
        analysis_results[analysis_id].status = "failed"
        analysis_results[analysis_id].error = str(e)
        analysis_results[analysis_id].completed_at = datetime.now().isoformat()


@app.get("/")
async def root():
    return {
        "status": "healthy",
        "service": "Board Panel - Suggestions Analysis",
        "version": "2.0.0"
    }


@app.post("/api/analyze")
async def analyze(request: AnalysisRequest, background_tasks: BackgroundTasks):
    """Submit for SUGGESTIONS analysis with sequential pipeline."""
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


@app.get("/api/results/{analysis_id}")
async def get_results(analysis_id: str):
    """Get the results of an analysis."""
    if analysis_id not in analysis_results:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    return analysis_results[analysis_id]


@app.get("/api/pipeline/{analysis_id}")
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
    uvicorn.run(app, host="0.0.0.0", port=8004)
