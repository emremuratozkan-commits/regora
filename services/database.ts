
import { Site, User, Ticket, Transaction, Announcement, ForumPost, ServiceLog, UserRole, ActivityLog, GlobalStats, Property } from '../types';
import { MOCK_SITES, MOCK_USER, MOCK_TICKETS, MOCK_TRANSACTIONS, MOCK_ANNOUNCEMENTS, MOCK_FORUM_POSTS, MOCK_SERVICE_LOGS } from '../constants';

const DB_KEY = 'regora_db_v3';
const SESSION_KEY = 'regora_session_v3';

interface DatabaseSchema {
  sites: Site[];
  users: User[];
  tickets: Ticket[];
  transactions: Transaction[];
  announcements: Announcement[];
  forumPosts: ForumPost[];
  serviceLogs: ServiceLog[];
  activityLogs: ActivityLog[];
}

interface SessionData {
  userId: string;
  siteId: string;
  role: UserRole;
  timestamp: number;
}

const getInitialData = (): DatabaseSchema => {
  const adminUser: User = {
    id: 'admin_1',
    siteId: 's1',
    username: 'admin',
    name: 'REGORA Yönetim',
    avatar: 'https://ui-avatars.com/api/?name=REGORA&background=000&color=fff',
    role: UserRole.ADMIN,
    apartment: 'Genel Merkez',
    status: 'active',
    balance: 0,
    household: []
  };

  const residentUser: User = {
    ...MOCK_USER,
    siteId: 's1',
    username: 'regora_user',
    status: 'active',
    block: 'A',
    apartment: '104',
    phoneNumber: '5551234567'
  };

  return {
    sites: MOCK_SITES,
    users: [residentUser, adminUser],
    tickets: MOCK_TICKETS.map(t => ({ ...t, siteId: 's1', userId: 'u1' })),
    transactions: MOCK_TRANSACTIONS.map(t => ({ ...t, userId: 'u1' })),
    announcements: MOCK_ANNOUNCEMENTS.map(a => ({ ...a, siteId: 's1' })),
    forumPosts: MOCK_FORUM_POSTS.map(f => ({ ...f, siteId: 's1' })),
    serviceLogs: MOCK_SERVICE_LOGS,
    activityLogs: []
  };
};

class DatabaseService {
  private data: DatabaseSchema;

  constructor() {
    const stored = localStorage.getItem(DB_KEY);
    if (stored) {
      this.data = JSON.parse(stored);
    } else {
      this.data = getInitialData();
      this.save();
    }
  }

  private save() {
    localStorage.setItem(DB_KEY, JSON.stringify(this.data));
  }

  async setSession(userId: string, siteId: string, role: UserRole): Promise<void> {
    const session: SessionData = { userId, siteId, role, timestamp: Date.now() };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  async getSession(): Promise<{ user: User, site: Site } | null> {
    const sessionStr = localStorage.getItem(SESSION_KEY);
    if (!sessionStr) return null;

    try {
      const session: SessionData = JSON.parse(sessionStr);
      const user = this.data.users.find(u => u.id === session.userId);
      const site = this.data.sites.find(s => s.id === session.siteId);

      if (user && site && user.status === 'active') {
        return { user, site };
      }
    } catch (e) {
      console.error("Session error", e);
    }
    this.clearSession();
    return null;
  }

  async clearSession(): Promise<void> {
    localStorage.removeItem(SESSION_KEY);
  }

  async register(name: string, username: string, phoneNumber: string, siteId: string, block: string, apartment: string): Promise<User | null> {
    if (this.data.users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
      throw new Error('Bu kullanıcı adı zaten alınmış.');
    }
    const newUser: User = {
      id: `u_${Date.now()}`,
      siteId: siteId,
      username: username,
      name: name,
      phoneNumber: phoneNumber,
      avatar: `https://ui-avatars.com/api/?name=${name}&background=000&color=fff`,
      role: UserRole.RESIDENT,
      block: block,
      apartment: apartment,
      status: 'pending',
      balance: 0,
      household: []
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  async login(username: string): Promise<{ user: User, site: Site } | null> {
    const user = this.data.users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!user) return null;
    if (user.status === 'pending') throw new Error('Hesabınız REGORA yönetici onayı beklemektedir.');
    if (user.status === 'rejected') throw new Error('Üyelik başvurunuz reddedilmiştir.');
    const site = this.data.sites.find(s => s.id === user.siteId);
    if (!site) return null;
    return { user, site };
  }

  async getPendingUsers(siteId: string): Promise<User[]> {
    return this.data.users.filter(u => u.siteId === siteId && u.status === 'pending');
  }

  async approveUser(userId: string): Promise<void> {
    const user = this.data.users.find(u => u.id === userId);
    if (user) {
      user.status = 'active';
      this.save();
    }
  }

  async rejectUser(userId: string): Promise<void> {
    this.data.users = this.data.users.filter(u => u.id !== userId);
    this.save();
  }

  async getGlobalStats(siteId: string): Promise<GlobalStats> {
    const siteTickets = this.data.tickets.filter(t => t.siteId === siteId);
    const siteUsers = this.data.users.filter(u => u.siteId === siteId && u.status === 'active');
    const activeTickets = siteTickets.filter(t => t.status !== 'resolved').length;
    const totalResidents = siteUsers.reduce((acc, u) => acc + 1 + (u.household?.length || 0), 0);
    const monthlyIncome = 85000;
    const monthlyExpense = 42000;
    const totalBalance = 320000;
    const collectionRate = 92;
    return { taxiCount: 15, guestCount: 42, totalBalance, monthlyIncome, monthlyExpense, activeTickets, collectionRate, totalResidents, averageRating: 4.8 };
  }

  async getSites(): Promise<Site[]> {
    return this.data.sites;
  }

  async addSite(site: Site): Promise<void> {
    this.data.sites.push(site);
    this.save();
  }

  async updateSite(site: Site): Promise<void> {
    const idx = this.data.sites.findIndex(s => s.id === site.id);
    if (idx !== -1) {
      this.data.sites[idx] = site;
      this.save();
    }
  }

  async deleteSite(id: string): Promise<void> {
    this.data.sites = this.data.sites.filter(s => s.id !== id);
    this.save();
  }

  async getTickets(siteId: string, userId?: string, role?: UserRole): Promise<Ticket[]> {
    let tickets = this.data.tickets.filter(t => t.siteId === siteId);
    if (role === UserRole.RESIDENT && userId) tickets = tickets.filter(t => t.userId === userId);
    return tickets.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async createTicket(ticket: Ticket): Promise<void> {
    this.data.tickets.unshift(ticket);
    this.save();
  }

  async updateTicketStatus(id: string, status: Ticket['status']): Promise<void> {
    const ticket = this.data.tickets.find(t => t.id === id);
    if (ticket) {
      ticket.status = status;
      this.save();
    }
  }

  async getAnnouncements(siteId: string): Promise<Announcement[]> {
    return this.data.announcements.filter(a => a.siteId === siteId || a.siteId === 'global');
  }

  async addAnnouncement(announcement: Announcement): Promise<void> {
    this.data.announcements.unshift(announcement);
    this.save();
  }

  async getForumPosts(siteId: string): Promise<ForumPost[]> {
    return this.data.forumPosts.filter(p => p.siteId === siteId);
  }

  async addForumPost(post: ForumPost): Promise<void> {
    this.data.forumPosts.unshift(post);
    this.save();
  }

  async logActivity(log: ActivityLog): Promise<void> {
    this.data.activityLogs.unshift(log);
    this.save();
  }

  async getActivityLogs(): Promise<ActivityLog[]> {
    return this.data.activityLogs;
  }
}

export const db = new DatabaseService();
