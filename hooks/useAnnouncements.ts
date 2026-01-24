/**
 * Announcement Hooks
 * React Query hooks for announcement operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import announcementService, {
    CreateAnnouncementRequest,
    AnnouncementFilters,
} from '../services/announcement.service';
import { Announcement } from '../types';

// Query Keys
export const announcementKeys = {
    all: ['announcements'] as const,
    lists: () => [...announcementKeys.all, 'list'] as const,
    list: (filters?: AnnouncementFilters) => [...announcementKeys.lists(), filters] as const,
    details: () => [...announcementKeys.all, 'detail'] as const,
    detail: (id: string) => [...announcementKeys.details(), id] as const,
};

/**
 * Fetch announcements with optional filters
 */
export const useAnnouncements = (filters?: AnnouncementFilters) => {
    return useQuery({
        queryKey: announcementKeys.list(filters),
        queryFn: async () => {
            const response = await announcementService.getAnnouncements(filters);
            return response.data || [];
        },
    });
};

/**
 * Fetch single announcement by ID
 */
export const useAnnouncement = (announcementId: string) => {
    return useQuery({
        queryKey: announcementKeys.detail(announcementId),
        queryFn: async () => {
            const response = await announcementService.getAnnouncement(announcementId);
            return response.data;
        },
        enabled: !!announcementId,
    });
};

/**
 * Create announcement mutation
 */
export const useCreateAnnouncement = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateAnnouncementRequest) =>
            announcementService.createAnnouncement(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: announcementKeys.lists() });
        },
    });
};

/**
 * Update announcement mutation
 */
export const useUpdateAnnouncement = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            announcementId,
            data,
        }: {
            announcementId: string;
            data: Partial<CreateAnnouncementRequest>;
        }) => announcementService.updateAnnouncement(announcementId, data),
        onSuccess: (_, { announcementId }) => {
            queryClient.invalidateQueries({ queryKey: announcementKeys.detail(announcementId) });
            queryClient.invalidateQueries({ queryKey: announcementKeys.lists() });
        },
    });
};

/**
 * Delete announcement mutation
 */
export const useDeleteAnnouncement = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (announcementId: string) =>
            announcementService.deleteAnnouncement(announcementId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: announcementKeys.lists() });
        },
    });
};
