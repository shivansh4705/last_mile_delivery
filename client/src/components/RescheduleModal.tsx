import React, { useState } from 'react';
import { api } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { Calendar, X, Clock, ArrowRight } from 'lucide-react';

interface RescheduleModalProps {
  orderId: string;
  trackingNumber: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const RescheduleModal: React.FC<RescheduleModalProps> = ({
  orderId,
  trackingNumber,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useNotification();

  const [deliveryDate, setDeliveryDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [scheduledSlot, setScheduledSlot] = useState<string>('10:00 AM - 02:00 PM');
  const [notes, setNotes] = useState<string>('Customer confirmed availability for reschedule');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.rescheduleOrder(orderId, {
        deliveryDate,
        scheduledSlot,
        notes,
      });

      showToast('Delivery Rescheduled', `Order #${trackingNumber} rescheduled for ${deliveryDate}. Agent reassigned.`, 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast('Reschedule Failed', err.message || 'Error rescheduling order', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass-card"
        style={{ maxWidth: 500, width: '100%', padding: '1.5rem' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ background: 'var(--accent-rose)', padding: '0.4rem', borderRadius: '8px', display: 'flex' }}>
              <Calendar size={18} color="#fff" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Reschedule Delivery Attempt</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Order #{trackingNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '0.4rem' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="input-group">
            <label className="input-label">Select New Delivery Date</label>
            <input
              type="date"
              className="form-control"
              value={deliveryDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDeliveryDate(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Preferred Time Window Slot</label>
            <select className="form-control" value={scheduledSlot} onChange={(e) => setScheduledSlot(e.target.value)}>
              <option value="09:00 AM - 01:00 PM">09:00 AM - 01:00 PM (Morning Slot)</option>
              <option value="01:00 PM - 05:00 PM">01:00 PM - 05:00 PM (Afternoon Slot)</option>
              <option value="05:00 PM - 09:00 PM">05:00 PM - 09:00 PM (Evening Slot)</option>
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Special Delivery Instructions / Notes</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="e.g. Leave package with security if door locked"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting} style={{ background: 'linear-gradient(135deg, #e11d48, #be123c)' }}>
              {submitting ? 'Rescheduling...' : 'Confirm Reschedule'} <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
