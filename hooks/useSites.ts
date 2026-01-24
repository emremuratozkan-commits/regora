/**
 * Site Hooks
 * React Query hooks for site operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import siteService, { CreateSiteRequest } from '../services/site.service';
import { Site, GlobalStats } from '../types';

// Query Keys
export const siteKeys = {
    all: ['sites'] as const,
    lists: () => [...siteKeys.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...siteKeys.lists(), filters] as const,
    details: () => [...siteKeys.all, 'detail'] as const,
    detail: (id: string) => [...siteKeys.details(), id] as const,
    stats: (id: string) => [...siteKeys.all, 'stats', id] as const,
};

/**
 * Fetch all sites
 */
export const useSites = () => {
    return useQuery({
        queryKey: siteKeys.lists(),
        queryFn: async () => {
            const response = await siteService.getSites();
            return response.data || [];
        },
    });
};

/**
 * Fetch single site by ID
 */
export const useSite = (siteId: string) => {
    return useQuery({
        queryKey: siteKeys.detail(siteId),
        queryFn: async () => {
            const response = await siteService.getSite(siteId);
            return response.data;
        },
        enabled: !!siteId,
    });
};

/**
 * Fetch site statistics
 */
export const useSiteStats = (siteId: string) => {
    return useQuery({
        queryKey: siteKeys.stats(siteId),
        queryFn: async () => {
            const response = await siteService.getStats(siteId);
            return response.data;
        },
        enabled: !!siteId,
    });
};

/**
 * Create site mutation
 */
export const useCreateSite = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateSiteRequest) => siteService.createSite(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: siteKeys.lists() });
        },
    });
};

/**
 * Update site mutation
 */
export const useUpdateSite = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ siteId, data }: { siteId: string; data: Partial<CreateSiteRequest> }) =>
            siteService.updateSite(siteId, data),
        onSuccess: (_, { siteId }) => {
            queryClient.invalidateQueries({ queryKey: siteKeys.detail(siteId) });
            queryClient.invalidateQueries({ queryKey: siteKeys.lists() });
        },
    });
};

/**
 * Delete site mutation
 */
export const useDeleteSite = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (siteId: string) => siteService.deleteSite(siteId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: siteKeys.lists() });
        },
    });
};

/**
 * Update site feature mutation
 */
export const useUpdateSiteFeature = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            siteId,
            featureKey,
            value,
        }: {
            siteId: string;
            featureKey: string;
            value: boolean;
        }) => siteService.updateFeature(siteId, featureKey, value),
        onSuccess: (_, { siteId }) => {
            queryClient.invalidateQueries({ queryKey: siteKeys.detail(siteId) });
        },
    });
};
