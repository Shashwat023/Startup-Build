import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/pitcher/approve/[session_id]
 * Approve or reject a pitch and provide feedback
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ session_id: string }> }
) {
    try {
        const body = await request.json();
        const { approved, feedback } = body;
        const { session_id } = await params;

        if (typeof approved !== "boolean") {
            return NextResponse.json(
                { error: "Approved field is required and must be a boolean" },
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

        const response = await fetch(
            `${pitcherUrl}/api/pitch/approve/${session_id}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ approved, feedback: feedback || "" }),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { error: data.detail || data.error || "Failed to process approval" },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error processing approval:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
