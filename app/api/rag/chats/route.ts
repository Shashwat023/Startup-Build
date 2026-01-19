import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
    listRecentChats,
    saveChat,
    deleteAllChats,
    getSessionIds,
    initializeCollection,
} from "@/lib/rag-storage";
import type { RAGMessage } from "@/lib/rag-storage";

// Initialize collection on first load
initializeCollection().catch(console.error);

// GET - List recent chats
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const chats = await listRecentChats(session.user.email);
        return NextResponse.json(chats);
    } catch (error) {
        console.error("List chats error:", error);
        return NextResponse.json(
            { error: "Failed to list chats" },
            { status: 500 }
        );
    }
}

// POST - Save chat
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { session_id, messages, chat_id } = body;

        if (!session_id || !messages) {
            return NextResponse.json(
                { error: "session_id and messages are required" },
                { status: 400 }
            );
        }

        const chatId = await saveChat(
            session_id,
            session.user.email,
            messages as RAGMessage[],
            chat_id
        );

        return NextResponse.json({ chat_id: chatId });
    } catch (error) {
        console.error("Save chat error:", error);
        return NextResponse.json(
            { error: "Failed to save chat" },
            { status: 500 }
        );
    }
}

// DELETE - Delete all chats
export async function DELETE(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get all session IDs before deleting
        const sessionIds = await getSessionIds(session.user.email);

        // Delete from MongoDB
        const deletedCount = await deleteAllChats(session.user.email);

        return NextResponse.json({
            deleted_count: deletedCount,
            session_ids: sessionIds,
        });
    } catch (error) {
        console.error("Delete all chats error:", error);
        return NextResponse.json(
            { error: "Failed to delete chats" },
            { status: 500 }
        );
    }
}
