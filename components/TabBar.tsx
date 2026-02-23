
import React from 'react';
import { useApp } from '../context/AppContext';
import { AppPermission, UserRole } from '../types';
import { useTranslation } from 'react-i18next';

interface TabBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabChange }) => {
  const { hasPermission, user } = useApp();
  const { t } = useTranslation();

  const isStaffOrAdmin = user.role === UserRole.SUPER_ADMIN || user.role === UserRole.MANAGER || user.role === UserRole.STAFF;

  const tabs = [
    ...(isStaffOrAdmin ? [] : [{ id: 'dashboard', icon: 'grid_view', label: t('tabbar.dashboard') }]),
    ...(hasPermission(AppPermission.VIEW_PERSONAL_FINANCE) || hasPermission(AppPermission.VIEW_SITE_FINANCE)
      ? [{ id: 'finance', icon: 'account_balance_wallet', label: t('tabbar.finance') }]
      : []
    ),
    ...(hasPermission(AppPermission.VIEW_ADMIN_DASHBOARD) || isStaffOrAdmin
      ? [{ id: 'admin', icon: 'shield_person', label: t('tabbar.admin') }]
      : []
    ),
    { id: 'services', icon: 'concierge', label: t('tabbar.services') },
    { id: 'community', icon: 'public', label: t('tabbar.community') },
    { id: 'settings', icon: 'settings', label: t('tabbar.settings') },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] safe-area-bottom">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-3xl border-t border-white/5"></div>
      <div className="relative flex justify-around items-center px-6 pt-4 pb-[calc(env(safe-area-inset-bottom)+12px)] max-w-[430px] mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center transition-all duration-300 tap-highlight-transparent ${isActive ? 'text-white scale-110' : 'text-gray-500 hover:text-gray-300'
                }`}
            >
              <div className="relative">
                <span
                  className={`material-symbols-rounded text-[26px] mb-1 ${isActive ? 'font-variation-filled' : ''}`}
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {tab.icon}
                </span>
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
                )}
              </div>
              <span className={`text-[9px] font-bold uppercase tracking-[0.1em] mt-0.5 transition-opacity ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TabBar;
