import React, { useState } from 'react';
import { api } from '../services/api';
import { Search, PackageSearch, ArrowRight, ShieldAlert, Truck } from 'lucide-react';
import { TrackingTimeline } from '../components/TrackingTimeline';
import { RescheduleModal } from '../components/RescheduleModal';

export const LiveTrackPage: React.FC = () => {
  const [trackingNumber, setTrackingNumber] = useState<string>('TRK-9001-B2C');
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [rescheduleOrder, setRescheduleOrder] = useState<any | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getOrderDetails(trackingNumber.trim());
      setOrder(data.order);
    } catch (err: any) {
      setError(err.message || 'Tracking number not found');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '2rem auto', padding: '0 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Search Header Banner */}
      <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ background: 'linear-gradient(135deg, #2563eb, #06b6d4)', width: 50, height: 50, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', boxShadow: '0 0 20px rgba(37,99,235,0.4)' }}>
          <PackageSearch size={26} color="#fff" />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>Live Shipment Tracking Lookup</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Enter your unique tracking code (e.g. TRK-9001-B2C, TRK-9002-B2B, TRK-9003-FAILED) for instant audit history
        </p>

        <form onSubmit={handleSearch} style={{ maxWidth: 550, margin: '0 auto', display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            className="form-control mono-text"
            placeholder="e.g. TRK-9001-B2C"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            style={{ fontSize: '1rem', padding: '0.75rem 1rem' }}
          />
          <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '0.75rem 1.5rem' }}>
            <Search size={18} /> {loading ? 'Searching...' : 'Track'}
          </button>
        </form>
      </div>

      {error && (
        <div className="glass-card" style={{ padding: '1rem', background: 'rgba(244, 63, 94, 0.15)', borderColor: 'rgba(244, 63, 94, 0.3)', color: 'var(--accent-rose)', textAlign: 'center' }}>
          {error}
        </div>
      )}

      {/* Tracking Result */}
      {order && (
        <TrackingTimeline
          order={order}
          onOpenReschedule={() => setRescheduleOrder(order)}
        />
      )}

      {rescheduleOrder && (
        <RescheduleModal
          orderId={rescheduleOrder.id}
          trackingNumber={rescheduleOrder.trackingNumber}
          onClose={() => setRescheduleOrder(null)}
          onSuccess={() => handleSearch({ preventDefault: () => {} } as any)}
        />
      )}

    </div>
  );
};
