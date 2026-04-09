package messaging

import (
	"encoding/json"
	"log"
)

// EventPublisher defines the interface for publishing events to a message broker.
type EventPublisher interface {
	PublishEvent(topic string, payload interface{}) error
}

// LocalEventBus is a mock implementation of a Message Broker like Kafka or RabbitMQ.
// It uses Goroutines and channels to simulate async event dispatch without the heavy dependency.
type LocalEventBus struct {
	eventChan chan []byte
}

func NewLocalEventBus() *LocalEventBus {
	bus := &LocalEventBus{
		eventChan: make(chan []byte, 100),
	}
	
	// Start a worker to process events asynchronously
	go bus.worker()
	
	return bus
}

func (b *LocalEventBus) PublishEvent(topic string, payload interface{}) error {
	data, err := json.Marshal(map[string]interface{}{
		"topic":   topic,
		"payload": payload,
	})
	if err != nil {
		return err
	}
	
	// Non-blocking send
	select {
	case b.eventChan <- data:
		log.Printf("[EVENT_BROKER] Sent event to topic '%s'", topic)
	default:
		log.Printf("[EVENT_BROKER] Warning: Event channel full, dropping event to topic '%s'", topic)
	}
	return nil
}

func (b *LocalEventBus) worker() {
	for eventData := range b.eventChan {
		var event map[string]interface{}
		if err := json.Unmarshal(eventData, &event); err != nil {
			log.Printf("[EVENT_BROKER_WORKER] Error unmarshalling event: %v", err)
			continue
		}
		
		// In a real system, consumers from other microservices (CRM, Accounting) would pick this up via Kafka.
		// Here, we simulate the consumer receiving it.
		topic := event["topic"].(string)
		log.Printf("[EVENT_BROKER_WORKER] Received event from topic '%s', Payload: %v", topic, event["payload"])
	}
}
