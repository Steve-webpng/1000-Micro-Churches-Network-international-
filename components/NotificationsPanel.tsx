import React from 'react';
import { Notification, Page } from '../types';
import { IconSermon, IconEvent, IconPrayer, IconFile, IconBell } from '../components/Icons';

interface NotificationsPanelProps {
  notifications: Notification[];
  onClose: () => void;
  onNotificationClick: (page: Page, id?: string) => void;
  onMarkAllRead: () => void;
}

const NotificationIcon = ({ page }: { page?: Page }) => {
    const className = "w-5 h-5 text-slate-500 dark:text-slate-300";
    switch (page) {
        case Page.SERMONS: return <IconSermon className={className} />;
        case Page.EVENTS: return <IconEvent className={className} />;
        case Page.PRAYER: return <IconPrayer className={className} />;
        case Page.RESOURCES: return <IconFile className={className} />;
        default: return <IconBell className={className} />;
    }
};

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ notifications, onClose, onNotificationClick, onMarkAllRead }) => {
  const handleItemClick = (notification: Notification) => {
      if (notification.link_to_page) {
          onNotificationClick(notification.link_to_page, notification.link_to_id);
      }
      onClose();
  };

  return (
    <div className="absolute top-full right-0 mt-2 w-80 max-w-sm bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-[100] animate-fade-in-down" onClick={(e) => e.stopPropagation()}>
      <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
        <h3 className="font-bold text-slate-800 dark:text-slate-100">Notifications</h3>
        {notifications.some(n => !n.is_read) && (
            <button onClick={onMarkAllRead} className="text-xs text-primary-600 dark:text-primary-400 font-semibold hover:underline">Mark all as read</button>
        )}
      </div>
      <div className="max-h-96 overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map(n => (
            <div
              key={n.id}
              onClick={() => handleItemClick(n)}
              className={`flex items-start gap-3 p-4 border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer relative ${!n.is_read ? '' : ''}`}
            >
                {!n.is_read && <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary-500"></div>}
                <div className="w-8 h-8 flex-shrink-0 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mt-1">
                    <NotificationIcon page={n.link_to_page} />
                </div>
                <div>
                    <p className={`text-sm ${!n.is_read ? 'font-semibold text-slate-800 dark:text-slate-100' : 'text-slate-600 dark:text-slate-300'}`}>{n.message}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        {new Date(n.created_at).toLocaleString()}
                    </p>
                </div>
            </div>
          ))
        ) : (
          <div className="p-10 text-center text-sm text-slate-500 dark:text-slate-400">
            You have no new notifications.
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPanel;
