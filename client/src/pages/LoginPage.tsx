import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { api } from '../services/api';
import { Truck, ShieldCheck, UserCheck, Lock, Mail, ArrowRight, UserPlus } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, quickSwitchRole } = useAuth();
  const { showToast } = useNotification();

  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('admin@delivery.com');
  const [password, setPassword] = useState<string>('password123');
  const [name, setName] = useState<string>('');
  const [role, setRole] = useState<'CUSTOMER' | 'AGENT' | 'ADMIN'>('CUSTOMER');
  const [phone, setPhone] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        await api.register({ name, email, password, role, phone });
        showToast('Registration Successful', 'Account created! Logging in...', 'success');
        await login(email, password);
      } else {
        await login(email, password);
        showToast('Welcome Back!', 'Logged into Logistics Portal', 'success');
      }
    } catch (err: any) {
      showToast('Authentication Error', err.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (targetRole: 'ADMIN' | 'CUSTOMER' | 'AGENT') => {
    setLoading(true);
    try {
      await quickSwitchRole(targetRole);
      showToast('Quick Login Active', `Signed in as Demo ${targetRole}`, 'info');
    } catch (err: any) {
      showToast('Error', err.message || 'Quick login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: '3rem auto', padding: '0 1.5rem' }}>
      <div className="glass-card" style={{ padding: '2rem' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ background: 'linear-gradient(135deg, #2563eb, #8b5cf6)', width: 50, height: 50, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem auto', boxShadow: '0 0 20px rgba(37,99,235,0.4)' }}>
            <Truck size={26} color="#fff" />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>
            {isRegister ? 'Create Logistics Account' : 'Sign in to LogixPulse'}
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Last-Mile Delivery Management & Rate Calculation Engine
          </p>
        </div>

        {/* Quick Demo Login Preset Buttons */}
        <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '0.875rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.5rem', textAlign: 'center' }}>
            Instant Evaluation Demo Accounts:
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button type="button" onClick={() => handleQuickDemo('ADMIN')} className="btn-secondary" style={{ fontSize: '0.725rem', padding: '0.3rem 0.6rem' }}>
              <ShieldCheck size={12} color="#c084fc" /> Admin
            </button>
            <button type="button" onClick={() => handleQuickDemo('CUSTOMER')} className="btn-secondary" style={{ fontSize: '0.725rem', padding: '0.3rem 0.6rem' }}>
              <UserCheck size={12} color="#60a5fa" /> Customer
            </button>
            <button type="button" onClick={() => handleQuickDemo('AGENT')} className="btn-secondary" style={{ fontSize: '0.725rem', padding: '0.3rem 0.6rem' }}>
              <Truck size={12} color="#34d399" /> Agent
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {isRegister && (
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <input type="text" className="form-control" placeholder="e.g. Sarah Connor" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
          )}

          <div className="input-group">
            <label className="input-label">Email Address</label>
            <input type="email" className="form-control" placeholder="email@delivery.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <input type="password" className="form-control" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          {isRegister && (
            <>
              <div className="input-group">
                <label className="input-label">Role Account Type</label>
                <select className="form-control" value={role} onChange={(e: any) => setRole(e.target.value)}>
                  <option value="CUSTOMER">Customer (Book & Track)</option>
                  <option value="AGENT">Delivery Agent (Field Driver)</option>
                  <option value="ADMIN">Operations Administrator</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Phone Number</label>
                <input type="text" className="form-control" placeholder="+1-555-0199" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </>
          )}

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center' }}>
            {isRegister ? <UserPlus size={16} /> : <ArrowRight size={16} />}
            {loading ? 'Authenticating...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {isRegister ? 'Already have an account?' : "Don't have an account yet?"}{' '}
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
          >
            {isRegister ? 'Sign In' : 'Register Here'}
          </button>
        </div>

      </div>
    </div>
  );
};
