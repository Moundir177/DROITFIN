// API client for communicating with the Cloudflare Worker

// Helper function to determine if we're running in production (deployed) or development (localhost)
export const isProduction = () => {
  if (typeof window === 'undefined') return false;
  const isProductionEnv = window.location.hostname !== 'localhost' && 
         window.location.hostname !== '127.0.0.1';
  
  console.log('DROITFIN DEBUG - isProduction check:', { 
    hostname: window.location.hostname,
    isProduction: isProductionEnv
  });
  
  return isProductionEnv;
};

// Base API URL based on environment
export const getApiBaseUrl = () => {
  if (isProduction()) {
    // In production, use the deployed worker URL directly
    const apiUrl = 'https://droitfin.moundix-neuf19.workers.dev/api';
    console.log('DROITFIN DEBUG - Using production API URL:', apiUrl);
    return apiUrl;
  }
  // In development, use localhost
  const apiUrl = 'http://localhost:8787/api';
  console.log('DROITFIN DEBUG - Using development API URL:', apiUrl);
  return apiUrl;
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
  if (!isProduction()) {
    console.log('DROITFIN DEBUG - Not in production, skipping API call');
    return null;
  }
  
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    console.log('DROITFIN DEBUG - No base URL available for API call');
    return null;
  }
  
  const url = `${baseUrl}/${endpoint}`;
  
  console.log(`DROITFIN DEBUG - API ${method} call to: ${url}`);
  if (data) console.log(`DROITFIN DEBUG - Request data:`, data);
  
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
    
    console.log('DROITFIN DEBUG - Fetching with options:', options);
    const response = await fetch(url, options);
    
    if (!response.ok) {
      console.error(`DROITFIN DEBUG - API error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error(`DROITFIN DEBUG - Response body:`, errorText);
      return null;
    }
    
    const responseData = await response.json();
    
    console.log(`DROITFIN DEBUG - API response:`, responseData);
    
    if (!responseData.success) {
      console.error(`DROITFIN DEBUG - API Error (${endpoint}):`, responseData.error);
      return null;
    }
    
    return responseData.data;
  } catch (error) {
    console.error(`DROITFIN DEBUG - API Error (${endpoint}):`, error);
    return null;
  }
};

// Generic function to get data from the API
export const getData = async <T>(key: string): Promise<T | null> => {
  try {
    // If we're not in production, don't try to fetch from API
    if (!isProduction()) {
      console.log(`DROITFIN DEBUG - Development mode, not fetching ${key} from API`);
      return null;
    }
    
    const url = `${getApiBaseUrl()}/data/${key}`;
    console.log(`DROITFIN DEBUG - Fetching data from API: ${url}`);
    
    // Add timeout to the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        cache: 'no-store'
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.error(`DROITFIN DEBUG - API Error: ${response.status} ${response.statusText}`);
        return null;
      }
      
      const result = await response.json();
      console.log(`DROITFIN DEBUG - API Response for ${key}:`, result);
      
      if (result && result.data) {
        return result.data as T;
      }
      
      return null;
    } catch (fetchError: unknown) {
      clearTimeout(timeoutId);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error(`DROITFIN DEBUG - API request timeout for ${key}`);
      } else {
        console.error(`DROITFIN DEBUG - Fetch error for ${key}:`, fetchError);
      }
      
      return null;
    }
  } catch (error) {
    console.error(`DROITFIN DEBUG - Error fetching data for key ${key}:`, error);
    return null;
  }
};

// Generic function to set data in the API
export const setData = async <T>(key: string, data: T): Promise<boolean> => {
  try {
    // If we're not in production, don't try to send to API
    if (!isProduction()) {
      console.log(`DROITFIN DEBUG - Development mode, not sending ${key} to API`);
      return true; // Return success in development mode
    }
    
    const url = `${getApiBaseUrl()}/data/${key}`;
    console.log(`DROITFIN DEBUG - Sending data to API: ${url}`);
    
    // Add timeout to the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data }),
        signal: controller.signal,
        cache: 'no-store'
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.error(`DROITFIN DEBUG - API Error: ${response.status} ${response.statusText}`);
        return false;
      }
      
      const result = await response.json();
      console.log(`DROITFIN DEBUG - API Response for saving ${key}:`, result);
      
      return result && result.success === true;
    } catch (fetchError: unknown) {
      clearTimeout(timeoutId);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error(`DROITFIN DEBUG - API request timeout for ${key}`);
      } else {
        console.error(`DROITFIN DEBUG - Fetch error for ${key}:`, fetchError);
      }
      
      return false;
    }
  } catch (error) {
    console.error(`DROITFIN DEBUG - Error setting data for key ${key}:`, error);
    return false;
  }
};

// Function to delete data from the API
export const deleteData = async (key: string): Promise<boolean> => {
  try {
    // If we're not in production, don't try to delete from API
    if (!isProduction()) {
      console.log(`DROITFIN DEBUG - Development mode, not deleting ${key} from API`);
      return true; // Return success in development mode
    }
    
    const url = `${getApiBaseUrl()}/data/${key}`;
    console.log(`DROITFIN DEBUG - Deleting data from API: ${url}`);
    
    // Add timeout to the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
    
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        cache: 'no-store'
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.error(`DROITFIN DEBUG - API Error: ${response.status} ${response.statusText}`);
        return false;
      }
      
      const result = await response.json();
      console.log(`DROITFIN DEBUG - API Response for deleting ${key}:`, result);
      
      return result && result.success === true;
    } catch (fetchError: unknown) {
      clearTimeout(timeoutId);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error(`DROITFIN DEBUG - API request timeout for ${key}`);
      } else {
        console.error(`DROITFIN DEBUG - Fetch error for ${key}:`, fetchError);
      }
      
      return false;
    }
  } catch (error) {
    console.error(`DROITFIN DEBUG - Error deleting data for key ${key}:`, error);
    return false;
  }
};

export const listKeys = async (): Promise<string[]> => {
  console.log('DROITFIN DEBUG - listKeys');
  const result = await apiCall<{name: string}[]>('list-keys');
  return result ? result.map(item => item.name) : [];
};

// Function to initialize the database with default content
export const initializeDatabaseViaApi = async (): Promise<boolean> => {
  try {
    // If we're not in production, don't try to initialize via API
    if (!isProduction()) {
      console.log('DROITFIN DEBUG - Development mode, not initializing via API');
      return true; // Return success in development mode
    }
    
    const url = `${getApiBaseUrl()}/initialize`;
    console.log('DROITFIN DEBUG - Initializing database via API');
    
    // Add timeout to the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        cache: 'no-store'
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.error(`DROITFIN DEBUG - API Error: ${response.status} ${response.statusText}`);
        return false;
      }
      
      const result = await response.json();
      console.log('DROITFIN DEBUG - API Response for database initialization:', result);
      
      return result && result.success === true;
    } catch (fetchError: unknown) {
      clearTimeout(timeoutId);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error('DROITFIN DEBUG - API request timeout for initialization');
      } else {
        console.error('DROITFIN DEBUG - Fetch error for initialization:', fetchError);
      }
      
      return false;
    }
  } catch (error) {
    console.error('DROITFIN DEBUG - Error initializing database:', error);
    return false;
  }
}; 