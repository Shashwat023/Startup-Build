# 🚀 StartupAI: AI-Powered Startup Orchestration Platform

StartupAI is a comprehensive, end-to-end platform designed to transform raw startup ideas into investment-ready business propositions. By leveraging a multi-agent orchestration system and advanced machine learning models, StartupAI provides founders with a professional toolkit for ideation, strategic analysis, team building, and investor outreach.

---

## ✨ Core Features

### 1. 🤖 Multimodal RAG Agent (Chatbot)
A powerful AI assistant that understands your business documents.
*   **Multimodal Queries**: Ask questions via **Text** or **Voice**.
*   **Document Intelligence**: Upload PDFs or text files for instant analysis.
*   **Source Tracking**: Get answers with clear citations from your uploaded knowledge base.

### 2. 👥 Board Panel Advisory (CrewAI)
Get strategic insights from a dedicated panel of specialized AI agents.
*   **Actionable Roadmaps**: Step-by-step 30-day plans for growth and execution.
*   **Strengths & Weaknesses**: Objective analysis of your business model and tech stack.
*   **Strategic Suggestions**: recibir strategic advice tailored to your specific industry and market stage.

### 3. 💡 Idea Enhancer (LangGraph)
Transform high-level concepts into robust business propositions using a specialized LangGraph workflow.
*   **Normalization & Structuring**: Refines raw ideas into professional formats.
*   **SWOT Analysis**: Identifies internal strengths/weaknesses and external opportunities/threats.
*   **Market Fit Scoring**: Evaluates your solution against target user needs.

### 4. 🎤 Iterative Pitch Generator (Pitcher)
Craft a winning pitch through an AI-powered "Human-in-the-Loop" workflow.
*   **AI Critique**: Receive detailed scores (Clarity, Problem, Solution, Traction) and constructive feedback.
*   **Refinement Loop**: Approve or reject AI refinements with specific feedback until the pitch is perfect.
*   **Final Package**: Generates elevator pitches, executive summaries, Q&A guides, and delivery tips.

### 5. 📈 Startup Success Predictor
Data-driven insights into your startup's future using Machine Learning.
*   **Predictive Analytics**: Calculates the probability of acquisition vs. operating vs. failure.
*   **Metric Analysis**: Evaluates milestones, funding history, and relationship velocity.

### 6. 🤝 Investor Connect
Automate your outreach to potential investors via professional workflows.
*   **n8n Orchestration**: Seamlessly connect with investors through automated email and CRM workflows.

---

## 🛠️ Technical Architecture

### Frontend
*   **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **Animations**: [Framer Motion](https://www.framer.com/motion/) & [GSAP](https://greensock.com/gsap/)
*   **Authentication**: [NextAuth.js](https://next-auth.js.org/)

### Backend & AI Infrastructure
*   **API Layer**: Next.js Route Handlers & FastAPI
*   **Orchestration**: [LangChain](https://www.langchain.com/), [LangGraph](https://www.langchain.com/langgraph), [CrewAI](https://www.crewai.com/)
*   **LLMs**: Groq (Llama 3), OpenAI models
*   **Database**: [MongoDB](https://www.mongodb.com/)
*   **Automation**: [n8n](https://n8n.io/)

---

## 🚦 Getting Started

### 1. Prerequisites
*   Node.js 18+
*   Python 3.10+
*   MongoDB Atlas account
*   Groq API Key

### 2. Environment Configuration
Create a `.env.local` file in the root directory and add the following:

| Variable | Description |
| :--- | :--- |
| `NEXTAUTH_SECRET` | Secret for session encryption |
| `GROQ_API_KEY` | Your Groq Cloud API key |
| `MONGODB_URI` | MongoDB connection string |
| `NEXT_PUBLIC_N8N_URL` | Your n8n webhook URL |

### 3. Installation
```bash
# Install frontend dependencies
npm install

# Setup local AI agents (optional but recommended)
# Each folder in AI_local_files may require its own virtual environment
```

### 4. Running the Platform
StartupAI requires several local microservices to enable all features.

**Start AI Agents (PowerShell):**
```powershell
./start-all-servers.ps1
```
*This will launch 8 services on ports 8000 through 8007.*

**Start Frontend:**
```bash
npm run dev
```

---
Built with ❤️ for the startup ecosystem.
