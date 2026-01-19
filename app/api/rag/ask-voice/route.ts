import { NextRequest, NextResponse } from "next/server";

/**
 * API route for voice-based queries to the RAG system
 * Content-Type: multipart/form-data
 */

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        const audio = formData.get("audio");
        const sessionId = formData.get("session_id");

        if (!audio) {
            return NextResponse.json(
                { error: "Audio file is required" },
                { status: 400 }
            );
        }

        const apiUrl = process.env.MULTIMODAL_RAG;
        if (!apiUrl) {
            console.error("MULTIMODAL_RAG environment variable not set");
            return NextResponse.json(
                { error: "RAG service not configured" },
                { status: 500 }
            );
        }

        // Build FormData for the external API
        const externalFormData = new FormData();
        externalFormData.append("audio", audio as Blob);
        if (sessionId) {
            externalFormData.append("session_id", sessionId as string);
        }

        const response = await fetch(`${apiUrl}/ask-voice`, {
            method: "POST",
            body: externalFormData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("RAG voice query error:", response.status, errorText);
            return NextResponse.json(
                { error: "Voice query failed" },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Voice query API error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
