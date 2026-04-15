// ═══════════════════════════════════════════════════════════
// @sgroup/platform — Event Bus
//
// Lightweight pub/sub for cross-module communication.
// Module A publishes events → Module B subscribes.
// No direct imports between modules allowed.
//
// Usage:
//   import { eventBus } from '@sgroup/platform';
//
//   // Publisher (in HR module)
//   eventBus.publish({ type: 'hr.employee.hired', module: 'hr', payload: { ... } });
//
//   // Subscriber (in Sales module)
//   const unsub = eventBus.subscribe('hr.employee.hired', (event) => { ... });
// ═══════════════════════════════════════════════════════════

/**
 * Domain event that flows through the event bus.
 * Convention: type = "{module}.{entity}.{action}"
 * Examples: "hr.employee.hired", "project.inventory.updated", "sales.deal.closed"
 */
export interface DomainEvent<T = unknown> {
  readonly type: string;
  readonly module: string;
  readonly payload: T;
  readonly timestamp: Date;
  readonly correlationId: string;
}

type EventHandler<T = unknown> = (event: DomainEvent<T>) => void;

/**
 * In-memory event bus for SPA cross-module communication.
 * For backend inter-service events, use RabbitMQ via go-kit.
 */
class EventBusImpl {
  private handlers = new Map<string, Set<EventHandler>>();

  /**
   * Publish a domain event to all subscribers.
   */
  publish<T>(event: DomainEvent<T>): void {
    const subscribers = this.handlers.get(event.type);
    if (subscribers) {
      subscribers.forEach((handler) => {
        try {
          handler(event as DomainEvent);
        } catch (err) {
          console.error(`[EventBus] Error handling ${event.type}:`, err);
        }
      });
    }

    // Also notify wildcard subscribers
    const wildcardSubs = this.handlers.get('*');
    if (wildcardSubs) {
      wildcardSubs.forEach((handler) => {
        try {
          handler(event as DomainEvent);
        } catch (err) {
          console.error(`[EventBus] Error in wildcard handler:`, err);
        }
      });
    }
  }

  /**
   * Subscribe to a specific event type.
   * Returns an unsubscribe function.
   */
  subscribe<T>(eventType: string, handler: EventHandler<T>): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    const typedHandler = handler as EventHandler;
    this.handlers.get(eventType)!.add(typedHandler);

    return () => {
      this.handlers.get(eventType)?.delete(typedHandler);
    };
  }

  /**
   * Remove all handlers for a specific event type, or all handlers if no type given.
   */
  clear(eventType?: string): void {
    if (eventType) {
      this.handlers.delete(eventType);
    } else {
      this.handlers.clear();
    }
  }
}

/**
 * Singleton event bus instance.
 * All modules share this single bus within the SPA.
 */
export const eventBus = new EventBusImpl();

/**
 * Helper to create a typed DomainEvent.
 */
export function createEvent<T>(
  type: string,
  module: string,
  payload: T,
): DomainEvent<T> {
  return {
    type,
    module,
    payload,
    timestamp: new Date(),
    correlationId: crypto.randomUUID(),
  };
}
