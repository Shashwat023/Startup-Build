"use client";

import { useAuthModal } from "@/components/providers/auth-modal-provider";
import { useCallback } from "react";

/**
 * Hook that provides an auth-aware fetch function.
 * Automatically shows login modal when API returns 401 AUTH_REQUIRED.
 * 
 * Usage:
 * ```tsx
 * const { authFetch } = useAuthFetch();
 * 
 * const response = await authFetch('/api/some-endpoint', {
 *   method: 'POST',
 *   body: JSON.stringify(data)
 * });
 * ```
 */
export function useAuthFetch() {
    const { showLoginModal } = useAuthModal();

    const authFetch = useCallback(async (url: string, options?: RequestInit): Promise<Response> => {
        const response = await fetch(url, options);

        if (response.status === 401) {
            try {
                const data = await response.clone().json();
                if (data.code === "AUTH_REQUIRED") {
                    showLoginModal();
                }
            } catch {
                // If we can't parse JSON, just show the modal for any 401
                showLoginModal();
            }
        }

        return response;
    }, [showLoginModal]);

    return { authFetch };
}
