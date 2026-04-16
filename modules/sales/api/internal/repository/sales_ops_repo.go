package repository

import (
	"github.com/vctplatform/sgroup-erp/modules/sales/api/internal/model"
	"gorm.io/gorm"
)

type SalesOpsRepository interface {
	// Deals
	GetDeals(filters map[string]interface{}) ([]model.SalesDeal, error)
	GetDealByID(id string) (*model.SalesDeal, error)
	CreateDeal(deal *model.SalesDeal) error
	UpdateDeal(id string, updates map[string]interface{}) error

	// Bookings
	GetBookings(filters map[string]interface{}) ([]model.SalesBooking, error)
	GetBookingByID(id string) (*model.SalesBooking, error)
	CreateBooking(booking *model.SalesBooking) error
	UpdateBooking(id string, updates map[string]interface{}) error

	// Deposits
	GetDeposits(filters map[string]interface{}) ([]model.SalesDeposit, error)
	GetDepositByID(id string) (*model.SalesDeposit, error)
	CreateDeposit(deposit *model.SalesDeposit) error
	UpdateDeposit(id string, updates map[string]interface{}) error

	// Activities
	CreateActivity(activity *model.SalesActivity) error

	// targets
	GetTargets(filters map[string]interface{}) ([]model.SalesTarget, error)
	UpsertTarget(target *model.SalesTarget) error
	
	// Staff / Projects
	GetStaffByCode(code string) (*model.SalesStaff, error)
	CreateStaff(staff *model.SalesStaff) error
	GetProjectByIDOrName(id string, name string) (*model.DimProject, error)
}

type salesOpsRepository struct {
	db *gorm.DB
}

func NewSalesOpsRepository(db *gorm.DB) SalesOpsRepository {
	return &salesOpsRepository{db: db}
}

// Deals
func (r *salesOpsRepository) GetDeals(filters map[string]interface{}) ([]model.SalesDeal, error) {
	var deals []model.SalesDeal
	query := r.db.Model(&model.SalesDeal{})
	
	for k, v := range filters {
		if v != nil && v != "" && v != 0 {
			query = query.Where(k+" = ?", v)
		}
	}
	
	err := query.Order("created_at desc").Find(&deals).Error
	return deals, err
}

func (r *salesOpsRepository) GetDealByID(id string) (*model.SalesDeal, error) {
	var deal model.SalesDeal
	if err := r.db.First(&deal, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &deal, nil
}

func (r *salesOpsRepository) CreateDeal(deal *model.SalesDeal) error {
	return r.db.Create(deal).Error
}

func (r *salesOpsRepository) UpdateDeal(id string, updates map[string]interface{}) error {
	return r.db.Model(&model.SalesDeal{}).Where("id = ?", id).Updates(updates).Error
}

// Bookings
func (r *salesOpsRepository) GetBookings(filters map[string]interface{}) ([]model.SalesBooking, error) {
	var bookings []model.SalesBooking
	query := r.db.Model(&model.SalesBooking{})

	for k, v := range filters {
		if v != nil && v != "" && v != 0 {
			query = query.Where(k+" = ?", v)
		}
	}
	
	err := query.Order("booking_date desc").Find(&bookings).Error
	return bookings, err
}

func (r *salesOpsRepository) GetBookingByID(id string) (*model.SalesBooking, error) {
	var booking model.SalesBooking
	if err := r.db.First(&booking, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &booking, nil
}

func (r *salesOpsRepository) CreateBooking(booking *model.SalesBooking) error {
	return r.db.Create(booking).Error
}

func (r *salesOpsRepository) UpdateBooking(id string, updates map[string]interface{}) error {
	return r.db.Model(&model.SalesBooking{}).Where("id = ?", id).Updates(updates).Error
}

// Deposits
func (r *salesOpsRepository) GetDeposits(filters map[string]interface{}) ([]model.SalesDeposit, error) {
	var deposits []model.SalesDeposit
	query := r.db.Model(&model.SalesDeposit{})

	for k, v := range filters {
		if v != nil && v != "" && v != 0 {
			query = query.Where(k+" = ?", v)
		}
	}
	
	err := query.Order("deposit_date desc").Find(&deposits).Error
	return deposits, err
}

func (r *salesOpsRepository) GetDepositByID(id string) (*model.SalesDeposit, error) {
	var deposit model.SalesDeposit
	if err := r.db.First(&deposit, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &deposit, nil
}

func (r *salesOpsRepository) CreateDeposit(deposit *model.SalesDeposit) error {
	return r.db.Create(deposit).Error
}

func (r *salesOpsRepository) UpdateDeposit(id string, updates map[string]interface{}) error {
	return r.db.Model(&model.SalesDeposit{}).Where("id = ?", id).Updates(updates).Error
}

// Activities
func (r *salesOpsRepository) CreateActivity(activity *model.SalesActivity) error {
	return r.db.Create(activity).Error
}

// Targets
func (r *salesOpsRepository) GetTargets(filters map[string]interface{}) ([]model.SalesTarget, error) {
	var targets []model.SalesTarget
	query := r.db.Model(&model.SalesTarget{})
	
	for k, v := range filters {
		if v != nil && v != "" && v != 0 {
			query = query.Where(k+" = ?", v)
		}
	}
	
	err := query.Find(&targets).Error
	return targets, err
}

func (r *salesOpsRepository) UpsertTarget(target *model.SalesTarget) error {
	var existing model.SalesTarget
	err := r.db.Where("year = ? AND month = ? AND team_id = ? AND staff_id = ? AND scenario_key = ?", 
		target.Year, target.Month, target.TeamID, target.StaffID, target.ScenarioKey).First(&existing).Error
		
	if err == nil {
		target.ID = existing.ID
		return r.db.Save(target).Error
	}
	return r.db.Create(target).Error
}

// Common
func (r *salesOpsRepository) GetStaffByCode(code string) (*model.SalesStaff, error) {
	var staff model.SalesStaff
	err := r.db.Where("employee_code = ?", code).First(&staff).Error
	if err != nil {
		return nil, err
	}
	return &staff, nil
}

func (r *salesOpsRepository) CreateStaff(staff *model.SalesStaff) error {
	return r.db.Create(staff).Error
}

func (r *salesOpsRepository) GetProjectByIDOrName(id string, name string) (*model.DimProject, error) {
	var project model.DimProject
	query := r.db.Model(&model.DimProject{})
	
	if id != "" {
		query = query.Where("id = ?", id)
	} else if name != "" {
		query = query.Where("name = ?", name)
	} else {
		return nil, gorm.ErrRecordNotFound
	}
	
	err := query.First(&project).Error
	return &project, err
}
