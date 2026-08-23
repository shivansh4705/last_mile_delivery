const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('delivery_tracker_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
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
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse<any>(res);
  },

  register: async (payload: any) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<any>(res);
  },

  quickLogin: async (role: 'ADMIN' | 'CUSTOMER' | 'AGENT') => {
    const res = await fetch(`${API_BASE}/auth/quick-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    return handleResponse<any>(res);
  },

  getProfile: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<any>(res);
  },

  // Zones API
  getZones: async () => {
    const res = await fetch(`${API_BASE}/zones`);
    return handleResponse<any>(res);
  },

  createZone: async (payload: { name: string; code: string; description?: string }) => {
    const res = await fetch(`${API_BASE}/zones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(payload),
    });
    return handleResponse<any>(res);
  },

  addAreaToZone: async (zoneId: string, area: { name: string; pincode: string; city: string }) => {
    const res = await fetch(`${API_BASE}/zones/${zoneId}/areas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(area),
    });
    return handleResponse<any>(res);
  },

  removeArea: async (areaId: string) => {
    const res = await fetch(`${API_BASE}/zones/areas/${areaId}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    return handleResponse<any>(res);
  },

  // Rate Cards API
  getRateCards: async () => {
    const res = await fetch(`${API_BASE}/rate-cards`);
    return handleResponse<any>(res);
  },

  updateRateCard: async (id: string, payload: any) => {
    const res = await fetch(`${API_BASE}/rate-cards/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(payload),
    });
    return handleResponse<any>(res);
  },

  calculateRatePreview: async (payload: any) => {
    const res = await fetch(`${API_BASE}/rate-cards/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<any>(res);
  },

  // Orders API
  createOrder: async (payload: any) => {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(payload),
    });
    return handleResponse<any>(res);
  },

  getOrders: async (filters: Record<string, string> = {}) => {
    const query = new URLSearchParams(filters).toString();
    const res = await fetch(`${API_BASE}/orders?${query}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<any>(res);
  },

  getOrderDetails: async (id: string) => {
    const res = await fetch(`${API_BASE}/orders/${id}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<any>(res);
  },

  updateOrderStatus: async (id: string, payload: { status: string; location?: string; notes?: string; failureReason?: string }) => {
    const res = await fetch(`${API_BASE}/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(payload),
    });
    return handleResponse<any>(res);
  },

  rescheduleOrder: async (id: string, payload: { deliveryDate: string; scheduledSlot?: string; notes?: string }) => {
    const res = await fetch(`${API_BASE}/orders/${id}/reschedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(payload),
    });
    return handleResponse<any>(res);
  },

  assignAgent: async (id: string, payload: { agentId?: string; auto?: boolean }) => {
    const res = await fetch(`${API_BASE}/orders/${id}/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(payload),
    });
    return handleResponse<any>(res);
  },

  overrideStatus: async (id: string, payload: { status: string; notes?: string }) => {
    const res = await fetch(`${API_BASE}/orders/${id}/override`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(payload),
    });
    return handleResponse<any>(res);
  },

  // Agents API
  getAgents: async () => {
    const res = await fetch(`${API_BASE}/agents`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<any>(res);
  },

  updateAgentStatus: async (payload: { isAvailable?: boolean; currentLat?: number; currentLng?: number; currentZoneId?: string }) => {
    const res = await fetch(`${API_BASE}/agents/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(payload),
    });
    return handleResponse<any>(res);
  },

  // Admin API
  getAdminStats: async () => {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<any>(res);
  },
};
