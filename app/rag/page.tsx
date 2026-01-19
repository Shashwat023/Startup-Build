"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
    Send,
    Mic,
    MicOff,
    Plus,
    Loader2,
    Bot,
    User,
    Trash2,
    AlertCircle,
    X,
    MessageSquare,
    Upload,
} from "lucide-react";
import { Sidebar } from "@/components/rag/sidebar";
import { UploadModal } from "@/components/rag/upload-modal";
import { DeleteConfirm } from "@/components/rag/delete-confirm";

interface Message {
    id: string;
    type: "user" | "assistant" | "system";
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

interface Chat {
    _id: string;
    session_id: string;
    title: string;
    updated_at: string;
    messages: Message[];
}

export default function RAGPage() {
    const { data: session } = useSession();

    // UI State
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<{
        isOpen: boolean;
        type: "current" | "all";
    }>({ isOpen: false, type: "current" });

    // Chat State
    const [chats, setChats] = useState<Chat[]>([]);
    const [activeChat, setActiveChat] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState("");
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);

    // Loading States
    const [isLoading, setIsLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isLoadingChats, setIsLoadingChats] = useState(true);

    // Error State
    const [error, setError] = useState<string | null>(null);

    // Refs
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Load chats on mount
    useEffect(() => {
        if (session?.user) {
            loadChats();
        }
    }, [session]);

    // Save chat after messages change
    useEffect(() => {
        if (sessionId && messages.length > 0 && session?.user) {
            saveCurrentChat();
        }
    }, [messages, sessionId]);

    // Generate unique ID
    const generateId = () => Math.random().toString(36).substring(2, 15);

    // Add message to chat
    const addMessage = (
        type: Message["type"],
        content: string,
        metadata?: Message["metadata"]
    ) => {
        const message: Message = {
            id: generateId(),
            type,
            content,
            timestamp: new Date(),
            metadata,
        };
        setMessages((prev) => [...prev, message]);
        return message;
    };

    // Load chats from MongoDB
    const loadChats = async () => {
        try {
            setIsLoadingChats(true);
            const response = await fetch("/api/rag/chats");
            if (response.ok) {
                const data = await response.json();
                setChats(data);
            }
        } catch (err) {
            console.error("Failed to load chats:", err);
        } finally {
            setIsLoadingChats(false);
        }
    };

    // Save current chat to MongoDB
    const saveCurrentChat = async () => {
        if (!sessionId || !session?.user) return;

        try {
            await fetch("/api/rag/chats", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    session_id: sessionId,
                    messages,
                    chat_id: currentChatId,
                }),
            });

            // Reload chats to update sidebar
            loadChats();
        } catch (err) {
            console.error("Failed to save chat:", err);
        }
    };

    // Load chat from sidebar
    const handleSelectChat = async (chatId: string) => {
        try {
            const response = await fetch(`/api/rag/chats/${chatId}`);
            if (response.ok) {
                const chat: Chat = await response.json();
                setActiveChat(chatId);
                setCurrentChatId(chatId);
                setSessionId(chat.session_id);
                setMessages(chat.messages);
                setIsSidebarOpen(false);
            }
        } catch (err) {
            console.error("Failed to load chat:", err);
            setError("Failed to load chat");
        }
    };

    // Start new chat
    const handleNewChat = () => {
        setActiveChat(null);
        setCurrentChatId(null);
        setSessionId(null);
        setMessages([]);
        setError(null);
        setIsSidebarOpen(false);
    };

    // Delete current chat
    const handleDeleteCurrentChat = async () => {
        if (!currentChatId) return;

        setIsDeleting(true);
        try {
            const response = await fetch(`/api/rag/chats/${currentChatId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                const data = await response.json();

                if (data.session_id) {
                    await fetch(`/api/rag/session/${data.session_id}`, {
                        method: "DELETE",
                    });
                }

                handleNewChat();
                loadChats();
            }
        } catch (err) {
            console.error("Failed to delete chat:", err);
            setError("Failed to delete chat");
        } finally {
            setIsDeleting(false);
            setDeleteConfirm({ isOpen: false, type: "current" });
        }
    };

    // Delete all chats
    const handleDeleteAllChats = async () => {
        setIsDeleting(true);
        try {
            const response = await fetch("/api/rag/chats", {
                method: "DELETE",
            });

            if (response.ok) {
                const data = await response.json();

                for (const sid of data.session_ids) {
                    await fetch(`/api/rag/session/${sid}`, {
                        method: "DELETE",
                    }).catch(console.error);
                }

                handleNewChat();
                loadChats();
            }
        } catch (err) {
            console.error("Failed to delete all chats:", err);
            setError("Failed to delete all chats");
        } finally {
            setIsDeleting(false);
            setDeleteConfirm({ isOpen: false, type: "all" });
        }
    };

    // Handle text query
    const handleTextSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || isLoading) return;

        const question = inputText.trim();
        setInputText("");
        setError(null);
        setIsLoading(true);

        addMessage("user", question);

        try {
            const response = await fetch("/api/rag/ask-text", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    question,
                    session_id: sessionId,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Query failed");
            }

            if (!sessionId && data.session_id) {
                setSessionId(data.session_id);
            }

            addMessage("assistant", data.answer, {
                content_type: data.content_type,
                sources: data.sources,
                text_docs_count: data.text_docs_count,
                image_docs_count: data.image_docs_count,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
            addMessage("system", "Failed to get response. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // Handle document upload
    const handleFileUpload = async (files: FileList) => {
        const formData = new FormData();
        Array.from(files).forEach((file) => {
            formData.append("files", file);
        });
        if (sessionId) {
            formData.append("session_id", sessionId);
        }

        const response = await fetch("/api/rag/upload", {
            method: "POST",
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Upload failed");
        }

        if (!sessionId && data.session_id) {
            setSessionId(data.session_id);
        }

        addMessage(
            "system",
            `✅ Uploaded ${data.files_processed.length} document(s): ${data.files_processed.join(", ")}`
        );
    };

    // Voice recording
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: "audio/webm",
            });

            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, {
                    type: "audio/webm",
                });
                stream.getTracks().forEach((track) => track.stop());
                await sendVoiceQuery(audioBlob);
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            setError("Microphone access denied. Please enable microphone permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const sendVoiceQuery = async (audioBlob: Blob) => {
        setIsLoading(true);
        setError(null);

        addMessage("user", "🎤 Voice message sent...");

        const formData = new FormData();
        formData.append("audio", audioBlob, "recording.webm");
        if (sessionId) {
            formData.append("session_id", sessionId);
        }

        try {
            const response = await fetch("/api/rag/ask-voice", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Voice query failed");
            }

            if (!sessionId && data.session_id) {
                setSessionId(data.session_id);
            }

            if (data.transcribed_text) {
                setMessages((prev) => {
                    const updated = [...prev];
                    const lastUserMsg = updated.findLast((m) => m.type === "user");
                    if (lastUserMsg) {
                        lastUserMsg.content = `🎤 "${data.transcribed_text}"`;
                    }
                    return updated;
                });
            }

            addMessage("assistant", data.answer, {
                transcribed_text: data.transcribed_text,
                content_type: data.content_type,
                sources: data.sources,
                text_docs_count: data.text_docs_count,
                image_docs_count: data.image_docs_count,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Voice query failed");
            addMessage("system", "❌ Voice query failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#020617]">
            <Navbar />

            <div className="pt-32 pb-24 px-6">
                <div className="container mx-auto max-w-6xl">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-12"
                    >
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F0C37A] to-[#D4A84A] mb-6">
                            <MessageSquare className="w-8 h-8 text-black" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                            Multimodal{" "}
                            <span className="bg-gradient-to-r from-[#F0C37A] via-[#E8B960] to-[#D4A84A] text-transparent bg-clip-text">
                                RAG Agent
                            </span>
                        </h1>
                        <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
                            Upload documents and ask questions via text or voice. Get intelligent answers powered by AI.
                        </p>
                    </motion.div>

                    {/* Main Chat Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <Card className="bg-white/5 backdrop-blur-md border-white/10">
                            <CardHeader className="border-b border-white/10">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-2xl text-white flex items-center gap-2">
                                        <button
                                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                        >
                                            <MessageSquare className="w-5 h-5" />
                                        </button>
                                        {chats.find((c) => c._id === activeChat)?.title || "New Chat"}
                                    </CardTitle>
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => setIsUploadModalOpen(true)}
                                            size="sm"
                                            className="bg-white/10 hover:bg-white/20 text-white"
                                        >
                                            <Upload className="w-4 h-4 mr-2" />
                                            Upload
                                        </Button>
                                        {currentChatId && (
                                            <Button
                                                onClick={() =>
                                                    setDeleteConfirm({ isOpen: true, type: "current" })
                                                }
                                                size="sm"
                                                className="bg-red-500/20 hover:bg-red-500/30 text-red-400"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="p-0">
                                {/* Messages Area */}
                                <div className="h-[500px] overflow-y-auto p-6">
                                    {messages.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-center">
                                            <Bot className="w-16 h-16 text-[#F0C37A] mb-4" />
                                            <h3 className="text-2xl font-bold text-white mb-2">
                                                What can I help with?
                                            </h3>
                                            <p className="text-neutral-400">
                                                Upload documents and ask questions to get started
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <AnimatePresence>
                                                {messages.map((message) => (
                                                    <motion.div
                                                        key={message.id}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0 }}
                                                        className="flex gap-4"
                                                    >
                                                        <div
                                                            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${message.type === "user"
                                                                    ? "bg-gradient-to-r from-[#F0C37A] to-[#D4A84A]"
                                                                    : message.type === "assistant"
                                                                        ? "bg-[#F0C37A]/20"
                                                                        : "bg-blue-500/20"
                                                                }`}
                                                        >
                                                            {message.type === "user" ? (
                                                                <User className="w-4 h-4 text-black" />
                                                            ) : message.type === "assistant" ? (
                                                                <Bot className="w-4 h-4 text-[#F0C37A]" />
                                                            ) : (
                                                                <AlertCircle className="w-4 h-4 text-blue-400" />
                                                            )}
                                                        </div>

                                                        <div className="flex-1 space-y-2">
                                                            <div className="text-sm font-medium text-neutral-400">
                                                                {message.type === "user"
                                                                    ? "You"
                                                                    : message.type === "assistant"
                                                                        ? "RAG Agent"
                                                                        : "System"}
                                                            </div>
                                                            <div className="text-white whitespace-pre-wrap">
                                                                {message.content}
                                                            </div>
                                                            {message.metadata?.sources &&
                                                                message.metadata.sources.length > 0 && (
                                                                    <div className="text-xs text-neutral-500 pt-2 border-t border-white/10">
                                                                        Sources: {message.metadata.sources.join(", ")}
                                                                    </div>
                                                                )}
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>

                                            {isLoading && (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="flex gap-4"
                                                >
                                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#F0C37A]/20 flex items-center justify-center">
                                                        <Bot className="w-4 h-4 text-[#F0C37A]" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="text-sm font-medium text-neutral-400 mb-2">
                                                            RAG Agent
                                                        </div>
                                                        <div className="flex items-center gap-2 text-neutral-400">
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                            <span>Thinking...</span>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}

                                            <div ref={messagesEndRef} />
                                        </div>
                                    )}
                                </div>

                                {/* Error Display */}
                                {error && (
                                    <div className="px-6 pb-4">
                                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4 text-red-400" />
                                            <span className="text-red-300 text-sm flex-1">{error}</span>
                                            <button onClick={() => setError(null)}>
                                                <X className="w-4 h-4 text-red-400" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Input Area */}
                                <div className="border-t border-white/10 p-6">
                                    <form onSubmit={handleTextSubmit} className="flex gap-2 items-end">
                                        <Button
                                            type="button"
                                            onClick={() => setIsUploadModalOpen(true)}
                                            disabled={isLoading || isRecording}
                                            className="px-3 bg-white/10 hover:bg-white/20 text-white"
                                        >
                                            <Plus className="w-5 h-5" />
                                        </Button>

                                        <div className="flex-1 relative">
                                            <input
                                                type="text"
                                                value={inputText}
                                                onChange={(e) => setInputText(e.target.value)}
                                                placeholder="Ask anything..."
                                                className="w-full px-4 py-3 pr-24 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#F0C37A] transition-all"
                                                disabled={isLoading || isRecording}
                                            />

                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                                                <button
                                                    type="button"
                                                    onClick={isRecording ? stopRecording : startRecording}
                                                    disabled={isLoading}
                                                    className={`p-2 rounded-lg transition-colors ${isRecording
                                                            ? "bg-red-500 hover:bg-red-600 animate-pulse"
                                                            : "hover:bg-white/10"
                                                        }`}
                                                >
                                                    {isRecording ? (
                                                        <MicOff className="w-4 h-4 text-white" />
                                                    ) : (
                                                        <Mic className="w-4 h-4 text-neutral-400" />
                                                    )}
                                                </button>

                                                <button
                                                    type="submit"
                                                    disabled={isLoading || !inputText.trim() || isRecording}
                                                    className="p-2 rounded-lg bg-gradient-to-r from-[#F0C37A] to-[#D4A84A] hover:from-[#E8B960] hover:to-[#C99A3A] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                                >
                                                    <Send className="w-4 h-4 text-black" />
                                                </button>
                                            </div>
                                        </div>
                                    </form>

                                    {isRecording && (
                                        <p className="text-center text-red-400 text-sm mt-2 animate-pulse">
                                            🎤 Recording... Click the mic button to stop
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>

            <Footer />

            {/* Sidebar Modal */}
            {isSidebarOpen && (
                <div className="fixed inset-0 z-50 flex">
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                    <div className="relative w-80 bg-[#0a0f1e] border-r border-white/10 h-full overflow-y-auto">
                        <Sidebar
                            isOpen={true}
                            onToggle={() => setIsSidebarOpen(false)}
                            chats={chats}
                            activeChat={activeChat}
                            onSelectChat={handleSelectChat}
                            onNewChat={handleNewChat}
                            onDeleteAll={() =>
                                setDeleteConfirm({ isOpen: true, type: "all" })
                            }
                        />
                    </div>
                </div>
            )}

            {/* Modals */}
            <UploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onUpload={handleFileUpload}
                sessionId={sessionId}
            />

            <DeleteConfirm
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ ...deleteConfirm, isOpen: false })}
                onConfirm={
                    deleteConfirm.type === "current"
                        ? handleDeleteCurrentChat
                        : handleDeleteAllChats
                }
                title={
                    deleteConfirm.type === "current"
                        ? "Delete Chat"
                        : "Delete All Chats"
                }
                message={
                    deleteConfirm.type === "current"
                        ? "Are you sure you want to delete this chat? This action cannot be undone."
                        : "Are you sure you want to delete all chats? This action cannot be undone."
                }
                isDeleting={isDeleting}
            />
        </main>
    );
}
