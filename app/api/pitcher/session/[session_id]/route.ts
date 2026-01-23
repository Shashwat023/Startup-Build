import { NextRequest, NextResponse } from "next/server";

/**
 * DELETE /api/pitcher/session/[session_id]
 * Delete a pitch session
 */
export async function DELETE(
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
            `${pitcherUrl}/api/pitch/session/${session_id}`,
            {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { error: data.detail || data.error || "Failed to delete session" },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error deleting session:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
