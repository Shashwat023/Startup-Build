from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uuid
from datetime import datetime
from typing import Dict
import json
import time
import re
from dotenv import load_dotenv

load_dotenv()

import warnings
import logging
logging.getLogger("litellm").setLevel(logging.ERROR)
warnings.filterwarnings("ignore", message=".*apscheduler.*")

from models import StartupInput, RoadmapResults, AnalysisResult, AgentRoadmap
from main import prepare_inputs
from crew import BoardPanelCrew

app = FastAPI(
    title="Board Panel - Roadmap API",
    description="AI-powered startup advisory - NEXT MONTH ROADMAP only",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware, 
    allow_origins=["*"], 
    allow_credentials=True, 
    allow_methods=["*"], 
    allow_headers=["*"]
)

# In-memory storage for analysis results
analysis_results: Dict[str, AnalysisResult] = {}

# Rate limiting configuration
REQUESTS_PER_MINUTE = 60  # Reduced to be more conservative
REQUEST_DELAY = 60.0 / REQUESTS_PER_MINUTE  # 1 second between requests
last_request_time = 0


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


def apply_rate_limit():
    """Apply rate limiting to API calls."""
    global last_request_time
    current_time = time.time()
    time_since_last = current_time - last_request_time
    
    if time_since_last < REQUEST_DELAY:
        sleep_time = REQUEST_DELAY - time_since_last
        time.sleep(sleep_time)
    
    last_request_time = time.time()


def run_analysis(analysis_id: str, startup_data: StartupInput):
    """Run the crew analysis with enhanced rate limiting and retry logic."""
    max_retries = 5  # Increased retries
    base_delay = 15  # Base delay in seconds
    
    try:
        analysis_results[analysis_id].status = "processing"
        inputs = prepare_inputs(startup_data)
        
        # Apply rate limiting before starting
        apply_rate_limit()
        
        crew_result = None
        for attempt in range(max_retries):
            try:
                if attempt > 0:
                    # Exponential backoff with jitter for retries
                    delay = base_delay * (2 ** attempt) + (time.time() % 5)
                    print(f"Rate limit retry {attempt + 1}/{max_retries}, waiting {delay:.1f}s...")
                    time.sleep(delay)
                
                # Run the crew
                crew_result = BoardPanelCrew().crew().kickoff(inputs=inputs)
                break
                
            except Exception as e:
                error_msg = str(e).lower()
                # Enhanced rate limit detection
                if any(keyword in error_msg for keyword in [
                    "rate_limit", "ratelimit", "429", "quota", 
                    "too many requests", "tokens per minute", "tpm"
                ]):
                    if attempt < max_retries - 1:
                        # Extract wait time from error if available
                        wait_match = re.search(r'try again in ([\d.]+)s', error_msg)
                        if wait_match:
                            wait_time = float(wait_match.group(1)) + 2  # Add buffer
                            print(f"Rate limit hit. API suggests waiting {wait_time}s")
                            time.sleep(wait_time)
                        continue
                    else:
                        # Final retry failed
                        raise Exception(f"Rate limit exceeded after {max_retries} retries. Please wait a few minutes and try again.")
                else:
                    # Non-rate-limit error, raise immediately
                    raise
        
        if not crew_result:
            raise Exception("Failed to get crew result after retries")
        
        # Extract tasks output
        tasks_output = crew_result.tasks_output if hasattr(crew_result, 'tasks_output') else []
        
        # Initialize results
        roadmap_data = {
            "marketing_roadmap": [],
            "tech_roadmap": [],
            "org_hr_roadmap": [],
            "competitive_roadmap": [],
            "finance_roadmap": []
        }
        
        # Process each task output
        for task_output in tasks_output:
            parsed = parse_agent_output_to_pydantic(str(task_output))
            agent_name = parsed.agent_name.lower()
            roadmap = parsed.next_month_roadmap
            
            # Map to correct roadmap based on agent name or task description
            task_desc = str(task_output.task).lower() if hasattr(task_output, 'task') else ""
            
            if "marketing" in agent_name or "marketing" in task_desc:
                roadmap_data["marketing_roadmap"] = roadmap
            elif "tech" in agent_name or "tech" in task_desc:
                roadmap_data["tech_roadmap"] = roadmap
            elif "org" in agent_name or "hr" in agent_name or "people" in agent_name:
                roadmap_data["org_hr_roadmap"] = roadmap
            elif "competitive" in agent_name or "competition" in task_desc:
                roadmap_data["competitive_roadmap"] = roadmap
            elif "finance" in agent_name or "financial" in agent_name:
                roadmap_data["finance_roadmap"] = roadmap
        
        # Create Pydantic result
        results = RoadmapResults(**roadmap_data)
        
        # Update analysis result
        analysis_results[analysis_id].status = "completed"
        analysis_results[analysis_id].result = results
        analysis_results[analysis_id].completed_at = datetime.now().isoformat()
        
    except Exception as e:
        error_message = str(e)
        
        # Add helpful context to error message
        if "rate_limit" in error_message.lower() or "ratelimit" in error_message.lower():
            error_message += "\n\nTip: The model may be experiencing high usage. Try again in a few minutes or switch to a faster model like 'llama-3.1-8b-instant' in your .env file."
        
        analysis_results[analysis_id].status = "failed"
        analysis_results[analysis_id].error = error_message


@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze(request: AnalysisRequest, background_tasks: BackgroundTasks):
    """Start a new roadmap analysis."""
    analysis_id = str(uuid.uuid4())
    
    # Initialize result object
    analysis_results[analysis_id] = AnalysisResult(
        analysis_id=analysis_id,
        status="queued",
        submitted_at=datetime.now().isoformat()
    )
    
    # Queue the analysis
    background_tasks.add_task(run_analysis, analysis_id, request.startup_data)
    
    return AnalysisResponse(
        analysis_id=analysis_id,
        status="queued",
        message="Roadmap analysis queued successfully. Check /api/results/{analysis_id} for status."
    )


@app.get("/api/results/{analysis_id}", response_model=AnalysisResult)
async def get_results(analysis_id: str):
    """Get the results of an analysis."""
    if analysis_id not in analysis_results:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    return analysis_results[analysis_id]


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "active_analyses": len([r for r in analysis_results.values() if r.status == "processing"]),
        "total_analyses": len(analysis_results)
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)
