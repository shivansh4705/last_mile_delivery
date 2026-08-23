import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import {
  ShieldCheck,
  Package,
  Truck,
  Layers,
  DollarSign,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  PackagePlus,
  Zap,
  Edit,
  UserCheck,
} from 'lucide-react';
import { AdminZoneEditor } from '../components/AdminZoneEditor';
import { AdminRateCardEditor } from '../components/AdminRateCardEditor';
import { CreateOrderModal } from '../components/CreateOrderModal';
import { TrackingTimeline } from '../components/TrackingTimeline';

export const AdminDashboard: React.FC = () => {
  const { showToast } = useNotification();
  const [activeTab, setActiveTab] = useState<'orders' | 'zones' | 'rates' | 'agents'>('orders');

  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]);

  const [loading, setLoading] = useState<boolean>(true);

  // Order Filters
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterZoneId, setFilterZoneId] = useState<string>('');
  const [filterAgentId, setFilterAgentId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Order & Modals
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [overrideOrder, setOverrideOrder] = useState<any | null>(null);
  const [overrideStatusVal, setOverrideStatusVal] = useState<string>('DELIVERED');
  const [overrideNotes, setOverrideNotes] = useState<string>('Admin manual override after manual phone verification');

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, ordersData, agentsData, zonesData] = await Promise.all([
        api.getAdminStats(),
        api.getOrders({
          status: filterStatus,
          zoneId: filterZoneId,
          agentId: filterAgentId,
          search: searchQuery,
        }),
        api.getAgents(),
        api.getZones(),
      ]);

      setStats(statsData.stats);
      setOrders(ordersData.orders);
      setAgents(agentsData.agents);
      setZones(zonesData.zones);

      if (ordersData.orders.length > 0 && !selectedOrder) {
        setSelectedOrder(ordersData.orders[0]);
      }
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to load admin telemetry', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [filterStatus, filterZoneId, filterAgentId]);

  const handleTriggerAutoAssign = async (orderId: string) => {
    try {
      const res = await api.assignAgent(orderId, { auto: true });
      showToast('Auto-Assignment Triggered', res.message || 'Assigned nearest agent', 'success');
      fetchDashboardData();
    } catch (err: any) {
      showToast('Auto-Assign Error', err.message || 'Failed to auto-assign agent', 'error');
    }
  };

  const handleAdminOverrideStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideOrder) return;
    try {
      await api.overrideStatus(overrideOrder.id, {
        status: overrideStatusVal,
        notes: overrideNotes,
      });
      showToast('Status Overridden', `Order status administratively set to ${overrideStatusVal}`, 'success');
      setOverrideOrder(null);
      fetchDashboardData();
    } catch (err: any) {
      showToast('Override Error', err.message || 'Failed to override status', 'error');
    }
  };

  return (
    <div style={{ maxWidth: 1380, margin: '2rem auto', padding: '0 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Executive Command Center Header */}
      <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', padding: '0.75rem', borderRadius: '12px', display: 'flex', boxShadow: '0 0 20px rgba(139, 92, 246, 0.4)' }}>
            <ShieldCheck size={26} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Logistics Operations Command Center</h2>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Full fleet visibility, zone rate cards, order status override, and intelligent agent dispatching
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={fetchDashboardData} className="btn-secondary">
            <RefreshCw size={15} /> Refresh Data
          </button>
          <button onClick={() => setShowCreateModal(true)} className="btn-primary">
            <PackagePlus size={16} /> Create Order (Admin)
          </button>
        </div>
      </div>

      {/* KPI Telemetry Cards */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem' }}>
          <div className="glass-card" style={{ padding: '1rem' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Total Orders</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>{stats.totalOrders}</div>
          </div>

          <div className="glass-card" style={{ padding: '1rem' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Active Transit</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-blue)' }}>{stats.activeDeliveries}</div>
          </div>

          <div className="glass-card" style={{ padding: '1rem' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Delivered</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>{stats.deliveredCount}</div>
          </div>

          <div className="glass-card" style={{ padding: '1rem' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Failed Attempts</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-rose)' }}>{stats.failedCount}</div>
          </div>

          <div className="glass-card" style={{ padding: '1rem' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Rescheduled</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-purple)' }}>{stats.rescheduledCount}</div>
          </div>

          <div className="glass-card" style={{ padding: '1rem' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Total Revenue</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>${stats.totalRevenue.toFixed(2)}</div>
          </div>

          <div className="glass-card" style={{ padding: '1rem' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Available Agents</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#34d399' }}>{stats.availableAgents} / {stats.totalAgents}</div>
          </div>
        </div>
      )}

      {/* Main Tab Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('orders')}
          className={`btn-secondary ${activeTab === 'orders' ? 'btn-primary' : ''}`}
        >
          <Package size={16} /> All Orders & Override Manager
        </button>
        <button
          onClick={() => setActiveTab('zones')}
          className={`btn-secondary ${activeTab === 'zones' ? 'btn-primary' : ''}`}
        >
          <Layers size={16} /> Zone & Area Manager
        </button>
        <button
          onClick={() => setActiveTab('rates')}
          className={`btn-secondary ${activeTab === 'rates' ? 'btn-primary' : ''}`}
        >
          <DollarSign size={16} /> Rate Cards & COD Rules
        </button>
        <button
          onClick={() => setActiveTab('agents')}
          className={`btn-secondary ${activeTab === 'agents' ? 'btn-primary' : ''}`}
        >
          <Truck size={16} /> Delivery Agent Roster
        </button>
      </div>

      {/* TAB 1: Order Manager & Status Override */}
      {activeTab === 'orders' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.6fr', gap: '1.5rem' }}>
          
          {/* Left Column: Filterable Order Matrix */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* Filter Toolbar */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
              <select className="form-control" style={{ fontSize: '0.75rem' }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="">Status: All</option>
                <option value="CREATED">Created</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="PICKED_UP">Picked Up</option>
                <option value="IN_TRANSIT">In Transit</option>
                <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                <option value="DELIVERED">Delivered</option>
                <option value="FAILED">Failed</option>
                <option value="RESCHEDULED">Rescheduled</option>
              </select>

              <select className="form-control" style={{ fontSize: '0.75rem' }} value={filterZoneId} onChange={(e) => setFilterZoneId(e.target.value)}>
                <option value="">Zone: All</option>
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>{z.name}</option>
                ))}
              </select>

              <select className="form-control" style={{ fontSize: '0.75rem' }} value={filterAgentId} onChange={(e) => setFilterAgentId(e.target.value)}>
                <option value="">Agent: All</option>
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>

            {loading ? (
              <div style={{ color: 'var(--text-muted)' }}>Loading logistics orders...</div>
            ) : orders.length === 0 ? (
              <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No orders match filters.</div>
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
                        borderColor: isSelected ? 'var(--accent-purple)' : 'var(--border-color)',
                        background: isSelected ? 'rgba(139, 92, 246, 0.1)' : 'var(--bg-card)',
                      }}
                      onClick={() => setSelectedOrder(o)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <span className="mono-text" style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--accent-blue)' }}>
                          #{o.trackingNumber}
                        </span>
                        <span className={`badge badge-${o.status.toLowerCase()}`}>
                          {o.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: 600 }}>
                        Customer: {o.customer?.name || 'Retail Customer'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Route: {o.pickupPincode} $\rightarrow$ {o.dropPincode} ({o.orderType})
                      </div>

                      {/* Admin Actions Bar */}
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }} onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleTriggerAutoAssign(o.id)}
                          className="btn-secondary"
                          style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem', color: 'var(--accent-cyan)' }}
                        >
                          <Zap size={12} /> Auto-Assign Agent
                        </button>
                        <button
                          onClick={() => setOverrideOrder(o)}
                          className="btn-secondary"
                          style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem', color: 'var(--accent-purple)' }}
                        >
                          <Edit size={12} /> Override Status
                        </button>
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
                Select an order from the list to view telemetry.
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 2: Zone & Area Manager */}
      {activeTab === 'zones' && <AdminZoneEditor />}

      {/* TAB 3: Rate Cards Configurator */}
      {activeTab === 'rates' && <AdminRateCardEditor />}

      {/* TAB 4: Delivery Agent Roster */}
      {activeTab === 'agents' && (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Active Delivery Agent Roster</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {agents.map((ag) => (
              <div key={ag.id} style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{ag.name}</span>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: ag.isAvailable ? '#34d399' : '#f87171',
                      background: ag.isAvailable ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                    }}
                  >
                    {ag.isAvailable ? 'AVAILABLE' : 'OFFLINE'}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Email: {ag.email}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Phone: {ag.phone || 'N/A'}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--accent-blue)', marginTop: 4 }}>
                  Assigned Zone: {ag.currentZone?.name || 'Standard Zone'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', marginTop: 4 }}>
                  Active Workload: {ag.agentDeliveries?.length || 0} Open Shipments
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Admin Status Override Modal */}
      {overrideOrder && (
        <div className="modal-overlay" onClick={() => setOverrideOrder(null)}>
          <div className="glass-card" style={{ maxWidth: 480, width: '100%', padding: '1.5rem' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--accent-purple)' }}>
              Admin Administrative Status Override
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Override status for Order #{overrideOrder.trackingNumber} with administrative audit logging.
            </p>

            <form onSubmit={handleAdminOverrideStatus} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="input-group">
                <label className="input-label">Select Target Status</label>
                <select className="form-control" value={overrideStatusVal} onChange={(e) => setOverrideStatusVal(e.target.value)}>
                  <option value="CREATED">CREATED</option>
                  <option value="ASSIGNED">ASSIGNED</option>
                  <option value="PICKED_UP">PICKED_UP</option>
                  <option value="IN_TRANSIT">IN_TRANSIT</option>
                  <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="FAILED">FAILED</option>
                  <option value="RESCHEDULED">RESCHEDULED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Override Reason & Notes</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={overrideNotes}
                  onChange={(e) => setOverrideNotes(e.target.value)}
                  placeholder="Record justification for status override..."
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setOverrideOrder(null)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' }}>
                  Confirm Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Order Modal */}
      {showCreateModal && (
        <CreateOrderModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={fetchDashboardData}
        />
      )}

    </div>
  );
};
