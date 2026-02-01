from crewai import Agent, Crew, Process, Task, LLM
from crewai.project import CrewBase, agent, crew, task
import os
from dotenv import load_dotenv

load_dotenv()


@CrewBase
class BoardPanelCrew:
    """BoardPanel Startup Advisory Crew - WEAKNESSES ONLY"""

    agents_config = 'config/agents.yaml'
    tasks_config = 'config/tasks.yaml'

    def __init__(self):
        groq_api_key = os.getenv('GROQ_API_KEY', '')
        groq_model = os.getenv('GROQ_MODEL', 'llama-3.3-70b-versatile')
        
        if not groq_api_key:
            raise ValueError("GROQ_API_KEY not found")
        
        # Set environment variables for LiteLLM
        os.environ['GROQ_API_KEY'] = groq_api_key
        
        # Initialize LLM with proper LiteLLM configuration
        self.llm = LLM(
            model=f"groq/{groq_model}",
            temperature=0.7,
            max_tokens=2048
        )
        
        super(BoardPanelCrew, self).__init__()

    @agent
    def marketing_advisor(self) -> Agent:
        return Agent(
            config=self.agents_config['marketing_advisor'],
            llm=self.llm,
            verbose=True
        )

    @agent
    def tech_lead(self) -> Agent:
        return Agent(
            config=self.agents_config['tech_lead'],
            llm=self.llm,
            verbose=True
        )

    @agent
    def org_hr_strategist(self) -> Agent:
        return Agent(
            config=self.agents_config['org_hr_strategist'],
            llm=self.llm,
            verbose=True
        )

    @agent
    def competitive_analyst(self) -> Agent:
        return Agent(
            config=self.agents_config['competitive_analyst'],
            llm=self.llm,
            verbose=True
        )

    @agent
    def finance_advisor(self) -> Agent:
        return Agent(
            config=self.agents_config['finance_advisor'],
            llm=self.llm,
            verbose=True
        )

    @task
    def marketing_analysis_task(self) -> Task:
        from models import AgentWeaknessOutput
        return Task(
            config=self.tasks_config['marketing_analysis_task'],
            agent=self.marketing_advisor(),
            output_json=AgentWeaknessOutput
        )

    @task
    def tech_analysis_task(self) -> Task:
        from models import AgentWeaknessOutput
        return Task(
            config=self.tasks_config['tech_analysis_task'],
            agent=self.tech_lead(),
            output_json=AgentWeaknessOutput
        )

    @task
    def org_hr_analysis_task(self) -> Task:
        from models import AgentWeaknessOutput
        return Task(
            config=self.tasks_config['org_hr_analysis_task'],
            agent=self.org_hr_strategist(),
            output_json=AgentWeaknessOutput
        )

    @task
    def competitive_analysis_task(self) -> Task:
        from models import AgentWeaknessOutput
        return Task(
            config=self.tasks_config['competitive_analysis_task'],
            agent=self.competitive_analyst(),
            output_json=AgentWeaknessOutput
        )

    @task
    def finance_analysis_task(self) -> Task:
        from models import AgentWeaknessOutput
        return Task(
            config=self.tasks_config['finance_analysis_task'],
            agent=self.finance_advisor(),
            output_json=AgentWeaknessOutput
        )

    @crew
    def crew(self) -> Crew:
        """Creates the BoardPanel crew with sequential execution."""
        # Create crew with tasks in specific order
        return Crew(
            agents=self.agents,
            tasks=self.tasks,
            process=Process.sequential,
            verbose=True,
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
