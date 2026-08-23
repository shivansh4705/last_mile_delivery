import React from 'react';
import { Truck, CheckCircle2, Clock, AlertTriangle, Calendar, User, MapPin, ShieldAlert, ArrowRight } from 'lucide-react';

interface TrackingTimelineProps {
  order: any;
  onOpenReschedule?: () => void;
}

const STEPS = [
  { key: 'CREATED', label: 'Order Created' },
  { key: 'ASSIGNED', label: 'Agent Assigned' },
  { key: 'PICKED_UP', label: 'Picked Up' },
  { key: 'IN_TRANSIT', label: 'In Transit' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { key: 'DELIVERED', label: 'Delivered' },
];

export const TrackingTimeline: React.FC<TrackingTimelineProps> = ({ order, onOpenReschedule }) => {
  if (!order) return null;

  const currentStatus = order.status;
  const isFailed = currentStatus === 'FAILED';
  const isRescheduled = currentStatus === 'RESCHEDULED';

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'CREATED': case 'PENDING_ASSIGNMENT': return 0;
      case 'ASSIGNED': return 1;
      case 'PICKED_UP': return 2;
      case 'IN_TRANSIT': return 3;
      case 'OUT_FOR_DELIVERY': return 4;
      case 'DELIVERED': return 5;
      case 'FAILED': return 4;
      case 'RESCHEDULED': return 1;
      default: return 0;
    }
  };

  const activeIndex = getStepIndex(currentStatus);

  return (
    <div className="glass-card" style={{ padding: '1.5rem' }}>
      
      {/* Header Info */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }} className="mono-text">
              #{order.trackingNumber}
            </h3>
            <span className={`badge badge-${currentStatus.toLowerCase()}`}>
              {currentStatus.replace('_', ' ')}
            </span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Shipment Type: <strong style={{ color: '#fff' }}>{order.orderType} ({order.paymentType})</strong> | Total: <strong style={{ color: 'var(--accent-emerald)' }}>${order.totalCharge?.toFixed(2)}</strong>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Target Delivery Window</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Calendar size={14} /> {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : 'Scheduled'} ({order.scheduledSlot || 'Slot TBD'})
          </div>
        </div>
      </div>

      {/* Failed Delivery Reschedule Alert */}
      {isFailed && (
        <div
          style={{
            marginBottom: '1.5rem',
            padding: '1.25rem',
            background: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <AlertTriangle size={24} color="var(--accent-rose)" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontWeight: 700, color: '#f87171', fontSize: '0.95rem' }}>Delivery Attempt Failed</div>
              <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                Reason: {order.failureReason || 'Customer unavailable / Address locked'}. Please reschedule for a convenient date.
              </div>
            </div>
          </div>
          {onOpenReschedule && (
            <button onClick={onOpenReschedule} className="btn-primary" style={{ background: 'linear-gradient(135deg, #e11d48, #be123c)' }}>
              Reschedule Delivery <ArrowRight size={16} />
            </button>
          )}
        </div>
      )}

      {/* Step Progress Tracker */}
      <div style={{ marginBottom: '2rem', padding: '0 0.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
          
          {/* Connecting Line */}
          <div
            style={{
              position: 'absolute',
              top: '16px',
              left: '5%',
              right: '5%',
              height: '3px',
              background: 'rgba(255, 255, 255, 0.1)',
              zIndex: 0,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '16px',
              left: '5%',
              width: `${(activeIndex / (STEPS.length - 1)) * 90}%`,
              height: '3px',
              background: isFailed ? 'var(--accent-rose)' : 'linear-gradient(to right, #2563eb, #10b981)',
              zIndex: 0,
              transition: 'width 0.5s ease',
            }}
          />

          {STEPS.map((step, idx) => {
            const isCompleted = idx <= activeIndex && !isFailed;
            const isCurrent = idx === activeIndex;

            return (
              <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, position: 'relative' }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    background: isFailed && isCurrent ? 'var(--accent-rose)' : isCompleted ? 'var(--accent-blue)' : 'var(--bg-card-solid)',
                    border: `2px solid ${isFailed && isCurrent ? 'var(--accent-rose)' : isCompleted ? '#3b82f6' : 'rgba(255,255,255,0.2)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    boxShadow: isCurrent ? '0 0 15px rgba(59, 130, 246, 0.5)' : 'none',
                  }}
                >
                  {isCompleted ? <CheckCircle2 size={18} /> : isFailed && isCurrent ? <AlertTriangle size={18} /> : idx + 1}
                </div>
                <span style={{ fontSize: '0.725rem', marginTop: 8, fontWeight: isCurrent ? 700 : 500, color: isCurrent ? '#fff' : 'var(--text-dim)' }}>
                  {step.label}
                </span>
              </div>
            );
          })}

        </div>
      </div>

      {/* Pickup & Drop Address Info Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <MapPin size={13} color="var(--accent-cyan)" /> Pickup Origin
          </div>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, marginTop: 4 }}>{order.pickupAddress}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pincode: {order.pickupPincode} ({order.pickupZone?.name || 'Assigned Zone'})</div>
        </div>

        <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <MapPin size={13} color="var(--accent-emerald)" /> Destination Drop
          </div>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, marginTop: 4 }}>{order.dropAddress}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pincode: {order.dropPincode} ({order.dropZone?.name || 'Assigned Zone'})</div>
        </div>
      </div>

      {/* Agent Card */}
      {order.agent && (
        <div style={{ background: 'rgba(37, 99, 235, 0.08)', border: '1px solid var(--border-highlight)', padding: '0.875rem 1.25rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'var(--accent-blue)', padding: '0.5rem', borderRadius: '50%', display: 'flex' }}>
              <Truck size={18} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Assigned Delivery Agent</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>{order.agent.name}</div>
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>
            📞 {order.agent.phone || 'Contact via Driver App'}
          </div>
        </div>
      )}

      {/* Immutable Audit Tracking History Timeline */}
      <div>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={16} color="var(--accent-blue)" /> Immutable Tracking History Audit Trail
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative' }}>
          {order.trackingHistory?.map((history: any) => (
            <div
              key={history.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '140px 1fr',
                gap: '1rem',
                padding: '0.75rem 1rem',
                background: 'rgba(0, 0, 0, 0.25)',
                borderRadius: 'var(--radius-md)',
                borderLeft: `3px solid ${
                  history.status === 'DELIVERED'
                    ? '#10b981'
                    : history.status === 'FAILED'
                    ? '#f43f5e'
                    : history.status === 'RESCHEDULED'
                    ? '#ec4899'
                    : '#3b82f6'
                }`,
              }}
            >
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                  {new Date(history.createdAt).toLocaleString()}
                </div>
                <span className={`badge badge-${history.status.toLowerCase()}`} style={{ fontSize: '0.65rem', marginTop: 4 }}>
                  {history.status}
                </span>
              </div>

              <div>
                <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  {history.notes || 'Status logged'}
                </div>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: 2, display: 'flex', gap: '1rem' }}>
                  <span>Actor: <strong>{history.actorName} ({history.actorRole})</strong></span>
                  {history.location && <span>Location: 📍 {history.location}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
