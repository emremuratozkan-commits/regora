/**
 * Announcement Service - Announcement API Operations
 */

import apiService from './api.service';
import { Announcement } from '../types';

export interface CreateAnnouncementRequest {
    title: string;
    content: string;
    priority: Announcement['priority'];
    targetSiteId?: string; // If not provided, uses current site
}

export interface AnnouncementFilters {
    siteId?: string;
    priority?: Announcement['priority'];
}

export const announcementService = {
    /**
     * Get announcements with optional filters
     */
    getAnnouncements: (filters?: AnnouncementFilters) =>
        apiService.get<Announcement[]>('/announcements', filters),

    /**
     * Get announcement by ID
     */
    getAnnouncement: (announcementId: string) =>
        apiService.get<Announcement>(`/announcements/${announcementId}`),

    /**
     * Create new announcement (Admin only)
     */
    createAnnouncement: (data: CreateAnnouncementRequest) =>
        apiService.post<Announcement>('/announcements', data),

    /**
     * Update announcement (Admin only)
     */
    updateAnnouncement: (announcementId: string, data: Partial<CreateAnnouncementRequest>) =>
        apiService.put<Announcement>(`/announcements/${announcementId}`, data),

    /**
     * Delete announcement (Admin only)
     */
    deleteAnnouncement: (announcementId: string) =>
        apiService.delete<void>(`/announcements/${announcementId}`),
};

export default announcementService;
