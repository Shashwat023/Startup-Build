import { getDatabase } from './mongodb';
import { ObjectId } from 'mongodb';

export interface RAGMessage {
    id: string;
    type: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    metadata?: {
        transcribed_text?: string;
        content_type?: string;
        sources?: string[];
        text_docs_count?: number;
        image_docs_count?: number;
    };
}

export interface RAGChat {
    _id?: ObjectId;
    session_id: string;
    user_id: string;
    title: string;
    messages: RAGMessage[];
    created_at: Date;
    updated_at: Date;
    expires_at: Date;
}

const COLLECTION_NAME = 'rag_chats';
const TTL_DAYS = 7;

// Initialize collection with TTL index
export async function initializeCollection() {
    const db = await getDatabase();
    const collection = db.collection(COLLECTION_NAME);

    // Create TTL index on expires_at field
    await collection.createIndex(
        { expires_at: 1 },
        { expireAfterSeconds: 0 }
    );

    // Create index on user_id and updated_at for efficient queries
    await collection.createIndex(
        { user_id: 1, updated_at: -1 }
    );
}

// Generate chat title from first user message
function generateChatTitle(messages: RAGMessage[]): string {
    const firstUserMessage = messages.find(m => m.type === 'user');
    if (!firstUserMessage) return 'New Chat';

    const content = firstUserMessage.content;
    // Take first 50 chars or until first newline
    const title = content.split('\n')[0].substring(0, 50);
    return title.length < content.length ? `${title}...` : title;
}

// Save or update chat
export async function saveChat(
    sessionId: string,
    userId: string,
    messages: RAGMessage[],
    existingChatId?: string
): Promise<string> {
    const db = await getDatabase();
    const collection = db.collection<RAGChat>(COLLECTION_NAME);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + TTL_DAYS * 24 * 60 * 60 * 1000);

    const chatData: Partial<RAGChat> = {
        session_id: sessionId,
        user_id: userId,
        title: generateChatTitle(messages),
        messages,
        updated_at: now,
        expires_at: expiresAt,
    };

    if (existingChatId) {
        // Update existing chat
        await collection.updateOne(
            { _id: new ObjectId(existingChatId) },
            { $set: chatData }
        );
        return existingChatId;
    } else {
        // Create new chat
        const result = await collection.insertOne({
            ...chatData,
            created_at: now,
        } as RAGChat);
        return result.insertedId.toString();
    }
}

// Load chat by ID
export async function loadChat(chatId: string): Promise<RAGChat | null> {
    const db = await getDatabase();
    const collection = db.collection<RAGChat>(COLLECTION_NAME);

    return await collection.findOne({ _id: new ObjectId(chatId) });
}

// Load chat by session ID
export async function loadChatBySessionId(sessionId: string): Promise<RAGChat | null> {
    const db = await getDatabase();
    const collection = db.collection<RAGChat>(COLLECTION_NAME);

    return await collection.findOne({ session_id: sessionId });
}

// List recent chats for user
export async function listRecentChats(userId: string, limit: number = 20): Promise<RAGChat[]> {
    const db = await getDatabase();
    const collection = db.collection<RAGChat>(COLLECTION_NAME);

    return await collection
        .find({ user_id: userId })
        .sort({ updated_at: -1 })
        .limit(limit)
        .toArray();
}

// Delete chat
export async function deleteChat(chatId: string): Promise<boolean> {
    const db = await getDatabase();
    const collection = db.collection<RAGChat>(COLLECTION_NAME);

    const result = await collection.deleteOne({ _id: new ObjectId(chatId) });
    return result.deletedCount > 0;
}

// Delete all chats for user
export async function deleteAllChats(userId: string): Promise<number> {
    const db = await getDatabase();
    const collection = db.collection<RAGChat>(COLLECTION_NAME);

    const result = await collection.deleteMany({ user_id: userId });
    return result.deletedCount;
}

// Get session IDs for deletion
export async function getSessionIds(userId: string): Promise<string[]> {
    const db = await getDatabase();
    const collection = db.collection<RAGChat>(COLLECTION_NAME);

    const chats = await collection
        .find({ user_id: userId }, { projection: { session_id: 1 } })
        .toArray();

    return chats.map(chat => chat.session_id).filter(Boolean);
}
