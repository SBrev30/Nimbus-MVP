// netlify/functions/notion-proxy.js
// Netlify Function to proxy Notion API calls and avoid CORS issues

export const handler = async (event, context) => {
  console.log('🔍 Notion proxy function called:', event.httpMethod);

  // CORS headers for browser compatibility
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: 'OK',
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed. Use POST.' }),
    };
  }

  try {
    // Parse request body
    const requestBody = JSON.parse(event.body || '{}');
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
    return {
      statusCode: 200, // Always return 200 for CORS compatibility
      headers,
      body: JSON.stringify({
        success: notionResponse.ok,
        status: notionResponse.status,
        data: responseData,
      }),
    };

  } catch (error) {
    console.error('❌ Proxy function error:', error);

    return {
      statusCode: 200, // Return 200 for CORS compatibility
      headers,
      body: JSON.stringify({
        success: false,
        status: 500,
        data: {
          object: 'error',
          status: 500,
          code: 'proxy_error',
          message: error.message || 'Proxy function error',
        },
      }),
    };
  }
};
