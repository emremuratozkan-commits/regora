
import { User, UserRole, Property, Transaction, Ticket, Announcement, AdminSiteStats, Site, ServiceItem, ForumPost, ServiceLog, Poll, BankDetails, AppPermission } from './types';

export const ROLE_PERMISSIONS: Record<UserRole, AppPermission[]> = {
  [UserRole.ADMIN]: [
    AppPermission.VIEW_ADMIN_DASHBOARD,
    AppPermission.MANAGE_SITE,
    AppPermission.MANAGE_FACILITIES,
    AppPermission.MANAGE_COMMUNITY,
    AppPermission.VIEW_SITE_FINANCE,
    AppPermission.MANAGE_TICKETS
  ],
  [UserRole.RESIDENT]: [
    AppPermission.VIEW_PERSONAL_FINANCE,
    AppPermission.CREATE_TICKETS
  ],
  [UserRole.TECHNICIAN]: [
      AppPermission.MANAGE_TICKETS
  ]
};

export const MOCK_SITES: Site[] = [
  { 
    id: 's1', 
    name: 'REGORA Heights', 
    address: 'Zincirlikuyu Cad. No:1, Levent', 
    city: 'İstanbul', 
    managerName: 'Mehmet Aksoy', 
    blockCount: 2, 
    unitCount: 180,
    duesAmount: 2450,
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800',
    features: { has_pool: true, has_gym: true, has_freight_elevator: true, has_parking_recognition: true, has_guest_kiosk: true }
  },
  { 
    id: 's2', 
    name: 'REGORA Marine Plaza', 
    address: 'Karaköy Rıhtım No:12', 
    city: 'İstanbul', 
    managerName: 'Esra Yıldız', 
    blockCount: 1, 
    unitCount: 45,
    duesAmount: 3800,
    imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=800',
    features: { has_pool: true, has_gym: true, has_freight_elevator: true, has_parking_recognition: true, has_guest_kiosk: true }
  },
];

export const MOCK_USER: User = {
  id: 'u1',
  siteId: 's1',
  username: 'regora_user',
  name: 'Can Dağdelen',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
  role: UserRole.RESIDENT,
  apartment: 'A Blok - Daire 104',
  balance: -2450.00,
  household: [
    { id: 'h1', name: 'Zeynep Dağdelen', type: 'family', relation: 'Eş' }
  ]
};

export const MOCK_BANK_DETAILS: BankDetails = {
  bankName: 'REGORA Finans',
  accountHolder: 'REGORA Mülk Yönetimi A.Ş.',
  iban: 'TR00 0001 2024 0000 0055 6677 88'
};

export const ALL_SERVICES: ServiceItem[] = [
  { 
    id: 's1', 
    key: 'has_pool', 
    title: 'Infinity Pool', 
    description: 'Doluluk: %20', 
    icon: 'pool', 
    color: 'text-white',
    action: 'Rezervasyon'
  },
  { 
    id: 's2', 
    key: 'has_gym', 
    title: 'Regora Wellness', 
    description: '7/24 Aktif', 
    icon: 'fitness_center', 
    color: 'text-white',
    action: 'Giriş Kodu'
  },
  { 
    id: 's4', 
    key: 'has_parking_recognition', 
    title: 'Smart Parking', 
    description: 'Otopark Yönetimi', 
    icon: 'directions_car', 
    color: 'text-white',
    action: 'Plaka Tanımla'
  },
  { 
    id: 's5', 
    key: 'has_guest_kiosk', 
    title: 'Concierge QR', 
    description: 'Misafir hızlı geçiş', 
    icon: 'qr_code_2', 
    color: 'text-white',
    action: 'QR Üret'
  }
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 't1', userId: 'u1', title: 'Ocak 2024 Aidat', date: '2024-01-01', amount: 2450, type: 'dues', status: 'pending' },
  { id: 't3', userId: 'u1', title: 'Aralık 2023 Aidat', date: '2023-12-01', amount: 2450, type: 'dues', status: 'paid' },
];

export const MOCK_UPCOMING_PAYMENTS: Transaction[] = [
  { id: 'up1', userId: 'u1', title: 'Enerji Gideri', date: '25 Oca', amount: 840.50, type: 'utility', status: 'pending' },
];

export const MOCK_TICKETS: Ticket[] = [
  { 
    id: 'tk1', 
    siteId: 's1',
    userId: 'u1',
    title: 'Akıllı Ev Paneli Sorunu', 
    description: 'Kontrol panelinde bağlantı hatası alıyorum.',
    requestorName: 'Can Dağdelen (A-104)',
    category: 'maintenance', 
    status: 'in_progress', 
    date: '1 sa önce' 
  }
];

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  { id: 'a1', siteId: 's1', title: 'Planlı Bakım Çalışması', content: 'Sosyal tesis alanında 20 Ocak günü rutin teknik bakım yapılacaktır.', priority: 'routine', date: 'Bugün' },
];

export const MOCK_FORUM_POSTS: ForumPost[] = [
  {
    id: 'f1',
    siteId: 's1',
    author: 'Selim Bey',
    authorAvatar: 'https://ui-avatars.com/api/?name=Selim+B&background=000&color=fff',
    title: 'Otopark Aydınlatmaları',
    content: 'Otopark -2 katında bazı lambalar yanmıyor.',
    date: '4 sa önce',
    likes: 8,
    comments: 2,
    status: 'approved'
  }
];

export const MOCK_SERVICE_LOGS: ServiceLog[] = [];
export const MOCK_POLL: Poll = {
  id: 'p1',
  siteId: 's1',
  title: 'Lobi Dekorasyon Yenileme',
  endDate: '5 Gün Kaldı',
  options: [
    { label: 'Minimalist Modern', percentage: 75 },
    { label: 'Klasik Şık', percentage: 25 }
  ]
};
