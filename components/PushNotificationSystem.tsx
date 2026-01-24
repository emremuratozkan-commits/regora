
import React from 'react';
import { useApp } from '../context/AppContext';

const PushNotificationSystem: React.FC = () => {
  const { pushNotifications, dismissPushNotification } = useApp();

  if (pushNotifications.length === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[120] pointer-events-none flex flex-col items-center gap-2 pt-2 px-4">
      {pushNotifications.map((notif) => (
        <div 
          key={notif.id}
          className="pointer-events-auto w-full max-w-sm bg-white/95 dark:bg-dark-surface/95 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl rounded-2xl p-4 animate-slide-down transition-all duration-300 transform"
          role="alert"
        >
          <div className="flex items-start gap-3">
             <div className={`p-2 rounded-xl flex-shrink-0 ${
                 notif.type === 'alert' ? 'bg-white text-black' :
                 notif.type === 'info' ? 'bg-gray-800 text-white' :
                 'bg-white text-black'
             }`}>
                 <span className="material-symbols-rounded text-xl">
                     {notif.type === 'alert' ? 'warning' : notif.type === 'info' ? 'campaign' : 'check_circle'}
                 </span>
             </div>
             
             <div className="flex-1 min-w-0">
                 <div className="flex justify-between items-start">
                     <h4 className="font-bold text-[10px] text-gray-900 dark:text-gray-100 truncate pr-2 tracking-widest uppercase">
                         {notif.type === 'alert' ? 'ÅKRONA Güvenlik' : 'ÅKRONA Bildirim'}
                     </h4>
                     <span className="text-[10px] text-gray-500 flex-shrink-0">Şimdi</span>
                 </div>
                 <p className="font-semibold text-xs text-gray-800 dark:text-gray-200 mt-0.5">{notif.title}</p>
                 <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">
                     {notif.message}
                 </p>
             </div>

             <button 
                onClick={() => dismissPushNotification(notif.id)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
             >
                 <span className="material-symbols-rounded text-sm">close</span>
             </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PushNotificationSystem;
