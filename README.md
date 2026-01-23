# StartupAI - AI-Powered Startup Orchestration Platform

StartupAI is a comprehensive platform designed to transform your startup idea into reality. By leveraging advanced AI agents and machine learning models, StartupAI provides founders with the tools they need for ideation, analysis, team building, and investor outreach.

## 🚀 Core Functionalities

### 1. Board Panel Advisory (CrewAI)
Get a dedicated AI board to analyze your startup.
*   **Actionable Roadmaps**: Generate step-by-step plans for growth.
*   **Strengths & Weaknesses**: Identify what's working and what needs improvement.
*   **Suggestions**: Receive strategic advice tailored to your business model.

### 2. Idea Enhancer (LangGraph)
Transform raw ideas into robust business propositions.
*   Uses a specialized agent to research, refine, and structure your initial concept.

### 3. Chatbot (Multimodal RAG)
A powerful AI assistant for your startup documents.
*   **Document Analysis**: Upload PDFs or text files and ask questions.
*   **Multimodal Support**: Understands context from various data sources locally.

### 4. Pitch Generator (Iterative Pitcher)
Craft a winning pitch through an iterative workflow.
*   **AI Critique**: Receive detailed scores and feedback on your pitch.
*   **Human-in-the-Loop**: Approve or reject AI refinements until the pitch is perfect.
*   **Final Package**: Generates elevator pitches, executive summaries, and Q&A guides.

### 5. Startup Success Predictor
Data-driven insights into your startup's future.
*   Utilizes a Machine Learning model to predict the probability of success based on milestones, relationships, and funding.

### 6. Investor Connect
Automate your outreach to potential investors.
*   Submit your startup details and connect via automated n8n workflows.

## 🛠️ Tech Stack

*   **Frontend**: [Next.js 15](https://nextjs.org/), [React](https://reactjs.org/), [Tailwind CSS](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/).
*   **Backend**: Next.js API Route Handlers.
*   **AI Local Agents**: Python, [LangChain](https://www.langchain.com/), [LangGraph](https://www.langchain.com/langgraph), [CrewAI](https://www.crewai.com/).
*   **Database**: [MongoDB](https://www.mongodb.com/).
*   **Deployment/Automation**: [n8n](https://n8n.io/), Uvicorn.

## 🚦 Getting Started

1.  **Environment Setup**:
    *   Configure your `.env.local` with necessary API keys (Groq, MongoDB, etc.).
    *   Set up local agent URLs (Pitcher, CrewAI, RAG).

2.  **Installation**:
    ```bash
    npm install
    ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```

4.  **Local AI Agents**:
    Ensure your Python-based local agents are running (e.g., Pitcher Agent, RAG Server) to enable all features.

---
Built with ❤️ for the startup ecosystem.
