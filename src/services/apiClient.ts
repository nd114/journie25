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

      // Check if response has content
      const contentType = response.headers.get('content-type');
      const hasJsonContent = contentType && contentType.includes('application/json');
      
      let data;
      if (hasJsonContent) {
        const text = await response.text();
        if (text) {
          try {
            data = JSON.parse(text);
          } catch (parseError) {
            console.error('JSON parse error:', parseError);
            return { error: 'Invalid response format from server' };
          }
        } else {
          // Empty JSON response
          data = null;
        }
      } else {
        // Non-JSON response - read as text for error reporting
        const text = await response.text();
        if (!response.ok) {
          return { error: text || `Request failed with status ${response.status}: ${response.statusText}` };
        }
        data = null;
      }

      if (!response.ok) {
        return { error: data?.error || `Request failed with status ${response.status}: ${response.statusText}` };
      }

      return { data };
    } catch (error) {
      console.error('API request error:', error);
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

  // Communities
  async getCommunities(category?: string) {
    const params = category ? `?category=${category}` : '';
    return this.request<any[]>(`/communities${params}`);
  }

  async joinCommunity(communityId: number) {
    return this.request<any>(`/communities/${communityId}/join`, {
      method: 'POST',
    });
  }

  async leaveCommunity(communityId: number) {
    return this.request<any>(`/communities/${communityId}/leave`, {
      method: 'POST',
    });
  }

  // Learning Paths
  async getLearningPaths() {
    return this.request<any[]>('/learning-paths');
  }

  async getLearningPathProgress(pathId: number) {
    return this.request<any>(`/learning-paths/${pathId}/progress`);
  }

  async completeLearningStep(pathId: number, stepId: string) {
    return this.request<any>(`/learning-paths/${pathId}/complete-step`, {
      method: 'POST',
      body: JSON.stringify({ stepId }),
    });
  }

  // Research Tools
  async getResearchTools() {
    return this.request<any[]>('/tools');
  }

  async useResearchTool(toolId: number, input: any) {
    return this.request<any>(`/tools/${toolId}/use`, {
      method: 'POST',
      body: JSON.stringify({ input }),
    });
  }

  // User Bookmarks
  async bookmarkPaper(paperId: number) {
    return this.request<any>(`/papers/${paperId}/bookmark`, {
      method: 'POST',
    });
  }

  async removeBookmark(paperId: number) {
    return this.request<any>(`/papers/${paperId}/bookmark`, {
      method: 'DELETE',
    });
  }

  async getUserBookmarks() {
    return this.request<any[]>('/bookmarks');
  }
  
  async getBookmarks() {
    return this.getUserBookmarks();
  }

  // Dashboard
  async getDashboardData() {
    return this.request<any>('/user/dashboard');
  }

  // Trending and Analytics
  async getTrendingPapers(limit?: number) {
    const params = limit ? `?limit=${limit}` : '';
    return this.request<any[]>(`/papers/trending${params}`);
  }

  async recordPaperView(paperId: number, readTime?: number) {
    return this.request<any>(`/papers/${paperId}/view`, {
      method: 'POST',
      body: JSON.stringify({ 
        sessionId: `session_${Date.now()}`,
        readTime 
      }),
    });
  }

  async getRecommendations(limit?: number) {
    const params = limit ? `?limit=${limit}` : '';
    return this.request<any[]>(`/recommendations${params}`);
  }
}

export const apiClient = new ApiClient();
