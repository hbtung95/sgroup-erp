// Package port defines the inbound and outbound interfaces (ports)
// for the HR module's hexagonal architecture.
//
// Inbound ports: Use case interfaces called by HTTP handlers.
// Outbound ports: Repository/service interfaces implemented by adapters.
//
// The domain layer and this port layer have ZERO infrastructure dependencies.
package port
