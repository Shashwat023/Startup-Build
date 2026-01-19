import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { loadChat, deleteChat } from "@/lib/rag-storage";

// GET - Load specific chat
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const chat = await loadChat(id);

        if (!chat) {
            return NextResponse.json({ error: "Chat not found" }, { status: 404 });
        }

        // Verify ownership
        if (chat.user_id !== session.user.email) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        return NextResponse.json(chat);
    } catch (error) {
        console.error("Load chat error:", error);
        return NextResponse.json(
            { error: "Failed to load chat" },
            { status: 500 }
        );
    }
}

// DELETE - Delete specific chat
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        // Load chat to get session_id and verify ownership
        const chat = await loadChat(id);
        if (!chat) {
            return NextResponse.json({ error: "Chat not found" }, { status: 404 });
        }

        if (chat.user_id !== session.user.email) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Delete from MongoDB
        const deleted = await deleteChat(id);

        if (!deleted) {
            return NextResponse.json(
                { error: "Failed to delete chat" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            session_id: chat.session_id,
        });
    } catch (error) {
        console.error("Delete chat error:", error);
        return NextResponse.json(
            { error: "Failed to delete chat" },
            { status: 500 }
        );
    }
}
