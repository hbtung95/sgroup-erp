export const MOCK_DELAY = 400;

const DEPARTMENTS = [
  { id: '1', name: 'Kinh Doanh', code: 'SALES', _count: { employees: 120 }, manager: { fullName: 'Ngô Việt' } },
  { id: '2', name: 'Marketing', code: 'MKT', _count: { employees: 25 }, manager: { fullName: 'Lê Hương' } },
  { id: '3', name: 'Nhân Sự', code: 'HR', _count: { employees: 15 }, manager: { fullName: 'Nguyễn Hoàng Oanh' } },
  { id: '4', name: 'Tài Chính Kế Toán', code: 'FIN', _count: { employees: 10 }, manager: { fullName: 'Trần Kế' } },
  { id: '5', name: 'Dự Án', code: 'PRJ', _count: { employees: 45 }, manager: { fullName: 'Phạm Huỳnh' } },
  { id: '6', name: 'Đại Lý', code: 'AGC', _count: { employees: 80 }, manager: { fullName: 'Lý Quốc' } },
  { id: '7', name: 'Hồ Sơ Thủ Tục', code: 'DOC', _count: { employees: 20 }, manager: { fullName: 'Trịnh Thanh' } }
];

const POSITIONS = [
  { id: '1', name: 'Giám đốc', code: 'DIR', level: 'Director' },
  { id: '2', name: 'Trưởng phòng', code: 'MGR', level: 'Manager' },
  { id: '3', name: 'Trưởng nhóm', code: 'LEAD', level: 'Leader' },
  { id: '4', name: 'Chuyên viên cao cấp', code: 'SNR', level: 'Senior' },
  { id: '5', name: 'Nhân viên', code: 'STF', level: 'Staff' }
];

const TEAMS = [
  { id: '1', name: 'Team Alpha', code: 'PRJ-A', departmentId: '5', _count: { employees: 12 } },
  { id: '2', name: 'Team Beta', code: 'PRJ-B', departmentId: '5', _count: { employees: 10 } },
  { id: '3', name: 'BD Zone 1', code: 'SALES-Z1', departmentId: '1', _count: { employees: 50 } },
  { id: '4', name: 'Content Creator', code: 'MKT-CC', departmentId: '2', _count: { employees: 8 } }
];

const EMPLOYEES = [
  {
    id: '1', fullName: 'Huỳnh Bảo Tuân', englishName: 'Tuan Huynh Bao', employeeCode: 'SGR-001',
    phone: '0901234567', email: 'tuan.hb@sgroup.vn', level: 'Director',
    department: { id: '5', name: 'Dự Án', code: 'PRJ' }, departmentId: '5',
    position: { id: '1', name: 'Giám đốc' }, positionId: '1',
    createdAt: '2023-01-10', startDate: '2023-03-15', employmentType: 'Toàn thời gian',
    officialSalary: 35000000, status: 'ACTIVE', gender: 'male', avatarUrl: 'https://i.pravatar.cc/150?u=1'
  },
  {
    id: '2', fullName: 'Nguyễn Hoàng Oanh', englishName: 'Oanh Nguyen Hoang', employeeCode: 'SGR-002',
    phone: '0987654321', email: 'oanh.nh@sgroup.vn', level: 'Manager',
    department: { id: '3', name: 'Nhân Sự', code: 'HR' }, departmentId: '3',
    position: { id: '2', name: 'Trưởng phòng' }, positionId: '2', directManager: 'Huỳnh Bảo Tuân',
    createdAt: '2022-06-01', startDate: '2022-08-01', employmentType: 'Toàn thời gian',
    officialSalary: 28000000, status: 'ACTIVE', gender: 'female', avatarUrl: 'https://i.pravatar.cc/150?u=2'
  },
  {
    id: '3', fullName: 'Trần Minh Khôi', englishName: 'Khoi Tran Minh', employeeCode: 'SGR-003',
    phone: '0976543210', email: 'khoi.tm@sgroup.vn', level: 'Senior',
    department: { id: '1', name: 'Kinh Doanh', code: 'SALES' }, departmentId: '1',
    team: { id: '3', name: 'BD Zone 1' }, teamId: '3',
    position: { id: '4', name: 'Chuyên viên cao cấp' }, positionId: '4', directManager: 'Ngô Việt',
    createdAt: '2024-01-15', startDate: '2024-03-15', employmentType: 'Toàn thời gian',
    officialSalary: 18000000, status: 'ACTIVE', gender: 'male', avatarUrl: 'https://i.pravatar.cc/150?u=3'
  },
  {
    id: '4', fullName: 'Lê Thị Hồng Nhung', englishName: 'Nhung Le Thi Hong', employeeCode: 'SGR-004',
    phone: '0965432109', email: 'nhung.lth@sgroup.vn', level: 'Staff',
    department: { id: '2', name: 'Marketing', code: 'MKT' }, departmentId: '2',
    team: { id: '4', name: 'Content Creator' }, teamId: '4',
    position: { id: '5', name: 'Nhân viên' }, positionId: '5', directManager: 'Lê Hương',
    createdAt: '2025-06-01', startDate: '2025-08-01', employmentType: 'Thử việc',
    probationSalary: 8000000, officialSalary: 12000000, status: 'PROBATION', gender: 'female', avatarUrl: 'https://i.pravatar.cc/150?u=4'
  },
  {
    id: '5', fullName: 'Trần Đại Kế', englishName: 'Ke Tran Dai', employeeCode: 'SGR-005',
    phone: '0954321098', email: 'ke.td@sgroup.vn', level: 'Manager',
    department: { id: '4', name: 'Tài Chính Kế Toán', code: 'FIN' }, departmentId: '4',
    position: { id: '2', name: 'Kế toán trưởng' }, positionId: '2',
    createdAt: '2023-05-15', startDate: '2023-06-01', employmentType: 'Toàn thời gian',
    officialSalary: 25000000, status: 'ACTIVE', gender: 'male', avatarUrl: 'https://i.pravatar.cc/150?u=5'
  },
  {
    id: '6', fullName: 'Phạm Thái Huỳnh', englishName: 'Huynh Pham Thai', employeeCode: 'SGR-006',
    phone: '0943210987', email: 'huynh.pt@sgroup.vn', level: 'Manager',
    department: { id: '5', name: 'Dự Án', code: 'PRJ' }, departmentId: '5',
    team: { id: '1', name: 'Team Alpha' }, teamId: '1',
    position: { id: '2', name: 'Quản lý Dự án' }, positionId: '2', directManager: 'Huỳnh Bảo Tuân',
    createdAt: '2024-08-10', startDate: '2024-09-01', employmentType: 'Toàn thời gian',
    officialSalary: 22000000, status: 'ON_LEAVE', gender: 'male', avatarUrl: 'https://i.pravatar.cc/150?u=6'
  }
];

const CONTRACTS = [
  { id: '1', employeeId: '1', employeeName: 'Huỳnh Bảo Tuân', contractNo: 'SGR-HDLD-001', type: 'Không xác định thời hạn', status: 'ACTIVE', startDate: '2023-03-15', endDate: '2099-12-31' },
  { id: '2', employeeId: '2', employeeName: 'Nguyễn Hoàng Oanh', contractNo: 'SGR-HDLD-002', type: 'Có thời hạn 3 năm', status: 'ACTIVE', startDate: '2022-08-01', endDate: '2025-07-31' },
  { id: '3', employeeId: '4', employeeName: 'Lê Thị Hồng Nhung', contractNo: 'SGR-HDTV-001', type: 'Thử việc 2 tháng', status: 'PROBATION', startDate: '2025-08-01', endDate: '2025-09-30' },
];

const ATTENDANCE = [
  { id: '1', employee: EMPLOYEES[0], check_in: '2026-04-14T08:05:00Z', check_out: '2026-04-14T17:35:00Z', status: 'ON_TIME' },
  { id: '2', employee: EMPLOYEES[1], check_in: '2026-04-14T08:12:00Z', check_out: '2026-04-14T17:40:00Z', status: 'LATE' },
  { id: '3', employee: EMPLOYEES[2], check_in: '2026-04-14T08:00:00Z', check_out: null, status: 'WORKING' },
  { id: '4', employee: EMPLOYEES[3], check_in: '2026-04-14T07:55:00Z', check_out: '2026-04-14T17:30:00Z', status: 'ON_TIME' },
];

const LEAVES = [
  { id: '1', employee: EMPLOYEES[2], leaveType: 'ANNUAL', startDate: '2026-04-20', endDate: '2026-04-21', totalDays: 2, status: 'APPROVED', reason: 'Về quê giải quyết việc gia đình', approver: 'Ngô Việt' },
  { id: '2', employee: EMPLOYEES[3], leaveType: 'SICK', startDate: '2026-04-25', endDate: '2026-04-25', totalDays: 1, status: 'PENDING', reason: 'Sốt xuất huyết', approver: null },
  { id: '3', employee: EMPLOYEES[5], leaveType: 'MATERNITY', startDate: '2026-01-01', endDate: '2026-06-30', totalDays: 180, status: 'APPROVED', reason: 'Nghỉ thai sản theo chế độ', approver: 'Huỳnh Bảo Tuân' }
];

const LEAVE_BALANCES = [
  { employee: EMPLOYEES[0], year: 2026, totalDays: 14, usedDays: 4, remainingDays: 10 },
  { employee: EMPLOYEES[1], year: 2026, totalDays: 16, usedDays: 2, remainingDays: 14 },
  { employee: EMPLOYEES[2], year: 2026, totalDays: 12, usedDays: 8, remainingDays: 4 },
  { employee: EMPLOYEES[3], year: 2026, totalDays: 12, usedDays: 0, remainingDays: 12 },
];

const PAYROLL = {
  runs: [
    { id: '1', cycleDate: '2026-03-01', period: 'Tháng 03/2026', totalEmployees: 154, totalGross: 3250000000, totalNet: 2850000000, status: 'PAID' },
    { id: '2', cycleDate: '2026-04-01', period: 'Tháng 04/2026', totalEmployees: 156, totalGross: 3310000000, totalNet: 2900000000, status: 'DRAFT' }
  ],
  payslips_1: [
    { id: 'PS-001', employee: EMPLOYEES[0], base_salary: 35000000, allowances: 5000000, deductions: 4000000, net_salary: 36000000, status: 'PAID', paidDays: 22 },
    { id: 'PS-002', employee: EMPLOYEES[1], base_salary: 28000000, allowances: 2500000, deductions: 3000000, net_salary: 27500000, status: 'APPROVED', paidDays: 22 },
    { id: 'PS-003', employee: EMPLOYEES[2], base_salary: 18000000, allowances: 1000000, deductions: 1500000, net_salary: 17500000, status: 'PENDING', paidDays: 21 },
    { id: 'PS-004', employee: EMPLOYEES[3], base_salary: 12000000, allowances: 500000, deductions: 1000000, net_salary: 11500000, status: 'PENDING', paidDays: 22 },
  ]
};

const PERFORMANCE = [
  { id: '1', employee: EMPLOYEES[2], reviewPeriod: 'Q1-2026', reviewer: 'Ngô Việt', overallScore: 92, grade: 'A', status: 'COMPLETED', comments: 'Hoàn thành xuất sắc chỉ tiêu doanh số 110%.' },
  { id: '2', employee: EMPLOYEES[3], reviewPeriod: 'Probation', reviewer: 'Lê Hương', overallScore: 85, grade: 'B', status: 'IN_PROGRESS', comments: 'Cần cải thiện kỹ năng chạy ads Facebook.' },
];

const RECRUITMENT = {
  jobs: [
    { id: '1', title: 'Senior Backend Go', department: 'Dự Án', vacancies: 2, hired: 0, status: 'OPEN', deadline: '2026-05-15' },
    { id: '2', title: 'Marketing Executive', department: 'Marketing', vacancies: 1, hired: 1, status: 'CLOSED', deadline: '2026-03-01' }
  ],
  candidates: [
    { id: '1', jobId: '1', name: 'Phạm Văn C', email: 'phamvanc@gmail.com', phone: '0933111222', stage: 'PHỎNG VẤN T2', source: 'LinkedIn', score: 85 },
    { id: '2', jobId: '1', name: 'Hoàng Thị D', email: 'hoangthid@gmail.com', phone: '0944111333', stage: 'SÀNG LỌC CV', source: 'TopCV', score: null },
  ]
};

const TRAINING = {
  courses: [
    { id: '1', name: 'Kỹ năng Đàm phán 101', instructor: 'Ngô Việt', startDate: '2026-05-10', endDate: '2026-05-12', status: 'UPCOMING', capacity: 20 },
    { id: '2', name: 'Hội nhập Nhân viên Mới', instructor: 'Nguyễn Hoàng Oanh', startDate: '2026-04-05', endDate: '2026-04-06', status: 'COMPLETED', capacity: 15 }
  ],
  trainees: [
    { id: '1', courseId: '1', employeeId: '3', employeeName: 'Trần Minh Khôi', status: 'ENROLLED' },
    { id: '2', courseId: '2', employeeId: '4', employeeName: 'Lê Thị Hồng Nhung', status: 'PASSED' },
  ]
};

const OVERTIME = [
  { id: '1', employee: EMPLOYEES[2], date: '2026-04-12', hours: 2.5, type: 'Ngày thường', reason: 'Xử lý hợp đồng dự án gấp', status: 'APPROVED', approver: 'Ngô Việt' },
  { id: '2', employee: EMPLOYEES[0], date: '2026-04-11', hours: 4, type: 'Cuối tuần', reason: 'Bảo trì hệ thống server', status: 'PENDING', approver: null }
];

const POLICIES = [
  { id: '1', code: 'POL-01', title: 'Quy định Thời gian làm việc', category: 'Nội quy', effectiveDate: '2023-01-01', status: 'ACTIVE' },
  { id: '2', code: 'POL-02', title: 'Quy chế Thưởng KPI theo Quý', category: 'Chế độ đãi ngộ', effectiveDate: '2024-01-01', status: 'ACTIVE' },
];

const BENEFITS = [
  { id: '1', name: 'Bảo hiểm Sức khỏe PVI Care (VIP)', type: 'Bảo hiểm', value: 15000000, recipientCount: 15 },
  { id: '2', name: 'Trợ cấp ăn trưa', type: 'Trợ cấp', value: 1000000, recipientCount: 156 },
];

const TRANSFERS = [
  { id: '1', employeeId: '4', employeeName: 'Lê Thị Hồng Nhung', type: 'TEAM', from: 'MKT-General', to: 'MKT-CC', effectiveDate: '2026-02-01', status: 'COMPLETED' }
];

export const mockHRData = {
  getDashboard: {
    totalEmployees: 156, activeEmployees: 142, probationEmployees: 14, pendingLeaves: 5,
    departmentCount: 7, onLeaveCount: 12
  },
  getDepartments: { data: DEPARTMENTS },
  getPositions: { data: POSITIONS },
  getTeams: { data: TEAMS },
  getEmployees: { data: EMPLOYEES, meta: { total: EMPLOYEES.length, page: 1, limit: 50 } },
  getEmployee: EMPLOYEES[0], // fallback
  getContracts: { data: CONTRACTS, meta: { total: CONTRACTS.length, page: 1, limit: 50 } },
  getAttendance: { data: ATTENDANCE, meta: { total: ATTENDANCE.length, page: 1, limit: 50 } },
  getLeaves: { data: LEAVES, meta: { total: LEAVES.length, page: 1, limit: 50 } },
  getLeaveBalances: { data: LEAVE_BALANCES },
  getLeaveBalance: LEAVE_BALANCES[0],
  getPayroll: { runs: PAYROLL.runs, payslips: PAYROLL.payslips_1 }, // Special mapping in api
  getPerformance: { data: PERFORMANCE, meta: { total: PERFORMANCE.length } },
  getJobs: { data: RECRUITMENT.jobs },
  getCandidates: { data: RECRUITMENT.candidates },
  getCourses: { data: TRAINING.courses },
  getTrainees: { data: TRAINING.trainees },
  getOvertime: { data: OVERTIME, meta: { total: OVERTIME.length } },
  getPolicies: { data: POLICIES },
  getBenefits: { data: BENEFITS },
  getTransfers: { data: TRANSFERS },
  getDashboardEvents: {
    data: [
      { type: 'birthday', date: 'Hôm nay 15/04', name: 'Nguyễn Hoàng Oanh', desc: 'Sinh nhật', role: 'Trưởng phòng HR' },
      { type: 'anniversary', date: 'Ngày mai 16/04', name: 'Huỳnh Bảo Tuân', desc: 'Kỷ niệm 1 năm làm việc', role: 'Giám đốc Công nghệ' }
    ]
  },
  getDashboardActivities: {
    data: [
      { id: 1, title: 'Bổ nhiệm Kế toán trưởng', time: 'Vừa xong', detail: 'Ông Trần Đại Kế chính thức đảm nhiệm vị trí Kế toán trưởng.', tone: '#8b5cf6' },
      { id: 2, title: 'Tuyển dụng', time: '2 giờ trước', detail: 'Hồ sơ ứng viên Backend Go đã được nhận.', tone: '#22c55e' }
    ]
  }
};

export function mockRespond<T>(data: T): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(data), MOCK_DELAY));
}
