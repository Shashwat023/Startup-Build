from crewai import Agent, Crew, Process, Task, LLM
from crewai.project import CrewBase, agent, crew, task
import os
import time
import warnings
import logging
from dotenv import load_dotenv

load_dotenv()

# Suppress litellm warnings about apscheduler
warnings.filterwarnings("ignore", module="litellm")
logging.getLogger("litellm").setLevel(logging.ERROR)

from models import AgentStrengthOutput


@CrewBase
class BoardPanelCrew:
    """BoardPanel Startup Advisory Crew - STRENGTHS ONLY with Structured Output - NO TOOLS"""

    agents_config = 'config/agents.yaml'
    tasks_config = 'config/tasks.yaml'

    def __init__(self):
        groq_api_key = os.getenv('GROQ_API_KEY', '')
        groq_model = os.getenv('GROQ_MODEL', 'llama-3.3-70b-versatile')
        
        if not groq_api_key:
            raise ValueError("GROQ_API_KEY not found")
        
        os.environ['GROQ_API_KEY'] = groq_api_key
        
        # LLM with JSON mode enabled for structured output
        # Increased max_tokens to ensure JSON completion
        self.llm = LLM(
            model=f"groq/{groq_model}",
            api_key=groq_api_key,
            temperature=0.3,
            max_tokens=1024,  # Increased from 600 to ensure complete JSON generation
            response_format={"type": "json_object"}
        )
        
        super(BoardPanelCrew, self).__init__()

    @agent
    def marketing_advisor(self) -> Agent:
        """Marketing advisor WITHOUT tools - analyzes input data directly"""
        return Agent(
            config=self.agents_config['marketing_advisor'],
            tools=[],
            llm=self.llm,
            verbose=True,
            allow_delegation=False
        )

    @agent
    def tech_lead(self) -> Agent:
        """Tech lead WITHOUT tools - analyzes input data directly"""
        return Agent(
            config=self.agents_config['tech_lead'],
            tools=[],
            llm=self.llm,
            verbose=True,
            allow_delegation=False
        )

    @agent
    def org_hr_strategist(self) -> Agent:
        """Org HR strategist WITHOUT tools - analyzes input data directly"""
        return Agent(
            config=self.agents_config['org_hr_strategist'],
            tools=[],
            llm=self.llm,
            verbose=True,
            allow_delegation=False
        )

    @agent
    def competitive_analyst(self) -> Agent:
        """Competitive analyst WITHOUT tools - analyzes input data directly"""
        return Agent(
            config=self.agents_config['competitive_analyst'],
            tools=[],
            llm=self.llm,
            verbose=True,
            allow_delegation=False
        )

    @agent
    def finance_advisor(self) -> Agent:
        """Finance advisor WITHOUT tools - analyzes input data directly"""
        return Agent(
            config=self.agents_config['finance_advisor'],
            tools=[],
            llm=self.llm,
            verbose=True,
            allow_delegation=False
        )

    @task
    def marketing_analysis_task(self) -> Task:
        return Task(
            config=self.tasks_config['marketing_analysis_task'],
            agent=self.marketing_advisor(),
            output_pydantic=AgentStrengthOutput
        )

    @task
    def tech_analysis_task(self) -> Task:
        return Task(
            config=self.tasks_config['tech_analysis_task'],
            agent=self.tech_lead(),
            output_pydantic=AgentStrengthOutput
        )

    @task
    def org_hr_analysis_task(self) -> Task:
        return Task(
            config=self.tasks_config['org_hr_analysis_task'],
            agent=self.org_hr_strategist(),
            output_pydantic=AgentStrengthOutput
        )

    @task
    def competitive_analysis_task(self) -> Task:
        return Task(
            config=self.tasks_config['competitive_analysis_task'],
            agent=self.competitive_analyst(),
            output_pydantic=AgentStrengthOutput
        )

    @task
    def finance_analysis_task(self) -> Task:
        return Task(
            config=self.tasks_config['finance_analysis_task'],
            agent=self.finance_advisor(),
            output_pydantic=AgentStrengthOutput
        )

    @crew
    def crew(self) -> Crew:
        """Creates the BoardPanel crew with sequential execution and structured output."""
        return Crew(
            agents=self.agents,
            tasks=self.tasks,
            process=Process.sequential,
            verbose=True,
            max_rpm=3
        )

    def get_agent_by_name(self, agent_name: str) -> Agent:
        """Get an agent instance by name for pipeline-controlled execution."""
        agent_map = {
            "finance_advisor": self.finance_advisor,
            "marketing_advisor": self.marketing_advisor,
            "tech_lead": self.tech_lead,
            "org_hr_strategist": self.org_hr_strategist,
            "competitive_analyst": self.competitive_analyst,
        }
        if agent_name not in agent_map:
            raise ValueError(f"Unknown agent: {agent_name}")
        return agent_map[agent_name]()

    def get_task_by_name(self, task_name: str) -> Task:
        """Get a task instance by name for pipeline-controlled execution."""
        task_map = {
            "finance_analysis_task": self.finance_analysis_task,
            "marketing_analysis_task": self.marketing_analysis_task,
            "tech_analysis_task": self.tech_analysis_task,
            "org_hr_analysis_task": self.org_hr_analysis_task,
            "competitive_analysis_task": self.competitive_analysis_task,
        }
        if task_name not in task_map:
            raise ValueError(f"Unknown task: {task_name}")
        return task_map[task_name]()

    def run_single_task(self, agent_name: str, task_name: str, inputs: dict):
        """
        Run a single agent task for pipeline-controlled execution.
        
        This allows the pipeline to control timing between agents,
        enforcing cooldown periods and controlled retries.
        """
        agent = self.get_agent_by_name(agent_name)
        task = self.get_task_by_name(task_name)
        
        # Create a mini-crew with just this agent and task
        single_crew = Crew(
            agents=[agent],
            tasks=[task],
            process=Process.sequential,
            verbose=True,
        )
        
        return single_crew.kickoff(inputs=inputs)
