/**
 * FinPilot AI - Backend API Integration Service
 * Connects the frontend to FastAPI backend running at http://localhost:8000/api/v1
 * Features token management, automatic endpoint discovery, error handling, and graceful offline fallback.
 */

const FinApi = {
  baseUrl: 'http://localhost:8000/api/v1',
  healthUrl: 'http://localhost:8000/health',
  isOnline: false,
  authToken: null,

  async init() {
    this.authToken = localStorage.getItem('finpilot_token') || null;
    await this.checkHealth();
  },

  async checkHealth() {
    try {
      const response = await fetch(this.healthUrl, { method: 'GET', mode: 'cors' });
      if (response.ok) {
        this.isOnline = true;
        console.log('🟢 FinPilot FastAPI Backend Connected:', await response.json());
        this.updateConnectionBadge(true);
        return true;
      }
    } catch (e) {
      this.isOnline = false;
      console.warn('⚡ FinPilot Backend Offline — Running in ultra-fast local simulation mode.');
      this.updateConnectionBadge(false);
    }
    return false;
  },

  updateConnectionBadge(online) {
    const badge = document.getElementById('backend-status-badge');
    if (badge) {
      badge.innerHTML = online 
        ? `<span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#10B981; margin-right:5px; box-shadow: 0 0 8px #10B981;"></span> FastAPI Live (8000)`
        : `<span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#5DA9FF; margin-right:5px;"></span> Standalone Engine`;
      badge.style.color = online ? '#10B981' : '#5DA9FF';
    }
  },

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }
    return headers;
  },

  // =========================================================================
  // AUTHENTICATION
  // =========================================================================
  async login(email, password) {
    if (!this.isOnline) return { success: true, simulated: true };

    try {
      const res = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        const data = await res.json();
        this.authToken = data.access_token;
        localStorage.setItem('finpilot_token', data.access_token);
        return { success: true, data };
      }
    } catch (err) {
      console.error('Login error:', err);
    }
    return { success: false };
  },

  // =========================================================================
  // DASHBOARD SUMMARY
  // =========================================================================
  async getDashboardSummary() {
    if (!this.isOnline) return null;

    try {
      const res = await fetch(`${this.baseUrl}/dashboard/`, {
        headers: this.getHeaders()
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Dashboard fetch fallback:', e);
    }
    return null;
  },

  // =========================================================================
  // TRANSACTIONS
  // =========================================================================
  async getTransactions(params = {}) {
    if (!this.isOnline) return null;

    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${this.baseUrl}/transactions/?${query}`, {
        headers: this.getHeaders()
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Transactions fetch fallback:', e);
    }
    return null;
  },

  async createTransaction(txData) {
    if (!this.isOnline) return null;

    try {
      const res = await fetch(`${this.baseUrl}/transactions/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(txData)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Create transaction fallback:', e);
    }
    return null;
  },

  // =========================================================================
  // AI ASSISTANT CHAT
  // =========================================================================
  async chatWithAi(query) {
    if (!this.isOnline) return null;

    try {
      const res = await fetch(`${this.baseUrl}/ai/chat`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ query })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('AI chat fallback:', e);
    }
    return null;
  },

  async getAiInsights() {
    if (!this.isOnline) return null;

    try {
      const res = await fetch(`${this.baseUrl}/ai/insights`, {
        headers: this.getHeaders()
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('AI insights fallback:', e);
    }
    return null;
  },

  // =========================================================================
  // BUDGETS
  // =========================================================================
  async getBudgets() {
    if (!this.isOnline) return null;

    try {
      const res = await fetch(`${this.baseUrl}/budgets/`, {
        headers: this.getHeaders()
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Budgets fallback:', e);
    }
    return null;
  },

  // =========================================================================
  // ANALYTICS
  // =========================================================================
  async getMonthlyAnalytics() {
    if (!this.isOnline) return null;

    try {
      const res = await fetch(`${this.baseUrl}/analytics/monthly`, {
        headers: this.getHeaders()
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Analytics fallback:', e);
    }
    return null;
  },

  // =========================================================================
  // REPORTS
  // =========================================================================
  getPdfReportUrl() {
    return `${this.baseUrl}/reports/pdf`;
  },

  getCsvReportUrl() {
    return `${this.baseUrl}/reports/csv`;
  }
};

if (typeof window !== 'undefined') {
  window.FinApi = FinApi;
}
