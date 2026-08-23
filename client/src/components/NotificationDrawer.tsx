import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Bell, X, Mail, Smartphone, CheckCircle, AlertCircle } from 'lucide-react';

interface NotificationDrawerProps {
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ onClose }) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // For demo purposes, fetch active orders and render recent notifications
    const fetchNotifs = async () => {
      try {
        const data = await api.getOrders();
        const notifList: any[] = [];
        data.orders.forEach((order: any) => {
          if (order.trackingHistory) {
            order.trackingHistory.forEach((th: any) => {
              notifList.push({
                id: th.id,
                orderId: order.id,
                trackingNumber: order.trackingNumber,
                title: `Status: ${th.status}`,
                message: th.notes || `Order status updated to ${th.status}`,
                type: 'EMAIL',
                actor: th.actorName,
                createdAt: th.createdAt,
              });
            });
          }
        });
        notifList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setNotifications(notifList.slice(0, 15));
      } catch (err) {
        console.warn('Error fetching notifications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifs();
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass-card"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 420,
          maxWidth: '100vw',
          borderRadius: 0,
          padding: '1.5rem',
          overflowY: 'auto',
          zIndex: 300,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell size={20} color="var(--accent-blue)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Notifications & Email Log</h3>
          </div>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '0.4rem' }}>
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div style={{ color: 'var(--text-muted)' }}>Loading notification feed...</div>
        ) : notifications.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '2rem' }}>No recent notifications.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {notifications.map((n) => (
              <div
                key={n.id}
                style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.875rem',
                  fontSize: '0.825rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span className="mono-text" style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                    #{n.trackingNumber}
                  </span>
                  <span style={{ fontSize: '0.675rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                    {new Date(n.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: 2 }}>{n.title}</div>
                <div style={{ color: 'var(--text-muted)' }}>{n.message}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: 6, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Mail size={12} color="var(--accent-blue)" /> Dispatched Email & SMS to Customer
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
