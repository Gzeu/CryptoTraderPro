# 🚀 Deployment Guide

CryptoTraderPro can be deployed on various platforms. Here are the most popular options:

## Vercel (Recommended)

Vercel provides the best Next.js deployment experience with zero configuration.

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Gzeu/CryptoTraderPro)

### Manual Deploy

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **Add Environment Variables**
   ```bash
   vercel env add NEXT_PUBLIC_COINGECKO_API_KEY production
   ```

## Netlify

### One-Click Deploy

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/Gzeu/CryptoTraderPro)

### Manual Deploy

1. **Build for Static Export**
   ```bash
   npm run build
   npm run export
   ```

2. **Deploy**
   ```bash
   netlify deploy --prod --dir=out
   ```

## Docker

### Dockerfile

```dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Build & Run

```bash
# Build image
docker build -t cryptotraderpro .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_COINGECKO_API_KEY=your_key \
  cryptotraderpro
```

## Environment Variables

Make sure to set these environment variables in your deployment:

```bash
# Required for optimal performance
NEXT_PUBLIC_COINGECKO_API_KEY=your_coingecko_api_key

# Optional
NEXT_PUBLIC_BINANCE_API_KEY=your_binance_api_key
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Performance Optimization

### Edge Functions

For better performance, consider using Edge Functions:

```javascript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Add CORS headers
  const response = NextResponse.next()
  
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
  
  return response
}

export const config = {
  matcher: '/api/:path*',
}
```

### CDN Configuration

Optimize static assets:

```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['assets.coingecko.com'],
    formats: ['image/webp', 'image/avif'],
  },
  
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=60, stale-while-revalidate=300' },
        ],
      },
    ]
  },
}
```

## Monitoring

### Add Analytics

1. **Vercel Analytics**
   ```bash
   npm i @vercel/analytics
   ```

2. **Google Analytics**
   ```bash
   npm i @next/third-parties
   ```

### Error Monitoring

1. **Sentry**
   ```bash
   npm i @sentry/nextjs
   ```

2. **LogRocket**
   ```bash
   npm i logrocket logrocket-react
   ```

## Security

### Headers Configuration

```javascript
// next.config.js security headers
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
]
```

## Troubleshooting

### Common Issues

1. **Build Fails**
   - Check Node.js version (18.17+)
   - Clear `.next` cache: `rm -rf .next`
   - Reinstall dependencies: `rm -rf node_modules && npm install`

2. **Charts Not Loading**
   - Ensure TradingView scripts are loaded
   - Check CSP headers for script restrictions

3. **API Rate Limits**
   - Add API keys to environment variables
   - Implement proper caching
   - Use multiple API sources

### Support

- **GitHub Issues**: [Report a bug](https://github.com/Gzeu/CryptoTraderPro/issues)
- **Discussions**: [Ask questions](https://github.com/Gzeu/CryptoTraderPro/discussions)
- **Discord**: [Join community](#)