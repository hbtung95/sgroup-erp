---
name: Performance Engineer
description: Application profiling, load testing, bottleneck analysis, and APM for SGROUP ERP
---

# Performance Engineer Skill — SGROUP ERP

## Role Overview
The Performance Engineer ensures SGROUP ERP runs fast and efficient under all conditions through profiling, load testing, optimization, and monitoring.

## Performance Budgets

### Frontend (React Native / Web)
| Metric | Budget | Critical | Tool |
|--------|--------|----------|------|
| First Contentful Paint | < 1.5s | < 3s | Lighthouse |
| Largest Contentful Paint | < 2.5s | < 4s | Lighthouse |
| Time to Interactive | < 3s | < 5s | Lighthouse |
| JS Bundle Size | < 500KB gz | < 1MB | `expo export` |
| Frame Rate | 60fps | > 30fps | React DevTools |
| Memory (mobile) | < 150MB | < 300MB | Xcode/Android Studio |
| List Render (100 items) | < 16ms/frame | < 33ms | Profiler |

### Backend (NestJS)
| Metric | Budget | Critical | Tool |
|--------|--------|----------|------|
| API p50 Response | < 50ms | < 200ms | APM |
| API p95 Response | < 200ms | < 500ms | APM |
| API p99 Response | < 500ms | < 2s | APM |
| Database Query | < 30ms | < 100ms | Prisma logs |
| Memory Usage | < 256MB | < 512MB | Process monitor |
| CPU Usage (idle) | < 5% | < 20% | Process monitor |
| Throughput | > 500 req/s | > 100 req/s | k6 |

## Profiling

### Backend Profiling (Node.js)
```typescript
// Enable Prisma query logging
const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
  ],
});

prisma.$on('query', (e) => {
  if (e.duration > 100) { // Slow query threshold: 100ms
    console.warn(`🐌 Slow query (${e.duration}ms): ${e.query}`);
  }
});
```

### Frontend Profiling (React Native)
```tsx
// Profile component renders
import { Profiler } from 'react';

const onRenderCallback = (id, phase, actualDuration) => {
  if (actualDuration > 16) { // Slower than 60fps
    console.warn(`🐌 Slow render: ${id} (${actualDuration.toFixed(1)}ms)`);
  }
};

<Profiler id="SalesPipeline" onRender={onRenderCallback}>
  <SalesPipeline />
</Profiler>
```

## Load Testing

### k6 Test Scenarios
```javascript
import http from 'k6/http';
import { check, sleep, group } from 'k6';

export const options = {
  scenarios: {
    // Normal load
    steady_state: {
      executor: 'constant-vus',
      vus: 50,
      duration: '5m',
    },
    // Spike test
    spike: {
      executor: 'ramping-vus',
      startTime: '5m',
      stages: [
        { duration: '30s', target: 200 },  // Spike
        { duration: '1m', target: 200 },   // Hold
        { duration: '30s', target: 50 },   // Recover
      ],
    },
    // Stress test
    stress: {
      executor: 'ramping-vus',
      startTime: '8m',
      stages: [
        { duration: '2m', target: 100 },
        { duration: '2m', target: 300 },
        { duration: '2m', target: 500 },
        { duration: '2m', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<2000'],
    http_req_failed: ['rate<0.01'],
    http_reqs: ['rate>100'],
  },
};

export default function () {
  group('API Health', () => {
    check(http.get(`${BASE_URL}/api/health`), {
      'status 200': (r) => r.status === 200,
      'response < 100ms': (r) => r.timings.duration < 100,
    });
  });

  group('List Leads', () => {
    const res = http.get(`${BASE_URL}/api/leads`, { headers: authHeaders });
    check(res, {
      'status 200': (r) => r.status === 200,
      'response < 500ms': (r) => r.timings.duration < 500,
    });
  });

  sleep(1);
}
```

## Common Bottlenecks & Fixes

### Database
| Bottleneck | Detection | Fix |
|-----------|-----------|-----|
| N+1 queries | Prisma query logs, high query count | Use `include` / `select` |
| Missing indexes | `EXPLAIN ANALYZE`, slow queries | Add @@index in schema |
| Full table scans | Query plan shows Seq Scan | Add WHERE filters, indexes |
| Large result sets | High memory, slow response | Pagination, cursor-based |
| Lock contention | Connection pool exhaustion | Optimize transactions, reduce scope |

### Frontend
| Bottleneck | Detection | Fix |
|-----------|-----------|-----|
| Unnecessary re-renders | React DevTools Profiler | React.memo, useMemo, useCallback |
| Large lists | Slow scroll, dropped frames | FlatList with getItemLayout |
| Heavy images | Slow LCP, high memory | Resize, lazy load, cache |
| Bundle size | Build analysis | Code splitting, tree shaking |
| Memory leaks | Growing memory in profiler | Cleanup useEffect, unsubscribe |

### API
| Bottleneck | Detection | Fix |
|-----------|-----------|-----|
| No caching | Same data fetched repeatedly | Redis cache, HTTP ETags |
| Synchronous processing | Slow endpoints | Queue with Bull/BullMQ |
| Large payloads | High bandwidth, slow parse | Pagination, field selection |
| Missing compression | Large response size | Enable gzip middleware |

## Monitoring & Alerting

### APM Setup (Application Performance Monitoring)
```typescript
// Timing middleware for NestJS
@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();
    const request = context.switchToHttp().getRequest();
    
    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        const method = request.method;
        const url = request.url;
        
        if (duration > 500) {
          console.warn(`🐌 Slow API: ${method} ${url} — ${duration}ms`);
        }
        
        // Send to metrics collector
        // metrics.histogram('api_duration', duration, { method, url });
      }),
    );
  }
}
```

### Key Alerts
| Alert | Condition | Severity |
|-------|-----------|----------|
| API Latency High | p95 > 1s for 5 min | Warning |
| Error Rate Spike | > 5% errors in 5 min | Critical |
| Memory High | > 80% for 10 min | Warning |
| Database Slow | avg query > 200ms | Warning |
| Connection Pool | > 90% used | Critical |


## ?? MANDATORY ARCHITECTURE RULES
**CRITICAL:** You MUST read and strictly adhere to the `docs/architecture/backend-architecture-rules.md` and `docs/architecture/api-architecture-rules.md`. Follow Clean Architecture, DTO validation, UUID v7, Soft Delete, and Decimal precision rules.