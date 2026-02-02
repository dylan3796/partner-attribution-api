import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export interface Partner {
  id: string;
  name: string;
  type: 'referral' | 'affiliate' | 'integration';
  status: 'active' | 'inactive';
  createdAt: string;
  totalDeals?: number;
  totalRevenue?: number;
}

export interface TouchPoint {
  partnerId: string;
  timestamp: string;
  type: 'click' | 'view' | 'signup' | 'demo' | 'trial';
  metadata?: Record<string, any>;
}

export interface Deal {
  id: string;
  amount: number;
  closedAt: string;
  touchPoints: TouchPoint[];
  attribution?: Record<string, number>;
}

export interface Event {
  id: string;
  userId: string;
  partnerId?: string;
  type: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface AttributionResult {
  partnerId: string;
  partnerName: string;
  credit: number;
  percentage: number;
}

export interface AnalyticsData {
  totalEvents: number;
  totalDeals: number;
  totalRevenue: number;
  totalPartners: number;
  revenueByPartner: Array<{ partnerId: string; name: string; revenue: number }>;
  eventsByType: Array<{ type: string; count: number }>;
  dealsByMonth: Array<{ month: string; deals: number; revenue: number }>;
}

class ApiClient {
  private client: AxiosInstance;
  private apiKey: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Load API key from localStorage
    this.apiKey = localStorage.getItem('api_key');
    if (this.apiKey) {
      this.setApiKey(this.apiKey);
    }

    // Add response interceptor for auth errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.clearApiKey();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  setApiKey(key: string) {
    this.apiKey = key;
    localStorage.setItem('api_key', key);
    this.client.defaults.headers.common['X-API-Key'] = key;
  }

  clearApiKey() {
    this.apiKey = null;
    localStorage.removeItem('api_key');
    delete this.client.defaults.headers.common['X-API-Key'];
  }

  getApiKey(): string | null {
    return this.apiKey;
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<{ apiKey: string; user: any }> {
    const response = await this.client.post('/auth/login', { email, password });
    this.setApiKey(response.data.apiKey);
    return response.data;
  }

  async signup(email: string, password: string, name: string): Promise<{ apiKey: string; user: any }> {
    const response = await this.client.post('/auth/signup', { email, password, name });
    this.setApiKey(response.data.apiKey);
    return response.data;
  }

  async generateApiKey(): Promise<{ apiKey: string }> {
    const response = await this.client.post('/auth/generate-key');
    return response.data;
  }

  async revokeApiKey(keyId: string): Promise<void> {
    await this.client.delete(`/auth/keys/${keyId}`);
  }

  // Partners endpoints
  async getPartners(): Promise<Partner[]> {
    const response = await this.client.get('/partners');
    return response.data;
  }

  async getPartner(id: string): Promise<Partner> {
    const response = await this.client.get(`/partners/${id}`);
    return response.data;
  }

  async createPartner(partner: Omit<Partner, 'id' | 'createdAt'>): Promise<Partner> {
    const response = await this.client.post('/partners', partner);
    return response.data;
  }

  async updatePartner(id: string, partner: Partial<Partner>): Promise<Partner> {
    const response = await this.client.put(`/partners/${id}`, partner);
    return response.data;
  }

  async deletePartner(id: string): Promise<void> {
    await this.client.delete(`/partners/${id}`);
  }

  // Events endpoints
  async trackEvent(event: Omit<Event, 'id'>): Promise<Event> {
    const response = await this.client.post('/events', event);
    return response.data;
  }

  async getEvents(filters?: {
    partnerId?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Event[]> {
    const response = await this.client.get('/events', { params: filters });
    return response.data;
  }

  // Deals endpoints
  async getDeals(): Promise<Deal[]> {
    const response = await this.client.get('/deals');
    return response.data;
  }

  async getDeal(id: string): Promise<Deal> {
    const response = await this.client.get(`/deals/${id}`);
    return response.data;
  }

  async createDeal(deal: Omit<Deal, 'id'>): Promise<Deal> {
    const response = await this.client.post('/deals', deal);
    return response.data;
  }

  // Attribution endpoints
  async calculateAttribution(
    dealId: string,
    model: 'first-touch' | 'last-touch' | 'linear' | 'time-decay' | 'position-based'
  ): Promise<AttributionResult[]> {
    const response = await this.client.post(`/attribution/calculate`, { dealId, model });
    return response.data;
  }

  async getAttribution(dealId: string): Promise<AttributionResult[]> {
    const response = await this.client.get(`/attribution/${dealId}`);
    return response.data;
  }

  // Analytics endpoints
  async getAnalytics(startDate?: string, endDate?: string): Promise<AnalyticsData> {
    const response = await this.client.get('/analytics', {
      params: { startDate, endDate },
    });
    return response.data;
  }
}

export const api = new ApiClient();
