import { NextRequest, NextResponse } from "next/server";

/**
 * API routes for session management
 */

// GET session info
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const { sessionId } = await params;

        const apiUrl = process.env.MULTIMODAL_RAG;
        if (!apiUrl) {
            return NextResponse.json(
                { error: "RAG service not configured" },
                { status: 500 }
            );
        }

        const response = await fetch(`${apiUrl}/session/${sessionId}`, {
            method: "GET",
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Session info error:", response.status, errorText);
            return NextResponse.json(
                { error: "Failed to get session info" },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Session API error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// DELETE session
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const { sessionId } = await params;

        const apiUrl = process.env.MULTIMODAL_RAG;
        if (!apiUrl) {
            return NextResponse.json(
                { error: "RAG service not configured" },
                { status: 500 }
            );
        }

        const response = await fetch(`${apiUrl}/session/${sessionId}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Session delete error:", response.status, errorText);
            return NextResponse.json(
                { error: "Failed to delete session" },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Session delete API error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
