import { useState, useRef, useEffect } from 'react';
import './NotificationDropdown.css';

const NotificationDropdown = ({ 
  notifications = [], 
  onMarkAsRead, 
  onMarkAllAsRead, 
  onNotificationClick 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNotificationClick = (notification) => {
    // Mark as read
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    
    // Navigate to relevant section
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
    
    setIsOpen(false);
  };

  const handleMarkAllAsRead = () => {
    onMarkAllAsRead();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order':
        return '📦';
      case 'review':
        return '⭐';
      default:
        return '📢';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'order':
        return '#667eea';
      case 'review':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  // Поправена функция за форматиране на времето
  const formatTime = (dateString) => {
    if (!dateString) return 'сега';
    
    try {
      const now = new Date();
      const notificationTime = new Date(dateString);
      const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));
      
      if (diffInMinutes < 1) return 'сега';
      if (diffInMinutes < 60) return `${diffInMinutes} мин`;
      
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `${diffInHours} час${diffInHours > 1 ? 'а' : ''}`;
      
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} ден${diffInDays > 1 ? 'и' : ''}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'сега';
    }
  };

  // Функция за генериране на title от message
  const getNotificationTitle = (notification) => {
    if (notification.type === 'order') {
      return 'Нова поръчка';
    } else if (notification.type === 'review') {
      return 'Нов отзив';
    }
    return 'Нотификация';
  };

  return (
    <div className="notification-dropdown-container" ref={dropdownRef}>
      <button 
        className="notification-dropdown-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Нотификации"
      >
        <span className="notification-dropdown-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="notification-dropdown-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown-menu">
          <div className="notification-dropdown-header">
            <div className="notification-dropdown-title">
              <h3>Нотификации</h3>
              {unreadCount > 0 && (
                <span className="notification-dropdown-count">
                  {unreadCount} нови
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button 
                className="notification-dropdown-mark-all"
                onClick={handleMarkAllAsRead}
              >
                Маркирай всички
              </button>
            )}
          </div>
          
          <div className="notification-dropdown-list">
            {notifications.length === 0 ? (
              <div className="notification-dropdown-empty">
                <div className="notification-dropdown-empty-icon">🔕</div>
                <p>Няма нови нотификации</p>
              </div>
            ) : (
              notifications.slice(0, 10).map(notification => (
                <div 
                  key={notification.id}
                  className={`notification-dropdown-item ${!notification.read ? 'notification-dropdown-item--unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div 
                    className="notification-dropdown-item-icon"
                    style={{ backgroundColor: getNotificationColor(notification.type) }}
                  >
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="notification-dropdown-item-content">
                    <div className="notification-dropdown-item-header">
                      <h4 className="notification-dropdown-item-title">
                        {getNotificationTitle(notification)}
                      </h4>
                      <span className="notification-dropdown-item-time">
                        {formatTime(notification.createdAt || notification.timestamp)}
                      </span>
                    </div>
                    <p className="notification-dropdown-item-message">
                      {notification.message}
                    </p>
                  </div>
                  
                  {!notification.read && (
                    <div className="notification-dropdown-item-dot"></div>
                  )}
                </div>
              ))
            )}
          </div>

          {notifications.length > 10 && (
            <div className="notification-dropdown-footer">
              <button className="notification-dropdown-view-all">
                Виж всички нотификации
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;