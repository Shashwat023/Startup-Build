import { NextRequest, NextResponse } from "next/server";

/**
 * API route for clearing session memory
 */

export async function POST(
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

        const response = await fetch(`${apiUrl}/clear-memory/${sessionId}`, {
            method: "POST",
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Clear memory error:", response.status, errorText);
            return NextResponse.json(
                { error: "Failed to clear memory" },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Clear memory API error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
