import type { RootState } from '@/app/store';

const API_BASE_URL = '/api';

// This base API is structured for future RTK Query integration.
// Replace mock implementations with real API calls when backend is ready.

class BaseApi {
  private getState: () => RootState;

  constructor(getState: () => RootState) {
    this.getState = getState;
  }

  private getHeaders(): HeadersInit {
    const state = this.getState();
    const token = ''; // Will come from auth state
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async get<T>(endpoint: string): Promise<T> {
    // Mock implementation - replace with real fetch when backend is ready
    throw new Error(`API GET ${endpoint} - not connected to backend yet`);
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    throw new Error(`API POST ${endpoint} - not connected to backend yet`);
  }

  async put<T>(endpoint: string, data: unknown): Promise<T> {
    throw new Error(`API PUT ${endpoint} - not connected to backend yet`);
  }

  async delete<T>(endpoint: string): Promise<T> {
    throw new Error(`API DELETE ${endpoint} - not connected to backend yet`);
  }
}

// Singleton instance - will be initialized with store
let apiInstance: BaseApi | null = null;

export function initApi(getState: () => RootState): BaseApi {
  apiInstance = new BaseApi(getState);
  return apiInstance;
}

export function getApi(): BaseApi {
  if (!apiInstance) {
    throw new Error('API not initialized. Call initApi first.');
  }
  return apiInstance;
}

// Mock API delay helper
export function mockDelay(ms: number = 300): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
