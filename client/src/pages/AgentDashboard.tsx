import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Truck, CheckCircle, AlertTriangle, MapPin, RefreshCw, Power, Navigation, ArrowRight, ShieldAlert } from 'lucide-react';
import { TrackingTimeline } from '../components/TrackingTimeline';

export const AgentDashboard: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const { showToast } = useNotification();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const [isAvailable, setIsAvailable] = useState<boolean>(user?.isAvailable ?? true);
  const [failedOrder, setFailedOrder] = useState<any | null>(null);
  const [failureReason, setFailureReason] = useState<string>('Customer Premises Locked');
  const [failureNotes, setFailureNotes] = useState<string>('Attempted delivery call to customer phone with no response.');

  const fetchAssignedDeliveries = async () => {
    setLoading(true);
    try {
      const data = await api.getOrders();
      setOrders(data.orders);
      if (data.orders.length > 0 && !selectedOrder) {
        setSelectedOrder(data.orders[0]);
      }
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to load assigned deliveries', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedDeliveries();
  }, []);

  const handleToggleAvailability = async () => {
    try {
      const nextStatus = !isAvailable;
      await api.updateAgentStatus({ isAvailable: nextStatus });
      setIsAvailable(nextStatus);
      showToast('Status Updated', `Availability set to ${nextStatus ? 'AVAILABLE' : 'OFFLINE'}`, 'info');
      refreshProfile();
    } catch (err: any) {
      showToast('Error', err.message || 'Could not update status', 'error');
    }
  };

  const handleUpdateStatus = async (orderId: string, status: string, notes?: string) => {
    try {
      await api.updateOrderStatus(orderId, {
        status,
        notes,
        location: 'Current GPS Delivery Stop',
      });
      showToast('Status Updated', `Shipment status set to ${status}`, 'success');
      fetchAssignedDeliveries();
    } catch (err: any) {
      showToast('Status Error', err.message || 'Could not update status', 'error');
    }
  };

  const handleConfirmFailedDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!failedOrder) return;
    try {
      await api.updateOrderStatus(failedOrder.id, {
        status: 'FAILED',
        failureReason,
        notes: failureNotes,
        location: 'Customer Drop Address',
      });
      showToast('Delivery Marked Failed', `Failure reason logged. Customer notified to reschedule.`, 'warning');
      setFailedOrder(null);
      fetchAssignedDeliveries();
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to record delivery failure', 'error');
    }
  };

  return (
    <div style={{ maxWidth: 1280, margin: '2rem auto', padding: '0 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Agent Status Banner */}
      <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'linear-gradient(135deg, #10b981, #047857)', padding: '0.75rem', borderRadius: '12px', display: 'flex' }}>
            <Truck size={24} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Agent Driver Console: {user?.name}</h2>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Assigned Zone: <strong style={{ color: '#fff' }}>{user?.currentZoneId || 'Standard Metro Zone'}</strong> | Assigned Active Tasks: <strong style={{ color: 'var(--accent-cyan)' }}>{orders.length}</strong>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={handleToggleAvailability}
            className="btn-secondary"
            style={{
              borderColor: isAvailable ? '#10b981' : '#f43f5e',
              color: isAvailable ? '#34d399' : '#f87171',
              background: isAvailable ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
            }}
          >
            <Power size={16} /> {isAvailable ? 'Status: AVAILABLE' : 'Status: OFFLINE'}
          </button>
          <button onClick={fetchAssignedDeliveries} className="btn-secondary">
            <RefreshCw size={15} /> Refresh Tasks
          </button>
        </div>
      </div>

      {/* Grid Layout: Left Task Cards, Right Detailed Timeline & Quick Status Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '1.5rem' }}>
        
        {/* Left Column: Assigned Delivery Orders */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Your Delivery Queue</h3>

          {loading ? (
            <div style={{ color: 'var(--text-muted)' }}>Loading assigned delivery tasks...</div>
          ) : orders.length === 0 ? (
            <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No deliveries currently assigned. Stay available for auto-assignment triggers!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {orders.map((o) => {
                const isSelected = selectedOrder?.id === o.id;
                return (
                  <div
                    key={o.id}
                    className="glass-card"
                    style={{
                      padding: '1.25rem',
                      cursor: 'pointer',
                      borderColor: isSelected ? 'var(--accent-emerald)' : 'var(--border-color)',
                      background: isSelected ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-card)',
                    }}
                    onClick={() => setSelectedOrder(o)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span className="mono-text" style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--accent-blue)' }}>
                        #{o.trackingNumber}
                      </span>
                      <span className={`badge badge-${o.status.toLowerCase()}`}>
                        {o.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.85rem', fontWeight: 600, marginTop: 4 }}>
                      🚩 Pickup: {o.pickupAddress}
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, marginTop: 2, color: 'var(--accent-cyan)' }}>
                      🏁 Drop: {o.dropAddress}
                    </div>

                    {/* Fast Status Action Buttons */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.875rem', flexWrap: 'wrap' }} onClick={(e) => e.stopPropagation()}>
                      {o.status === 'ASSIGNED' && (
                        <button onClick={() => handleUpdateStatus(o.id, 'PICKED_UP', 'Parcel loaded at origin center')} className="btn-primary" style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}>
                          Mark Picked Up
                        </button>
                      )}
                      {o.status === 'PICKED_UP' && (
                        <button onClick={() => handleUpdateStatus(o.id, 'IN_TRANSIT', 'Driver en route on expressway')} className="btn-primary" style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}>
                          Mark In Transit
                        </button>
                      )}
                      {o.status === 'IN_TRANSIT' && (
                        <button onClick={() => handleUpdateStatus(o.id, 'OUT_FOR_DELIVERY', 'Out for final delivery door drop')} className="btn-primary" style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                          Out for Delivery
                        </button>
                      )}
                      {o.status === 'OUT_FOR_DELIVERY' && (
                        <>
                          <button onClick={() => handleUpdateStatus(o.id, 'DELIVERED', 'Parcel delivered & signed')} className="btn-primary" style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', background: 'linear-gradient(135deg, #10b981, #047857)' }}>
                            Mark Delivered
                          </button>
                          <button onClick={() => setFailedOrder(o)} className="btn-danger" style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}>
                            Mark Failed
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Selected Order Timeline */}
        <div>
          {selectedOrder ? (
            <TrackingTimeline order={selectedOrder} />
          ) : (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Select a task from your queue to view full delivery instructions.
            </div>
          )}
        </div>

      </div>

      {/* Failed Delivery Dialog Modal */}
      {failedOrder && (
        <div className="modal-overlay" onClick={() => setFailedOrder(null)}>
          <div className="glass-card" style={{ maxWidth: 500, width: '100%', padding: '1.5rem' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={20} /> Mark Delivery Failed
            </h3>

            <form onSubmit={handleConfirmFailedDelivery} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="input-group">
                <label className="input-label">Primary Failure Reason</label>
                <select className="form-control" value={failureReason} onChange={(e) => setFailureReason(e.target.value)}>
                  <option value="Customer Premises Locked">Customer Premises Locked / Unattended</option>
                  <option value="Customer Refused Order">Customer Refused Delivery / Refused COD</option>
                  <option value="Incomplete / Wrong Address">Incomplete or Untraceable Address</option>
                  <option value="Customer Requested Reschedule">Customer Requested Reschedule at Doorstep</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Detailed Notes / Location Context</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={failureNotes}
                  onChange={(e) => setFailureNotes(e.target.value)}
                  placeholder="Record customer contact attempt details..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setFailedOrder(null)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-danger">
                  Confirm Failure & Notify Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
