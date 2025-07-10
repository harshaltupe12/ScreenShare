const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Request failed',
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('API request error:', error);
      return {
        success: false,
        error: 'Network error',
      };
    }
  }

  // Meeting APIs
  async startMeeting(token: string): Promise<ApiResponse> {
    return this.request('/api/meetings/start', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async joinMeeting(meetingId: string, token: string): Promise<ApiResponse> {
    return this.request(`/api/meetings/join/${meetingId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async endMeeting(meetingId: string, token: string): Promise<ApiResponse> {
    return this.request(`/api/meetings/end/${meetingId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async getMeeting(meetingId: string, token: string): Promise<ApiResponse> {
    return this.request(`/api/meetings/${meetingId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async getUserMeetings(token: string): Promise<ApiResponse> {
    return this.request('/api/meetings/user/meetings', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // AI APIs
  async processQuery(
    meetingId: string,
    message: string,
    screenSnapshot?: string,
    token?: string
  ): Promise<ApiResponse> {
    return this.request('/api/ai/chat-with-screenshot', {
      method: 'POST',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify({
        meetingId,
        message,
        screenSnapshot,
      }),
    });
  }

  async analyzeScreen(
    meetingId: string,
    screenData: string,
    token?: string
  ): Promise<ApiResponse> {
    return this.request('/api/ai/analyze-screen', {
      method: 'POST',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify({
        meetingId,
        screenData,
      }),
    });
  }

  async getChatHistory(
    meetingId: string,
    page: number = 1,
    limit: number = 50,
    token?: string
  ): Promise<ApiResponse> {
    return this.request(
      `/api/ai/chat/${meetingId}?page=${page}&limit=${limit}`,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      }
    );
  }
}

export const apiService = new ApiService(); 