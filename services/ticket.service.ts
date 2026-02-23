/**
 * Ticket Service - Support Ticket API Operations
 */

import apiService from './api.service';
import { Ticket } from '../types';

export interface CreateTicketRequest {
    title: string;
    description: string;
    category: Ticket['category'];
    targetRole?: Ticket['targetRole'];
    attachment?: string;
}

export interface UpdateTicketStatusRequest {
    status: Ticket['status'];
}

export interface TicketFilters {
    siteId?: string;
    userId?: string;
    status?: Ticket['status'];
    category?: Ticket['category'];
    targetRole?: Ticket['targetRole'];
}

export const ticketService = {
    /**
     * Get tickets with optional filters
     */
    getTickets: (filters?: TicketFilters) => apiService.get<Ticket[]>('/tickets', filters),

    /**
     * Get ticket by ID
     */
    getTicket: (ticketId: string) => apiService.get<Ticket>(`/tickets/${ticketId}`),

    /**
     * Create new ticket
     */
    createTicket: (data: CreateTicketRequest) => apiService.post<Ticket>('/tickets', data),

    /**
     * Update ticket status
     */
    updateStatus: (ticketId: string, status: Ticket['status']) =>
        apiService.patch<Ticket>(`/tickets/${ticketId}/status`, { status }),

    /**
     * Add attachment to ticket
     */
    addAttachment: (ticketId: string, attachmentUrl: string) =>
        apiService.patch<Ticket>(`/tickets/${ticketId}/attachment`, { attachment: attachmentUrl }),

    /**
     * Delete ticket (Admin only)
     */
    deleteTicket: (ticketId: string) => apiService.delete<void>(`/tickets/${ticketId}`),
};

export default ticketService;
