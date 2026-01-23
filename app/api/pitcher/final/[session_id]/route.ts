import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/pitcher/final/[session_id]
 * Get the final pitch package after approval
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ session_id: string }> }
) {
    try {
        const { session_id } = await params;

        const pitcherUrl = process.env.PITCHER_AGENT_URL;

        if (!pitcherUrl) {
            return NextResponse.json(
                { error: "PITCHER_AGENT_URL not configured" },
                { status: 500 }
            );
        }

        const response = await fetch(
            `${pitcherUrl}/api/pitch/final/${session_id}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { error: data.detail || data.error || "Failed to get final pitch" },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error getting final pitch:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
