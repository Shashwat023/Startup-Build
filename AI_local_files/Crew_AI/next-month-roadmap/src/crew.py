from crewai import Agent, Crew, Process, Task, LLM
from crewai.project import CrewBase, agent, crew, task
import os
from dotenv import load_dotenv
import time

load_dotenv()


@CrewBase
class BoardPanelCrew:
    """BoardPanel Startup Advisory Crew - ROADMAP ONLY"""

    agents_config = 'config/agents.yaml'
    tasks_config = 'config/tasks.yaml'

    def __init__(self):
        groq_api_key = os.getenv('GROQ_API_KEY', '')
        groq_model = os.getenv('GROQ_MODEL', 'llama-3.3-70b-versatile')
        
        if not groq_api_key:
            raise ValueError("GROQ_API_KEY not found")
        
        os.environ['GROQ_API_KEY'] = groq_api_key
        
        # Configure LLM using OpenAI client with explicit Groq endpoint
        try:
            # Initialize LLM with explicit Groq configuration
            self.llm = LLM(
                model=groq_model,
                api_key=groq_api_key,
                api_base="https://api.groq.com/openai/v1",
                temperature=0.7,
                max_tokens=1500,
                timeout=60,
                max_retries=3,
            )
            
            print("LLM initialized successfully with explicit Groq endpoint")
            
        except Exception as e:
            print(f"LLM initialization failed: {e}")
            # Try with groq/ prefix as fallback
            try:
                self.llm = LLM(
                    model=f"groq/{groq_model}",
                    api_key=groq_api_key,
                    temperature=0.7,
                    max_tokens=1500,
                    timeout=60,
                    max_retries=3,
                )
                print("LLM initialized with Groq prefix format")
            except Exception as e2:
                raise Exception(f"Failed to initialize LLM with both methods: {e}, {e2}")
        
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
        return Task(
            config=self.tasks_config['marketing_analysis_task'],
            agent=self.marketing_advisor()
        )

    @task
    def tech_analysis_task(self) -> Task:
        return Task(
            config=self.tasks_config['tech_analysis_task'],
            agent=self.tech_lead()
        )

    @task
    def org_hr_analysis_task(self) -> Task:
        return Task(
            config=self.tasks_config['org_hr_analysis_task'],
            agent=self.org_hr_strategist()
        )

    @task
    def competitive_analysis_task(self) -> Task:
        return Task(
            config=self.tasks_config['competitive_analysis_task'],
            agent=self.competitive_analyst()
        )

    @task
    def finance_analysis_task(self) -> Task:
        return Task(
            config=self.tasks_config['finance_analysis_task'],
            agent=self.finance_advisor()
        )

    @crew
    def crew(self) -> Crew:
        """Creates the BoardPanel crew with sequential execution and rate limit management."""
        return Crew(
            agents=self.agents,
            tasks=self.tasks,
            process=Process.sequential,
            verbose=True,
            # Add delay between tasks to avoid rate limits
            step_callback=self._rate_limit_callback,
        )
    
    def _rate_limit_callback(self, step_output):
        """Add a small delay between tasks to avoid hitting rate limits."""
        time.sleep(2)  # 2 second delay between tasks
        return step_output
