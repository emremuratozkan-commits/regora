/**
 * Ticket Hooks
 * React Query hooks for ticket operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ticketService, { CreateTicketRequest, TicketFilters } from '../services/ticket.service';
import { Ticket } from '../types';

// Query Keys
export const ticketKeys = {
    all: ['tickets'] as const,
    lists: () => [...ticketKeys.all, 'list'] as const,
    list: (filters?: TicketFilters) => [...ticketKeys.lists(), filters] as const,
    details: () => [...ticketKeys.all, 'detail'] as const,
    detail: (id: string) => [...ticketKeys.details(), id] as const,
};

/**
 * Fetch tickets with optional filters
 */
export const useTickets = (filters?: TicketFilters) => {
    return useQuery({
        queryKey: ticketKeys.list(filters),
        queryFn: async () => {
            const response = await ticketService.getTickets(filters);
            return response.data || [];
        },
    });
};

/**
 * Fetch single ticket by ID
 */
export const useTicket = (ticketId: string) => {
    return useQuery({
        queryKey: ticketKeys.detail(ticketId),
        queryFn: async () => {
            const response = await ticketService.getTicket(ticketId);
            return response.data;
        },
        enabled: !!ticketId,
    });
};

/**
 * Create ticket mutation
 */
export const useCreateTicket = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateTicketRequest) => ticketService.createTicket(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
        },
    });
};

/**
 * Update ticket status mutation
 */
export const useUpdateTicketStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ ticketId, status }: { ticketId: string; status: Ticket['status'] }) =>
            ticketService.updateStatus(ticketId, status),
        onSuccess: (_, { ticketId }) => {
            queryClient.invalidateQueries({ queryKey: ticketKeys.detail(ticketId) });
            queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
        },
    });
};

/**
 * Delete ticket mutation
 */
export const useDeleteTicket = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (ticketId: string) => ticketService.deleteTicket(ticketId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
        },
    });
};
