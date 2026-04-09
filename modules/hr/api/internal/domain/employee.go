package domain

import (
	"time"
)

// Employee represents a person working for the company.
type Employee struct {
	ID           uint       `gorm:"primaryKey" json:"id"`
	Code         string     `gorm:"size:50;uniqueIndex;not null" json:"code"` // Employee Code (Mã nhân viên)
	FirstName    string     `gorm:"size:100;not null" json:"first_name"`
	LastName     string     `gorm:"size:100;not null" json:"last_name"`
	FullName     string     `gorm:"size:200" json:"full_name"`
	Email        string     `gorm:"size:255;uniqueIndex;not null" json:"email"`
	Phone        string     `gorm:"size:50" json:"phone"`
	IdentityCard string     `gorm:"size:50;uniqueIndex" json:"identity_card"` // CMND/CCCD
	DateOfBirth  *time.Time `json:"date_of_birth"`
	Gender       string     `gorm:"size:10" json:"gender"` // Male, Female, Other
	Address      string     `gorm:"type:text" json:"address"`
	AvatarURL    string     `gorm:"size:500" json:"avatar_url"`

	// Job Information
	DepartmentID *uint       `json:"department_id"`
	Department   *Department `gorm:"foreignKey:DepartmentID" json:"department,omitempty"`
	PositionID   *uint       `json:"position_id"`
	Position     *Position   `gorm:"foreignKey:PositionID" json:"position,omitempty"`

	// Status (e.g., Active, OnLeave, Terminated)
	Status    string     `gorm:"size:50;default:'Active'" json:"status"`
	JoinDate  *time.Time `json:"join_date"`
	LeaveDate *time.Time `json:"leave_date"`

	// Manager
	ManagerID *uint     `json:"manager_id"`
	Manager   *Employee `gorm:"foreignKey:ManagerID" json:"manager,omitempty"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// TableName overrides the table name
func (Employee) TableName() string {
	return "hr_employees"
}
