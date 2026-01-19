"use client";

import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

interface Chat {
    _id: string;
    session_id: string;
    title: string;
    updated_at: string;
}

interface ChatItemProps {
    chat: Chat;
    isActive: boolean;
    onClick: () => void;
}

export function ChatItem({ chat, isActive, onClick }: ChatItemProps) {
    const timeAgo = formatDistanceToNow(new Date(chat.updated_at), {
        addSuffix: true,
    });

    return (
        <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full text-left px-3 py-2.5 rounded-lg transition-all ${isActive
                    ? "bg-white/10 text-white"
                    : "text-neutral-400 hover:bg-white/5 hover:text-white"
                }`}
        >
            <div className="flex flex-col gap-1">
                <span className="text-sm font-medium truncate">{chat.title}</span>
                <span className="text-xs text-neutral-500">{timeAgo}</span>
            </div>
        </motion.button>
    );
}
