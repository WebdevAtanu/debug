import React, { useState, useEffect } from 'react';
import { notificationsService } from '../services/notificationsService';
import { socketService } from '../services/socketService';
import type { Notification } from '../services/notificationsService';

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    setupSocketListeners();
    return () => {
      cleanupSocketListeners();
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await notificationsService.getNotifications();
      setNotifications(response.data?.notifications || response.data || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupSocketListeners = () => {
    socketService.onNotification((data: any) => {
      console.log('New notification received:', data);
      fetchNotifications();
    });
  };

  const cleanupSocketListeners = () => {
    socketService.removeNotificationListener(() => {});
  };

  if (loading) return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Notifications</h1>
        
        {notifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">No notifications</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`bg-white rounded-lg shadow p-6 border-l-4 ${
                  notification.read ? 'border-gray-300' : 'border-indigo-600'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium">{notification.message}</p>
                    <span className="text-sm text-gray-500 mt-2 block">
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {!notification.read && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      New
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
