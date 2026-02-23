
import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import TabBar from './components/TabBar';
import Dashboard from './pages/Dashboard';
import Finance from './pages/Finance';
import Services from './pages/Services';
import Community from './pages/Community';
import AdminDashboard from './pages/AdminDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import Settings from './pages/Settings';
import Login from './pages/Login';
import PendingApproval from './pages/PendingApproval';
import StaffDashboard from './pages/StaffDashboard';
import ForcePasswordChange from './pages/ForcePasswordChange';
import UIOverlay from './components/UIOverlay';
import PushNotificationSystem from './components/PushNotificationSystem';
import { AppPermission, UserRole } from './types';

const AppContent: React.FC = () => {
  const { isLoading, isAuthenticated, hasPermission, user } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (isAuthenticated && (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.MANAGER || user.role === UserRole.STAFF)) {
      setActiveTab('admin');
    }
  }, [isAuthenticated, user.role]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-dark-bg text-white">
        <div className="animate-fade-in flex flex-col items-center">
          {/* REGORA Logo Loading */}
          <div className="w-24 h-24 mb-8 rounded-full bg-white flex items-center justify-center shadow-2xl shadow-white/5">
            <span className="material-symbols-rounded text-6xl text-black font-variation-filled">lock</span>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-[0.3em] uppercase">REGORA</h1>
          <p className="font-medium tracking-[0.2em] text-[10px] text-gray-600 uppercase mt-4">Architectural SuperApp</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <UIOverlay />
        <Login />
      </>
    );
  }

  // Handle Forced Password Change
  if (user.forcePasswordChange) {
    return <ForcePasswordChange />;
  }

  // Handle Pending Approval
  const isApproved = user.status === 'approved' || user.role === UserRole.SUPER_ADMIN || user.role === UserRole.MANAGER || user.role === UserRole.STAFF;
  if (!isApproved) {
    return (
      <>
        <UIOverlay />
        <PendingApproval />
      </>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        if (user.role === UserRole.SUPER_ADMIN) return <SuperAdminDashboard />;
        if (user.role === UserRole.MANAGER) return <AdminDashboard />;
        if (user.role === UserRole.STAFF) return <StaffDashboard />;
        return <Dashboard />;
      case 'finance': return <Finance />;
      case 'services': return <Services />;
      case 'community': return <Community />;
      case 'admin':
        if (user.role === UserRole.SUPER_ADMIN) return <SuperAdminDashboard />;
        if (user.role === UserRole.MANAGER) return <AdminDashboard />;
        if (user.role === UserRole.STAFF) return <StaffDashboard />;
        return hasPermission(AppPermission.VIEW_ADMIN_DASHBOARD) ? <AdminDashboard /> : <Dashboard />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg text-gray-100 font-sans selection:bg-white selection:text-black no-select">
      <UIOverlay />
      <PushNotificationSystem />
      <main className="max-w-[430px] mx-auto min-h-screen pt-safe px-4 pb-[calc(env(safe-area-inset-bottom)+90px)]">
        {renderContent()}
      </main>
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
