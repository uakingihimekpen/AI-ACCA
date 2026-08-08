const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface RequestOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
  auth?: boolean;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, headers = {}, auth = false } = options;

    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    if (auth && this.token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${this.token}`,
      };
    }

    if (body) {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth
  register(data: { name: string; email: string; password: string; platform?: string }) {
    return this.request<{ message: string; user: any; token: string }>('/api/auth/register', {
      method: 'POST',
      body: data,
    });
  }

  login(data: { email: string; password: string }) {
    return this.request<{ message: string; user: any; token: string }>('/api/auth/login', {
      method: 'POST',
      body: data,
    });
  }

  getProfile() {
    return this.request<{ user: any }>('/api/auth/profile', { auth: true });
  }

  updateProfile(data: { name?: string; fcm_token?: string }) {
    return this.request<{ message: string; user: any }>('/api/auth/profile', {
      method: 'PUT',
      body: data,
      auth: true,
    });
  }

  // Accumulators
  getTodayAccumulators() {
    return this.request<{ accumulators: any[] }>('/api/accumulators/today', { auth: true });
  }

  getAccumulatorHistory(params?: { tier?: number; status?: string; page?: number }) {
    const query = new URLSearchParams();
    if (params?.tier) query.set('tier', params.tier.toString());
    if (params?.status) query.set('status', params.status);
    if (params?.page) query.set('page', params.page.toString());
    return this.request<{ accumulators: any[]; pagination: any }>(
      `/api/accumulators/history?${query.toString()}`,
      { auth: true }
    );
  }

  getAccumulatorStats() {
    return this.request<{ perTier: any[]; overall: any }>('/api/accumulators/stats');
  }

  getAccumulatorById(id: string) {
    return this.request<{ accumulator: any }>(`/api/accumulators/${id}`, { auth: true });
  }

  // Rollovers
  getActiveRollovers() {
    return this.request<{ rollovers: any[] }>('/api/rollovers/active', { auth: true });
  }

  getRolloverHistory() {
    return this.request<{ rollovers: any[] }>('/api/rollovers/history', { auth: true });
  }

  getRolloverById(id: string) {
    return this.request<{ rollover: any }>(`/api/rollovers/${id}`, { auth: true });
  }

  // VIP
  getVipPlans() {
    return this.request<{ plans: any }>('/api/vip/plans');
  }

  getVipStatus() {
    return this.request<{ is_vip: boolean; plan?: string; expiry?: string; daysLeft?: number }>(
      '/api/vip/status',
      { auth: true }
    );
  }

  initializeVipPayment(plan: string) {
    return this.request<{ message: string; plan: string; amount: number; currency: string }>(
      '/api/vip/initialize',
      { method: 'POST', body: { plan }, auth: true }
    );
  }

  verifyVipPayment(reference: string, plan: string) {
    return this.request<{ message: string; plan: string; expiry: string }>(
      '/api/vip/verify',
      { method: 'POST', body: { reference, plan }, auth: true }
    );
  }

  // Donations
  getBankDetails() {
    return this.request<{ bankDetails: any }>('/api/donations/bank-details');
  }

  getDonationWall() {
    return this.request<{ donors: any[] }>('/api/donations/wall');
  }

  initializeDonation(data: { amount: number; donorName?: string; showOnWall?: boolean }) {
    return this.request<{ message: string; donation: any }>('/api/donations/paystack', {
      method: 'POST',
      body: data,
      auth: true,
    });
  }

  recordBankTransfer(data: { amount: number; donorName?: string; showOnWall?: boolean }) {
    return this.request<{ message: string; donation: any; bankDetails: any }>(
      '/api/donations/bank-transfer',
      { method: 'POST', body: data, auth: true }
    );
  }

  // Ratings
  getRatings() {
    return this.request<{ ratings: any[]; aggregate: any }>('/api/ratings');
  }

  submitRating(data: { stars: number; comment?: string }) {
    return this.request<{ message: string; rating: any }>('/api/ratings', {
      method: 'POST',
      body: data,
      auth: true,
    });
  }

  // Admin
  adminGetAccumulators(params?: { status?: string; tier?: number; page?: number }) {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.tier) query.set('tier', params.tier.toString());
    if (params?.page) query.set('page', params.page.toString());
    return this.request<{ accumulators: any[]; pagination: any }>(
      `/api/admin/accumulators?${query.toString()}`,
      { auth: true }
    );
  }

  adminCreateAccumulator(data: any) {
    return this.request<{ message: string; accumulator: any }>('/api/admin/accumulators', {
      method: 'POST',
      body: data,
      auth: true,
    });
  }

  adminUpdateAccumulator(id: string, data: any) {
    return this.request<{ message: string; accumulator: any }>(`/api/admin/accumulators/${id}`, {
      method: 'PUT',
      body: data,
      auth: true,
    });
  }

  adminGradeAccumulator(id: string, status: string) {
    return this.request<{ message: string; accumulator: any }>(
      `/api/admin/accumulators/${id}/grade`,
      { method: 'POST', body: { status }, auth: true }
    );
  }

  adminGetRollovers() {
    return this.request<{ rollovers: any[] }>('/api/admin/rollovers', { auth: true });
  }

  adminCreateRollover(data: any) {
    return this.request<{ message: string; rollover: any }>('/api/admin/rollovers', {
      method: 'POST',
      body: data,
      auth: true,
    });
  }

  adminUpdateRolloverDay(rolloverId: string, dayNumber: number, data: any) {
    return this.request<{ message: string; day: any }>(
      `/api/admin/rollovers/${rolloverId}/days/${dayNumber}`,
      { method: 'PUT', body: data, auth: true }
    );
  }

  adminGetDonations(params?: { status?: string }) {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    return this.request<{ donations: any[]; pagination: any }>(
      `/api/admin/donations?${query.toString()}`,
      { auth: true }
    );
  }

  adminConfirmDonation(id: string) {
    return this.request<{ message: string; donation: any }>(`/api/admin/donations/${id}/confirm`, {
      method: 'POST',
      auth: true,
    });
  }

  adminGetAnalytics() {
    return this.request<{ users: any; accumulators: any; donations: any; ratings: any; dailyActiveUsers: number }>(
      '/api/admin/analytics',
      { auth: true }
    );
  }

  adminGetRatings() {
    return this.request<{ ratings: any[] }>('/api/admin/ratings', { auth: true });
  }

  adminHideRating(id: string) {
    return this.request<{ message: string; rating: any }>(`/api/admin/ratings/${id}/hide`, {
      method: 'POST',
      auth: true,
    });
  }

  adminGetAuditLogs() {
    return this.request<{ logs: any[]; pagination: any }>('/api/admin/audit-logs', { auth: true });
  }
}

export const api = new ApiClient();