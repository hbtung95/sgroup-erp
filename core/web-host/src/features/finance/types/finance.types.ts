export interface FinanceAccount {
  id: string;
  accountCode: string;
  accountName: string;
  accountType: 'CASH' | 'BANK' | 'EPAY';
  bankName?: string;
  bankNumber?: string;
  initialBalance: number;
  currentBalance: number;
  currency: string;
  status: 'ACTIVE' | 'INACTIVE';
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FinanceCategory {
  id: string;
  categoryCode: string;
  categoryName: string;
  type: 'INCOME' | 'EXPENSE';
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FinanceTransaction {
  id: string;
  transactionCode: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  currency: string;
  
  accountId: string;
  account?: FinanceAccount;
  
  categoryId: string;
  category?: FinanceCategory;
  
  dealId?: string;
  projectId?: string;
  customerId?: string;
  staffId?: string;
  
  payerName?: string;
  receiverName?: string;
  
  paymentMethod: 'CASH' | 'BANK_TRANSFER';
  paymentDate: string;
  
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  
  approvedBy?: string;
  approvedAt?: string;
  documentUrl?: string;
  note?: string;
  
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface DebtRecord {
  id: string;
  debtCode: string;
  debtType: 'RECEIVABLE_CUSTOMER' | 'RECEIVABLE_DEVELOPER' | 'PAYABLE_STAFF';
  
  customerId?: string;
  projectId?: string;
  staffId?: string;
  dealId?: string;
  
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  
  dueDate?: string;
  status: 'UNPAID' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  
  note?: string;
  createdAt: string;
  updatedAt: string;
  
  transactionId?: string;
  transaction?: FinanceTransaction;
}
