import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');

    console.log('🛰️ Vite Sanity Proxy Config:', {
      projectId: env.VITE_SANITY_PROJECT_ID || 'NOT SET',
      dataset: env.VITE_SANITY_DATASET || 'NOT SET'
    });

    const proxyConfig: Record<string, any> = {};

    if (env.VITE_SANITY_PROJECT_ID) {
      const sanityApiHost = `https://${env.VITE_SANITY_PROJECT_ID}.api.sanity.io`;
      proxyConfig['/api/sanity'] = {
        target: sanityApiHost,
        changeOrigin: true,
        secure: true,
        rewrite: (path: string) => path.replace(/^\/api\/sanity/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (_, req) => {
            console.log(`🛰️ Forwarding Sanity request: ${req.url}`);
          });
          proxy.on('proxyRes', (proxyRes, req) => {
            console.log(`🛰️ Sanity response ${proxyRes.statusCode} for ${req.url}`);
          });
          proxy.on('error', (err) => {
            console.error('🛑 Sanity proxy error:', err);
          });
        },
      };
    } else {
      console.warn('⚠️ VITE_SANITY_PROJECT_ID not set. Skipping Sanity proxy.');
    }

    // Proxy for secure assets to bypass CORS
    proxyConfig['/api/assets'] = {
      target: 'https://assets.artflaneur.com.au',
      changeOrigin: true,
      secure: true,
      rewrite: (path: string) => path.replace(/^\/api\/assets/, ''),
    };

    // Proxy for secure token endpoint to bypass CORS in development
    proxyConfig['/api/token'] = {
      target: 'https://hgito8qnb0.execute-api.ap-southeast-2.amazonaws.com',
      changeOrigin: true,
      secure: true,
      rewrite: (path: string) => path.replace(/^\/api\/token/, '/dev/token'),
    };

    // Proxy for GraphQL API
    if (env.VITE_GRAPHQL_ENDPOINT) {
      proxyConfig['/api/graphql'] = {
        target: env.VITE_GRAPHQL_ENDPOINT.replace('/graphql', ''),
        changeOrigin: true,
        secure: true,
        rewrite: (path: string) => path.replace(/^\/api\/graphql/, '/graphql'),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            if (env.VITE_GRAPHQL_API_KEY) {
              proxyReq.setHeader('x-api-key', env.VITE_GRAPHQL_API_KEY);
            }
            if (env.VITE_GRAPHQL_TENANT_ID) {
              proxyReq.setHeader('x-tenant-id', env.VITE_GRAPHQL_TENANT_ID);
            }
          });
        },
      };
    } else {
      console.warn('⚠️ VITE_GRAPHQL_ENDPOINT not set. GraphQL proxy disabled.');
    }
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: proxyConfig
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
          '@/components': path.resolve(__dirname, './components'),
          '@/pages': path.resolve(__dirname, './pages'),
        }
      }
    };
});
