package messaging

import (
	"encoding/json"
	"log"
)

// JournalEntryPayload represents the ledger payload to be sent to Accounting.
type JournalEntryPayload struct {
	EventID       string  `json:"event_id"`
	PayrollRunID  uint    `json:"payroll_run_id"`
	TotalGross    float64 `json:"total_gross"`
	TotalNetValue float64 `json:"total_net_value"`
	Currency      string  `json:"currency"`
	Description   string  `json:"description"`
}

// EventPublisher handles sending messages to RabbitMQ, Kafka or gRPC.
type EventPublisher interface {
	PublishJournalEntry(payload JournalEntryPayload) error
}

type eventPublisher struct {
	// Connection pools, topics
}

func NewEventPublisher() EventPublisher {
	return &eventPublisher{}
}

func (p *eventPublisher) PublishJournalEntry(payload JournalEntryPayload) error {
	bytesData, _ := json.Marshal(payload)
	
	// MOCK: Sending data over Kafka or gRPC
	log.Printf("[MESSAGING - KAFKA] Transmitting Accounting Journal Entry to 'accounting.events': %s", string(bytesData))
	
	return nil
}
