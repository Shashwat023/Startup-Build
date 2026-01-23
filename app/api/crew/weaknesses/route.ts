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
        const submitResponse = await fetch(`${weaknessesUrl}/analyze`, {
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

        // Poll for results (max 5 minutes, check every 3 seconds)
        const maxAttempts = 100;
        const pollInterval = 3000;

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            await new Promise((resolve) => setTimeout(resolve, pollInterval));

            const statusResponse = await fetch(
                `${weaknessesUrl}/results/${analysisId}`
            );

            if (statusResponse.ok) {
                const result = await statusResponse.json();

                if (result.status === "completed") {
                    return NextResponse.json({
                        analysis_id: analysisId,
                        agent: "weaknesses",
                        status: "completed",
                        submitted_at: result.submitted_at,
                        completed_at: result.completed_at,
                        result: result.result,
                    });
                }

                if (result.status === "failed") {
                    return NextResponse.json({
                        analysis_id: analysisId,
                        agent: "weaknesses",
                        status: "failed",
                        submitted_at: result.submitted_at,
                        error: result.error || "Analysis failed",
                    });
                }

                // Still processing, continue polling
                console.log(
                    `Attempt ${attempt + 1}/${maxAttempts}: Status is ${result.status}`
                );
            }
        }

        // Timeout
        return NextResponse.json(
            {
                analysis_id: analysisId,
                agent: "weaknesses",
                status: "processing",
                error: "Analysis timed out. Please check back later.",
            },
            { status: 408 }
        );
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
