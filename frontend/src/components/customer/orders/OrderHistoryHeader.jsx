import React from 'react';
import { Package } from 'lucide-react';
import OrderSearchBar from './OrderSearchBar';
import OrderFilterDropdown from './OrderFilterDropdown';

const OrderHistoryHeader = React.memo(({ searchQuery, onSearchChange, activeFilter, onFilterChange }) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
    <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
      <Package size={24} className="text-slate-900" />
      My Orders
    </h1>
    <div className="flex items-center gap-3 w-full md:w-auto relative">
      <OrderSearchBar value={searchQuery} onChange={onSearchChange} />
      <OrderFilterDropdown activeFilter={activeFilter} onFilterChange={onFilterChange} />
    </div>
  </div>
));

OrderHistoryHeader.displayName = 'OrderHistoryHeader';
export default OrderHistoryHeader;
