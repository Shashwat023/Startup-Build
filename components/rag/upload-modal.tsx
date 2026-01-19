"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, FileText, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpload: (files: FileList) => Promise<void>;
    sessionId: string | null;
}

export function UploadModal({
    isOpen,
    onClose,
    onUpload,
    sessionId,
}: UploadModalProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");
    const [uploadMessage, setUploadMessage] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async () => {
        if (!fileInputRef.current?.files || fileInputRef.current.files.length === 0) {
            return;
        }

        setIsUploading(true);
        setUploadStatus("idle");

        try {
            await onUpload(fileInputRef.current.files);
            setUploadStatus("success");
            setUploadMessage(`Successfully uploaded ${fileInputRef.current.files.length} file(s)`);

            // Close after 1.5 seconds
            setTimeout(() => {
                onClose();
                resetState();
            }, 1500);
        } catch (error) {
            setUploadStatus("error");
            setUploadMessage(error instanceof Error ? error.message : "Upload failed");
        } finally {
            setIsUploading(false);
        }
    };

    const resetState = () => {
        setUploadStatus("idle");
        setUploadMessage("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleClose = () => {
        if (!isUploading) {
            onClose();
            resetState();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
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
                                    <div className="p-2 rounded-lg bg-[#F0C37A]/20">
                                        <Upload className="w-5 h-5 text-[#F0C37A]" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-white">Upload Documents</h3>
                                </div>
                                <button
                                    onClick={handleClose}
                                    disabled={isUploading}
                                    className="p-1 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
                                >
                                    <X className="w-5 h-5 text-neutral-400" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="space-y-4">
                                {/* File Input */}
                                <div
                                    onClick={() => !isUploading && fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center cursor-pointer hover:border-[#F0C37A]/50 transition-colors"
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        accept=".pdf,.txt"
                                        className="hidden"
                                        disabled={isUploading}
                                    />
                                    <FileText className="w-12 h-12 text-neutral-500 mx-auto mb-3" />
                                    <p className="text-white font-medium mb-1">
                                        Click to select files
                                    </p>
                                    <p className="text-sm text-neutral-500">
                                        PDF or TXT files only
                                    </p>
                                </div>

                                {/* Status Message */}
                                {uploadStatus !== "idle" && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`p-3 rounded-lg flex items-center gap-2 ${uploadStatus === "success"
                                                ? "bg-green-500/20 text-green-400"
                                                : "bg-red-500/20 text-red-400"
                                            }`}
                                    >
                                        {uploadStatus === "success" ? (
                                            <CheckCircle className="w-4 h-4" />
                                        ) : (
                                            <AlertCircle className="w-4 h-4" />
                                        )}
                                        <span className="text-sm">{uploadMessage}</span>
                                    </motion.div>
                                )}

                                {/* Session Info */}
                                {sessionId && (
                                    <div className="text-xs text-neutral-500 bg-white/5 rounded-lg p-3">
                                        <span className="font-medium">Session ID:</span>{" "}
                                        <span className="font-mono">{sessionId.substring(0, 16)}...</span>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-3 pt-2">
                                    <Button
                                        onClick={handleClose}
                                        disabled={isUploading}
                                        className="flex-1 bg-white/10 hover:bg-white/20 text-white"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleUpload}
                                        disabled={isUploading || uploadStatus === "success"}
                                        className="flex-1 bg-gradient-to-r from-[#F0C37A] to-[#D4A84A] hover:from-[#E8B960] hover:to-[#C99A3A] text-black"
                                    >
                                        {isUploading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Uploading...
                                            </>
                                        ) : (
                                            "Upload"
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
