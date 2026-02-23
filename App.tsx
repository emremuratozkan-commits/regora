
import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import TabBar from './components/TabBar';
import Dashboard from './pages/Dashboard';
import Finance from './pages/Finance';
import Services from './pages/Services';
import Community from './pages/Community';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import UIOverlay from './components/UIOverlay';
import PushNotificationSystem from './components/PushNotificationSystem';
import { AppPermission } from './types';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { isLoading, isAuthenticated, hasPermission } = useApp();

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

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'finance': return <Finance />;
      case 'services': return <Services />;
      case 'community': return <Community />;
      case 'admin':
        return hasPermission(AppPermission.VIEW_ADMIN_DASHBOARD) ? <AdminDashboard /> : <Dashboard />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg text-gray-100 font-sans selection:bg-white selection:text-black">
      <UIOverlay />
      <PushNotificationSystem />
      <main className="max-w-md mx-auto min-h-screen pt-6 px-4">
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
