import { NextRequest, NextResponse } from "next/server";

/**
 * API route for startup success prediction
 * Proxies requests to the ML model API
 */

interface PredictionRequest {
    relationships: number;
    funding_rounds: number;
    funding_total_usd: number;
    milestones: number;
    has_VC: 0 | 1;
    has_angel: 0 | 1;
    avg_participants: number;
    startup_age: number;
    execution_velocity: number;
    rounds_per_year: number;
}

interface PredictionResponse {
    prediction: string;
    probability_acquired: number;
}

export async function POST(request: NextRequest) {
    try {
        const body: PredictionRequest = await request.json();

        // Validate required fields
        const requiredFields: (keyof PredictionRequest)[] = [
            "relationships",
            "funding_rounds",
            "funding_total_usd",
            "milestones",
            "has_VC",
            "has_angel",
            "avg_participants",
            "startup_age",
            "execution_velocity",
            "rounds_per_year",
        ];

        for (const field of requiredFields) {
            if (body[field] === undefined || body[field] === null) {
                return NextResponse.json(
                    { error: `Missing required field: ${field}` },
                    { status: 400 }
                );
            }
        }

        // Validate numeric values
        if (
            typeof body.relationships !== "number" ||
            typeof body.funding_rounds !== "number" ||
            typeof body.funding_total_usd !== "number" ||
            typeof body.milestones !== "number" ||
            typeof body.avg_participants !== "number" ||
            typeof body.startup_age !== "number" ||
            typeof body.execution_velocity !== "number" ||
            typeof body.rounds_per_year !== "number"
        ) {
            return NextResponse.json(
                { error: "All fields except has_VC and has_angel must be numbers" },
                { status: 400 }
            );
        }

        // Validate boolean fields (0 or 1)
        if ((body.has_VC !== 0 && body.has_VC !== 1) || (body.has_angel !== 0 && body.has_angel !== 1)) {
            return NextResponse.json(
                { error: "has_VC and has_angel must be 0 or 1" },
                { status: 400 }
            );
        }

        // Get API URL from environment
        const apiUrl = process.env.STARTUP_SUCCESS_PREDICTOR;
        if (!apiUrl) {
            console.error("STARTUP_SUCCESS_PREDICTOR environment variable not set");
            return NextResponse.json(
                { error: "Prediction service not configured" },
                { status: 500 }
            );
        }

        // Call the ML model API
        const response = await fetch(`${apiUrl}/predict`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("ML API error:", response.status, errorText);
            return NextResponse.json(
                { error: "Prediction service unavailable" },
                { status: 503 }
            );
        }

        const data: PredictionResponse = await response.json();

        return NextResponse.json(data);
    } catch (error) {
        console.error("Prediction API error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
