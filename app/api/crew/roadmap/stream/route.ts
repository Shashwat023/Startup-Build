import { NextRequest } from "next/server";

// SSE Stream: Forward pipeline progress from FastAPI to frontend
export async function GET(request: NextRequest) {
    const analysisId = request.nextUrl.searchParams.get("id");

    if (!analysisId) {
        return new Response(
            JSON.stringify({ error: "Analysis ID required" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }

    const roadmapUrl = process.env.CREWAI_ROADMAP_URL;
    if (!roadmapUrl) {
        return new Response(
            JSON.stringify({ error: "CREWAI_ROADMAP_URL not configured" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }

    try {
        // Connect to FastAPI SSE stream
        const backendStream = await fetch(`${roadmapUrl}/api/stream/${analysisId}`, {
            headers: { "Accept": "text/event-stream" }
        });

        if (!backendStream.ok) {
            return new Response(
                JSON.stringify({ error: "Analysis not found" }),
                { status: backendStream.status, headers: { "Content-Type": "application/json" } }
            );
        }

        // Forward the SSE stream to the client
        return new Response(backendStream.body, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no"
            }
        });
    } catch (error) {
        console.error("Error connecting to stream:", error);
        return new Response(
            JSON.stringify({ error: "Failed to connect to backend stream" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}
