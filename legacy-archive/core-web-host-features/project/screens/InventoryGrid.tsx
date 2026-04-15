import React, { useState, useMemo, useCallback } from 'react';
import { useProjects, useInventory } from '../hooks/useProjects';
import { productApi } from '../api/projectApi';
import type { REProduct } from '../types';

import {
  InventoryFilter,
  InventoryFiltersType,
  FloorPlanView,
  UnitGridView,
  UnitDrawer,
  LockModal,
  BulkActionBar
} from '../components/inventory';

export function InventoryGrid() {
  const { data: inventory = [], refetch } = useInventory();
  const { data: projects = [] } = useProjects();
  
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'floor'>('grid');
  const [hoveredUnit, setHoveredUnit] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<InventoryFiltersType>({
    search: '',
    statusFilter: 'ALL',
    projectFilter: 'ALL',
    directionFilter: 'ALL',
    bedroomFilter: 'ALL',
    minPrice: '',
    maxPrice: '',
    minArea: '',
    maxArea: '',
  });

  const [lockModalOpen, setLockModalOpen] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<REProduct | null>(null);
  const [selectedMulti, setSelectedMulti] = useState<string[]>([]);

  const toggleMultiSelect = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedMulti(prev => prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id]);
  }, []);

  const handleAction = useCallback(async (id: string, action: 'lock' | 'unlock' | 'deposit' | 'sold', payload?: any) => {
    setActionLoadingId(id);
    setMenuOpen(null);
    try {
      if (action === 'lock') {
         await productApi.lock(id, { bookedBy: 'Admin', ...payload });
         setLockModalOpen(null);
      }
      else if (action === 'unlock') await productApi.unlock(id, 'Admin', true);
      else if (action === 'deposit') await productApi.deposit(id, 'Admin');
      else if (action === 'sold') await productApi.sold(id, 'Admin');
      await refetch();
    } catch (err: any) {
      alert(err.message || 'Thao tác thất bại');
    } finally {
      setActionLoadingId(null);
    }
  }, [refetch]);

  const handleBulkAction = useCallback(async (action: 'lock' | 'unlock', payload?: any) => {
    if (selectedMulti.length === 0) return;
    setActionLoadingId('bulk');
    try {
      if (action === 'lock') {
        await productApi.bulkLock(selectedMulti, { bookedBy: 'Admin', ...payload });
        setLockModalOpen(null);
      } else if (action === 'unlock') {
        await productApi.bulkUnlock(selectedMulti, 'Admin', true);
      }
      setSelectedMulti([]);
      await refetch();
    } catch (err: any) {
      alert(err.message || 'Thao tác hàng loạt thất bại');
    } finally {
      setActionLoadingId(null);
    }
  }, [selectedMulti, refetch]);

  const filtered = useMemo(() => inventory.filter(inv => {
    const matchSearch = inv.code.toLowerCase().includes(filters.search.toLowerCase());
    const matchStatus = filters.statusFilter === 'ALL' || inv.status === filters.statusFilter;
    const matchProj = filters.projectFilter === 'ALL' || inv.projectId === filters.projectFilter;
    const matchDir = filters.directionFilter === 'ALL' || inv.direction === filters.directionFilter;
    const matchBed = filters.bedroomFilter === 'ALL' || inv.bedrooms.toString() === filters.bedroomFilter;
    const invPriceB = inv.price / 1000000000;
    const matchMinPrice = filters.minPrice === '' || invPriceB >= Number(filters.minPrice);
    const matchMaxPrice = filters.maxPrice === '' || invPriceB <= Number(filters.maxPrice);
    const matchMinArea = filters.minArea === '' || inv.area >= Number(filters.minArea);
    const matchMaxArea = filters.maxArea === '' || inv.area <= Number(filters.maxArea);
    
    return matchSearch && matchStatus && matchProj && matchDir && matchBed && matchMinPrice && matchMaxPrice && matchMinArea && matchMaxArea;
  }), [inventory, filters]);

  const stats = useMemo(() => ({
    total: inventory.length,
    avail: inventory.filter(u => u.status === 'AVAILABLE').length,
    locked: inventory.filter(u => u.status === 'LOCKED' || u.status === 'RESERVED').length,
    sold: inventory.filter(u => u.status === 'DEPOSIT' || u.status === 'SOLD' || u.status === 'COMPLETED').length,
  }), [inventory]);

  return (
    <div className="flex-1 flex flex-col h-full bg-transparent relative z-10 overflow-hidden p-4 sm:p-8 lg:px-10">
      
      <InventoryFilter
        filters={filters}
        setFilters={setFilters}
        viewMode={viewMode}
        setViewMode={setViewMode}
        projects={projects}
        stats={stats}
      />

      {viewMode === 'floor' ? (
        <FloorPlanView
          filtered={filtered}
          hoveredUnit={hoveredUnit}
          setHoveredUnit={setHoveredUnit}
          selectedMulti={selectedMulti}
          toggleMultiSelect={toggleMultiSelect}
          setSelectedUnit={setSelectedUnit}
        />
      ) : (
        <UnitGridView
          filtered={filtered}
          viewMode={viewMode}
          projects={projects}
          selectedMulti={selectedMulti}
          toggleMultiSelect={toggleMultiSelect}
          setSelectedUnit={setSelectedUnit}
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          actionLoadingId={actionLoadingId}
          handleAction={handleAction}
          setLockModalOpen={setLockModalOpen}
        />
      )}

      <LockModal
        unitId={lockModalOpen}
        loadingId={actionLoadingId}
        onClose={() => setLockModalOpen(null)}
        onConfirm={(unitId, payload) => {
          if (unitId === 'bulk') handleBulkAction('lock', payload);
          else handleAction(unitId, 'lock', payload);
        }}
        isBulk={lockModalOpen === 'bulk'}
        bulkCount={selectedMulti.length}
      />

      <BulkActionBar
        selectedCount={selectedMulti.length}
        onClear={() => setSelectedMulti([])}
        onBulkLock={() => setLockModalOpen('bulk')}
        onBulkUnlock={() => {
          if(confirm(`Bạn có chắc chắn mở khoá ${selectedMulti.length} căn hộ đã chọn?`)) {
            handleBulkAction('unlock');
          }
        }}
      />

      <UnitDrawer
        unit={selectedUnit}
        projects={projects}
        actionLoadingId={actionLoadingId}
        onClose={() => setSelectedUnit(null)}
        onAction={handleAction}
        onOpenLockModal={setLockModalOpen}
      />

    </div>
  );
}
