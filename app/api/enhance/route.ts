import { NextRequest, NextResponse } from "next/server";

/**
 * API route for startup idea enhancement
 * Proxies requests to the enhancement agent API
 */

interface EnhancementRequest {
    raw_idea: string;
}

interface EnhancementResponse {
    result: {
        problem_statement: string;
        target_users: string;
        solution: string;
        value_proposition: string;
        key_assumptions: string[];
        feasibility_score: number;
        desirability_score: number;
        viability_score: number;
        market_type: string;
        differentiation_strength: string;
        execution_complexity: string;
        competitors: Array<{
            name?: string;
            description?: string;
            [key: string]: any;
        }>;
        market_size: {
            TAM?: string | number;
            SAM?: string | number;
            SOM?: string | number;
        };
        next_best_action: string;
        validation_readiness: string;
        revenue_streams: string[];
        key_metrics: string[];
        mvp_scope: string;
        customer_acquisition_channels: string[];
        ethical_legal_sensitivity: string;
        [key: string]: any;
    };
}

export async function POST(request: NextRequest) {
    try {
        const body: EnhancementRequest = await request.json();

        // Validate required field
        if (!body.raw_idea || typeof body.raw_idea !== "string") {
            return NextResponse.json(
                { error: "raw_idea is required and must be a string" },
                { status: 400 }
            );
        }

        // Validate idea is not empty
        if (body.raw_idea.trim().length === 0) {
            return NextResponse.json(
                { error: "raw_idea cannot be empty" },
                { status: 400 }
            );
        }

        // Get API URL from environment
        const apiUrl = process.env.STARTUP_IDEA_ENHANCEMENT;
        if (!apiUrl) {
            console.error("STARTUP_IDEA_ENHANCEMENT environment variable not set");
            return NextResponse.json(
                { error: "Enhancement service not configured" },
                { status: 500 }
            );
        }

        // Call the enhancement API
        const response = await fetch(`${apiUrl}/enhance-idea`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Enhancement API error:", response.status, errorText);
            return NextResponse.json(
                { error: "Enhancement service unavailable" },
                { status: 503 }
            );
        }

        const data: EnhancementResponse = await response.json();

        return NextResponse.json(data);
    } catch (error) {
        console.error("Enhancement API error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
