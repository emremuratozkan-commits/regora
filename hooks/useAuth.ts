/**
 * Authentication Hooks
 * React Query hooks for authentication operations
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService, AuthResult } from '../services/AuthService';
import { User } from '../types';

// Query Keys
export const authKeys = {
    all: ['auth'] as const,
    session: () => [...authKeys.all, 'session'] as const,
};

/**
 * Login mutation hook
 */
export const useLogin = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ username, password }: { username: string; password: string }) =>
            authService.login(username, password),
        onSuccess: (data: AuthResult | null) => {
            if (data) {
                // Invalidate all queries to refresh with new user context
                queryClient.invalidateQueries();
            }
        },
    });
};

/**
 * Register mutation hook
 */
export const useRegister = () => {
    return useMutation({
        mutationFn: ({
            name,
            username,
            phoneNumber,
            siteId,
            block,
            apartment,
        }: {
            name: string;
            username: string;
            phoneNumber: string;
            siteId: string;
            block: string;
            apartment: string;
        }) => authService.register(name, username, phoneNumber, siteId, block, apartment),
    });
};

/**
 * Logout mutation hook
 */
export const useLogout = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => authService.logout(),
        onSuccess: () => {
            // Clear all cached data
            queryClient.clear();
        },
    });
};

/**
 * Validate session hook
 */
export const useValidateSession = () => {
    return useMutation({
        mutationFn: () => authService.validateSession(),
    });
};
