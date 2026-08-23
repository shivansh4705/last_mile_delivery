import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { PackagePlus, X, Calculator, ShieldCheck, ArrowRight } from 'lucide-react';

interface CreateOrderModalProps {
  onClose: () => void;
  onSuccess: () => void;
  initialCalc?: any;
}

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({ onClose, onSuccess, initialCalc }) => {
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [customerId, setCustomerId] = useState<string>('');
  const [orderType, setOrderType] = useState<'B2C' | 'B2B'>('B2C');
  const [paymentType, setPaymentType] = useState<'PREPAID' | 'COD'>('PREPAID');
  
  const [pickupAddress, setPickupAddress] = useState<string>('Block B, Connaught Place, New Delhi');
  const [pickupPincode, setPickupPincode] = useState<string>('110001');
  const [dropAddress, setDropAddress] = useState<string>('Okhla Industrial Estate Phase 3, Delhi');
  const [dropPincode, setDropPincode] = useState<string>('110020');

  const [length, setLength] = useState<number>(30);
  const [width, setWidth] = useState<number>(20);
  const [height, setHeight] = useState<number>(15);
  const [actualWeight, setActualWeight] = useState<number>(2.0);

  const [deliveryDate, setDeliveryDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [scheduledSlot, setScheduledSlot] = useState<string>('10:00 AM - 02:00 PM');

  const [calcPreview, setCalcPreview] = useState<any>(initialCalc || null);
  const [loadingCalc, setLoadingCalc] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [customers, setCustomers] = useState<any[]>([]);

  // If Admin, fetch customer dropdown
  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchCustomers();
    }
  }, [user]);

  const fetchCustomers = async () => {
    try {
      const data = await api.getOrders();
      // Extract unique customers
      const custMap: any = {};
      data.orders.forEach((o: any) => {
        if (o.customer) custMap[o.customer.id] = o.customer;
      });
      setCustomers(Object.values(custMap));
    } catch (err) {
      console.warn('Error fetching customers:', err);
    }
  };

  // Recalculate price whenever parameters change
  const runRatePreview = async () => {
    if (!pickupPincode || !dropPincode || length <= 0 || width <= 0 || height <= 0 || actualWeight <= 0) return;
    setLoadingCalc(true);
    try {
      const res = await api.calculateRatePreview({
        length,
        width,
        height,
        actualWeight,
        pickupPincode,
        dropPincode,
        orderType,
        paymentType,
      });
      setCalcPreview(res.calculation);
    } catch (err) {
      console.warn('Calculation preview error:', err);
    } finally {
      setLoadingCalc(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      runRatePreview();
    }, 400);
    return () => clearTimeout(timer);
  }, [length, width, height, actualWeight, pickupPincode, dropPincode, orderType, paymentType]);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        customerId: user?.role === 'ADMIN' ? customerId : undefined,
        orderType,
        paymentType,
        pickupAddress,
        pickupPincode,
        dropAddress,
        dropPincode,
        length,
        width,
        height,
        actualWeight,
        deliveryDate,
        scheduledSlot,
        autoAssign: true,
      };

      const res = await api.createOrder(payload);
      showToast('Order Placed Successfully!', `Tracking Number #${res.order.trackingNumber}. Agent auto-assignment initiated.`, 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast('Order Creation Failed', err.message || 'Error creating order', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass-card"
        style={{ maxWidth: 760, width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '1.75rem' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #2563eb, #8b5cf6)', padding: '0.4rem', borderRadius: '8px', display: 'flex' }}>
              <PackagePlus size={20} color="#fff" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                {user?.role === 'ADMIN' ? 'Create Order (Admin Portal)' : 'Book New Shipment'}
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Auto-calculates volumetric rate and triggers intelligent agent assignment</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '0.4rem' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmitOrder} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          
          {/* Admin selecting customer */}
          {user?.role === 'ADMIN' && (
            <div className="input-group" style={{ gridColumn: 'span 2' }}>
              <label className="input-label">Select Customer Account (On Behalf Of)</label>
              <select className="form-control" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                <option value="">-- Use Default / First Customer Account --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Segment & Payment */}
          <div className="input-group">
            <label className="input-label">Order Type (Segment)</label>
            <select className="form-control" value={orderType} onChange={(e: any) => setOrderType(e.target.value)}>
              <option value="B2C">B2C (Retail Delivery)</option>
              <option value="B2B">B2B (Enterprise Bulk Freight)</option>
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Payment Method</label>
            <select className="form-control" value={paymentType} onChange={(e: any) => setPaymentType(e.target.value)}>
              <option value="PREPAID">Prepaid (Digital Payment)</option>
              <option value="COD">COD (Cash on Delivery + Surcharge)</option>
            </select>
          </div>

          {/* Pickup Info */}
          <div className="input-group" style={{ gridColumn: 'span 2' }}>
            <label className="input-label">Pickup Address & Area Pincode</label>
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '0.5rem' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Full Pickup Address"
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                required
              />
              <input
                type="text"
                className="form-control mono-text"
                placeholder="Pincode (e.g. 110001)"
                value={pickupPincode}
                onChange={(e) => setPickupPincode(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Drop Info */}
          <div className="input-group" style={{ gridColumn: 'span 2' }}>
            <label className="input-label">Destination Address & Drop Pincode</label>
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '0.5rem' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Full Destination Drop Address"
                value={dropAddress}
                onChange={(e) => setDropAddress(e.target.value)}
                required
              />
              <input
                type="text"
                className="form-control mono-text"
                placeholder="Pincode (e.g. 110020)"
                value={dropPincode}
                onChange={(e) => setDropPincode(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Package Weight & Dimensions */}
          <div className="input-group" style={{ gridColumn: 'span 2' }}>
            <label className="input-label">Package Dimensions & Actual Weight</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1.2fr', gap: '0.5rem' }}>
              <input type="number" step="0.1" className="form-control" placeholder="Length (cm)" value={length} onChange={(e) => setLength(parseFloat(e.target.value) || 0)} required />
              <input type="number" step="0.1" className="form-control" placeholder="Width (cm)" value={width} onChange={(e) => setWidth(parseFloat(e.target.value) || 0)} required />
              <input type="number" step="0.1" className="form-control" placeholder="Height (cm)" value={height} onChange={(e) => setHeight(parseFloat(e.target.value) || 0)} required />
              <input type="number" step="0.1" className="form-control" placeholder="Actual Wt (kg)" value={actualWeight} onChange={(e) => setActualWeight(parseFloat(e.target.value) || 0)} required />
            </div>
          </div>

          {/* Preferred Delivery Slot */}
          <div className="input-group">
            <label className="input-label">Target Delivery Date</label>
            <input type="date" className="form-control" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} required />
          </div>

          <div className="input-group">
            <label className="input-label">Time Window Slot</label>
            <select className="form-control" value={scheduledSlot} onChange={(e) => setScheduledSlot(e.target.value)}>
              <option value="09:00 AM - 01:00 PM">09:00 AM - 01:00 PM (Morning Slot)</option>
              <option value="01:00 PM - 05:00 PM">01:00 PM - 05:00 PM (Afternoon Slot)</option>
              <option value="05:00 PM - 09:00 PM">05:00 PM - 09:00 PM (Evening Slot)</option>
            </select>
          </div>

          {/* Live Dynamic Price Breakdown Box */}
          {calcPreview && (
            <div className="glass-card" style={{ gridColumn: 'span 2', padding: '1rem', background: 'rgba(0, 0, 0, 0.4)', borderColor: 'var(--accent-blue-glow)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Zone Route: <span style={{ color: '#fff', fontWeight: 600 }}>{calcPreview.pickupZone?.name || 'Detected'} $\rightarrow$ {calcPreview.dropZone?.name || 'Detected'} ({calcPreview.zoneType} ZONE)</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Volumetric Wt: <strong style={{ color: 'var(--accent-cyan)' }}>{calcPreview.volumetricWeight} kg</strong> | Chargeable Wt: <strong style={{ color: 'var(--accent-amber)' }}>{calcPreview.chargeableWeight} kg</strong>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Auto-Calculated Total</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>
                    ${calcPreview.totalCharge.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Dispatching Order...' : 'Confirm Order & Auto-Assign Agent'} <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
