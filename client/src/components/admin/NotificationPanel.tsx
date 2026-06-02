// @ts-nocheck
import { BellIcon, XMarkIcon } from '@heroicons/react/24/outline';
import type { Notification } from '../../services/NotificationService';
import EmptyState from '../EmptyState';

export default function NotificationPanel({
  notifications,
  isOpen,
  shaking,
  onToggle,
  onMarkAllRead,
  onSelectOrder,
}) {
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        className={`nav-link ${shaking ? 'shaking-bell' : ''}`}
        onClick={onToggle}
        style={{
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          position: 'relative',
        }}
        aria-label="Notifications"
      >
        <BellIcon style={{ width: 22, height: 22 }} aria-hidden />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: -4,
              right: -6,
              background: 'var(--primary)',
              color: '#fff',
              fontSize: '10px',
              fontWeight: 700,
              borderRadius: '10px',
              padding: '2px 6px',
              minWidth: '18px',
              textAlign: 'center',
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 40,
            }}
            onClick={onToggle}
          />
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: '100%',
              marginTop: 8,
              width: 320,
              maxHeight: 400,
              overflowY: 'auto',
              background: '#fff',
              borderRadius: 12,
              border: '1px solid var(--almond)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              zIndex: 50,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                borderBottom: '1px solid var(--almond)',
              }}
            >
              <strong>Notifications</strong>
              {unreadCount > 0 && (
                <button
                  type="button"
                  className="btn-sm"
                  onClick={onMarkAllRead}
                  style={{ fontSize: '11px' }}
                >
                  Mark all read
                </button>
              )}
            </div>
            {notifications.length === 0 ? (
              <EmptyState
                title="No notifications"
                description="New orders and updates will appear here."
              />
            ) : (
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {notifications.map((n: Notification) => (
                  <li
                    key={n.id}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid rgba(0,0,0,0.04)',
                      background: n.is_read
                        ? 'transparent'
                        : 'rgba(212, 124, 106, 0.06)',
                      cursor: n.order_id ? 'pointer' : 'default',
                    }}
                    onClick={() => n.order_id && onSelectOrder(n.order_id)}
                  >
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>
                      {n.title}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--cocoa)', marginTop: 4 }}>
                      {n.message}
                    </div>
                    <div style={{ fontSize: '11px', opacity: 0.6, marginTop: 4 }}>
                      {new Date(n.created_at).toLocaleString()}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
