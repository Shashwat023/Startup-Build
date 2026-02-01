"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LogIn, X } from "lucide-react";
import { signIn } from "next-auth/react";

interface AuthModalContextType {
    showLoginModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | null>(null);

export function useAuthModal() {
    const context = useContext(AuthModalContext);
    if (!context) {
        throw new Error("useAuthModal must be used within AuthModalProvider");
    }
    return context;
}

export function AuthModalProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);

    const showLoginModal = () => setIsOpen(true);
    const closeModal = () => setIsOpen(false);

    const handleGoogleSignIn = async () => {
        await signIn("google", { callbackUrl: window.location.pathname });
    };

    return (
        <AuthModalContext.Provider value={{ showLoginModal }}>
            {children}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeModal}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        />
                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", duration: 0.5 }}
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md p-6"
                        >
                            <div className="bg-gradient-to-b from-[#1a1a2e] to-[#16162a] border border-white/10 rounded-2xl p-8 shadow-2xl">
                                {/* Close button */}
                                <button
                                    onClick={closeModal}
                                    className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                {/* Icon */}
                                <div className="flex justify-center mb-6">
                                    <div className="w-16 h-16 rounded-full bg-[#F0C37A]/20 flex items-center justify-center">
                                        <LogIn className="w-8 h-8 text-[#F0C37A]" />
                                    </div>
                                </div>

                                {/* Content */}
                                <h2 className="text-2xl font-bold text-white text-center mb-2">
                                    Sign In Required
                                </h2>
                                <p className="text-neutral-400 text-center mb-6">
                                    Please sign in to access this feature and unlock the full power of StartupAI.
                                </p>

                                {/* Sign in button */}
                                <Button
                                    onClick={handleGoogleSignIn}
                                    className="w-full bg-[#F0C37A] hover:bg-[#E8B960] text-black font-semibold py-6"
                                >
                                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    Sign in with Google
                                </Button>

                                {/* Alternative text */}
                                <p className="text-neutral-500 text-sm text-center mt-4">
                                    Your progress will be saved after signing in.
                                </p>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </AuthModalContext.Provider>
    );
}
