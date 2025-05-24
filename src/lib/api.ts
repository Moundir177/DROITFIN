// API client for communicating with the Cloudflare Worker

// Helper function to determine if we're running in production (deployed) or development (localhost)
export const isProduction = () => {
  if (typeof window === 'undefined') return false;
  return window.location.hostname !== 'localhost' && 
         window.location.hostname !== '127.0.0.1';
};

// Base API URL based on environment
export const getApiBaseUrl = () => {
  if (isProduction()) {
    // In production, use the deployed worker URL directly
    return 'https://droitfpra.moundix-neuf19.workers.dev/api';
  } else {
    // In development, use localStorage (handled directly in database.ts)
    return null;
  }
};

// Add debug mode for logging
const DEBUG = true;

// Generic API call function
export const apiCall = async <T>(
  endpoint: string, 
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: any
): Promise<T | null> => {
  // If we're in development, return null as we'll use localStorage directly
  if (!isProduction()) return null;
  
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) return null;
  
  const url = `${baseUrl}/${endpoint}`;
  
  if (DEBUG) {
    console.log(`API ${method} call to: ${url}`);
    if (data) console.log(`Request data:`, data);
  }
  
  try {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      // Allow credentials for cookies if needed later
      credentials: 'include',
    };
    
    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(url, options);
    
    if (!response.ok) {
      console.error(`API error: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const responseData = await response.json();
    
    if (DEBUG) {
      console.log(`API response:`, responseData);
    }
    
    if (!responseData.success) {
      console.error(`API Error (${endpoint}):`, responseData.error);
      return null;
    }
    
    return responseData.data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    return null;
  }
};

// Specific API functions for different data types
export const getData = async <T>(key: string): Promise<T | null> => {
  return await apiCall<T>(`data/${key}`);
};

export const setData = async <T>(key: string, value: T): Promise<boolean> => {
  const result = await apiCall<{success: boolean}>(`data/${key}`, 'POST', value);
  return result?.success || false;
};

export const deleteData = async (key: string): Promise<boolean> => {
  const result = await apiCall<{success: boolean}>(`data/${key}`, 'DELETE');
  return result?.success || false;
};

export const listKeys = async (): Promise<string[]> => {
  const result = await apiCall<{name: string}[]>('list-keys');
  return result ? result.map(item => item.name) : [];
};

// Function to initialize the database with default values via API
export const initializeDatabaseViaApi = async (): Promise<boolean> => {
  const result = await apiCall<{success: boolean}>('initialize', 'POST');
  return result?.success || false;
}; 