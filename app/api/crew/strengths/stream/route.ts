import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const analysisId = searchParams.get("id");

        if (!analysisId) {
            return new Response("Missing analysis ID", { status: 400 });
        }

        const strengthsUrl = process.env.CREWAI_STRENGTHS_URL;
        if (!strengthsUrl) {
            return new Response("Backend URL not configured", { status: 500 });
        }

        // Connect to backend SSE stream
        const backendStream = await fetch(
            `${strengthsUrl}/api/stream/${analysisId}`
        );

        if (!backendStream.ok) {
            return new Response("Failed to connect to backend stream", {
                status: backendStream.status,
            });
        }

        // Forward the stream to the client
        return new Response(backendStream.body, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        });
    } catch (error) {
        console.error("Stream error:", error);
        return new Response("Stream connection failed", { status: 500 });
    }
}
