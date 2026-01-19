"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Plus, Trash2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatItem } from "./chat-item";

interface Chat {
    _id: string;
    session_id: string;
    title: string;
    updated_at: string;
}

interface SidebarProps {
    isOpen: boolean;
    onToggle: () => void;
    chats: Chat[];
    activeChat: string | null;
    onSelectChat: (chatId: string) => void;
    onNewChat: () => void;
    onDeleteAll: () => void;
}

export function Sidebar({
    isOpen,
    onToggle,
    chats,
    activeChat,
    onSelectChat,
    onNewChat,
    onDeleteAll,
}: SidebarProps) {
    return (
        <>
            {/* Backdrop for mobile */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onToggle}
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{
                    width: isOpen ? 280 : 60,
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="fixed left-0 bg-[#0a0f1e] border-r border-white/10 z-40 flex flex-col"
                style={{ top: "64px", height: "calc(100vh - 64px)" }}
            >
                {/* Toggle Button */}
                <div className="h-16 flex items-center justify-between px-3 border-b border-white/10">
                    {isOpen ? (
                        <>
                            <div className="flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-[#F0C37A]" />
                                <span className="text-white font-semibold">RAG Agent</span>
                            </div>
                            <button
                                onClick={onToggle}
                                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                            >
                                <ChevronRight className="w-5 h-5 text-neutral-400" />
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={onToggle}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors mx-auto"
                        >
                            <MessageSquare className="w-5 h-5 text-[#F0C37A]" />
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    {isOpen ? (
                        <>
                            {/* New Chat Button */}
                            <div className="p-3">
                                <Button
                                    onClick={onNewChat}
                                    className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/10 justify-start"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    New Chat
                                </Button>
                            </div>

                            {/* Chat List */}
                            <div className="flex-1 overflow-y-auto px-3 space-y-1">
                                <div className="text-xs text-neutral-500 uppercase tracking-wider mb-2 px-2">
                                    Recent Chats
                                </div>
                                {chats.length === 0 ? (
                                    <div className="text-sm text-neutral-500 px-2 py-4 text-center">
                                        No chats yet
                                    </div>
                                ) : (
                                    chats.map((chat) => (
                                        <ChatItem
                                            key={chat._id}
                                            chat={chat}
                                            isActive={activeChat === chat._id}
                                            onClick={() => onSelectChat(chat._id)}
                                        />
                                    ))
                                )}
                            </div>

                            {/* Delete All Button */}
                            {chats.length > 0 && (
                                <div className="p-3 border-t border-white/10">
                                    <Button
                                        onClick={onDeleteAll}
                                        size="sm"
                                        className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/20"
                                    >
                                        <Trash2 className="w-3 h-3 mr-2" />
                                        Delete All Chats
                                    </Button>
                                </div>
                            )}
                        </>
                    ) : (
                        // Collapsed state - icon only
                        <div className="flex flex-col items-center gap-4 py-4">
                            <button
                                onClick={onNewChat}
                                className="p-2 rounded-lg hover:bg-white/10 transition-colors group relative"
                                title="New Chat"
                            >
                                <Plus className="w-5 h-5 text-neutral-400 group-hover:text-white" />
                            </button>
                            {chats.length > 0 && (
                                <button
                                    onClick={onDeleteAll}
                                    className="p-2 rounded-lg hover:bg-white/10 transition-colors group relative"
                                    title="Delete All"
                                >
                                    <Trash2 className="w-5 h-5 text-neutral-400 group-hover:text-red-400" />
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </motion.aside>
        </>
    );
}
