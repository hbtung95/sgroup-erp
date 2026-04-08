---
description: How to run the SGROUP ERP development server locally
---
// turbo-all

# Workflow: Chạy Dev Server

## 1. Start infrastructure (Docker)
```powershell
cd "D:\SGROUP ERP"
docker-compose up -d
```
Services: PostgreSQL (5432), Redis (6379), RabbitMQ (5672/15672), MinIO (9000/9001)

## 2. Start API Gateway
```powershell
cd "D:\SGROUP ERP\core\api-gateway"
go run cmd/main.go
```

## 3. Start module backends (each in separate terminal)
```powershell
# Example for CRM module:
cd "D:\SGROUP ERP\modules\crm\api"
go run cmd/main.go
```

## 4. Start frontend (Web Host)
```powershell
cd "D:\SGROUP ERP\core\web-host"
npm run dev
```

## 5. Start toàn bộ workspace (Turborepo — alternative)
```powershell
cd "D:\SGROUP ERP"
npm run dev
```

## URLs
- Frontend: http://localhost:5173
- API Gateway: http://localhost:8080/api/v1
- PostgreSQL: localhost:5432 (sgroup_erp / erp_admin)
- Redis: localhost:6379
- RabbitMQ: localhost:5672 (Management UI: http://localhost:15672)
- MinIO: http://localhost:9001 (Console)

## Environment
Đảm bảo có file `.env` trong `core/web-host/` với:
```
VITE_API_URL=http://localhost:8080/api/v1
```
