import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { DollarSign, Save, ShieldAlert, Check } from 'lucide-react';

export const AdminRateCardEditor: React.FC = () => {
  const { showToast } = useNotification();
  const [rateCards, setRateCards] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const fetchRateCards = async () => {
    setLoading(true);
    try {
      const data = await api.getRateCards();
      setRateCards(data.rateCards);
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to fetch rate cards', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRateCards();
  }, []);

  const handleChange = (id: string, field: string, value: number) => {
    setRateCards((prev) =>
      prev.map((rc) => (rc.id === id ? { ...rc, [field]: value } : rc))
    );
  };

  const handleSave = async (rateCard: any) => {
    setSavingId(rateCard.id);
    try {
      await api.updateRateCard(rateCard.id, {
        baseWeight: rateCard.baseWeight,
        baseRate: rateCard.baseRate,
        perKgRate: rateCard.perKgRate,
        minCharge: rateCard.minCharge,
        codSurcharge: rateCard.codSurcharge,
      });
      showToast('Rate Card Saved', `Updated rules for ${rateCard.orderType} ${rateCard.zoneType}`, 'success');
    } catch (err: any) {
      showToast('Save Failed', err.message || 'Error updating rate card', 'error');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="glass-card" style={{ padding: '1.25rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>
          Dynamic Logistics Rate Card Configurator
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Configure pricing rules separately for B2B and B2C orders (Intra-Zone vs Inter-Zone) and COD surcharges. Zero hardcoding!
        </p>
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-muted)' }}>Loading rate cards...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          {rateCards.map((rc) => (
            <div key={rc.id} className="glass-card" style={{ padding: '1.25rem', borderColor: rc.orderType === 'B2B' ? 'rgba(139, 92, 246, 0.3)' : 'rgba(37, 99, 235, 0.3)' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                <div>
                  <span className={`badge ${rc.zoneType === 'INTRA' ? 'badge-assigned' : 'badge-out_for_delivery'}`}>
                    {rc.orderType} • {rc.zoneType} ZONE
                  </span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 4 }}>
                    {rc.zoneType === 'INTRA' ? 'Same zone origin & destination' : 'Cross-zone long haul transit'}
                  </div>
                </div>
                <button
                  onClick={() => handleSave(rc)}
                  className="btn-primary"
                  disabled={savingId === rc.id}
                  style={{ fontSize: '0.75rem', padding: '0.4rem 0.85rem' }}
                >
                  <Save size={14} /> {savingId === rc.id ? 'Saving...' : 'Save Rules'}
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                
                <div className="input-group">
                  <label className="input-label">Base Weight Allowance (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control mono-text"
                    value={rc.baseWeight}
                    onChange={(e) => handleChange(rc.id, 'baseWeight', parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Base Rate ($)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control mono-text"
                    value={rc.baseRate}
                    onChange={(e) => handleChange(rc.id, 'baseRate', parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Per-Kg Rate above Base ($)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control mono-text"
                    value={rc.perKgRate}
                    onChange={(e) => handleChange(rc.id, 'perKgRate', parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Minimum Guaranteed Charge ($)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control mono-text"
                    value={rc.minCharge}
                    onChange={(e) => handleChange(rc.id, 'minCharge', parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="input-group" style={{ gridColumn: 'span 2' }}>
                  <label className="input-label" style={{ color: 'var(--accent-amber)' }}>COD Cash Surcharge ($)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control mono-text"
                    value={rc.codSurcharge}
                    onChange={(e) => handleChange(rc.id, 'codSurcharge', parseFloat(e.target.value) || 0)}
                  />
                </div>

              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};
