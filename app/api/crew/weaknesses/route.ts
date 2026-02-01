import { NextRequest, NextResponse } from "next/server";

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

        const weaknessesUrl = process.env.CREWAI_WEAKNESSES_URL;
        if (!weaknessesUrl) {
            return NextResponse.json(
                { error: "CREWAI_WEAKNESSES_URL not configured" },
                { status: 500 }
            );
        }

        // Submit analysis to FastAPI backend
        const submitResponse = await fetch(`${weaknessesUrl}/api/analyze`, {
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

        // Return immediately with analysis ID and stream URL
        return NextResponse.json({
            analysis_id: analysisId,
            stream_url: `/api/crew/weaknesses/stream?id=${analysisId}`,
            status: "queued",
            message: "Analysis queued. Connect to stream_url for real-time progress."
        });

    } catch (error) {
        console.error("Error in weaknesses analysis:", error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : "Internal server error",
            },
            { status: 500 }
        );
    }
}

// GET endpoint for polling fallback
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const analysisId = searchParams.get("id");

        if (!analysisId) {
            return NextResponse.json(
                { error: "analysis_id is required" },
                { status: 400 }
            );
        }

        const weaknessesUrl = process.env.CREWAI_WEAKNESSES_URL;
        if (!weaknessesUrl) {
            return NextResponse.json(
                { error: "CREWAI_WEAKNESSES_URL not configured" },
                { status: 500 }
            );
        }

        const response = await fetch(`${weaknessesUrl}/api/results/${analysisId}`);

        if (!response.ok) {
            if (response.status === 404) {
                return NextResponse.json(
                    { error: "Analysis not found" },
                    { status: 404 }
                );
            }
            const errorText = await response.text();
            return NextResponse.json(
                { error: `Backend error: ${errorText}` },
                { status: response.status }
            );
        }

        const result = await response.json();
        return NextResponse.json(result);

    } catch (error) {
        console.error("Error fetching weaknesses results:", error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : "Internal server error",
            },
            { status: 500 }
        );
    }
}
