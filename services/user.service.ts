/**
 * User Service - User API Operations
 */

import apiService, { ApiResponse } from './api.service';
import { User, UserRole } from '../types';

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
}

export interface RegisterRequest {
    name: string;
    username: string;
    phoneNumber: string;
    siteId: string;
    block: string;
    apartment: string;
}

export const userService = {
    /**
     * Get current user profile
     */
    getProfile: () => apiService.get<User>('/users/me'),

    /**
     * Get user by ID
     */
    getUser: (userId: string) => apiService.get<User>(`/users/${userId}`),

    /**
     * Update user profile
     */
    updateProfile: (data: Partial<User>) => apiService.put<User>('/users/me', data),

    /**
     * Update user avatar
     */
    updateAvatar: (avatarUrl: string) => apiService.patch<User>('/users/me/avatar', { avatar: avatarUrl }),

    /**
     * Get pending users for a site (Admin only)
     */
    getPendingUsers: (siteId: string) => apiService.get<User[]>(`/users/pending`, { siteId }),

    /**
     * Approve user registration (Admin only)
     */
    approveUser: (userId: string) => apiService.post<void>(`/users/${userId}/approve`),

    /**
     * Reject user registration (Admin only)
     */
    rejectUser: (userId: string) => apiService.delete<void>(`/users/${userId}`),

    /**
     * Add household member
     */
    addHouseholdMember: (name: string, relation: string) =>
        apiService.post<User>('/users/me/household', { name, relation }),

    /**
     * Remove household member
     */
    removeHouseholdMember: (memberId: string) =>
        apiService.delete<void>(`/users/me/household/${memberId}`),

    /**
     * Add license plate
     */
    addLicensePlate: (plate: string) =>
        apiService.post<User>('/users/me/license-plates', { plate }),

    /**
     * Remove license plate
     */
    removeLicensePlate: (plate: string) =>
        apiService.delete<void>(`/users/me/license-plates/${encodeURIComponent(plate)}`),
};

export default userService;
