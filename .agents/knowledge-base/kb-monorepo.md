# KB: Monorepo & Golang Imports (The Module Rule)

**Date Logged**: 2026-04-08
**Context**: SGROUP ERP Monorepo with Go Workspaces.

## The Bug
Agents repeatedly created Go code outside of the established module structure, causing import path errors and workspace fragmentation.

## The Rule (Permanent)
1. **NO OUTSIDE FOLDERS**: All backend code MUST reside strictly inside `D:\SGROUP ERP\modules\{name}\api\` or `D:\SGROUP ERP\core\api-gateway\`. NEVER create a directory at the root `D:\SGROUP ERP\`.
2. **GO WORKSPACE**: The root `go.work` file manages multi-module workspace. Each module has its own `go.mod`.
3. **GOLANG MODULE IMPORT PATH**: 
   Each module's `go.mod` defines its own module name (e.g. `sgroup-erp/modules/crm/api`).
   Internal imports must be prefixed with the module name.
   
   *Example:*
   ```go
   // CORRECT (within modules/crm/api/)
   import "sgroup-erp/modules/crm/api/internal/model"
   
   // INCORRECT (Will fail go build)
   import "internal/model"
   ```

4. **SHARED GO CODE**: Use `packages/go-common/` for reusable Go logic (DB connect, logging, utils). Import via `sgroup-erp/packages/go-common`.

## Action
Before generating scaffold commands or `main.go`, ensure all imports adhere to this strict path formatting.
