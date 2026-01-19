import { NextRequest, NextResponse } from "next/server";

/**
 * API route for text-based queries to the RAG system
 * Content-Type: application/x-www-form-urlencoded
 */

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { question, session_id } = body;

        if (!question || typeof question !== "string") {
            return NextResponse.json(
                { error: "Question is required" },
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

        // Build URL-encoded form data
        const formData = new URLSearchParams();
        formData.append("question", question);
        if (session_id) {
            formData.append("session_id", session_id);
        }

        const response = await fetch(`${apiUrl}/ask-text`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: formData.toString(),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("RAG text query error:", response.status, errorText);
            return NextResponse.json(
                { error: "Query failed" },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Text query API error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
