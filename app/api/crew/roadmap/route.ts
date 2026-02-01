import { NextRequest, NextResponse } from "next/server";

// POST: Submit analysis and wait for completion (legacy polling)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { startup_data } = body;

        if (!startup_data) {
            return NextResponse.json(
                { error: "startup_data is required" },
                { status: 400 }
            );
        }

        const roadmapUrl = process.env.CREWAI_ROADMAP_URL;
        if (!roadmapUrl) {
            return NextResponse.json(
                { error: "CREWAI_ROADMAP_URL not configured" },
                { status: 500 }
            );
        }

        // Submit analysis to FastAPI backend
        const submitResponse = await fetch(`${roadmapUrl}/api/analyze`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ startup_data }),
        });

        if (!submitResponse.ok) {
            const errorText = await submitResponse.text();
            console.error("FastAPI Error:", errorText);
            return NextResponse.json(
                { error: `Backend error: ${submitResponse.statusText}` },
                { status: submitResponse.status }
            );
        }

        const submitResult = await submitResponse.json();
        const analysisId = submitResult.analysis_id;

        // Return immediately with analysis ID for SSE streaming
        // Frontend should connect to /api/crew/roadmap/stream?id=<analysisId>
        return NextResponse.json({
            analysis_id: analysisId,
            agent: "next-month-roadmap",
            status: "queued",
            message: "Analysis started. Connect to SSE stream for real-time progress.",
            stream_url: `/api/crew/roadmap/stream?id=${analysisId}`
        });
    } catch (error) {
        console.error("Error in roadmap analysis:", error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : "Internal server error",
            },
            { status: 500 }
        );
    }
}

// GET: Poll for results (fallback)
export async function GET(request: NextRequest) {
    const analysisId = request.nextUrl.searchParams.get("id");

    if (!analysisId) {
        return NextResponse.json(
            { error: "Analysis ID required" },
            { status: 400 }
        );
    }

    const roadmapUrl = process.env.CREWAI_ROADMAP_URL;
    if (!roadmapUrl) {
        return NextResponse.json(
            { error: "CREWAI_ROADMAP_URL not configured" },
            { status: 500 }
        );
    }

    try {
        const response = await fetch(`${roadmapUrl}/api/results/${analysisId}`);

        if (!response.ok) {
            return NextResponse.json(
                { error: "Analysis not found" },
                { status: response.status }
            );
        }

        const result = await response.json();

        return NextResponse.json({
            analysis_id: analysisId,
            agent: "next-month-roadmap",
            status: result.status,
            submitted_at: result.submitted_at,
            completed_at: result.completed_at,
            result: result.result,
            error: result.error,
            pipeline: result.pipeline
        });
    } catch (error) {
        console.error("Error fetching results:", error);
        return NextResponse.json(
            { error: "Failed to fetch results" },
            { status: 500 }
        );
    }
}
