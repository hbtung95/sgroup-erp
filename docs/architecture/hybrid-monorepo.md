# Hybrid Monorepo Architecture

## Mục tiêu

Dự án được chuẩn hóa theo mô hình hybrid giữa:

- Lát cắt dọc: mỗi module nghiệp vụ sống trong `modules/<domain>/*`
- Lát cắt ngang: các năng lực dùng chung sống trong `packages/*`

`core/*` chỉ còn vai trò host, orchestration và runtime shell.

## Quy tắc chính

- `core/web-host` không chứa business feature của module active.
- `modules/hr|project|sales/web` là nguồn UI/module canonical cho runtime web hiện tại.
- `packages/platform` giữ auth store, module catalog, runtime contracts và API entrypoints.
- `packages/web-ui` giữ web primitives dùng chung, tránh để module import ngược vào host.
- `legacy-archive/*` chỉ là nguồn tham chiếu và migration source, không phải runtime source.

## Trạng thái module

- `active`: `hr`, `project`, `sales`
- `planned`: `exec`, `mkt`, `agency`, `shomes`, `finance`, `legal`, `admin`
- `scaffold`: `crm`, `accounting`

## Legacy migration map

- `legacy-archive/core-web-host-features/hr` -> `modules/hr/web`
- `legacy-archive/core-web-host-features/project` -> `modules/project/web`
- `legacy-archive/core-web-host-features/sales` -> `modules/sales/web`
- `legacy-archive/modules-hr-nextjs` -> tham chiếu cho standalone HR UI
- `legacy-archive/modules-project-nextjs` -> tham chiếu cho standalone Project UI
- `legacy-archive/legacy-frontend-web` -> nguồn visual language/branding cũ

## Runtime contract

- `hr` web API: `/api/hr/v1`
- `project` web API: `/api/project/v1` -> rewrite về `project-api:/api/v1`
- `sales` web API: `/api/sales/v1` -> rewrite về `sales-api:/api/v1`

## Cách mở rộng

1. Tạo module mới trong `modules/<domain>/api`, `modules/<domain>/web`, `modules/<domain>/app`
2. Khai báo metadata trong `packages/platform/src/modules/catalog.ts`
3. Nếu là module active, đăng ký shell trong `core/web-host/src/module-registry/registry.ts`
4. Đưa shared UI/logic sang `packages/*`, không import ngược từ `core/web-host`
