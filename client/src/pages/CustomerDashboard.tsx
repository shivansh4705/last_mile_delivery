import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Package, PackagePlus, Clock, ArrowRight, AlertTriangle, CheckCircle, Search, RefreshCw } from 'lucide-react';
import { TrackingTimeline } from '../components/TrackingTimeline';
import { CreateOrderModal } from '../components/CreateOrderModal';
import { RescheduleModal } from '../components/RescheduleModal';

export const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [rescheduleOrder, setRescheduleOrder] = useState<any | null>(null);

  const [filterStatus, setFilterStatus] = useState<string>('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await api.getOrders({ status: filterStatus });
      setOrders(data.orders);
      if (data.orders.length > 0 && !selectedOrder) {
        setSelectedOrder(data.orders[0]);
      }
    } catch (err) {
      console.warn('Error fetching customer orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filterStatus]);

  return (
    <div style={{ maxWidth: 1280, margin: '2rem auto', padding: '0 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header Banner */}
      <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Welcome, {user?.name} 👋</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Customer Logistics Portal • Real-time status tracking & instant booking engine
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={fetchOrders} className="btn-secondary" style={{ padding: '0.5rem 0.85rem' }}>
            <RefreshCw size={15} /> Refresh
          </button>
          <button onClick={() => setShowCreateModal(true)} className="btn-primary">
            <PackagePlus size={16} /> Book New Shipment
          </button>
        </div>
      </div>

      {/* Main Grid Layout: Left Orders List, Right Selected Order Live Tracking */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.5rem' }}>
        
        {/* Left Column: Orders List & Filter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <select
              className="form-control"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ fontSize: '0.8rem' }}
            >
              <option value="">All Order Statuses</option>
              <option value="CREATED">Created</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_TRANSIT">In Transit</option>
              <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
              <option value="DELIVERED">Delivered</option>
              <option value="FAILED">Failed Attempt</option>
              <option value="RESCHEDULED">Rescheduled</option>
            </select>
          </div>

          {loading ? (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Loading shipments...</div>
          ) : orders.length === 0 ? (
            <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Package size={36} color="var(--accent-blue)" style={{ marginBottom: '0.5rem' }} />
              <div>No orders found. Click "Book New Shipment" to create your first order.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {orders.map((o) => {
                const isSelected = selectedOrder?.id === o.id;
                return (
                  <div
                    key={o.id}
                    className="glass-card"
                    style={{
                      padding: '1.15rem',
                      cursor: 'pointer',
                      borderColor: isSelected ? 'var(--accent-blue)' : 'var(--border-color)',
                      background: isSelected ? 'rgba(37, 99, 235, 0.12)' : 'var(--bg-card)',
                    }}
                    onClick={() => setSelectedOrder(o)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span className="mono-text" style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--accent-blue)' }}>
                        #{o.trackingNumber}
                      </span>
                      <span className={`badge badge-${o.status.toLowerCase()}`}>
                        {o.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: 600 }}>
                      📍 {o.dropAddress}
                    </div>

                    <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '0.4rem', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Chargeable Wt: <strong>{o.chargeableWeight}kg</strong></span>
                      <span className="mono-text" style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>${o.totalCharge?.toFixed(2)}</span>
                    </div>

                    {o.status === 'FAILED' && (
                      <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(244, 63, 94, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.725rem', color: 'var(--accent-rose)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <AlertTriangle size={12} /> Reschedule Needed
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setRescheduleOrder(o);
                          }}
                          className="btn-secondary"
                          style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', color: 'var(--accent-rose)', borderColor: 'var(--accent-rose)' }}
                        >
                          Reschedule
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Right Column: Interactive Live Tracking Audit Trail */}
        <div>
          {selectedOrder ? (
            <TrackingTimeline
              order={selectedOrder}
              onOpenReschedule={() => setRescheduleOrder(selectedOrder)}
            />
          ) : (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Select an order from the list to view its live status breakdown and audit trail.
            </div>
          )}
        </div>

      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateOrderModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={fetchOrders}
        />
      )}

      {rescheduleOrder && (
        <RescheduleModal
          orderId={rescheduleOrder.id}
          trackingNumber={rescheduleOrder.trackingNumber}
          onClose={() => setRescheduleOrder(null)}
          onSuccess={fetchOrders}
        />
      )}

    </div>
  );
};
