import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/pitcher/start
 * Start a new pitch generation workflow
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { mvp_description } = body;

        if (!mvp_description) {
            return NextResponse.json(
                { error: "MVP description is required" },
                { status: 400 }
            );
        }

        const pitcherUrl = process.env.PITCHER_AGENT_URL;

        if (!pitcherUrl) {
            return NextResponse.json(
                { error: "PITCHER_AGENT_URL not configured" },
                { status: 500 }
            );
        }

        const response = await fetch(`${pitcherUrl}/api/pitch/start`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ mvp_description }),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { error: data.error || "Failed to start pitch workflow" },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error starting pitch workflow:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
