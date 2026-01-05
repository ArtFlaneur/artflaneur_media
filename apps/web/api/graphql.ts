// Vercel Edge Function - защищает GraphQL API key
export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  // Эти переменные БЕЗ VITE_ - они секретные, только на сервере
  const GRAPHQL_ENDPOINT = process.env.GRAPHQL_ENDPOINT;
  const GRAPHQL_API_KEY = process.env.GRAPHQL_API_KEY;

  if (!GRAPHQL_ENDPOINT || !GRAPHQL_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'GraphQL not configured on server' }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  // Разрешаем только POST запросы
  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }), 
      { 
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    const body = await request.json();
    const tenantId = request.headers.get('x-tenant-id') || 'artflaneur';
    
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': GRAPHQL_API_KEY,
        'x-tenant-id': tenantId,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('GraphQL proxy error:', error);
    return new Response(
      JSON.stringify({ error: 'GraphQL request failed' }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
