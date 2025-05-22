// Cloudflare Worker for handling backend API requests
// This will replace localStorage-based storage in the deployed environment

// Type definition for Cloudflare KV namespace
interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
  list(options?: { prefix?: string, limit?: number, cursor?: string }): Promise<{ keys: { name: string }[] }>;
}

export interface Env {
  DROIT_KV: KVNamespace;
}

// Helper types for our API
interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

// Function to handle CORS preflight requests and set appropriate headers
function handleCors(request: Request): Record<string, string> {
  // Make sure the necessary headers are present for CORS to work
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Handle OPTIONS request for CORS preflight
  if (request.method === 'OPTIONS') {
    return headers;
  }

  return headers;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // Handle CORS
    const corsHeaders = handleCors(request);
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Parse the API endpoint path
    const apiPath = path.replace(/^\/api\//, '');
    
    try {
      // Data operations based on endpoint and method
      if (apiPath.startsWith('data/')) {
        const key = apiPath.replace('data/', '');
        
        // GET: Retrieve data
        if (request.method === 'GET') {
          const data = await env.DROIT_KV.get(key);
          return new Response(
            JSON.stringify({ success: true, data: data ? JSON.parse(data) : null }),
            { 
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              } 
            }
          );
        }
        
        // POST/PUT: Save data
        if (request.method === 'POST' || request.method === 'PUT') {
          const body = await request.json();
          await env.DROIT_KV.put(key, JSON.stringify(body));
          return new Response(
            JSON.stringify({ success: true }),
            { 
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              } 
            }
          );
        }
        
        // DELETE: Remove data
        if (request.method === 'DELETE') {
          await env.DROIT_KV.delete(key);
          return new Response(
            JSON.stringify({ success: true }),
            { 
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              } 
            }
          );
        }
      }
      
      // List all keys (useful for admin operations)
      if (apiPath === 'list-keys' && request.method === 'GET') {
        const keys = await env.DROIT_KV.list();
        return new Response(
          JSON.stringify({ success: true, data: keys.keys }),
          { 
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            } 
          }
        );
      }
      
      // Initialize database with default values
      if (apiPath === 'initialize' && request.method === 'POST') {
        // We'll implement this if needed - would import the default data from database.ts
        return new Response(
          JSON.stringify({ success: true, message: 'Database initialized' }),
          { 
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            } 
          }
        );
      }

      // If no matching endpoint is found
      return new Response(
        JSON.stringify({ success: false, error: 'Endpoint not found' }),
        { 
          status: 404,
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          } 
        }
      );
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return new Response(
        JSON.stringify({ success: false, error: errorMessage }),
        { 
          status: 500,
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          } 
        }
      );
    }
  },
}; 