/**
 * Hooks Barrel Export
 * Re-export all hooks from a single entry point
 */

// Auth hooks
export {
    useLogin,
    useRegister,
    useLogout,
    useValidateSession,
    authKeys,
} from './useAuth';

// Site hooks
export {
    useSites,
    useSite,
    useSiteStats,
    useCreateSite,
    useUpdateSite,
    useDeleteSite,
    useUpdateSiteFeature,
    siteKeys,
} from './useSites';

// Ticket hooks
export {
    useTickets,
    useTicket,
    useCreateTicket,
    useUpdateTicketStatus,
    useDeleteTicket,
    ticketKeys,
} from './useTickets';

// Announcement hooks
export {
    useAnnouncements,
    useAnnouncement,
    useCreateAnnouncement,
    useUpdateAnnouncement,
    useDeleteAnnouncement,
    announcementKeys,
} from './useAnnouncements';

// User hooks
export {
    useProfile,
    useUser,
    usePendingUsers,
    useUpdateProfile,
    useUpdateAvatar,
    useApproveUser,
    useRejectUser,
    useAddHouseholdMember,
    useRemoveHouseholdMember,
    useAddLicensePlate,
    userKeys,
} from './useUsers';
