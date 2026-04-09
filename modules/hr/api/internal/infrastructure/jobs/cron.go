package jobs

import (
	"log"

	"github.com/robfig/cron/v3"
	"gorm.io/gorm"
)

// Scheduler manages the background jobs for the HR module
type Scheduler struct {
	cron *cron.Cron
	db   *gorm.DB
}

// NewScheduler creates a new scheduled job manager
func NewScheduler(db *gorm.DB) *Scheduler {
	c := cron.New()
	return &Scheduler{
		cron: c,
		db:   db,
	}
}

// Start registers and boots up all background jobs
func (s *Scheduler) Start() {
	// Job 1: Auto Terminate expired contracts every night at 23:59
	_, err := s.cron.AddFunc("59 23 * * *", s.TerminateExpiredContracts)
	if err != nil {
		log.Fatalf("Failed to register job TerminateExpiredContracts: %v", err)
	}

	// Job 2: Prepare Monthly Payroll Drafts on the 25th of every month at midnight
	_, err = s.cron.AddFunc("0 0 25 * *", s.DraftMonthlyPayroll)
	if err != nil {
		log.Fatalf("Failed to register job DraftMonthlyPayroll: %v", err)
	}

	s.cron.Start()
	log.Println("Background Jobs Scheduler started successfully.")
}

func (s *Scheduler) TerminateExpiredContracts() {
	// In reality context, this checks `EndDate` inside EmploymentContract 
	// against time.Now() and updates Employee Status to 'Terminated'
	log.Println("[CRON] Running daily check for expired employee contracts...")
	// var contracts []domain.EmploymentContract
	// s.db.Where("end_date <= ? AND status = ?", time.Now(), "Active").Find(&contracts)
	// Update statuses...
}

func (s *Scheduler) DraftMonthlyPayroll() {
	log.Println("[CRON] Generating Draft Payrolls for the upcoming cycle...")
}
