---
description: How to build the SGROUP ERP project and verify all checks pass
---
// turbo-all

# Workflow: Build & Verify

## 1. Install dependencies
```powershell
cd "D:\SGROUP ERP"
npm install
```

## 2. TypeScript check (Web Host)
```powershell
cd "D:\SGROUP ERP\core\web-host"
npx tsc -b --noEmit
```

## 3. Vite build (Web Host)
```powershell
cd "D:\SGROUP ERP\core\web-host"
npx vite build
```

## 4. Full Turborepo build
```powershell
cd "D:\SGROUP ERP"
npx turbo run build
```

## 5. Backend build (per module — if Go code changed)
```powershell
cd "D:\SGROUP ERP"
Get-ChildItem -Path "modules\*\api\go.mod" -Recurse | ForEach-Object { Push-Location $_.DirectoryName; go build ./...; go vet ./...; Pop-Location }
```

## 6. API Gateway build
```powershell
cd "D:\SGROUP ERP\core\api-gateway"
go build ./... ; go vet ./...
```

## 7. Lint check
```powershell
cd "D:\SGROUP ERP"
npx turbo run lint
```

## Troubleshooting
- **TS error "Cannot find module"**: Check path aliases in `vite.config.ts` and `tsconfig.app.json`
- **Build fail on imports**: Check barrel exports in `index.ts` files
- **EPERM errors**: Close VS Code terminal running dev server before build
- **Go build fail**: Check `go.work` includes the module. Run `go work sync`.
