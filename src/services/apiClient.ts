const API_BASE = '/api';

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Request failed' };
      }

      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Network error' };
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  async register(email: string, password: string, name: string) {
    const response = await this.request<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    
    if (response.data?.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  async login(email: string, password: string) {
    const response = await this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.data?.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  async getCurrentUser() {
    return this.request<any>('/auth/me');
  }

  logout() {
    this.setToken(null);
  }

  async getPapers(filters?: { field?: string; search?: string }) {
    const params = new URLSearchParams();
    if (filters?.field) params.append('field', filters.field);
    if (filters?.search) params.append('search', filters.search);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<any[]>(`/papers${query}`);
  }

  async getPaper(id: number) {
    return this.request<any>(`/papers/${id}`);
  }

  async createPaper(paper: {
    title: string;
    abstract: string;
    content: string;
    authors: string[];
    researchField?: string;
    keywords?: string[];
  }) {
    return this.request<any>('/papers', {
      method: 'POST',
      body: JSON.stringify(paper),
    });
  }

  async updatePaper(id: number, updates: Partial<any>) {
    return this.request<any>(`/papers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deletePaper(id: number) {
    return this.request<void>(`/papers/${id}`, {
      method: 'DELETE',
    });
  }

  async getComments(paperId: number) {
    return this.request<any[]>(`/papers/${paperId}/comments`);
  }

  async createComment(paperId: number, content: string, parentId?: number) {
    return this.request<any>(`/papers/${paperId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content, parentId }),
    });
  }

  async getFields() {
    return this.request<any[]>('/fields');
  }

  async getProfile() {
    return this.request<any>('/auth/me');
  }

  async updateProfile(updates: {
    name?: string;
    orcid?: string | null;
    affiliation?: string | null;
    bio?: string | null;
  }) {
    return this.request<any>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request<any>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }
}

export const apiClient = new ApiClient();
