import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import type { AppNotification } from '../../types';

export const NotificationCenter: React.FC = () => {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useApp();
  const navigate = useNavigate();

  const handleNotificationClick = async (n: AppNotification) => {
    if (!n.read) await markNotificationRead(n.id);
    
    switch (n.type) {
      case 'FRIEND_REQUEST':
      case 'FRIEND_ACCEPTED':
        navigate('/friends');
        break;
      case 'DIRECT_MESSAGE':
        navigate('/messages');
        break;
      case 'EVENT_CREATED':
      case 'EVENT_REGISTRATION':
        navigate(`/events/${n.entityId}`);
        break;
      case 'POST_LIKE':
      case 'POST_COMMENT':
      case 'POST_MENTION':
        // Navigating directly to a post requires knowing the community.
        // For simplicity, we can route to explore/search to find it, or simply just go to communities hub.
        navigate('/communities');
        break;
      case 'CHAT_MENTION':
        navigate(`/communities/${n.entityId}`);
        break;
      default:
        break;
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'FRIEND_REQUEST': return { icon: 'person_add', color: '#3b82f6' };
      case 'FRIEND_ACCEPTED': return { icon: 'how_to_reg', color: '#10b981' };
      case 'DIRECT_MESSAGE': return { icon: 'chat', color: '#8b5cf6' };
      case 'POST_LIKE': return { icon: 'favorite', color: '#ef4444' };
      case 'POST_COMMENT': return { icon: 'comment', color: '#f59e0b' };
      case 'POST_MENTION':
      case 'CHAT_MENTION': return { icon: 'alternate_email', color: '#06b6d4' };
      case 'EVENT_CREATED': return { icon: 'event', color: '#6366f1' };
      case 'EVENT_REGISTRATION': return { icon: 'confirmation_number', color: '#10b981' };
      default: return { icon: 'notifications', color: 'var(--text-muted)' };
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div style={{ maxWidth: 768, margin: '0 auto', width: '100%' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-desc">Stay updated on activity in your network.</p>
        </div>
        {unreadCount > 0 && (
          <button className="btn btn-primary btn-sm" onClick={markAllNotificationsRead}>
            <span className="material-symbols-outlined" style={{ fontSize: 18, marginRight: 6 }}>done_all</span>
            Mark all read
          </button>
        )}
      </div>

      <div className="card">
        {notifications.length === 0 ? (
          <div className="empty-state" style={{ padding: '64px 24px' }}>
            <span className="material-symbols-outlined empty-icon">notifications_off</span>
            <div className="empty-title">You're all caught up!</div>
            <div className="empty-desc">No new notifications right now.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {notifications.map((n, idx) => {
              const { icon, color } = getIcon(n.type);
              return (
                <div 
                  key={n.id} 
                  onClick={() => handleNotificationClick(n)}
                  style={{
                    display: 'flex', 
                    gap: 16, 
                    padding: '20px 24px', 
                    cursor: 'pointer',
                    borderBottom: idx < notifications.length - 1 ? '1px solid var(--border)' : 'none',
                    background: n.read ? 'transparent' : 'rgba(59, 130, 246, 0.04)',
                    alignItems: 'flex-start',
                    transition: 'background 0.2s'
                  }}
                  className="hoverable"
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%', background: `${color}1A`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    <span className="material-symbols-outlined" style={{ color, fontSize: 22 }}>{icon}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ 
                      fontSize: 15, 
                      color: 'var(--text-primary)',
                      fontWeight: n.read ? 500 : 600,
                      marginBottom: 6
                    }}>
                      {n.message}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      {new Date(n.createdAt).toLocaleString(undefined, {
                        month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                      })}
                    </div>
                  </div>
                  {!n.read && (
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--primary)', marginTop: 17 }} />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
