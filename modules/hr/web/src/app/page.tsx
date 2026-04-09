"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, ClientSideRowModelModule, ValidationModule } from 'ag-grid-community';
import { Users, Filter, Download, Plus, RefreshCw } from 'lucide-react';
import axios from 'axios';
import EmployeeDrawer from '../components/EmployeeDrawer';

// Setup ag-grid modules
ModuleRegistry.registerModules([ClientSideRowModelModule, ValidationModule]);

const API_BASE_URL = 'http://localhost:8080/api/hr/v1';

export default function HRAdminDashboard() {
  const [rowData, setRowData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Fetch true data from backend
  const fetchEmployees = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/employees`);
      
      // Formatting the raw nested data to flat data for Ag-Grid
      const formattedData = response.data.data.map((emp: any) => ({
        id: emp.id,
        code: emp.code,
        name: `${emp.last_name} ${emp.first_name}`,
        dept: emp.department?.name || 'Chưa Xếp Phòng',
        pos: emp.position?.title || 'Chưa Xếp Hạng',
        status: emp.status,
        salary: '15,000,000', // Hardcoded temporarily until Payroll Engine API is built
      }));
      
      setRowData(formattedData);
    } catch (error) {
      console.error("Failed to fetch employees", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleSaveEmployee = async (data: any) => {
    try {
      await axios.post(`${API_BASE_URL}/employees`, data);
      setIsDrawerOpen(false);
      fetchEmployees(); // Refresh the grid
    } catch (error) {
      console.error("Failed to create employee", error);
      alert("Lỗi khi tạo nhân viên!");
    }
  };

  // Column Definitions
  const colDefs = useMemo(() => [
    { field: "code", headerName: "Employee ID", pinned: "left", width: 140 },
    { field: "name", headerName: "Full Name", flex: 1, minWidth: 200 },
    { field: "dept", headerName: "Department", filter: true, width: 150 },
    { field: "pos", headerName: "Position", filter: true, width: 220 },
    { 
      field: "status", 
      headerName: "Status", 
      width: 120,
      cellRenderer: (params: any) => {
        const color = params.value === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400';
        return `<span class="px-2 py-1 rounded-full text-xs font-medium ${color} border border-white/5 backdrop-blur-sm">${params.value}</span>`;
      }
    },
    { field: "salary", headerName: "Base Salary (VND)", filter: "agNumberColumnFilter", width: 180, headerClass: 'text-right', cellClass: 'text-right font-mono' },
  ], []);

  const defaultColDef = useMemo(() => ({
    sortable: true,
    resizable: true,
  }), []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 font-sans antialiased bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(30,58,138,0.3),rgba(2,6,23,1))]">
      {/* Header Container - Neo Glassmorphism */}
      <div className="mb-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-6 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-400" />
            Core HR Data Center
          </h1>
          <p className="text-slate-400 mt-2 text-sm">Advanced Bulk Processing & Employee Master Data Management (Back-office Only)</p>
        </div>

        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-sm font-medium border border-white/5 transition-all">
            <Filter className="w-4 h-4" /> Filter Views
          </button>
          <button 
            onClick={fetchEmployees}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-sm font-medium border border-emerald-500/20 transition-all">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all"
          >
            <Plus className="w-4 h-4" /> Add Record
          </button>
        </div>
      </div>

      {/* Grid Container */}
      <div className="rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-slate-900/50 backdrop-blur-md h-[calc(100vh-200px)] relative">
        {isLoading && (
          <div className="absolute inset-0 z-10 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center">
            <div className="animate-spin text-blue-500"><RefreshCw className="w-8 h-8" /></div>
          </div>
        )}
        <div className="ag-theme-alpine-dark h-full w-full custom-ag-grid">
          <AgGridReact
            rowData={rowData}
            columnDefs={colDefs}
            defaultColDef={defaultColDef}
            rowSelection="multiple"
            pagination={true}
            paginationPageSize={50}
            enableCellTextSelection={true}
          />
        </div>
      </div>

      {/* Employee Creation Drawer */}
      <EmployeeDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        onSave={handleSaveEmployee} 
      />
    </div>
  );
}
