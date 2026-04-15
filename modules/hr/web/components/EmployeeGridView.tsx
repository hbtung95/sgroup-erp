import React, { useCallback } from 'react';
import { Employee } from '../types';
import { EmployeeCard } from './EmployeeCard';
// If routing is handled differently (e.g. useNavigate), it should be injected or handled cleanly.
// Since original code uses window.location.hash, I am wrapping it in a useCallback.

export interface EmployeeGridViewProps {
  employees: Employee[];
  canEdit: boolean;
  onEdit: (employee: Employee) => void;
}

export const EmployeeGridView: React.FC<EmployeeGridViewProps> = ({ employees, canEdit, onEdit }) => {
  // Extract click logic out of the map for better performance and maintainability 
  const handleViewProfile = useCallback((employee: Employee) => {
    window.location.hash = `hr_profile?id=${employee.id}`;
  }, []);

  if (!employees?.length) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-sg-muted" role="status">
        Mảng dữ liệu nhân viên trống.
      </div>
    );
  }

  return (
    <div 
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
      role="list"
      aria-label="Danh sách nhân viên"
    >
      {employees.map((staff) => (
        <EmployeeCard
          key={staff.id}
          staff={staff}
          canEdit={canEdit}
          onEdit={onEdit}
          onClick={handleViewProfile}
        />
      ))}
    </div>
  );
};

EmployeeGridView.displayName = 'EmployeeGridView';
