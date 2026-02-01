import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
    // If user is not authenticated and trying to access protected API routes
    if (!req.auth) {
        return NextResponse.json(
            {
                error: "Authentication required",
                code: "AUTH_REQUIRED",
                message: "Please sign in to use this feature"
            },
            { status: 401 }
        )
    }

    return NextResponse.next()
})

export const config = {
    // Only protect API routes (except auth routes)
    // Users can browse all pages, but API calls require authentication
    matcher: ["/api/((?!auth).*)"]
}
