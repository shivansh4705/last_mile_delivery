import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { MapPin, Plus, Trash2, Shield, Layers } from 'lucide-react';

export const AdminZoneEditor: React.FC = () => {
  const { showToast } = useNotification();
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // New Zone Form State
  const [newZoneName, setNewZoneName] = useState<string>('');
  const [newZoneCode, setNewZoneCode] = useState<string>('');
  const [newZoneDesc, setNewZoneDesc] = useState<string>('');

  // New Area Form State (per zone)
  const [selectedZoneId, setSelectedZoneId] = useState<string>('');
  const [areaName, setAreaName] = useState<string>('');
  const [pincode, setPincode] = useState<string>('');
  const [city, setCity] = useState<string>('');

  const fetchZones = async () => {
    setLoading(true);
    try {
      const data = await api.getZones();
      setZones(data.zones);
      if (data.zones.length > 0 && !selectedZoneId) {
        setSelectedZoneId(data.zones[0].id);
      }
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to fetch zones', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  const handleCreateZone = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createZone({
        name: newZoneName,
        code: newZoneCode,
        description: newZoneDesc,
      });
      showToast('Zone Created', `Zone ${newZoneName} (${newZoneCode}) added.`, 'success');
      setNewZoneName('');
      setNewZoneCode('');
      setNewZoneDesc('');
      fetchZones();
    } catch (err: any) {
      showToast('Error', err.message || 'Could not create zone', 'error');
    }
  };

  const handleAddArea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedZoneId) return;
    try {
      await api.addAreaToZone(selectedZoneId, {
        name: areaName,
        pincode,
        city,
      });
      showToast('Area Mapped', `Pincode ${pincode} mapped to zone.`, 'success');
      setAreaName('');
      setPincode('');
      setCity('');
      fetchZones();
    } catch (err: any) {
      showToast('Mapping Error', err.message || 'Failed to add pincode mapping', 'error');
    }
  };

  const handleRemoveArea = async (areaId: string) => {
    try {
      await api.removeArea(areaId);
      showToast('Area Removed', 'Pincode mapping deleted.', 'info');
      fetchZones();
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to remove area', 'error');
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
      
      {/* Left Column: Create Zone & Add Pincode */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Create Zone */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={16} color="var(--accent-blue)" /> Add New Delivery Zone
          </h4>
          <form onSubmit={handleCreateZone} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div className="input-group">
              <label className="input-label">Zone Name</label>
              <input type="text" className="form-control" placeholder="e.g. Central Metro Hub" value={newZoneName} onChange={(e) => setNewZoneName(e.target.value)} required />
            </div>
            <div className="input-group">
              <label className="input-label">Zone Code (Unique Identifier)</label>
              <input type="text" className="form-control mono-text" placeholder="e.g. ZONE-CENTRAL" value={newZoneCode} onChange={(e) => setNewZoneCode(e.target.value)} required />
            </div>
            <div className="input-group">
              <label className="input-label">Description</label>
              <input type="text" className="form-control" placeholder="Coverage region details" value={newZoneDesc} onChange={(e) => setNewZoneDesc(e.target.value)} />
            </div>
            <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>Create Zone</button>
          </form>
        </div>

        {/* Map Area Pincode to Zone */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={16} color="var(--accent-cyan)" /> Map Pincode / Area to Zone
          </h4>
          <form onSubmit={handleAddArea} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div className="input-group">
              <label className="input-label">Target Zone</label>
              <select className="form-control" value={selectedZoneId} onChange={(e) => setSelectedZoneId(e.target.value)} required>
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>{z.name} ({z.code})</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div className="input-group">
                <label className="input-label">Area Name</label>
                <input type="text" className="form-control" placeholder="e.g. Bandra West" value={areaName} onChange={(e) => setAreaName(e.target.value)} required />
              </div>
              <div className="input-group">
                <label className="input-label">City</label>
                <input type="text" className="form-control" placeholder="e.g. Mumbai" value={city} onChange={(e) => setCity(e.target.value)} required />
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">Pincode (Used for Auto-Zone Detection)</label>
              <input type="text" className="form-control mono-text" placeholder="e.g. 400050" value={pincode} onChange={(e) => setPincode(e.target.value)} required />
            </div>
            <button type="submit" className="btn-secondary" style={{ marginTop: '0.5rem', color: 'var(--accent-cyan)', borderColor: 'rgba(6, 182, 212, 0.3)' }}>
              Map Pincode to Zone
            </button>
          </form>
        </div>

      </div>

      {/* Right Column: Existing Zones & Mapped Pincodes List */}
      <div className="glass-card" style={{ padding: '1.25rem', maxHeight: '85vh', overflowY: 'auto' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Active Zones & Pincode Registry</h4>

        {loading ? (
          <div style={{ color: 'var(--text-muted)' }}>Loading zone registry...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {zones.map((z) => (
              <div key={z.id} style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{z.name}</span>
                    <span className="mono-text" style={{ marginLeft: 8, fontSize: '0.75rem', color: 'var(--accent-blue)', background: 'rgba(37,99,235,0.15)', padding: '2px 8px', borderRadius: 4 }}>
                      {z.code}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    {z._count?.agents || 0} Agents | {z.areas?.length || 0} Pincodes
                  </span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
                  {z.areas?.map((area: any) => (
                    <span
                      key={area.id}
                      style={{
                        fontSize: '0.75rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-color)',
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-sm)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                      }}
                    >
                      <span>{area.name} (<strong>{area.pincode}</strong>)</span>
                      <button
                        onClick={() => handleRemoveArea(area.id)}
                        style={{ border: 'none', background: 'transparent', color: 'var(--accent-rose)', cursor: 'pointer', display: 'flex' }}
                        title="Remove pincode mapping"
                      >
                        <Trash2 size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
