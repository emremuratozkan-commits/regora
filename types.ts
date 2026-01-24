
export enum UserRole {
  RESIDENT = 'RESIDENT',
  ADMIN = 'ADMIN',
  TECHNICIAN = 'TECHNICIAN'
}

export enum AppPermission {
  VIEW_ADMIN_DASHBOARD = 'VIEW_ADMIN_DASHBOARD',
  MANAGE_SITE = 'MANAGE_SITE',
  MANAGE_FACILITIES = 'MANAGE_FACILITIES',
  MANAGE_COMMUNITY = 'MANAGE_COMMUNITY',
  VIEW_SITE_FINANCE = 'VIEW_SITE_FINANCE',
  VIEW_PERSONAL_FINANCE = 'VIEW_PERSONAL_FINANCE',
  CREATE_TICKETS = 'CREATE_TICKETS',
  MANAGE_TICKETS = 'MANAGE_TICKETS'
}

export type ThemeAccent = 'gold' | 'blue' | 'purple' | 'emerald' | 'rose';

export interface CameraPreferences {
  profilePhoto: boolean;
  virtualTour: boolean;
  maintenanceRequest: boolean;
}

export interface PushNotification {
  id: string;
  title: string;
  message: string;
  type: 'alert' | 'info' | 'success';
  timestamp: number;
  read?: boolean;
}

export interface PropertyFeatures {
  has_pool: boolean;
  has_gym: boolean;
  has_freight_elevator: boolean;
  has_parking_recognition: boolean;
  has_guest_kiosk: boolean;
  [key: string]: boolean;
}

export interface Site {
  id: string;
  name: string;
  address: string;
  city: string;
  managerName: string;
  blockCount: number;
  unitCount: number;
  duesAmount: number;
  imageUrl?: string; // New: Cover image for the site
  managementPlanUrl?: string;
  features: PropertyFeatures; 
  block?: string; 
}

export type SiteOption = Site;

// Property is now an alias for Site in the frontend context to ensure consistency
export type Property = Site;

export interface HouseholdMember {
  id: string;
  name: string;
  type: 'family' | 'guest' | 'tenant';
  relation: string;
}

export interface ServiceItem {
  id: string;
  key: string; 
  title: string;
  description: string;
  icon: string;
  color: string;
  action: string;
}

export interface User {
  id: string;
  siteId: string; // Foreign Key to Site
  name: string;
  avatar: string;
  role: UserRole;
  block?: string; // New: Block info
  apartment: string;
  phoneNumber?: string; // New: Phone Number
  status?: 'active' | 'pending' | 'rejected'; // New: Approval status
  balance: number;
  household: HouseholdMember[];
  licensePlates?: string[]; // Added license plates
  username: string; // For login lookup
}

export interface Transaction {
  id: string;
  userId: string; // Foreign Key
  title: string;
  date: string;
  amount: number;
  type: 'dues' | 'utility' | 'fine';
  status: 'paid' | 'pending' | 'overdue';
}

export interface Ticket {
  id: string;
  siteId: string; // Foreign Key
  userId: string; // Foreign Key
  title: string;
  description: string;
  requestorName: string;
  category: 'maintenance' | 'security' | 'cleaning' | 'landscape' | 'technical'; // Expanded categories
  status: 'open' | 'in_progress' | 'resolved';
  date: string;
  attachment?: string;
}

export interface Announcement {
  id: string;
  siteId: string; // Foreign Key (or 'global')
  title: string;
  content: string;
  priority: 'emergency' | 'important' | 'routine';
  date: string;
}

export interface Poll {
  id: string;
  siteId: string;
  title: string;
  options: { label: string; percentage: number }[];
  endDate: string;
}

export interface ForumPost {
  id: string;
  siteId: string;
  author: string;
  authorAvatar: string;
  title: string;
  content: string;
  date: string;
  likes: number;
  status: 'approved' | 'pending';
  comments: number;
}

export interface ServiceLog {
  id: string;
  serviceName: string; 
  userName: string;
  userApartment: string;
  time: string;
  date: string;
  icon: string;
  color: string;
}

export interface ActivityLog {
  id: string;
  type: 'taxi' | 'guest' | 'real_estate' | 'ticket' | 'system' | 'household' | 'admin';
  title: string;
  description: string;
  time: string;
  user?: string;
}

export interface GlobalStats {
  taxiCount: number;
  guestCount: number;
  totalBalance: number;
  monthlyIncome: number; 
  monthlyExpense: number; 
  activeTickets: number;
  collectionRate: number; 
  totalResidents: number; 
  averageRating: number; 
}

export interface BankDetails {
  bankName: string;
  accountHolder: string;
  iban: string;
}

export interface AdminSiteStats {
  id: string;
  name: string;
  occupancyRate: number;
  collectionRate: number; // Tahsilat oranı
  pendingTickets: number;
  status: 'good' | 'warning' | 'critical';
}

// UI Types
export type ModalType = 
  | 'QR' 
  | 'PAYMENT' 
  | 'TICKET' 
  | 'TICKET_DETAIL' 
  | 'EMERGENCY' 
  | 'CONFIRMATION' 
  | 'REAL_ESTATE' 
  | 'CREATE_POST' 
  | 'CREATE_ANNOUNCEMENT' 
  | 'CREATE_POLL'
  | 'SERVICE_LOGS'
  | 'MANAGE_SITE' 
  | 'FACILITY_SETTINGS'
  | 'MANAGE_HOUSEHOLD'
  | 'ADD_SERVICE'
  | 'RATE_SERVICES'
  | 'FORGOT_PASSWORD'
  | 'CAMERA_SETTINGS' 
  | 'NOTIFICATION_CENTER'
  | 'ADMIN_REPORTS'
  | 'RESERVATION'
  | 'ADD_LICENSE_PLATE'
  | 'MANAGE_USERS' // New
  | null;

export interface ModalContent {
  type: ModalType;
  title?: string;
  message?: string;
  data?: any;
  onConfirm?: (data?: any) => void;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}
