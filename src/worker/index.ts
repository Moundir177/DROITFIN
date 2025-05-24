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
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400', // 24 hours
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

    // Handle root requests to confirm worker is operational
    if (path === '/' || path === '') {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'DROIT_FPRA API Worker is running', 
          endpoints: ['/api/data/{key}', '/api/list-keys', '/api/initialize'] 
        }),
        { 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          } 
        }
      );
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
        try {
          // Create some basic test data
          await env.DROIT_KV.put('test-key', 'test-value');
          
          // Add a test page
          const testPage = {
            id: 'test-page',
            title: {
              fr: 'Page de test',
              ar: 'صفحة اختبار'
            },
            sections: [
              {
                id: 'section1',
                title: { 
                  fr: 'Section 1', 
                  ar: 'القسم 1'
                },
                content: {
                  fr: 'Contenu de test pour la section 1',
                  ar: 'محتوى اختبار للقسم 1'
                }
              }
            ]
          };
          
          await env.DROIT_KV.put('test-page', JSON.stringify(testPage));
          
          // Return success
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: 'Database initialized with test data',
              data: { testPage }
            }),
            { 
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              } 
            }
          );
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          return new Response(
            JSON.stringify({ success: false, error: `Error initializing database: ${errorMessage}` }),
            { 
              status: 500,
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              } 
            }
          );
        }
      }

      // Check for test data
      if (apiPath === 'test' && request.method === 'GET') {
        const data = await env.DROIT_KV.get('test-key');
        return new Response(
          JSON.stringify({ success: true, data, raw: true }),
          { 
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            } 
          }
        );
      }
      
      // Debug endpoint to check request details
      if (apiPath === 'debug' && request.method === 'GET') {
        // List all keys in the KV namespace
        const keys = await env.DROIT_KV.list();
        
        // Return debug info
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Debug information',
            url: request.url,
            method: request.method,
            headers: Object.fromEntries([...request.headers]),
            path: path,
            apiPath: apiPath,
            keys: keys.keys,
            env: Object.keys(env)
          }),
          { 
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            } 
          }
        );
      }

      // API endpoint to get data
      if (apiPath.startsWith('data/') && request.method === 'GET') {
        const key = apiPath.replace('data/', '');
        try {
          const data = await env.DROIT_KV.get(key);
          
          // If no data found
          if (data === null) {
            return new Response(
              JSON.stringify({ success: false, error: `No data found for key: ${key}` }),
              { 
                status: 404, 
                headers: { 
                  'Content-Type': 'application/json',
                  ...corsHeaders
                } 
              }
            );
          }
          
          // Return the data
          return new Response(
            JSON.stringify({ success: true, data: JSON.parse(data) }),
            { 
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              } 
            }
          );
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          return new Response(
            JSON.stringify({ success: false, error: `Error getting data: ${errorMessage}` }),
            { 
              status: 500,
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              } 
            }
          );
        }
      }
      
      // API endpoint to set data
      if (apiPath.startsWith('data/') && request.method === 'POST') {
        const key = apiPath.replace('data/', '');
        try {
          // Parse the request body
          const requestData = await request.json();
          
          // Convert the data to a string
          const dataString = JSON.stringify(requestData);
          
          // Store in KV
          await env.DROIT_KV.put(key, dataString);
          
          // Return success
          return new Response(
            JSON.stringify({ success: true, message: `Data stored for key: ${key}` }),
            { 
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              } 
            }
          );
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          return new Response(
            JSON.stringify({ success: false, error: `Error storing data: ${errorMessage}` }),
            { 
              status: 500,
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              } 
            }
          );
        }
      }
      
      // API endpoint to delete data
      if (apiPath.startsWith('data/') && request.method === 'DELETE') {
        const key = apiPath.replace('data/', '');
        try {
          // Delete from KV
          await env.DROIT_KV.delete(key);
          
          // Return success
          return new Response(
            JSON.stringify({ success: true, message: `Data deleted for key: ${key}` }),
            { 
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              } 
            }
          );
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          return new Response(
            JSON.stringify({ success: false, error: `Error deleting data: ${errorMessage}` }),
            { 
              status: 500,
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              } 
            }
          );
        }
      }
      
      // API endpoint to list all keys
      if (apiPath === 'list-keys' && request.method === 'GET') {
        try {
          const keys = await env.DROIT_KV.list();
          
          // Return the keys
          return new Response(
            JSON.stringify({ success: true, data: keys.keys }),
            { 
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              } 
            }
          );
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          return new Response(
            JSON.stringify({ success: false, error: `Error listing keys: ${errorMessage}` }),
            { 
              status: 500,
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              } 
            }
          );
        }
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