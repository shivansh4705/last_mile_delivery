import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Navbar } from './components/Navbar';
import { RateCalculatorModal } from './components/RateCalculatorModal';
import { CreateOrderModal } from './components/CreateOrderModal';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { AgentDashboard } from './pages/AgentDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { LiveTrackPage } from './pages/LiveTrackPage';
import { LoginPage } from './pages/LoginPage';

const MainContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const [showCalculator, setShowCalculator] = useState<boolean>(false);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [initialCalc, setInitialCalc] = useState<any>(null);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text-muted)' }}>
        Initializing Logistics Engine...
      </div>
    );
  }

  const renderRolePage = () => {
    if (activeTab === 'livetrack') {
      return <LiveTrackPage />;
    }

    if (!user) {
      return <LoginPage />;
    }

    switch (user.role) {
      case 'ADMIN':
        return <AdminDashboard />;
      case 'AGENT':
        return <AgentDashboard />;
      case 'CUSTOMER':
      default:
        return <CustomerDashboard />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        onOpenCalculator={() => setShowCalculator(true)}
        onOpenLiveTrack={() => setActiveTab('livetrack')}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main style={{ flex: 1 }}>
        {renderRolePage()}
      </main>

      {/* Global Footer */}
      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '1.5rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '3rem' }}>
        <div>LogixPulse Last-Mile Logistics Engine • Rate Calculation Engine & Intelligent Agent Auto-Assignment Platform</div>
        <div style={{ marginTop: 4, fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
          Volumetric Billing Formula: (Length × Width × Height) / 5000 (kg) | Role-Based Control Access (Admin / Agent / Customer)
        </div>
      </footer>

      {/* Calculator Modal */}
      {showCalculator && (
        <RateCalculatorModal
          onClose={() => setShowCalculator(false)}
          onProceedOrder={(calcData) => {
            setInitialCalc(calcData);
            setShowCreateModal(true);
          }}
        />
      )}

      {/* Order Booking Modal triggered from calculator */}
      {showCreateModal && (
        <CreateOrderModal
          initialCalc={initialCalc}
          onClose={() => {
            setShowCreateModal(false);
            setInitialCalc(null);
          }}
          onSuccess={() => {
            setActiveTab('dashboard');
          }}
        />
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <MainContent />
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;
