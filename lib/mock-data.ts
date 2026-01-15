import type {
    Project,
    AIAnalysis,
    MarketInsight,
    TeamMember,
    Document,
    AutomationLog,
} from "@/types";

/**
 * Mock data for the AI Startup Orchestration Platform
 * This simulates API responses for demonstration purposes
 */

export const mockProjects: Project[] = [
    {
        id: "proj-001",
        name: "EcoTrack",
        description: "AI-powered carbon footprint tracking app for individuals and businesses",
        status: "in-progress",
        createdAt: "2026-01-05T10:00:00Z",
        updatedAt: "2026-01-11T15:30:00Z",
        idea: "An AI-powered mobile and web application that helps individuals and businesses track, analyze, and reduce their carbon footprint through personalized recommendations and gamification.",
    },
    {
        id: "proj-002",
        name: "MindfulAI",
        description: "Mental wellness platform with AI-driven personalized meditation and therapy",
        status: "analyzing",
        createdAt: "2026-01-08T14:20:00Z",
        updatedAt: "2026-01-10T09:15:00Z",
        idea: "A mental wellness platform that uses AI to create personalized meditation sessions, track mood patterns, and provide evidence-based therapeutic interventions through conversational AI.",
    },
    {
        id: "proj-003",
        name: "CodeMentor Pro",
        description: "AI coding assistant specifically designed for teaching and mentoring",
        status: "planning",
        createdAt: "2026-01-03T08:45:00Z",
        updatedAt: "2026-01-09T16:00:00Z",
        idea: "An AI-powered coding education platform that adapts to each student's learning style, provides real-time code reviews, and creates personalized learning paths for software development.",
    },
    {
        id: "proj-004",
        name: "FoodWise",
        description: "Smart meal planning and nutrition optimization using computer vision",
        status: "ideation",
        createdAt: "2026-01-10T11:30:00Z",
        updatedAt: "2026-01-11T12:00:00Z",
        idea: "A mobile app that uses computer vision to analyze food, track nutrition, suggest meal plans based on health goals, and reduce food waste through smart inventory management.",
    },
];

export const mockAIAnalysis: AIAnalysis = {
    id: "analysis-001",
    projectId: "proj-001",
    summary: "EcoTrack presents a compelling opportunity in the rapidly growing sustainability tech market. The concept leverages AI to democratize carbon tracking, addressing both individual and enterprise needs. The gamification approach could drive user engagement, while the B2B2C model provides multiple revenue streams. Key challenges include data accuracy, user acquisition costs, and competition from established players.",
    strengths: [
        "Addresses urgent global need for carbon reduction with measurable impact",
        "Dual market approach (B2C and B2B) provides diversified revenue streams",
        "AI-driven personalization can create strong user retention and engagement",
        "Gamification elements tap into behavioral psychology for habit formation",
        "Scalable technology platform with potential for global expansion",
    ],
    weaknesses: [
        "High customer acquisition costs in crowded sustainability app market",
        "Dependency on accurate data sources for carbon calculations",
        "Requires significant initial investment in AI model training",
        "User fatigue risk - sustainability apps often see declining engagement",
        "Complex regulatory landscape across different markets",
    ],
    opportunities: [
        "Growing corporate ESG reporting requirements create B2B demand",
        "Potential partnerships with carbon offset providers for monetization",
        "Integration opportunities with smart home devices and IoT sensors",
        "Government incentives and grants for climate tech startups",
        "White-label solutions for enterprises wanting branded sustainability tools",
    ],
    threats: [
        "Competition from well-funded players like Google, Apple entering the space",
        "Changing carbon calculation methodologies could require platform overhauls",
        "Privacy concerns around tracking user behavior and consumption patterns",
        "Economic downturn could reduce consumer spending on sustainability tools",
        "Greenwashing backlash affecting trust in carbon tracking solutions",
    ],
    viabilityScore: 78,
    marketFitScore: 82,
    innovationScore: 75,
    recommendations: [
        {
            id: "rec-001",
            title: "Focus on B2B Enterprise Market First",
            description: "Given the higher willingness to pay and regulatory drivers, prioritize enterprise customers for initial traction and revenue. Use B2C as a freemium lead generation channel.",
            priority: "high",
            category: "business",
        },
        {
            id: "rec-002",
            title: "Partner with Established Data Providers",
            description: "Rather than building all carbon calculation models in-house, partner with established providers like Watershed or Persefoni to ensure data accuracy and credibility.",
            priority: "high",
            category: "technical",
        },
        {
            id: "rec-003",
            title: "Implement Social Features Early",
            description: "Add community challenges, leaderboards, and social sharing to leverage network effects and reduce churn through social accountability.",
            priority: "medium",
            category: "business",
        },
        {
            id: "rec-004",
            title: "Explore Carbon Credit Marketplace Integration",
            description: "Create a marketplace where users can purchase verified carbon credits directly through the app, adding a transaction-based revenue stream.",
            priority: "medium",
            category: "business",
        },
    ],
    generatedAt: "2026-01-11T15:30:00Z",
};

export const mockMarketInsights: MarketInsight[] = [
    {
        id: "insight-001",
        type: "trend",
        title: "ESG Reporting Mandates Accelerating",
        description: "New SEC and EU regulations require public companies to disclose Scope 1, 2, and 3 emissions, creating massive demand for carbon tracking solutions.",
        impact: "high",
        source: "McKinsey Sustainability Report 2026",
        confidence: 92,
    },
    {
        id: "insight-002",
        type: "competitor",
        title: "Watershed Raises $200M Series C",
        description: "Leading enterprise carbon accounting platform Watershed raised significant funding, validating the B2B market but also intensifying competition.",
        impact: "high",
        source: "TechCrunch",
        confidence: 95,
    },
    {
        id: "insight-003",
        type: "opportunity",
        title: "SMB Market Underserved",
        description: "While enterprise solutions exist, small and medium businesses lack affordable, easy-to-use carbon tracking tools, representing a blue ocean opportunity.",
        impact: "high",
        source: "Gartner Market Analysis",
        confidence: 85,
    },
    {
        id: "insight-004",
        type: "trend",
        title: "Consumer Sustainability Fatigue",
        description: "Studies show declining engagement with sustainability apps after initial enthusiasm, highlighting need for strong retention mechanics.",
        impact: "medium",
        source: "Stanford Behavioral Science Lab",
        confidence: 88,
    },
    {
        id: "insight-005",
        type: "opportunity",
        title: "API-First Carbon Platforms Growing",
        description: "Developers increasingly want to embed carbon tracking into existing apps via APIs, creating potential for platform business model.",
        impact: "medium",
        source: "a16z Climate Tech Thesis",
        confidence: 80,
    },
];

export const mockTeamMembers: TeamMember[] = [
    {
        id: "team-001",
        name: "Dr. Sarah Chen",
        role: "Chief Technology Officer",
        expertise: ["Machine Learning", "Climate Science", "Distributed Systems"],
        bio: "Former Google AI researcher with PhD in Environmental Engineering. Led carbon modeling projects at DeepMind. 10+ years building scalable ML systems.",
        aiGenerated: true,
        skills: [
            { name: "Machine Learning", level: 95 },
            { name: "Python/TensorFlow", level: 92 },
            { name: "Climate Modeling", level: 88 },
            { name: "System Architecture", level: 90 },
        ],
    },
    {
        id: "team-002",
        name: "Marcus Rodriguez",
        role: "Head of Product",
        expertise: ["Product Strategy", "UX Design", "Behavioral Psychology"],
        bio: "Ex-Spotify product lead who grew their sustainability features to 50M users. Expert in gamification and habit formation. Stanford MBA.",
        aiGenerated: true,
        skills: [
            { name: "Product Management", level: 93 },
            { name: "User Research", level: 89 },
            { name: "Gamification Design", level: 91 },
            { name: "Data Analytics", level: 85 },
        ],
    },
    {
        id: "team-003",
        name: "Aisha Patel",
        role: "VP of Business Development",
        expertise: ["Enterprise Sales", "Sustainability Consulting", "Partnerships"],
        bio: "Former Salesforce enterprise account executive and sustainability consultant at Deloitte. Built partnerships with Fortune 500 companies.",
        aiGenerated: true,
        skills: [
            { name: "Enterprise Sales", level: 94 },
            { name: "Partnership Development", level: 90 },
            { name: "ESG Consulting", level: 87 },
            { name: "Negotiation", level: 92 },
        ],
    },
    {
        id: "team-004",
        name: "James Liu",
        role: "Lead Mobile Engineer",
        expertise: ["React Native", "iOS/Android", "Performance Optimization"],
        bio: "Senior engineer from Uber with expertise in building high-performance mobile apps. Contributed to open-source climate tech projects.",
        aiGenerated: true,
        skills: [
            { name: "React Native", level: 96 },
            { name: "Mobile Architecture", level: 91 },
            { name: "Performance Optimization", level: 89 },
            { name: "CI/CD", level: 87 },
        ],
    },
];

export const mockDocuments: Document[] = [
    {
        id: "doc-001",
        title: "EcoTrack Business Plan 2026-2028",
        type: "business-plan",
        description: "Comprehensive 3-year business plan including market analysis, financial projections, and go-to-market strategy.",
        createdAt: "2026-01-11T10:00:00Z",
        fileSize: "2.4 MB",
    },
    {
        id: "doc-002",
        title: "Investor Pitch Deck",
        type: "pitch-deck",
        description: "Series A pitch deck highlighting market opportunity, product vision, team, and funding requirements.",
        createdAt: "2026-01-11T11:30:00Z",
        fileSize: "8.7 MB",
    },
    {
        id: "doc-003",
        title: "Technical Architecture Specification",
        type: "technical-spec",
        description: "Detailed technical architecture including AI model design, data pipeline, API specifications, and infrastructure plan.",
        createdAt: "2026-01-11T13:15:00Z",
        fileSize: "1.8 MB",
    },
    {
        id: "doc-004",
        title: "Market Research Report",
        type: "market-research",
        description: "In-depth analysis of the carbon tracking market, competitor landscape, and customer segments.",
        createdAt: "2026-01-11T14:00:00Z",
        fileSize: "3.2 MB",
    },
    {
        id: "doc-005",
        title: "Financial Model & Projections",
        type: "financial-model",
        description: "5-year financial model with revenue projections, cost structure, and key metrics for Series A fundraising.",
        createdAt: "2026-01-11T15:30:00Z",
        fileSize: "956 KB",
    },
];

export const mockAutomationLogs: AutomationLog[] = [
    {
        id: "log-001",
        timestamp: "2026-01-11T15:30:45Z",
        action: "AI Analysis Completed",
        status: "success",
        details: "Generated comprehensive SWOT analysis and market fit scoring using GPT-4 and proprietary startup evaluation models.",
        duration: 127,
    },
    {
        id: "log-002",
        timestamp: "2026-01-11T15:28:12Z",
        action: "Market Research Aggregation",
        status: "success",
        details: "Collected and analyzed 247 data points from industry reports, competitor websites, and market databases.",
        duration: 89,
    },
    {
        id: "log-003",
        timestamp: "2026-01-11T15:25:33Z",
        action: "Team Composition Generation",
        status: "success",
        details: "AI-generated optimal team structure with 4 key roles based on startup requirements and industry best practices.",
        duration: 45,
    },
    {
        id: "log-004",
        timestamp: "2026-01-11T15:23:01Z",
        action: "Document Generation - Business Plan",
        status: "success",
        details: "Created 42-page business plan including executive summary, market analysis, financial projections, and operational plan.",
        duration: 156,
    },
    {
        id: "log-005",
        timestamp: "2026-01-11T15:20:15Z",
        action: "Document Generation - Pitch Deck",
        status: "success",
        details: "Generated 18-slide investor pitch deck with market opportunity, product vision, team, and financial highlights.",
        duration: 98,
    },
    {
        id: "log-006",
        timestamp: "2026-01-11T15:18:42Z",
        action: "Technical Architecture Design",
        status: "success",
        details: "Created system architecture diagram and technical specifications for ML pipeline, APIs, and infrastructure.",
        duration: 112,
    },
    {
        id: "log-007",
        timestamp: "2026-01-11T15:15:00Z",
        action: "Competitor Analysis",
        status: "success",
        details: "Analyzed 12 direct competitors and 8 adjacent players, identifying key differentiators and market gaps.",
        duration: 203,
    },
    {
        id: "log-008",
        timestamp: "2026-01-11T15:10:30Z",
        action: "Idea Validation",
        status: "success",
        details: "Validated startup idea against 50+ criteria including market size, technical feasibility, and competitive landscape.",
        duration: 67,
    },
];

/**
 * Helper function to get a project by ID
 */
export function getProjectById(id: string): Project | undefined {
    return mockProjects.find((project) => project.id === id);
}

/**
 * Helper function to get full project data with all related information
 */
export function getFullProjectData(id: string): Project | null {
    const project = getProjectById(id);
    if (!project) return null;

    return {
        ...project,
        aiAnalysis: mockAIAnalysis,
        marketInsights: mockMarketInsights,
        team: mockTeamMembers,
        documents: mockDocuments,
        automationLogs: mockAutomationLogs,
    };
}
