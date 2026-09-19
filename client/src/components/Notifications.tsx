import React, { useState, useEffect } from 'react';
import { notificationsService } from '../services/notificationsService';
import { socketService } from '../services/socketService';
import type { Notification } from '../services/notificationsService';

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotifications();
    setupSocketListeners();
    return () => {
      cleanupSocketListeners();
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await notificationsService.getNotifications();
      setNotifications(response.data || []);
    } catch (err: any) {
      setError(err.userMessage || 'Failed to fetch notifications');
      console.error('Failed to fetch notifications:', err);
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

  if (loading) return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <span className="text-gray-500">Loading notifications...</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-base-content mb-2 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            Notifications
          </h1>
          <p className="text-gray-600">Stay updated with your bug activity</p>
        </div>
        
        {error && (
          <div className="alert alert-error mb-6 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}
        
        {notifications.length === 0 ? (
          <div className="card bg-base-100 shadow border border-base-200">
            <div className="card-body text-center py-12">
              <div className="text-6xl mb-4">🔔</div>
              <h3 className="text-xl font-semibold mb-2">No Notifications</h3>
              <p className="text-gray-500">You're all caught up! No new notifications to show.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`card bg-base-100 shadow hover:shadow-md transition-all duration-200 border-l-4 ${
                  notification.read ? 'border-gray-300' : 'border-primary'
                }`}
              >
                <div className="card-body py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`avatar placeholder ${notification.read ? 'bg-base-200' : 'bg-primary/10'}`}>
                        <div className={`text-neutral-content rounded-full w-12 ${notification.read ? 'bg-neutral' : 'bg-primary'}`}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-base-content mb-1">{notification.message}</p>
                        <span className="text-sm text-gray-500">
                          {new Date(notification.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    {!notification.read && (
                      <span className="badge badge-primary badge-sm">New</span>
                    )}
                  </div>
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