"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeleteConfirmProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    isDeleting?: boolean;
}

export function DeleteConfirm({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    isDeleting = false,
}: DeleteConfirmProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4"
                    >
                        {/* Modal */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#0a0f1e] border border-white/10 rounded-2xl p-6 max-w-md w-full"
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-red-500/20">
                                        <AlertTriangle className="w-5 h-5 text-red-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-white">{title}</h3>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                                >
                                    <X className="w-5 h-5 text-neutral-400" />
                                </button>
                            </div>

                            {/* Message */}
                            <p className="text-neutral-400 mb-6">{message}</p>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <Button
                                    onClick={onClose}
                                    disabled={isDeleting}
                                    className="flex-1 bg-white/10 hover:bg-white/20 text-white"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={onConfirm}
                                    disabled={isDeleting}
                                    className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                                >
                                    {isDeleting ? "Deleting..." : "Delete"}
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
