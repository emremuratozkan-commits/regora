
import React from 'react';
import { useApp } from '../context/AppContext';
import { AppPermission } from '../types';

interface TabBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabChange }) => {
  const { hasPermission } = useApp();

  const tabs = [
    { id: 'dashboard', icon: 'grid_view', label: 'ÖZET' },
    { id: 'finance', icon: 'account_balance_wallet', label: 'FİNANS' },
    ...(hasPermission(AppPermission.VIEW_ADMIN_DASHBOARD) 
        ? [{ id: 'admin', icon: 'shield_person', label: 'YÖNETİM' }] 
        : []
    ),
    { id: 'services', icon: 'concierge', label: 'HİZMET' },
    { id: 'community', icon: 'public', label: 'YAŞAM' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl border-t border-white/5"></div>
      <div className="relative flex justify-around items-center px-4 py-3 pb-7 max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center w-14 transition-all duration-300 ${
                isActive ? 'text-white' : 'text-gray-600'
              }`}
            >
              <span 
                className={`material-symbols-rounded text-2xl mb-1.5 ${isActive ? 'font-variation-filled' : ''}`}
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {tab.icon}
              </span>
              <span className="text-[8px] font-bold tracking-[0.1em]">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TabBar;
