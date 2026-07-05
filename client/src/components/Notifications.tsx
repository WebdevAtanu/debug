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

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="notifications">
      <h2>Notifications</h2>
      {notifications.length === 0 ? (
        <p>No notifications</p>
      ) : (
        <div className="notifications-list">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`notification ${notification.read ? 'read' : 'unread'}`}
            >
              <div className="notification-content">
                <p>{notification.message}</p>
                <span className="notification-date">
                  {new Date(notification.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
