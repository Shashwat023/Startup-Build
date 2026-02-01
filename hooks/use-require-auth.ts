"use client";

import { useSession } from "next-auth/react";
import { useAuthModal } from "@/components/providers/auth-modal-provider";

/**
 * Hook to require authentication before performing an action.
 * 
 * Usage:
 * ```tsx
 * const { requireAuth } = useRequireAuth();
 * 
 * const handleSubmit = async () => {
 *   if (!requireAuth()) return; // Shows login modal if not authenticated
 *   // ... proceed with action
 * };
 * ```
 */
export function useRequireAuth() {
    const { data: session, status } = useSession();
    const { showLoginModal } = useAuthModal();

    const requireAuth = (): boolean => {
        if (status === "loading") return false;

        if (!session) {
            showLoginModal();
            return false;
        }

        return true;
    };

    return {
        requireAuth,
        isAuthenticated: !!session,
        isLoading: status === "loading",
        session,
    };
}
