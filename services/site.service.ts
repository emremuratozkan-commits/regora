/**
 * Site Service - Site/Property API Operations
 */

import apiService from './api.service';
import { Site, GlobalStats, PropertyFeatures } from '../types';

export interface CreateSiteRequest {
    name: string;
    address: string;
    city: string;
    managerName: string;
    blockCount: number;
    unitCount: number;
    duesAmount: number;
    imageUrl?: string;
    features: PropertyFeatures;
}

export interface UpdateSiteRequest extends Partial<CreateSiteRequest> {
    id: string;
}

export const siteService = {
    /**
     * Get all sites
     */
    getSites: () => apiService.get<Site[]>('/sites'),

    /**
     * Get site by ID
     */
    getSite: (siteId: string) => apiService.get<Site>(`/sites/${siteId}`),

    /**
     * Create new site (Admin only)
     */
    createSite: (data: CreateSiteRequest) => apiService.post<Site>('/sites', data),

    /**
     * Update site (Admin only)
     */
    updateSite: (siteId: string, data: Partial<CreateSiteRequest>) =>
        apiService.put<Site>(`/sites/${siteId}`, data),

    /**
     * Delete site (Admin only)
     */
    deleteSite: (siteId: string) => apiService.delete<void>(`/sites/${siteId}`),

    /**
     * Get site statistics
     */
    getStats: (siteId: string) => apiService.get<GlobalStats>(`/sites/${siteId}/stats`),

    /**
     * Update site feature
     */
    updateFeature: (siteId: string, featureKey: string, value: boolean) =>
        apiService.patch<Site>(`/sites/${siteId}/features`, { [featureKey]: value }),
};

export default siteService;
