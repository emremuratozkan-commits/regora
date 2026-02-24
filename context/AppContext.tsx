
import React, { createContext, useContext, useState, useEffect, PropsWithChildren, useCallback } from 'react';
import { User, Property, ModalContent, ToastMessage, UserRole, PropertyFeatures, Announcement, ForumPost, Poll, Site, ServiceLog, ActivityLog, GlobalStats, HouseholdMember, ServiceItem, Ticket, AppPermission, CameraPreferences, PushNotification, ThemeAccent } from '../types';
import { ALL_SERVICES, MOCK_POLL, ROLE_PERMISSIONS } from '../constants';
import { authService } from '../services/AuthService';
import apiService from '../services/api.service';
import siteService from '../services/site.service';
import ticketService from '../services/ticket.service';
import announcementService from '../services/announcement.service';
import userService from '../services/user.service';
import i18n from '../i18n';

declare global {
    interface Window {
        regoraCLI: {
            help: () => void;
            theme: (color: ThemeAccent) => void;
        };
    }
}

interface AppContextType {
    user: User;
    property: Property;
    sites: Site[];
    services: ServiceItem[];
    announcements: Announcement[];
    forumPosts: ForumPost[];
    tickets: Ticket[];
    activePoll: Poll | null;
    serviceLogs: ServiceLog[];
    activities: ActivityLog[];
    globalStats: GlobalStats;
    cameraPermissions: CameraPreferences;
    pushNotifications: PushNotification[];
    notificationHistory: PushNotification[];
    unreadNotificationCount: number;
    pendingUsers: User[];
    theme: ThemeAccent;
    isLoading: boolean;
    isAuthenticated: boolean;
    modal: ModalContent | null;
    toast: ToastMessage | null;
    openModal: (content: ModalContent) => void;
    closeModal: () => void;
    showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
    toggleRole: () => void;
    updatePropertyFeature: (key: string, value: boolean) => void;
    login: (username: string, password: string) => Promise<boolean>;
    register: (name: string, username: string, phoneNumber: string, siteId: string, block: string, apartment: string) => Promise<boolean>;
    approveUser: (userId: string) => Promise<void>;
    rejectUser: (userId: string) => Promise<void>;
    logout: () => void;
    addAnnouncement: (title: string, content: string, priority: Announcement['priority'], targetSiteId?: string) => void;
    addForumPost: (title: string, content: string) => void;
    approveForumPost: (id: string) => void;
    createPoll: (title: string, options: string[], targetSiteId?: string) => void;
    addSite: (siteData: Omit<Site, 'id'>) => void;
    updateSite: (site: Site) => void;
    removeSite: (id: string) => void;
    switchSite: (siteId: string) => void;
    logActivity: (type: ActivityLog['type'], title: string, description: string) => void;
    addServiceLog: (serviceName: string, icon: string, color: string) => void;
    addHouseholdMember: (name: string, relation: string) => void;
    removeHouseholdMember: (id: string) => void;
    addNewService: (service: ServiceItem) => void;
    updateTicketStatus: (ticketId: string, status: Ticket['status']) => void;
    addTicket: (ticket: Omit<Ticket, 'id' | 'status' | 'date' | 'siteId' | 'userId'>) => void;
    submitServiceRatings: (ratings: number) => void;
    hasPermission: (permission: AppPermission) => boolean;
    toggleCameraPermission: (key: keyof CameraPreferences) => Promise<void>;
    updateUserAvatar: (url: string) => void;
    sendPushNotification: (title: string, message: string, type: 'alert' | 'info' | 'success') => void;
    dismissPushNotification: (id: string) => void;
    markNotificationsAsRead: () => void;
    clearAllNotifications: () => void;
    setTheme: (theme: ThemeAccent) => void;
    addLicensePlate: (plate: string) => void;
    refreshData: () => Promise<void>;
    allUsers: User[];
    assignManager: (siteId: string, managerId: string) => Promise<void>;
    assignStaff: (siteId: string, userId: string, jobTitle: string) => Promise<void>;
    createAuthority: (data: { name: string; username: string; role: UserRole; jobTitle: string; password?: string }) => Promise<void>;
    confirmPasswordChange: (newPassword: string) => Promise<void>;
    language: 'tr' | 'en';
    setLanguage: (lang: 'tr' | 'en') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_USER: User = { id: '', siteId: '', username: '', name: '', role: UserRole.RESIDENT, avatar: '', apartment: '', status: 'approved', balance: 0, household: [], licensePlates: [] };
const INITIAL_PROPERTY: Property = { id: '', name: '', address: '', city: '', managerName: '', blockCount: 0, unitCount: 0, duesAmount: 0, block: '', features: {} as PropertyFeatures };
const INITIAL_STATS: GlobalStats = { taxiCount: 0, guestCount: 0, totalBalance: 0, monthlyIncome: 0, monthlyExpense: 0, activeTickets: 0, collectionRate: 0, totalResidents: 0, averageRating: 0 };

export const AppProvider = ({ children }: PropsWithChildren) => {
    const [user, setUser] = useState<User>(INITIAL_USER);
    const [property, setProperty] = useState<Property>(INITIAL_PROPERTY);
    const [sites, setSites] = useState<Site[]>([]);
    const [services, setServices] = useState<ServiceItem[]>(ALL_SERVICES);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);
    const [activePoll, setActivePoll] = useState<Poll | null>(MOCK_POLL);
    const [serviceLogs, setServiceLogs] = useState<ServiceLog[]>([]);

    const [theme, setThemeState] = useState<ThemeAccent>('gold');
    const [pushNotifications, setPushNotifications] = useState<PushNotification[]>([]);
    const [notificationHistory, setNotificationHistory] = useState<PushNotification[]>([]);
    const [cameraPermissions, setCameraPermissions] = useState<CameraPreferences>({ profilePhoto: false, virtualTour: false, maintenanceRequest: true });
    const [activities, setActivities] = useState<ActivityLog[]>([]);
    const [globalStats, setGlobalStats] = useState<GlobalStats>(INITIAL_STATS);
    const [pendingUsers, setPendingUsers] = useState<User[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [modal, setModal] = useState<ModalContent | null>(null);
    const [toast, setToast] = useState<ToastMessage | null>(null);
    const initialLang = (i18n.language?.split('-')[0] as 'tr' | 'en') || 'tr';
    const [language, setLanguageState] = useState<'tr' | 'en'>(initialLang === 'en' ? 'en' : 'tr');

    const setLanguage = (lang: 'tr' | 'en') => {
        i18n.changeLanguage(lang);
        setLanguageState(lang);
    };

    // Fetch data from API
    const refreshData = useCallback(async () => {
        if (!property.id || !user.id) return;

        setIsLoading(true);
        try {
            // Fetch tickets
            const ticketsResponse = await ticketService.getTickets({ siteId: property.id });
            if (ticketsResponse.data) {
                setTickets(ticketsResponse.data);
            }

            // Fetch announcements
            const announcementsResponse = await announcementService.getAnnouncements({ siteId: property.id });
            if (announcementsResponse.data) {
                setAnnouncements(announcementsResponse.data);
            }

            // Fetch site stats
            const statsResponse = await siteService.getStats(property.id);
            if (statsResponse.data) {
                setGlobalStats(statsResponse.data);
            }

            // Fetch pending users for management roles
            const isManagement = user.role === UserRole.SUPER_ADMIN || user.role === UserRole.MANAGER;
            if (isManagement) {
                const pendingResponse = await userService.getPendingUsers(property.id);
                if (pendingResponse.data) {
                    setPendingUsers(pendingResponse.data);
                }

                // Fetch all users for assignment if management role
                if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.MANAGER) {
                    // For mock purposes, we'll just set some users if the API fails or is not ready
                    const usersResponse = await apiService.get<User[]>('/users');
                    if (usersResponse.data) {
                        setAllUsers(usersResponse.data);
                    } else {
                        // Mock fallback users
                        setAllUsers([
                            { id: 'm1', name: 'Alp Arslan', role: UserRole.MANAGER, username: 'alp', siteId: '', avatar: '', apartment: '', status: 'approved', balance: 0, household: [], licensePlates: [] },
                            { id: 'm2', name: 'Buse Terim', role: UserRole.RESIDENT, username: 'buse', siteId: '', avatar: '', apartment: '', status: 'approved', balance: 0, household: [], licensePlates: [] },
                            { id: 'm3', name: 'Cem Yılmaz', role: UserRole.STAFF, username: 'cem', siteId: '', avatar: '', apartment: '', status: 'approved', balance: 0, household: [], licensePlates: [] }
                        ]);
                    }
                }
            }
        } catch (error) {
            console.error('Error refreshing data:', error);
        } finally {
            setIsLoading(false);
        }
    }, [property.id, user.id, user.role]);

    // Fetch sites on mount
    const fetchSites = useCallback(async () => {
        try {
            const response = await siteService.getSites();
            if (response.data) {
                setSites(response.data);
            }
        } catch (error) {
            console.error('Error fetching sites:', error);
        }
    }, []);

    useEffect(() => {
        const initApp = async () => {
            // Fetch sites first
            await fetchSites();

            // Validate existing session with AuthService
            const validSession = await authService.validateSession();
            if (validSession) {
                setUser(validSession.user);
                setProperty(validSession.site);
                setIsAuthenticated(true);
            }
            setIsLoading(false);
        };

        // Setup auto-logout callback for token expiry
        authService.setOnTokenExpired(() => {
            setIsAuthenticated(false);
            setUser(INITIAL_USER);
            setProperty(INITIAL_PROPERTY);
            showToast('Oturum süresi doldu. Lütfen tekrar giriş yapın.', 'info');
        });

        initApp();
    }, [fetchSites]);

    // Refresh data when user or property changes
    useEffect(() => {
        if (isAuthenticated && property.id && user.id) {
            refreshData();
        }
    }, [isAuthenticated, property.id, user.id, refreshData]);

    useEffect(() => {
        const root = document.documentElement;
        let rgb = '255, 255, 255';
        switch (theme) {
            case 'blue': rgb = '59, 130, 246'; break;
            case 'purple': rgb = '168, 85, 247'; break;
            case 'emerald': rgb = '16, 185, 129'; break;
            case 'rose': rgb = '244, 63, 94'; break;
            default: rgb = '255, 255, 255';
        }
        root.style.setProperty('--primary-color', rgb);
    }, [theme]);

    const openModal = (content: ModalContent) => setModal(content);
    const closeModal = () => setModal(null);
    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        const id = Date.now().toString();
        setToast({ id, message, type });
        setTimeout(() => setToast((c) => (c?.id === id ? null : c)), 3000);
    };

    const login = async (username: string, password: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            const result = await authService.login(username, password);
            if (result) {
                setUser(result.user);
                setProperty(result.site);
                setIsAuthenticated(true);
                setIsLoading(false);
                return true;
            }
            showToast('Kullanıcı adı veya şifre hatalı.', 'error');
            setIsLoading(false);
            return false;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Hata oluştu.';
            showToast(errorMessage, 'error');
            setIsLoading(false);
            return false;
        }
    };

    const register = async (name: string, username: string, phoneNumber: string, siteId: string, block: string, apartment: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            const newUser = await authService.register(name, username, phoneNumber, siteId, block, apartment);
            if (newUser) {
                setUser(newUser);
                setIsAuthenticated(true);
                showToast('Başvuru alındı. REGORA onayı bekleniyor.', 'success');
                setIsLoading(false);
                return true;
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Kayıt hatası.';
            showToast(errorMessage, 'error');
        }
        setIsLoading(false);
        return false;
    };

    const logout = async () => {
        await authService.logout();
        setIsAuthenticated(false);
        setUser(INITIAL_USER);
        setProperty(INITIAL_PROPERTY);
        setTickets([]);
        setAnnouncements([]);
        setPendingUsers([]);
        showToast('Oturum sonlandırıldı.', 'info');
    };

    const switchSite = async (siteId: string) => {
        const site = sites.find(s => s.id === siteId);
        if (site) {
            setProperty(site);
        }
    };

    const logActivity = (type: ActivityLog['type'], title: string, description: string) => {
        const newActivity: ActivityLog = {
            id: Date.now().toString(), type, title, description,
            time: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
            user: user.name
        };
        setActivities(prev => [newActivity, ...prev]);
    };

    const addAnnouncement = async (title: string, content: string, priority: Announcement['priority'], targetSiteId?: string) => {
        try {
            const response = await announcementService.createAnnouncement({
                title,
                content,
                priority,
                targetSiteId: targetSiteId || property.id,
            });
            if (response.data) {
                setAnnouncements(prev => [response.data!, ...prev]);
                logActivity('admin', 'Yeni Duyuru', title);
                showToast('Duyuru oluşturuldu.', 'success');
            }
        } catch (error) {
            showToast('Duyuru oluşturulamadı.', 'error');
        }
    };

    const addForumPost = (title: string, content: string) => {
        const newPost: ForumPost = {
            id: `f_${Date.now()}`,
            siteId: property.id,
            author: user.name,
            authorAvatar: user.avatar,
            title,
            content,
            date: 'Yeni',
            likes: 0,
            comments: 0,
            status: 'pending'
        };
        setForumPosts(prev => [newPost, ...prev]);
    };

    const approveForumPost = (id: string) => {
        setForumPosts(prev => prev.map(p => p.id === id ? { ...p, status: 'approved' } : p));
    };

    const createPoll = (title: string, options: string[], targetSiteId?: string) => {
        const newPoll: Poll = {
            id: `p_${Date.now()}`,
            siteId: targetSiteId || property.id,
            title,
            endDate: '7 Gün Kaldı',
            options: options.map(o => ({ label: o, percentage: 0 }))
        };
        setActivePoll(newPoll);
        logActivity('admin', 'Yeni Oylama', title);
    };

    const addSite = async (siteData: Omit<Site, 'id'>) => {
        try {
            const response = await siteService.createSite(siteData);
            if (response.data) {
                setSites(prev => [...prev, response.data!]);
                if (siteData.managerId) {
                    await assignManager(response.data.id, siteData.managerId);
                }
                showToast('Site başarıyla eklendi.', 'success');
            }
        } catch (error) {
            showToast('Site eklenemedi.', 'error');
        }
    };

    const updateSite = async (site: Site) => {
        try {
            const response = await siteService.updateSite(site.id, site);
            if (response.data) {
                setSites(prev => prev.map(s => s.id === site.id ? response.data! : s));
                if (property.id === site.id) setProperty(response.data);

                // If manager changed, re-assign (mock logic handles overrides)
                if (site.managerId) {
                    await assignManager(site.id, site.managerId);
                }

                showToast('Site bilgileri güncellendi.', 'success');
            }
        } catch (error) {
            showToast('Site güncellenemedi.', 'error');
        }
    };

    const removeSite = async (id: string) => {
        try {
            await siteService.deleteSite(id);
            setSites(prev => prev.filter(s => s.id !== id));
            showToast('Site silindi.', 'info');
        } catch (error) {
            showToast('Site silinemedi.', 'error');
        }
    };

    const addServiceLog = (serviceName: string, icon: string, color: string) => {
        const newLog: ServiceLog = {
            id: `log_${Date.now()}`,
            serviceName,
            userName: user.name,
            userApartment: user.apartment || 'Genel',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: new Date().toLocaleDateString(),
            icon,
            color
        };
        setServiceLogs(prev => [newLog, ...prev]);
    };

    const addHouseholdMember = async (name: string, relation: string) => {
        try {
            const response = await userService.addHouseholdMember(name, relation);
            if (response.data) {
                setUser(response.data);
                logActivity('household', 'Kişi Eklendi', `${name} (${relation || 'Diğer'})`);
            }
        } catch (error) {
            showToast('Kişi eklenemedi.', 'error');
        }
    };

    const removeHouseholdMember = async (id: string) => {
        try {
            await userService.removeHouseholdMember(id);
            setUser(prev => ({ ...prev, household: prev.household.filter(h => h.id !== id) }));
        } catch (error) {
            showToast('Kişi silinemedi.', 'error');
        }
    };

    const addNewService = (service: ServiceItem) => {
        setServices(prev => [...prev, service]);
        const updatedProperty = { ...property, features: { ...property.features, [service.key]: true } };
        setProperty(updatedProperty);
        siteService.updateSite(property.id, { features: updatedProperty.features });
    };

    const assignManager = async (siteId: string, managerId: string) => {
        try {
            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 500));
            const selectedManager = allUsers.find(u => u.id === managerId);

            setSites(prev => prev.map(s =>
                s.id === siteId ? { ...s, managerId, managerName: selectedManager?.name || 'Bilinmiyor' } : s
            ));

            if (property.id === siteId) {
                setProperty(prev => ({ ...prev, managerId, managerName: selectedManager?.name || 'Bilinmiyor' }));
            }

            // Update user role to MANAGER if they were resident
            setAllUsers(prev => prev.map(u =>
                u.id === managerId ? { ...u, role: UserRole.MANAGER, siteId } : u
            ));

            showToast('Yönetici ataması başarıyla yapıldı.', 'success');
        } catch (error) {
            showToast('Atama sırasında hata oluştu.', 'error');
        }
    };

    const assignStaff = async (siteId: string, userId: string, jobTitle: string) => {
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            setAllUsers(prev => prev.map(u =>
                u.id === userId ? { ...u, role: UserRole.STAFF, siteId, jobTitle } : u
            ));
            showToast('Personel ataması başarıyla yapıldı.', 'success');
        } catch (error) {
            showToast('Atama sırasında hata oluştu.', 'error');
        }
    };

    const approveUser = async (userId: string) => {
        try {
            await userService.approveUser(userId);
            setPendingUsers(prev => prev.filter(u => u.id !== userId));
            logActivity('admin', 'Kullanıcı Onayı', userId);
            showToast('Kullanıcı onaylandı.', 'success');
        } catch (error) {
            showToast('Kullanıcı onaylanamadı.', 'error');
        }
    };

    const rejectUser = async (userId: string) => {
        try {
            await userService.rejectUser(userId);
            setPendingUsers(prev => prev.filter(u => u.id !== userId));
            showToast('Kullanıcı reddedildi.', 'info');
        } catch (error) {
            showToast('Kullanıcı reddedilemedi.', 'error');
        }
    };

    const updateTicketStatus = async (id: string, status: Ticket['status']) => {
        try {
            const response = await ticketService.updateStatus(id, status);
            if (response.data) {
                setTickets(prev => prev.map(t => t.id === id ? response.data! : t));
                showToast('Talep durumu güncellendi.', 'success');
            }
        } catch (error) {
            showToast('Talep güncellenemedi.', 'error');
        }
    };

    const addTicket = async (ticket: Omit<Ticket, 'id' | 'status' | 'date' | 'siteId' | 'userId'>) => {
        try {
            const response = await ticketService.createTicket({
                title: ticket.title,
                description: ticket.description,
                category: ticket.category,
                targetRole: ticket.targetRole,
                attachment: ticket.attachment,
            });
            if (response.data) {
                setTickets(prev => [response.data!, ...prev]);
                showToast('Talep oluşturuldu.', 'success');
            }
        } catch (error) {
            showToast('Talep oluşturulamadı.', 'error');
        }
    };

    const submitServiceRatings = (rating: number) => {
        setGlobalStats(prev => ({ ...prev, averageRating: (prev.averageRating + rating) / 2 }));
        logActivity('system', 'Hizmet Puanlama', `Sakin: ${rating}/5`);
    };

    const toggleCameraPermission = async (key: keyof CameraPreferences) => {
        setCameraPermissions(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const updateUserAvatar = async (url: string) => {
        try {
            const response = await userService.updateAvatar(url);
            if (response.data) {
                setUser(response.data);
            }
        } catch (error) {
            showToast('Avatar güncellenemedi.', 'error');
        }
    };

    const addLicensePlate = async (plate: string) => {
        try {
            const response = await userService.addLicensePlate(plate);
            if (response.data) {
                setUser(response.data);
                logActivity('system', 'Plaka Tanımlandı', plate);
            }
        } catch (error) {
            showToast('Plaka eklenemedi.', 'error');
        }
    };

    const updatePropertyFeature = async (key: string, value: boolean) => {
        try {
            const response = await siteService.updateFeature(property.id, key, value);
            if (response.data) {
                setProperty(response.data);
            }
        } catch (error) {
            showToast('Özellik güncellenemedi.', 'error');
        }
    };

    const hasPermission = (permission: AppPermission): boolean => {
        const permissions = ROLE_PERMISSIONS[user.role] || [];
        return permissions.includes(permission);
    };

    const markNotificationsAsRead = () => { };
    const clearAllNotifications = () => { };
    const setTheme = (t: ThemeAccent) => setThemeState(t);
    const dismissPushNotification = () => { };

    const createAuthority = async (data: { name: string; username: string; role: UserRole; jobTitle: string; password?: string }) => {
        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            const newUser: User = {
                id: 'auth_' + Date.now(),
                name: data.name,
                username: data.username,
                role: data.role,
                jobTitle: data.jobTitle,
                status: 'approved',
                isStaff: true,
                forcePasswordChange: true,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=random`,
                balance: 0,
                household: [],
                licensePlates: []
            };
            setAllUsers(prev => [...prev, newUser]);
            showToast('Yetkili hesabı oluşturuldu.', 'success');
        } catch (error) {
            showToast('Hesap oluşturulurken hata oluştu.', 'error');
        }
    };

    const confirmPasswordChange = async (newPassword: string) => {
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            setUser(prev => ({ ...prev, forcePasswordChange: false }));
            setAllUsers(prev => prev.map(u => u.id === user.id ? { ...u, forcePasswordChange: false } : u));
            showToast('Şifreniz başarıyla güncellendi.', 'success');
        } catch (error) {
            showToast('Şifre güncellenemedi.', 'error');
        }
    };

    return (
        <AppContext.Provider value={{
            user, property, sites, services, announcements, forumPosts, tickets, activePoll, serviceLogs, activities,
            globalStats, cameraPermissions, pushNotifications, notificationHistory, unreadNotificationCount: 0, pendingUsers, theme,
            isLoading, isAuthenticated, modal, toast, openModal, closeModal, showToast, toggleRole: () => { }, updatePropertyFeature,
            allUsers, assignManager, assignStaff, createAuthority, confirmPasswordChange,
            login, register, approveUser, rejectUser, logout, addAnnouncement, addForumPost, approveForumPost, createPoll, addSite, updateSite, removeSite, switchSite,
            logActivity, addServiceLog, addHouseholdMember, removeHouseholdMember, addNewService, updateTicketStatus,
            addTicket, submitServiceRatings, hasPermission, toggleCameraPermission, updateUserAvatar, sendPushNotification: () => { },
            dismissPushNotification, markNotificationsAsRead, clearAllNotifications, setTheme, addLicensePlate, refreshData, language, setLanguage
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error('useApp error');
    return context;
};
