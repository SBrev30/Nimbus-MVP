import type { Context, Config } from "@netlify/functions";

interface NotionProxyRequest {
  method?: string;
  endpoint: string;
  token: string;
  body?: any;
}

export default async (req: Request, context: Context) => {
  console.log('🔍 Notion proxy function called:', req.method);

  // CORS headers for browser compatibility
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('OK', {
      status: 200,
      headers,
    });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed. Use POST.' }),
      {
        status: 405,
        headers,
      }
    );
  }

  try {
    // Parse request body
    const requestBody: NotionProxyRequest = await req.json();
    const { method, endpoint, token, body: requestData } = requestBody;

    // Validate required fields
    if (!token) {
      throw new Error('Missing Notion token');
    }
    if (!endpoint) {
      throw new Error('Missing API endpoint');
    }

    console.log('📡 Proxying request to Notion API:', {
      method: method || 'GET',
      endpoint,
      tokenPrefix: token.substring(0, 6) + '...',
    });

    // Make request to Notion API
    const notionResponse = await fetch(`https://api.notion.com/v1${endpoint}`, {
      method: method || 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: requestData ? JSON.stringify(requestData) : undefined,
    });

    // Get response data
    const responseData = await notionResponse.json();

    console.log('📥 Notion API response:', {
      status: notionResponse.status,
      ok: notionResponse.ok,
      hasData: !!responseData,
    });

    // Return the response (whether success or error)
    return new Response(
      JSON.stringify({
        success: notionResponse.ok,
        status: notionResponse.status,
        data: responseData,
      }),
      {
        status: 200, // Always return 200 for CORS compatibility
        headers,
      }
    );

  } catch (error) {
    console.error('❌ Proxy function error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        status: 500,
        data: {
          object: 'error',
          status: 500,
          code: 'proxy_error',
          message: error instanceof Error ? error.message : 'Proxy function error',
        },
      }),
      {
        status: 200, // Return 200 for CORS compatibility
        headers,
      }
    );
  }
};

export const config: Config = {
  path: "/.netlify/functions/notion-proxy"
};
