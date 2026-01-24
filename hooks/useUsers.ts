/**
 * User Hooks
 * React Query hooks for user operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import userService from '../services/user.service';
import { User } from '../types';

// Query Keys
export const userKeys = {
    all: ['users'] as const,
    profile: () => [...userKeys.all, 'profile'] as const,
    details: () => [...userKeys.all, 'detail'] as const,
    detail: (id: string) => [...userKeys.details(), id] as const,
    pending: (siteId: string) => [...userKeys.all, 'pending', siteId] as const,
};

/**
 * Fetch current user profile
 */
export const useProfile = () => {
    return useQuery({
        queryKey: userKeys.profile(),
        queryFn: async () => {
            const response = await userService.getProfile();
            return response.data;
        },
    });
};

/**
 * Fetch user by ID
 */
export const useUser = (userId: string) => {
    return useQuery({
        queryKey: userKeys.detail(userId),
        queryFn: async () => {
            const response = await userService.getUser(userId);
            return response.data;
        },
        enabled: !!userId,
    });
};

/**
 * Fetch pending users for a site (Admin only)
 */
export const usePendingUsers = (siteId: string) => {
    return useQuery({
        queryKey: userKeys.pending(siteId),
        queryFn: async () => {
            const response = await userService.getPendingUsers(siteId);
            return response.data || [];
        },
        enabled: !!siteId,
    });
};

/**
 * Update profile mutation
 */
export const useUpdateProfile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: Partial<User>) => userService.updateProfile(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.profile() });
        },
    });
};

/**
 * Update avatar mutation
 */
export const useUpdateAvatar = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (avatarUrl: string) => userService.updateAvatar(avatarUrl),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.profile() });
        },
    });
};

/**
 * Approve user mutation (Admin only)
 */
export const useApproveUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userId: string) => userService.approveUser(userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.all });
        },
    });
};

/**
 * Reject user mutation (Admin only)
 */
export const useRejectUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userId: string) => userService.rejectUser(userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.all });
        },
    });
};

/**
 * Add household member mutation
 */
export const useAddHouseholdMember = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ name, relation }: { name: string; relation: string }) =>
            userService.addHouseholdMember(name, relation),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.profile() });
        },
    });
};

/**
 * Remove household member mutation
 */
export const useRemoveHouseholdMember = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (memberId: string) => userService.removeHouseholdMember(memberId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.profile() });
        },
    });
};

/**
 * Add license plate mutation
 */
export const useAddLicensePlate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (plate: string) => userService.addLicensePlate(plate),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.profile() });
        },
    });
};
