import { NextRequest, NextResponse } from "next/server";

/**
 * API route for uploading documents to the RAG system
 * Content-Type: multipart/form-data
 */

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        const files = formData.getAll("files");
        const sessionId = formData.get("session_id");

        if (!files || files.length === 0) {
            return NextResponse.json(
                { error: "No files provided" },
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
        files.forEach((file) => {
            externalFormData.append("files", file as Blob);
        });
        if (sessionId) {
            externalFormData.append("session_id", sessionId as string);
        }

        const response = await fetch(`${apiUrl}/upload-document`, {
            method: "POST",
            body: externalFormData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("RAG upload error:", response.status, errorText);
            return NextResponse.json(
                { error: "Document upload failed" },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Upload API error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
