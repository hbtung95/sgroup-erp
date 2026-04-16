package events

import (
	"log"
	"sync"
)

// ═══════════════════════════════════════════════════════════
// EVENT BUS — Async, goroutine-safe internal event system
// ═══════════════════════════════════════════════════════════

// EventType defines a strongly-typed event identifier.
type EventType string

const (
	EventTransactionCreated  EventType = "transaction.created"
	EventTransactionApproved EventType = "transaction.approved"
	EventTransactionRejected EventType = "transaction.rejected"
	EventTransactionDeposit  EventType = "transaction.deposit"
	EventTransactionSold     EventType = "transaction.sold"
	EventDealCreated         EventType = "deal.created"
	EventDealClosed          EventType = "deal.closed"
	EventDealLost            EventType = "deal.lost"
	EventDealStatusChanged   EventType = "deal.status_changed"
	EventBookingCreated      EventType = "booking.created"
	EventBookingApproved     EventType = "booking.approved"
	EventCustomerCreated     EventType = "customer.created"
	EventCommissionCalculated EventType = "commission.calculated"
	EventHrEmployeeCreated   EventType = "hr.employee_created"
	EventHrEmployeeUpdated   EventType = "hr.employee_updated"
	EventProjectInventoryUpdated EventType = "project.inventory_updated"
)

// Event represents a domain event with typed payload.
type Event struct {
	Type EventType
	Data interface{}
}

// EventHandler processes a single event.
type EventHandler func(Event)

// EventBusInterface defines the contract for testability.
type EventBusInterface interface {
	Subscribe(eventType EventType, handler EventHandler)
	Publish(eventType EventType, data interface{})
}

// EventBus is the concrete implementation (Singleton).
type EventBus struct {
	handlers map[EventType][]EventHandler
	mu       sync.RWMutex
}

var (
	instance *EventBus
	once     sync.Once
)

// GetEventBus returns the global EventBus singleton.
func GetEventBus() *EventBus {
	once.Do(func() {
		instance = &EventBus{
			handlers: make(map[EventType][]EventHandler),
		}
	})
	return instance
}

// Subscribe registers a handler for a specific event type.
func (eb *EventBus) Subscribe(eventType EventType, handler EventHandler) {
	eb.mu.Lock()
	defer eb.mu.Unlock()
	eb.handlers[eventType] = append(eb.handlers[eventType], handler)
	log.Printf("[EventBus] ✓ Subscribed to %s (total handlers: %d)", eventType, len(eb.handlers[eventType]))
}

// Publish dispatches an event to all registered handlers asynchronously.
func (eb *EventBus) Publish(eventType EventType, data interface{}) {
	eb.mu.RLock()
	defer eb.mu.RUnlock()

	handlers, ok := eb.handlers[eventType]
	if !ok || len(handlers) == 0 {
		log.Printf("[EventBus] No handlers for %s, event dropped", eventType)
		return
	}

	log.Printf("[EventBus] Publishing %s to %d handler(s)", eventType, len(handlers))

	for _, handler := range handlers {
		go func(h EventHandler, evt Event) {
			defer func() {
				if r := recover(); r != nil {
					log.Printf("[EventBus] ⚠ Panic in handler for %s: %v", evt.Type, r)
				}
			}()
			h(evt)
		}(handler, Event{Type: eventType, Data: data})
	}
}

// SubscribeAll registers a handler for multiple event types.
func (eb *EventBus) SubscribeAll(eventTypes []EventType, handler EventHandler) {
	for _, et := range eventTypes {
		eb.Subscribe(et, handler)
	}
}

// HasHandlers checks if any handlers are registered for an event type.
func (eb *EventBus) HasHandlers(eventType EventType) bool {
	eb.mu.RLock()
	defer eb.mu.RUnlock()
	handlers, ok := eb.handlers[eventType]
	return ok && len(handlers) > 0
}
