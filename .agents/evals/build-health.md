# Eval: Build Health

## Frontend
  npx tsc -b --noEmit    → 0 errors
  npx vite build         → exits 0, dist/ created
  Target: build <30s, bundle <500KB gzipped

## Backend (per module)
  cd modules/{name}/api ; go build ./...  → exits 0
  cd modules/{name}/api ; go vet ./...    → 0 warnings
  Target: compile <10s per service

## API Gateway
  cd core/api-gateway ; go build ./...    → exits 0

## Full Pipeline
  npx turbo run build    → all tasks exit 0

## Domain Completeness
  Every module in shared/domain/ that has been built should have:
  - Frontend pages in modules/{name}/web/src/
  - Backend API in modules/{name}/api/
  - Migration in modules/{name}/api/migrations/
  - i18n keys in en.json + vi.json
  - Domain spec in .agents/shared/domain/{name}.md
