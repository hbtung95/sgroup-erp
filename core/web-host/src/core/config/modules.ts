export type ErpModuleId =
  | "exec"
  | "biz"
  | "mkt"
  | "agency"
  | "shomes"
  | "project"
  | "hr"
  | "finance"
  | "legal"
  | "admin";

export type UserRole = "admin" | "hr" | "employee";

export interface ErpModuleDefinition {
  id: ErpModuleId;
  name: string;
  description: string;
  routeName?: string;
}

export const ERP_MODULES: ErpModuleDefinition[] = [
  {
    id: "exec",
    name: "Ban điều hành",
    description: "KPI chiến lược, Báo cáo tổng thể",
    routeName: "BDHModule",
  },
  {
    id: "biz",
    name: "Kinh doanh",
    description: "Quản lý CRM, Giỏ hàng, Giao dịch",
    routeName: "SalesModule",
  },
  {
    id: "mkt",
    name: "Marketing",
    description: "Chiến dịch, Lead, Ngân sách",
    routeName: "MarketingModule",
  },
  {
    id: "agency",
    name: "Đại lý",
    description: "Mạng lưới F1/F2, Chính sách",
    routeName: "AgencyModule",
  },
  {
    id: "shomes",
    name: "S-Homes",
    description: "Quản trị dịch vụ nhà ở toàn diện",
    routeName: "SHomesModule",
  },
  {
    id: "project",
    name: "Dự án",
    description: "Thông tin rổ hàng, Tài liệu dự án",
    routeName: "ProjectModule",
  },
  {
    id: "hr",
    name: "Nhân sự",
    description: "Tuyển dụng, Đào tạo, Lương thưởng",
    routeName: "HRModule",
  },
  {
    id: "finance",
    name: "Tài chính & Kế toán",
    description: "Dòng tiền, Công nợ, Đối soát",
    routeName: "FinanceModule",
  },
  {
    id: "legal",
    name: "Pháp lý & Hồ sơ",
    description: "Pháp lý dự án, Hợp đồng",
    routeName: "LegalModule",
  },
  {
    id: "admin",
    name: "Quản trị Hệ thống",
    description: "Cấu hình tổ chức, Phân quyền",
    routeName: "AdminModule",
  },
];

export const ALL_MODULE_IDS = ERP_MODULES.map((moduleItem) => moduleItem.id);

export const ERP_MODULE_NAME_MAP: Record<ErpModuleId, string> = ERP_MODULES.reduce(
  (acc, moduleItem) => {
    acc[moduleItem.id] = moduleItem.name;
    return acc;
  },
  {} as Record<ErpModuleId, string>
);

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Quản trị viên",
  hr: "Quản lý nhân sự",
  employee: "Nhân viên",
};
