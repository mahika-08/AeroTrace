export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export class ApiError extends Error {
  public status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    });

    if (!response.ok) {
      let message = `API Error: ${response.status} ${response.statusText}`;
      try {
        const errData = await response.json();
        message = errData.detail || errData.message || message;
      } catch (e) {
        // Ignore json parse error
      }
      throw new ApiError(response.status, message);
    }

    return await response.json();
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new Error(`Network Error: ${err.message}`);
  }
}
