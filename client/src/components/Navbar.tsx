import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Truck, ShieldCheck, UserCheck, Calculator, Bell, LogOut, PackageSearch, RefreshCw } from 'lucide-react';
import { NotificationDrawer } from './NotificationDrawer';

interface NavbarProps {
  onOpenCalculator: () => void;
  onOpenLiveTrack: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCalculator,
  onOpenLiveTrack,
  activeTab,
  setActiveTab,
}) => {
  const { user, quickSwitchRole, logout } = useAuth();
  const [showDrawer, setShowDrawer] = useState(false);
  const [switching, setSwitching] = useState(false);

  const handleRoleSwitch = async (role: 'ADMIN' | 'CUSTOMER' | 'AGENT') => {
    setSwitching(true);
    await quickSwitchRole(role);
    setSwitching(false);
  };

  return (
    <>
      <header className="glass-nav">
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          
          {/* Brand Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => setActiveTab('dashboard')}>
            <div style={{ background: 'linear-gradient(135deg, #2563eb, #06b6d4)', padding: '0.6rem', borderRadius: '12px', display: 'flex', boxShadow: '0 0 15px rgba(37, 99, 235, 0.4)' }}>
              <Truck size={22} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em', background: 'linear-gradient(to right, #ffffff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                LOGIX<span style={{ color: '#3b82f6', WebkitTextFillColor: '#3b82f6' }}>PULSE</span>
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                Last-Mile Logistics Engine
              </div>
            </div>
          </div>

          {/* Demo Quick Role Switcher Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0, 0, 0, 0.3)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, paddingLeft: '0.5rem' }}>
              Quick Demo Role:
            </span>
            <button
              onClick={() => handleRoleSwitch('ADMIN')}
              className={`btn-secondary ${user?.role === 'ADMIN' ? 'active-role' : ''}`}
              style={{
                fontSize: '0.75rem',
                padding: '0.25rem 0.65rem',
                borderRadius: 'var(--radius-full)',
                background: user?.role === 'ADMIN' ? 'linear-gradient(135deg, #8b5cf6, #6d28d9)' : 'transparent',
                borderColor: user?.role === 'ADMIN' ? '#8b5cf6' : 'transparent',
                color: user?.role === 'ADMIN' ? '#fff' : 'var(--text-muted)',
              }}
            >
              <ShieldCheck size={13} /> Admin
            </button>
            <button
              onClick={() => handleRoleSwitch('CUSTOMER')}
              className={`btn-secondary ${user?.role === 'CUSTOMER' ? 'active-role' : ''}`}
              style={{
                fontSize: '0.75rem',
                padding: '0.25rem 0.65rem',
                borderRadius: 'var(--radius-full)',
                background: user?.role === 'CUSTOMER' ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'transparent',
                borderColor: user?.role === 'CUSTOMER' ? '#2563eb' : 'transparent',
                color: user?.role === 'CUSTOMER' ? '#fff' : 'var(--text-muted)',
              }}
            >
              <UserCheck size={13} /> Customer
            </button>
            <button
              onClick={() => handleRoleSwitch('AGENT')}
              className={`btn-secondary ${user?.role === 'AGENT' ? 'active-role' : ''}`}
              style={{
                fontSize: '0.75rem',
                padding: '0.25rem 0.65rem',
                borderRadius: 'var(--radius-full)',
                background: user?.role === 'AGENT' ? 'linear-gradient(135deg, #10b981, #047857)' : 'transparent',
                borderColor: user?.role === 'AGENT' ? '#10b981' : 'transparent',
                color: user?.role === 'AGENT' ? '#fff' : 'var(--text-muted)',
              }}
            >
              <Truck size={13} /> Agent
            </button>
            {switching && <RefreshCw size={13} className="spin" style={{ color: 'var(--accent-blue)' }} />}
          </div>

          {/* Navigation Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button onClick={onOpenCalculator} className="btn-secondary" style={{ fontSize: '0.8rem' }}>
              <Calculator size={15} /> Rate Calculator
            </button>

            <button onClick={onOpenLiveTrack} className="btn-secondary" style={{ fontSize: '0.8rem' }}>
              <PackageSearch size={15} /> Live Track
            </button>

            {user && (
              <>
                <button
                  onClick={() => setShowDrawer(true)}
                  className="btn-secondary"
                  style={{ padding: '0.5rem', position: 'relative' }}
                  title="Notifications Feed"
                >
                  <Bell size={18} />
                  <span style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-rose)' }}></span>
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '0.75rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700 }}>{user.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--accent-blue)', fontWeight: 600 }}>{user.role}</div>
                  </div>
                  <button onClick={logout} className="btn-secondary" style={{ padding: '0.5rem', color: 'var(--accent-rose)' }} title="Sign Out">
                    <LogOut size={16} />
                  </button>
                </div>
              </>
            )}
          </div>

        </div>
      </header>

      {/* Notification Drawer Modal */}
      {showDrawer && <NotificationDrawer onClose={() => setShowDrawer(false)} />}
    </>
  );
};
