import React, { useState } from 'react';
import { api } from '../services/api';
import { Calculator, X, ArrowRight, ShieldAlert, CheckCircle2, Box } from 'lucide-react';

interface RateCalculatorModalProps {
  onClose: () => void;
  onProceedOrder?: (calcData: any) => void;
}

export const RateCalculatorModal: React.FC<RateCalculatorModalProps> = ({ onClose, onProceedOrder }) => {
  const [length, setLength] = useState<number>(30);
  const [width, setWidth] = useState<number>(20);
  const [height, setHeight] = useState<number>(15);
  const [actualWeight, setActualWeight] = useState<number>(1.5);
  const [pickupPincode, setPickupPincode] = useState<string>('110001');
  const [dropPincode, setDropPincode] = useState<string>('110020');
  const [orderType, setOrderType] = useState<'B2C' | 'B2B'>('B2C');
  const [paymentType, setPaymentType] = useState<'PREPAID' | 'COD'>('PREPAID');

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await api.calculateRatePreview({
        length,
        width,
        height,
        actualWeight,
        pickupPincode,
        dropPincode,
        orderType,
        paymentType,
      });
      setResult(data.calculation);
    } catch (err: any) {
      setError(err.message || 'Failed to calculate rate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass-card"
        style={{ maxWidth: 700, width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '1.75rem' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ background: 'var(--accent-blue)', padding: '0.4rem', borderRadius: '8px', display: 'flex' }}>
              <Calculator size={18} color="#fff" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Rate & Volumetric Pricing Engine</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Auto-detects pickup & drop zones and calculates volumetric billing weight</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '0.4rem' }}>
            <X size={18} />
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleCalculate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          
          {/* Order & Payment Type */}
          <div className="input-group">
            <label className="input-label">Order Segment</label>
            <select className="form-control" value={orderType} onChange={(e: any) => setOrderType(e.target.value)}>
              <option value="B2C">B2C (Retail Delivery)</option>
              <option value="B2B">B2B (Enterprise Bulk Freight)</option>
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Payment Mode</label>
            <select className="form-control" value={paymentType} onChange={(e: any) => setPaymentType(e.target.value)}>
              <option value="PREPAID">Prepaid (Zero Surcharge)</option>
              <option value="COD">Cash on Delivery (COD Surcharge)</option>
            </select>
          </div>

          {/* Package Dimensions */}
          <div className="input-group" style={{ gridColumn: 'span 2' }}>
            <label className="input-label">Package Dimensions (L × W × H in cm)</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1.2fr', gap: '0.5rem' }}>
              <input
                type="number"
                step="0.1"
                className="form-control"
                placeholder="Length"
                value={length}
                onChange={(e) => setLength(parseFloat(e.target.value) || 0)}
              />
              <input
                type="number"
                step="0.1"
                className="form-control"
                placeholder="Width"
                value={width}
                onChange={(e) => setWidth(parseFloat(e.target.value) || 0)}
              />
              <input
                type="number"
                step="0.1"
                className="form-control"
                placeholder="Height"
                value={height}
                onChange={(e) => setHeight(parseFloat(e.target.value) || 0)}
              />
              <input
                type="number"
                step="0.1"
                className="form-control"
                placeholder="Actual Wt (kg)"
                value={actualWeight}
                onChange={(e) => setActualWeight(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Pickup & Drop Pincodes */}
          <div className="input-group">
            <label className="input-label">Pickup Pincode / Area</label>
            <input
              type="text"
              className="form-control mono-text"
              placeholder="e.g. 110001 (Delhi)"
              value={pickupPincode}
              onChange={(e) => setPickupPincode(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Drop Pincode / Area</label>
            <input
              type="text"
              className="form-control mono-text"
              placeholder="e.g. 110020 or 560001"
              value={dropPincode}
              onChange={(e) => setDropPincode(e.target.value)}
            />
          </div>

          <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
              <Calculator size={16} /> {loading ? 'Computing Rate Engine...' : 'Calculate Delivery Charge'}
            </button>
          </div>
        </form>

        {error && (
          <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: 'var(--radius-md)', color: 'var(--accent-rose)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={16} /> {error}
          </div>
        )}

        {/* Calculation Output Card */}
        {result && (
          <div className="glass-card" style={{ marginTop: '1.25rem', padding: '1.25rem', background: 'rgba(0, 0, 0, 0.4)', borderColor: 'var(--accent-blue-glow)' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px dashed var(--border-color)', paddingBottom: '0.75rem' }}>
              <div>
                <span className={`badge ${result.zoneType === 'INTRA' ? 'badge-assigned' : 'badge-out_for_delivery'}`}>
                  {result.zoneType} ZONE SHIPMENT
                </span>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Pickup: <strong>{result.pickupZone?.name || 'Detected Zone'}</strong> $\rightarrow$ Drop: <strong>{result.dropZone?.name || 'Detected Zone'}</strong>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Estimated Charge</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>
                  ${result.totalCharge.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Volumetric Weight Formula Breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1rem', background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Actual Weight</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{result.actualWeight} kg</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Volumetric Wt (L×B×H / 5000)</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>{result.volumetricWeight} kg</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Billable Weight (Higher)</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)' }}>{result.chargeableWeight} kg</div>
              </div>
            </div>

            {/* Price Table Breakdown */}
            <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Base Freight Charge (Up to {result.appliedRateCard.baseWeight}kg):</span>
                <span className="mono-text">${result.baseCharge.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Additional Weight Charge (${result.appliedRateCard.perKgRate}/kg):</span>
                <span className="mono-text">${result.weightCharge.toFixed(2)}</span>
              </div>
              {result.codSurcharge > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-rose)' }}>
                  <span>COD Cash Handling Surcharge:</span>
                  <span className="mono-text">+${result.codSurcharge.toFixed(2)}</span>
                </div>
              )}
            </div>

            {onProceedOrder && (
              <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    onProceedOrder(result);
                    onClose();
                  }}
                  className="btn-primary"
                >
                  Confirm & Create Order <ArrowRight size={16} />
                </button>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
