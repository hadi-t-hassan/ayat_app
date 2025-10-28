/**
 * API utility functions for authenticated requests
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '10000');

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

/**
 * Make an authenticated API request with automatic token refresh
 */
export const authenticatedRequest = async <T = any>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const token = localStorage.getItem('access_token');
  
  if (!token) {
    // No token available, redirect to login
    window.location.href = '/auth';
    return { error: 'No access token', status: 401 };
  }

  // Check if token is expired
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    const isExpired = payload.exp < currentTime;
    
    if (isExpired) {
      // Try to refresh the token
      const refreshSuccess = await refreshAccessToken();
      if (!refreshSuccess) {
        // Refresh failed, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        localStorage.removeItem('profile');
        window.location.href = '/auth';
        return { error: 'Token expired and refresh failed', status: 401 };
      }
    }
  } catch (error) {
    // Token is invalid, redirect to login
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('profile');
    window.location.href = '/auth';
    return { error: 'Invalid token', status: 401 };
  }

  // Make the request with the (possibly refreshed) token
  const updatedToken = localStorage.getItem('access_token');
  const fullUrl = `${API_BASE_URL}${url}`;
  
  console.log('Making API request to:', fullUrl);
  console.log('Request options:', options);
  console.log('Token:', updatedToken ? 'Present' : 'Missing');
  
  const response = await fetch(fullUrl, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${updatedToken}`,
      ...options.headers,
    },
  });
  
  console.log('Response status:', response.status);
  console.log('Response headers:', Object.fromEntries(response.headers.entries()));

  // Handle 401 Unauthorized
  if (response.status === 401) {
    // Try to refresh token once more
    const refreshSuccess = await refreshAccessToken();
    if (refreshSuccess) {
      // Retry the request with new token
      const newToken = localStorage.getItem('access_token');
      const retryResponse = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${newToken}`,
          ...options.headers,
        },
      });
      
      if (retryResponse.ok) {
        const data = await retryResponse.json();
        return { data, status: retryResponse.status };
      }
    }
    
    // Refresh failed or retry failed, logout and redirect
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('profile');
    window.location.href = '/auth';
    return { error: 'Authentication failed', status: 401 };
  }

  let data = null;
  let error = undefined;
  
  if (response.ok) {
    data = await response.json();
    console.log('Response data:', data);
  } else {
    const errorText = await response.text();
    console.log('Error response body:', errorText);
    error = `HTTP ${response.status}: ${errorText}`;
  }
  
  return { data, error, status: response.status };
};

/**
 * Refresh the access token using the refresh token
 */
const refreshAccessToken = async (): Promise<boolean> => {
  try {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      return false;
    }

    const response = await fetch(`${API_BASE_URL}/auth/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh: refreshToken,
      }),
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    localStorage.setItem('access_token', data.access);
    
    // Update refresh token if provided
    if (data.refresh) {
      localStorage.setItem('refresh_token', data.refresh);
    }
    
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Make a GET request
 */
export const apiGet = <T = any>(url: string): Promise<ApiResponse<T>> => {
  return authenticatedRequest<T>(url, { method: 'GET' });
};

/**
 * Make a POST request
 */
export const apiPost = <T = any>(url: string, data: any): Promise<ApiResponse<T>> => {
  return authenticatedRequest<T>(url, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * Make a PUT request
 */
export const apiPut = <T = any>(url: string, data: any): Promise<ApiResponse<T>> => {
  return authenticatedRequest<T>(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

/**
 * Make a PATCH request
 */
export const apiPatch = <T = any>(url: string, data: any): Promise<ApiResponse<T>> => {
  return authenticatedRequest<T>(url, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

/**
 * Make a DELETE request
 */
export const apiDelete = <T = any>(url: string): Promise<ApiResponse<T>> => {
  return authenticatedRequest<T>(url, { method: 'DELETE' });
};

/**
 * Download a file from the API
 */
export const apiDownloadFile = async (url: string, filename?: string): Promise<void> => {
  const token = localStorage.getItem('access_token');
  
  if (!token) {
    window.location.href = '/auth';
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to download file');
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
};

/**
 * Upload a file to the API
 */
export const apiUploadFile = async <T = any>(url: string, file: File, additionalData?: Record<string, any>): Promise<ApiResponse<T>> => {
  const token = localStorage.getItem('access_token');
  
  if (!token) {
    window.location.href = '/auth';
    return { error: 'No access token', status: 401 };
  }

  try {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    let data = null;
    let error = undefined;

    if (response.ok) {
      data = await response.json();
    } else {
      const errorText = await response.text();
      error = `HTTP ${response.status}: ${errorText}`;
    }

    return { data, error, status: response.status };
  } catch (error) {
    return { error: `Network error: ${error}`, status: 0 };
  }
};
