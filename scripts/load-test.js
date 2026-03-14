// ══════════════════════════════════════════════════════════════════
// SGROUP ERP — Load Testing Script (k6)
// Usage: k6 run scripts/load-test.js --vus 50 --duration 30s
// Install: https://k6.io/docs/getting-started/installation/
// ══════════════════════════════════════════════════════════════════

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// ── Config ──
const BASE_URL = __ENV.API_URL || 'https://sgroup-erp-backend.onrender.com';
const AUTH_EMAIL = __ENV.AUTH_EMAIL || 'admin@sgroup.vn';
const AUTH_PASSWORD = __ENV.AUTH_PASSWORD || 'admin123';

// ── Custom Metrics ──
const errorRate = new Rate('errors');
const loginDuration = new Trend('login_duration');
const projectsListDuration = new Trend('projects_list_duration');
const productsListDuration = new Trend('products_list_duration');
const dealsDuration = new Trend('deals_list_duration');

// ── Test Scenarios ──
export const options = {
  scenarios: {
    // Smoke test: 1 VU, 30s
    smoke: {
      executor: 'constant-vus',
      vus: 1,
      duration: '30s',
      tags: { scenario: 'smoke' },
    },
    // Load test: ramp up to 50 VUs
    load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 10 },
        { duration: '1m',  target: 50 },
        { duration: '30s', target: 50 },
        { duration: '30s', target: 0 },
      ],
      startTime: '35s', // after smoke test
      tags: { scenario: 'load' },
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests under 2s
    http_req_failed: ['rate<0.05'],     // <5% error rate
    errors: ['rate<0.1'],
  },
};

// ── Helper: Login and get token ──
function login() {
  const res = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
    email: AUTH_EMAIL,
    password: AUTH_PASSWORD,
  }), { headers: { 'Content-Type': 'application/json' } });

  loginDuration.add(res.timings.duration);

  const success = check(res, {
    'login status 200/201': (r) => r.status === 200 || r.status === 201,
    'login has token': (r) => {
      try { return !!JSON.parse(r.body).access_token; } catch { return false; }
    },
  });
  errorRate.add(!success);

  if (success) {
    return JSON.parse(res.body).access_token;
  }
  return null;
}

// ── Main test function ──
export default function () {
  const token = login();
  if (!token) {
    sleep(1);
    return;
  }

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // Test 1: List projects
  group('GET /projects', () => {
    const res = http.get(`${BASE_URL}/projects`, { headers });
    projectsListDuration.add(res.timings.duration);
    const ok = check(res, {
      'projects status 200': (r) => r.status === 200,
      'projects is array': (r) => { try { return Array.isArray(JSON.parse(r.body)); } catch { return false; } },
    });
    errorRate.add(!ok);
  });

  sleep(0.5);

  // Test 2: List products for first project
  group('GET /projects/:id/products', () => {
    const projectsRes = http.get(`${BASE_URL}/projects`, { headers });
    try {
      const projects = JSON.parse(projectsRes.body);
      if (projects.length > 0) {
        const res = http.get(`${BASE_URL}/projects/${projects[0].id}/products`, { headers });
        productsListDuration.add(res.timings.duration);
        const ok = check(res, {
          'products status 200': (r) => r.status === 200,
        });
        errorRate.add(!ok);
      }
    } catch {}
  });

  sleep(0.5);

  // Test 3: List deals
  group('GET /deals', () => {
    const res = http.get(`${BASE_URL}/deals`, { headers });
    dealsDuration.add(res.timings.duration);
    const ok = check(res, {
      'deals status 200': (r) => r.status === 200,
    });
    errorRate.add(!ok);
  });

  sleep(1);
}

// ── Summary Reporter ──
export function handleSummary(data) {
  const summary = {
    timestamp: new Date().toISOString(),
    total_requests: data.metrics.http_reqs?.values?.count || 0,
    avg_duration_ms: Math.round(data.metrics.http_req_duration?.values?.avg || 0),
    p95_duration_ms: Math.round(data.metrics.http_req_duration?.values?.['p(95)'] || 0),
    p99_duration_ms: Math.round(data.metrics.http_req_duration?.values?.['p(99)'] || 0),
    error_rate: (data.metrics.http_req_failed?.values?.rate || 0).toFixed(4),
    endpoints: {
      login: Math.round(data.metrics.login_duration?.values?.avg || 0),
      projects_list: Math.round(data.metrics.projects_list_duration?.values?.avg || 0),
      products_list: Math.round(data.metrics.products_list_duration?.values?.avg || 0),
      deals_list: Math.round(data.metrics.deals_list_duration?.values?.avg || 0),
    },
  };

  console.log('\n══════════════════════════════════════════');
  console.log('  SGROUP ERP — Load Test Results');
  console.log('══════════════════════════════════════════');
  console.log(JSON.stringify(summary, null, 2));
  console.log('══════════════════════════════════════════\n');

  return {
    'results/load-test-results.json': JSON.stringify(summary, null, 2),
  };
}
