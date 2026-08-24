const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('delivery_tracker_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Client-Side Standalone Data Store for GitHub Pages deployment
const INITIAL_ZONES = [
  {
    id: 'zone-1',
    name: 'North Metro Zone',
    code: 'ZONE-NORTH',
    description: 'Capital region & northern territories',
    areas: [
      { id: 'a1', name: 'Connaught Place', pincode: '110001', city: 'Delhi', zoneId: 'zone-1' },
      { id: 'a2', name: 'Daryaganj', pincode: '110002', city: 'Delhi', zoneId: 'zone-1' },
      { id: 'a3', name: 'Okhla Industrial Area', pincode: '110020', city: 'Delhi', zoneId: 'zone-1' },
      { id: 'a4', name: 'Gurugram Cyber City', pincode: '122002', city: 'Gurugram', zoneId: 'zone-1' },
    ],
    _count: { agents: 1, pickupOrders: 2, dropOrders: 2 },
  },
  {
    id: 'zone-2',
    name: 'South Tech Hub',
    code: 'ZONE-SOUTH',
    description: 'Tech corridors including Bengaluru',
    areas: [
      { id: 'a5', name: 'MG Road Central', pincode: '560001', city: 'Bengaluru', zoneId: 'zone-2' },
      { id: 'a6', name: 'Indiranagar Hub', pincode: '560038', city: 'Bengaluru', zoneId: 'zone-2' },
      { id: 'a7', name: 'Electronic City', pincode: '560100', city: 'Bengaluru', zoneId: 'zone-2' },
    ],
    _count: { agents: 1, pickupOrders: 1, dropOrders: 1 },
  },
  {
    id: 'zone-3',
    name: 'West Commercial Zone',
    code: 'ZONE-WEST',
    description: 'Financial hub, Mumbai Metropolitan region',
    areas: [
      { id: 'a8', name: 'Fort Business District', pincode: '400001', city: 'Mumbai', zoneId: 'zone-3' },
      { id: 'a9', name: 'Bandra West Suburb', pincode: '400050', city: 'Mumbai', zoneId: 'zone-3' },
      { id: 'a10', name: 'Powai Knowledge Park', pincode: '400076', city: 'Mumbai', zoneId: 'zone-3' },
    ],
    _count: { agents: 1, pickupOrders: 1, dropOrders: 1 },
  },
];

const INITIAL_RATE_CARDS = [
  { id: 'rc-1', orderType: 'B2C', zoneType: 'INTRA', baseWeight: 1.0, baseRate: 5.0, perKgRate: 1.5, minCharge: 5.0, codSurcharge: 2.0 },
  { id: 'rc-2', orderType: 'B2C', zoneType: 'INTER', baseWeight: 1.0, baseRate: 12.0, perKgRate: 3.0, minCharge: 12.0, codSurcharge: 3.5 },
  { id: 'rc-3', orderType: 'B2B', zoneType: 'INTRA', baseWeight: 5.0, baseRate: 18.0, perKgRate: 1.0, minCharge: 18.0, codSurcharge: 5.0 },
  { id: 'rc-4', orderType: 'B2B', zoneType: 'INTER', baseWeight: 5.0, baseRate: 40.0, perKgRate: 2.2, minCharge: 40.0, codSurcharge: 10.0 },
];

const INITIAL_USERS = [
  { id: 'u-admin', name: 'System Operations Admin', email: 'admin@delivery.com', role: 'ADMIN', phone: '+1-800-555-0199' },
  { id: 'u-c1', name: 'John Doe (B2C Customer)', email: 'john.b2c@customer.com', role: 'CUSTOMER', phone: '+1-555-0144' },
  { id: 'u-c2', name: 'Acme Enterprise (B2B)', email: 'acme.b2b@enterprise.com', role: 'CUSTOMER', phone: '+1-555-0188' },
  { id: 'u-ag1', name: 'Vikram Singh (Agent North)', email: 'agent.north@delivery.com', role: 'AGENT', phone: '+91-98765-43210', isAvailable: true, currentZoneId: 'zone-1', currentLat: 28.6139, currentLng: 77.2090 },
  { id: 'u-ag2', name: 'Priya Sharma (Agent South)', email: 'agent.south@delivery.com', role: 'AGENT', phone: '+91-98765-43211', isAvailable: true, currentZoneId: 'zone-2', currentLat: 12.9716, currentLng: 77.5946 },
  { id: 'u-ag3', name: 'Rahul Mehta (Agent West)', email: 'agent.west@delivery.com', role: 'AGENT', phone: '+91-98765-43212', isAvailable: true, currentZoneId: 'zone-3', currentLat: 19.0760, currentLng: 72.8777 },
];

const INITIAL_ORDERS = [
  {
    id: 'ord-1',
    trackingNumber: 'TRK-9001-B2C',
    customerId: 'u-c1',
    agentId: 'u-ag1',
    orderType: 'B2C',
    paymentType: 'COD',
    pickupAddress: 'Block B, Connaught Place, New Delhi',
    pickupPincode: '110001',
    pickupZoneId: 'zone-1',
    dropAddress: 'Sector 4, Okhla Industrial Area, New Delhi',
    dropPincode: '110020',
    dropZoneId: 'zone-1',
    length: 30, width: 20, height: 15,
    actualWeight: 1.2, volumetricWeight: 1.8, chargeableWeight: 1.8,
    baseCharge: 5.0, weightCharge: 1.2, codSurcharge: 2.0, totalCharge: 8.2,
    status: 'IN_TRANSIT',
    deliveryDate: new Date(Date.now() + 86400000).toISOString(),
    scheduledSlot: '10:00 AM - 02:00 PM',
    customer: INITIAL_USERS[1],
    agent: INITIAL_USERS[3],
    pickupZone: INITIAL_ZONES[0],
    dropZone: INITIAL_ZONES[0],
    trackingHistory: [
      { id: 'th-1', orderId: 'ord-1', status: 'CREATED', actorId: 'u-c1', actorRole: 'CUSTOMER', actorName: 'John Doe', notes: 'Order registered via customer portal', createdAt: new Date(Date.now() - 7200000).toISOString() },
      { id: 'th-2', orderId: 'ord-1', status: 'ASSIGNED', actorId: 'u-admin', actorRole: 'SYSTEM', actorName: 'Auto-Assignment Engine', notes: 'Assigned to driver Vikram Singh (Nearest available in Zone North)', createdAt: new Date(Date.now() - 5400000).toISOString() },
      { id: 'th-3', orderId: 'ord-1', status: 'PICKED_UP', actorId: 'u-ag1', actorRole: 'AGENT', actorName: 'Vikram Singh', location: 'Connaught Place Hub', notes: 'Parcel scanned & loaded into delivery van', createdAt: new Date(Date.now() - 3600000).toISOString() },
      { id: 'th-4', orderId: 'ord-1', status: 'IN_TRANSIT', actorId: 'u-ag1', actorRole: 'AGENT', actorName: 'Vikram Singh', location: 'Outer Ring Expressway', notes: 'En route to destination delivery stop', createdAt: new Date(Date.now() - 1800000).toISOString() },
    ],
  },
  {
    id: 'ord-2',
    trackingNumber: 'TRK-9002-B2B',
    customerId: 'u-c2',
    agentId: 'u-ag2',
    orderType: 'B2B',
    paymentType: 'PREPAID',
    pickupAddress: 'MG Road Commerce Tower, Bengaluru',
    pickupPincode: '560001',
    pickupZoneId: 'zone-2',
    dropAddress: 'Fort Business District, Mumbai',
    dropPincode: '400001',
    dropZoneId: 'zone-3',
    length: 50, width: 40, height: 30,
    actualWeight: 10.0, volumetricWeight: 12.0, chargeableWeight: 12.0,
    baseCharge: 40.0, weightCharge: 15.4, codSurcharge: 0.0, totalCharge: 55.4,
    status: 'OUT_FOR_DELIVERY',
    deliveryDate: new Date().toISOString(),
    scheduledSlot: '02:00 PM - 06:00 PM',
    customer: INITIAL_USERS[2],
    agent: INITIAL_USERS[4],
    pickupZone: INITIAL_ZONES[1],
    dropZone: INITIAL_ZONES[2],
    trackingHistory: [
      { id: 'th-5', orderId: 'ord-2', status: 'CREATED', actorId: 'u-c2', actorRole: 'CUSTOMER', actorName: 'Acme Enterprise', notes: 'Bulk B2B shipment created', createdAt: new Date(Date.now() - 10000000).toISOString() },
      { id: 'th-6', orderId: 'ord-2', status: 'ASSIGNED', actorId: 'u-ag2', actorRole: 'AGENT', actorName: 'Priya Sharma', notes: 'Driver assigned for express delivery', createdAt: new Date(Date.now() - 8000000).toISOString() },
      { id: 'th-7', orderId: 'ord-2', status: 'OUT_FOR_DELIVERY', actorId: 'u-ag2', actorRole: 'AGENT', actorName: 'Priya Sharma', notes: 'Out for final doorstep delivery attempt', createdAt: new Date(Date.now() - 2000000).toISOString() },
    ],
  },
  {
    id: 'ord-3',
    trackingNumber: 'TRK-9003-FAILED',
    customerId: 'u-c1',
    agentId: 'u-ag3',
    orderType: 'B2C',
    paymentType: 'COD',
    pickupAddress: 'Bandra West Shopping Hub, Mumbai',
    pickupPincode: '400050',
    pickupZoneId: 'zone-3',
    dropAddress: 'Powai Knowledge Park, Mumbai',
    dropPincode: '400076',
    dropZoneId: 'zone-3',
    length: 25, width: 20, height: 10,
    actualWeight: 2.0, volumetricWeight: 1.0, chargeableWeight: 2.0,
    baseCharge: 5.0, weightCharge: 1.5, codSurcharge: 2.0, totalCharge: 8.5,
    status: 'FAILED',
    failureReason: 'Customer premises locked / Customer unavailable',
    deliveryDate: new Date(Date.now() - 86400000).toISOString(),
    scheduledSlot: '10:00 AM - 02:00 PM',
    customer: INITIAL_USERS[1],
    agent: INITIAL_USERS[5],
    pickupZone: INITIAL_ZONES[2],
    dropZone: INITIAL_ZONES[2],
    trackingHistory: [
      { id: 'th-8', orderId: 'ord-3', status: 'CREATED', actorId: 'u-c1', actorRole: 'CUSTOMER', actorName: 'John Doe', notes: 'Shipment created', createdAt: new Date(Date.now() - 90000000).toISOString() },
      { id: 'th-9', orderId: 'ord-3', status: 'OUT_FOR_DELIVERY', actorId: 'u-ag3', actorRole: 'AGENT', actorName: 'Rahul Mehta', notes: 'Out for delivery', createdAt: new Date(Date.now() - 88000000).toISOString() },
      { id: 'th-10', orderId: 'ord-3', status: 'FAILED', actorId: 'u-ag3', actorRole: 'AGENT', actorName: 'Rahul Mehta', notes: 'Attempt Failed: Customer premises locked. Automated notification dispatched to customer for rescheduling.', createdAt: new Date(Date.now() - 86400000).toISOString() },
    ],
  },
];

// LocalStorage Helper for Standalone Mode
function getLocal<T>(key: string, defaultVal: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setLocal(key: string, val: any) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.warn('LocalStorage save error:', err);
  }
}

// Client-Side Rate Engine Calculation
function computeClientRate(input: any) {
  const { length, width, height, actualWeight, pickupPincode, dropPincode, orderType = 'B2C', paymentType = 'PREPAID' } = input;

  const vol = (length * width * height) / 5000;
  const volumetricWeight = parseFloat(vol.toFixed(2));
  const chargeableWeight = parseFloat(Math.max(actualWeight, volumetricWeight).toFixed(2));

  const zones = getLocal('app_zones', INITIAL_ZONES);
  const rateCards = getLocal('app_rate_cards', INITIAL_RATE_CARDS);

  // Find Zone by pincode
  let pickupZone = null;
  let dropZone = null;

  for (const z of zones) {
    if (z.areas?.some((a: any) => a.pincode === pickupPincode.trim())) pickupZone = z;
    if (z.areas?.some((a: any) => a.pincode === dropPincode.trim())) dropZone = z;
  }

  const isIntra = pickupZone && dropZone && pickupZone.id === dropZone.id;
  const zoneType = isIntra ? 'INTRA' : 'INTER';

  const rc = rateCards.find((r: any) => r.orderType === orderType && r.zoneType === zoneType) || rateCards[0];

  const baseCharge = rc.baseRate;
  const extraWeight = Math.max(0, chargeableWeight - rc.baseWeight);
  const weightCharge = parseFloat((extraWeight * rc.perKgRate).toFixed(2));
  const subtotal = Math.max(rc.minCharge, baseCharge + weightCharge);
  const codSurcharge = paymentType === 'COD' ? rc.codSurcharge : 0;
  const totalCharge = parseFloat((subtotal + codSurcharge).toFixed(2));

  return {
    volumetricWeight,
    chargeableWeight,
    actualWeight,
    pickupZone: pickupZone ? { id: pickupZone.id, name: pickupZone.name, code: pickupZone.code } : null,
    dropZone: dropZone ? { id: dropZone.id, name: dropZone.name, code: dropZone.code } : null,
    zoneType,
    baseCharge,
    weightCharge,
    codSurcharge,
    totalCharge,
    appliedRateCard: rc,
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'An API error occurred');
  }
  return data as T;
}

export const api = {
  // Auth API
  login: async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      return await handleResponse<any>(res);
    } catch {
      // Fallback standalone login
      const users = getLocal('app_users', INITIAL_USERS);
      const user = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase()) || users[0];
      const token = `standalone_token_${user.id}`;
      return { message: 'Login successful (Standalone Mode)', user, token };
    }
  },

  register: async (payload: any) => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return await handleResponse<any>(res);
    } catch {
      const users = getLocal('app_users', INITIAL_USERS);
      const newUser = { id: `u-${Date.now()}`, ...payload };
      users.push(newUser);
      setLocal('app_users', users);
      const token = `standalone_token_${newUser.id}`;
      return { message: 'Registered successfully', user: newUser, token };
    }
  },

  quickLogin: async (role: 'ADMIN' | 'CUSTOMER' | 'AGENT') => {
    try {
      const res = await fetch(`${API_BASE}/auth/quick-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      return await handleResponse<any>(res);
    } catch {
      const users = getLocal('app_users', INITIAL_USERS);
      const user = users.find((u: any) => u.role === role) || users[0];
      const token = `standalone_token_${user.id}`;
      return { message: `Quick login as ${role}`, user, token };
    }
  },

  getProfile: async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, { headers: { ...getAuthHeader() } });
      return await handleResponse<any>(res);
    } catch {
      const users = getLocal('app_users', INITIAL_USERS);
      const token = localStorage.getItem('delivery_tracker_token');
      const userId = token?.replace('standalone_token_', '') || users[0].id;
      const user = users.find((u: any) => u.id === userId) || users[0];
      return { user };
    }
  },

  // Zones API
  getZones: async () => {
    try {
      const res = await fetch(`${API_BASE}/zones`);
      return await handleResponse<any>(res);
    } catch {
      return { zones: getLocal('app_zones', INITIAL_ZONES) };
    }
  },

  createZone: async (payload: any) => {
    try {
      const res = await fetch(`${API_BASE}/zones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(payload),
      });
      return await handleResponse<any>(res);
    } catch {
      const zones = getLocal('app_zones', INITIAL_ZONES);
      const newZone = { id: `z-${Date.now()}`, ...payload, areas: [], _count: { agents: 0, pickupOrders: 0, dropOrders: 0 } };
      zones.push(newZone);
      setLocal('app_zones', zones);
      return { message: 'Zone created', zone: newZone };
    }
  },

  addAreaToZone: async (zoneId: string, area: any) => {
    try {
      const res = await fetch(`${API_BASE}/zones/${zoneId}/areas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(area),
      });
      return await handleResponse<any>(res);
    } catch {
      const zones = getLocal('app_zones', INITIAL_ZONES);
      const zone = zones.find((z: any) => z.id === zoneId);
      if (zone) {
        zone.areas = zone.areas || [];
        zone.areas.push({ id: `a-${Date.now()}`, ...area, zoneId });
        setLocal('app_zones', zones);
      }
      return { message: 'Area mapped', area };
    }
  },

  removeArea: async (areaId: string) => {
    try {
      const res = await fetch(`${API_BASE}/zones/areas/${areaId}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() },
      });
      return await handleResponse<any>(res);
    } catch {
      const zones = getLocal('app_zones', INITIAL_ZONES);
      zones.forEach((z: any) => {
        if (z.areas) z.areas = z.areas.filter((a: any) => a.id !== areaId);
      });
      setLocal('app_zones', zones);
      return { message: 'Area removed' };
    }
  },

  // Rate Cards API
  getRateCards: async () => {
    try {
      const res = await fetch(`${API_BASE}/rate-cards`);
      return await handleResponse<any>(res);
    } catch {
      return { rateCards: getLocal('app_rate_cards', INITIAL_RATE_CARDS) };
    }
  },

  updateRateCard: async (id: string, payload: any) => {
    try {
      const res = await fetch(`${API_BASE}/rate-cards/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(payload),
      });
      return await handleResponse<any>(res);
    } catch {
      const rateCards = getLocal('app_rate_cards', INITIAL_RATE_CARDS);
      const idx = rateCards.findIndex((r: any) => r.id === id);
      if (idx !== -1) {
        rateCards[idx] = { ...rateCards[idx], ...payload };
        setLocal('app_rate_cards', rateCards);
      }
      return { message: 'Rate card updated', rateCard: rateCards[idx] };
    }
  },

  calculateRatePreview: async (payload: any) => {
    try {
      const res = await fetch(`${API_BASE}/rate-cards/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return await handleResponse<any>(res);
    } catch {
      const calculation = computeClientRate(payload);
      return { success: true, calculation };
    }
  },

  // Orders API
  createOrder: async (payload: any) => {
    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(payload),
      });
      return await handleResponse<any>(res);
    } catch {
      const orders = getLocal('app_orders', INITIAL_ORDERS);
      const users = getLocal('app_users', INITIAL_USERS);
      const calculation = computeClientRate(payload);

      const trackingNumber = `TRK-${Math.floor(100000 + Math.random() * 900000)}-${payload.orderType || 'B2C'}`;
      const customer = users.find((u: any) => u.id === payload.customerId) || users[1];
      const assignedAgent = users.find((u: any) => u.role === 'AGENT' && u.isAvailable) || users[3];

      const newOrder: any = {
        id: `ord-${Date.now()}`,
        trackingNumber,
        customerId: customer.id,
        agentId: assignedAgent.id,
        orderType: payload.orderType || 'B2C',
        paymentType: payload.paymentType || 'PREPAID',
        pickupAddress: payload.pickupAddress,
        pickupPincode: payload.pickupPincode,
        pickupZoneId: calculation.pickupZone?.id || null,
        dropAddress: payload.dropAddress,
        dropPincode: payload.dropPincode,
        dropZoneId: calculation.dropZone?.id || null,
        length: payload.length, width: payload.width, height: payload.height, actualWeight: payload.actualWeight,
        volumetricWeight: calculation.volumetricWeight,
        chargeableWeight: calculation.chargeableWeight,
        baseCharge: calculation.baseCharge,
        weightCharge: calculation.weightCharge,
        codSurcharge: calculation.codSurcharge,
        totalCharge: calculation.totalCharge,
        status: 'ASSIGNED',
        failureReason: null,
        deliveryDate: payload.deliveryDate || new Date(Date.now() + 86400000).toISOString(),
        scheduledSlot: payload.scheduledSlot || '10:00 AM - 02:00 PM',
        customer,
        agent: assignedAgent,
        pickupZone: calculation.pickupZone,
        dropZone: calculation.dropZone,
        trackingHistory: [
          { id: `th-${Date.now()}-1`, orderId: `ord-${Date.now()}`, status: 'CREATED', actorId: customer.id, actorName: customer.name, actorRole: 'CUSTOMER', location: 'Origin', notes: 'Order booked', createdAt: new Date().toISOString() },
          { id: `th-${Date.now()}-2`, orderId: `ord-${Date.now()}`, status: 'ASSIGNED', actorId: 'u-admin', actorName: 'Auto-Assignment Engine', actorRole: 'SYSTEM', location: 'System', notes: `Intelligently assigned to driver ${assignedAgent.name}`, createdAt: new Date().toISOString() },
        ],
      };

      orders.unshift(newOrder);
      setLocal('app_orders', orders);
      return { message: 'Order created', order: newOrder, rateBreakdown: calculation };
    }
  },

  getOrders: async (filters: Record<string, string> = {}) => {
    try {
      const query = new URLSearchParams(filters).toString();
      const res = await fetch(`${API_BASE}/orders?${query}`, { headers: { ...getAuthHeader() } });
      return await handleResponse<any>(res);
    } catch {
      let orders = getLocal('app_orders', INITIAL_ORDERS);
      if (filters.status) orders = orders.filter((o: any) => o.status === filters.status);
      if (filters.zoneId) orders = orders.filter((o: any) => o.pickupZoneId === filters.zoneId || o.dropZoneId === filters.zoneId);
      if (filters.agentId) orders = orders.filter((o: any) => o.agentId === filters.agentId);
      return { orders };
    }
  },

  getOrderDetails: async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/orders/${id}`, { headers: { ...getAuthHeader() } });
      return await handleResponse<any>(res);
    } catch {
      const orders = getLocal('app_orders', INITIAL_ORDERS);
      const order = orders.find((o: any) => o.id === id || o.trackingNumber === id) || orders[0];
      return { order };
    }
  },

  updateOrderStatus: async (id: string, payload: any) => {
    try {
      const res = await fetch(`${API_BASE}/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(payload),
      });
      return await handleResponse<any>(res);
    } catch {
      const orders = getLocal('app_orders', INITIAL_ORDERS);
      const order = orders.find((o: any) => o.id === id);
      if (order) {
        order.status = payload.status;
        if (payload.failureReason) order.failureReason = payload.failureReason;
        order.trackingHistory = order.trackingHistory || [];
        order.trackingHistory.push({
          id: `th-${Date.now()}`,
          orderId: id,
          status: payload.status,
          actorId: 'u-ag1',
          actorName: 'Delivery Driver',
          actorRole: 'AGENT',
          location: payload.location || 'Delivery Stop',
          notes: payload.notes || `Status updated to ${payload.status}`,
          createdAt: new Date().toISOString(),
        });
        setLocal('app_orders', orders);
      }
      return { message: `Order status set to ${payload.status}`, order };
    }
  },

  rescheduleOrder: async (id: string, payload: any) => {
    try {
      const res = await fetch(`${API_BASE}/orders/${id}/reschedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(payload),
      });
      return await handleResponse<any>(res);
    } catch {
      const orders = getLocal('app_orders', INITIAL_ORDERS);
      const users = getLocal('app_users', INITIAL_USERS);
      const order = orders.find((o: any) => o.id === id);

      if (order) {
        order.status = 'RESCHEDULED';
        order.deliveryDate = payload.deliveryDate;
        if (payload.scheduledSlot) order.scheduledSlot = payload.scheduledSlot;

        const reassignedAgent = users.find((u: any) => u.role === 'AGENT' && u.id !== order.agentId && u.isAvailable) || order.agent;
        order.agent = reassignedAgent;
        order.agentId = reassignedAgent.id;

        order.trackingHistory.push({
          id: `th-${Date.now()}`,
          orderId: id,
          status: 'RESCHEDULED',
          actorId: order.customer?.id || 'u-c1',
          actorName: order.customer?.name || 'Customer',
          actorRole: 'CUSTOMER',
          location: 'Customer Portal',
          notes: `Rescheduled for ${payload.deliveryDate}. Driver ${reassignedAgent.name} reassigned.`,
          createdAt: new Date().toISOString(),
        });

        setLocal('app_orders', orders);
      }
      return { message: 'Rescheduled successfully', order };
    }
  },

  assignAgent: async (id: string, payload: any) => {
    try {
      const res = await fetch(`${API_BASE}/orders/${id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(payload),
      });
      return await handleResponse<any>(res);
    } catch {
      const orders = getLocal('app_orders', INITIAL_ORDERS);
      const users = getLocal('app_users', INITIAL_USERS);
      const order = orders.find((o: any) => o.id === id);

      if (order) {
        const agent = payload.agentId ? users.find((u: any) => u.id === payload.agentId) : users.find((u: any) => u.role === 'AGENT' && u.isAvailable);
        order.agent = agent || users[3];
        order.agentId = agent?.id || 'u-ag1';
        order.status = 'ASSIGNED';

        order.trackingHistory.push({
          id: `th-${Date.now()}`,
          orderId: id,
          status: 'ASSIGNED',
          actorId: 'u-admin',
          actorName: 'Auto-Assignment Engine',
          actorRole: 'SYSTEM',
          location: 'Dispatch Center',
          notes: `Assigned to driver ${agent?.name || 'Driver'}`,
          createdAt: new Date().toISOString(),
        });
        setLocal('app_orders', orders);
      }
      return { message: 'Agent assigned', order };
    }
  },

  overrideStatus: async (id: string, payload: any) => {
    try {
      const res = await fetch(`${API_BASE}/orders/${id}/override`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(payload),
      });
      return await handleResponse<any>(res);
    } catch {
      const orders = getLocal('app_orders', INITIAL_ORDERS);
      const order = orders.find((o: any) => o.id === id);
      if (order) {
        order.status = payload.status;
        order.trackingHistory.push({
          id: `th-${Date.now()}`,
          orderId: id,
          status: payload.status,
          actorId: 'u-admin',
          actorName: 'Operations Admin',
          actorRole: 'ADMIN',
          location: 'Admin Portal',
          notes: `[ADMIN OVERRIDE] ${payload.notes || 'Status force update'}`,
          createdAt: new Date().toISOString(),
        });
        setLocal('app_orders', orders);
      }
      return { message: 'Status overridden', order };
    }
  },

  // Agents API
  getAgents: async () => {
    try {
      const res = await fetch(`${API_BASE}/agents`, { headers: { ...getAuthHeader() } });
      return await handleResponse<any>(res);
    } catch {
      const users = getLocal('app_users', INITIAL_USERS);
      const agents = users.filter((u: any) => u.role === 'AGENT');
      return { agents };
    }
  },

  updateAgentStatus: async (payload: any) => {
    try {
      const res = await fetch(`${API_BASE}/agents/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(payload),
      });
      return await handleResponse<any>(res);
    } catch {
      const users = getLocal('app_users', INITIAL_USERS);
      const token = localStorage.getItem('delivery_tracker_token');
      const userId = token?.replace('standalone_token_', '') || users[3].id;
      const agent = users.find((u: any) => u.id === userId);

      if (agent) {
        if (payload.isAvailable !== undefined) agent.isAvailable = payload.isAvailable;
        setLocal('app_users', users);
      }
      return { message: 'Agent status updated', agent };
    }
  },

  // Admin API
  getAdminStats: async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/stats`, { headers: { ...getAuthHeader() } });
      return await handleResponse<any>(res);
    } catch {
      const orders = getLocal('app_orders', INITIAL_ORDERS);
      const users = getLocal('app_users', INITIAL_USERS);
      const totalRevenue = orders.reduce((sum: number, o: any) => sum + (o.totalCharge || 0), 0);

      return {
        stats: {
          totalOrders: orders.length,
          activeDeliveries: orders.filter((o: any) => ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(o.status)).length,
          deliveredCount: orders.filter((o: any) => o.status === 'DELIVERED').length,
          failedCount: orders.filter((o: any) => o.status === 'FAILED').length,
          rescheduledCount: orders.filter((o: any) => o.status === 'RESCHEDULED').length,
          totalRevenue: parseFloat(totalRevenue.toFixed(2)),
          totalAgents: users.filter((u: any) => u.role === 'AGENT').length,
          availableAgents: users.filter((u: any) => u.role === 'AGENT' && u.isAvailable).length,
          totalCustomers: users.filter((u: any) => u.role === 'CUSTOMER').length,
          totalZones: 4,
        },
      };
    }
  },
};
