import React, { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';

const FILTER_OPTIONS = ['All', 'Delivered', 'Processing', 'Cancelled', 'Returned & Refunded'];

/**
 * OrderFilterDropdown — self-contained open/close state.
 * Receives activeFilter and onFilterChange from parent (Profile.jsx)
 * so the filter logic/state lives in one place.
 */
const OrderFilterDropdown = React.memo(({ activeFilter, onFilterChange }) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (filter) => {
    onFilterChange(filter);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-5 py-3.5 rounded-full border text-sm font-semibold transition-all cursor-pointer ${
          activeFilter !== 'All'
            ? 'bg-slate-900 border-slate-900 text-white'
            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
        }`}
      >
        <SlidersHorizontal size={16} />
        <span className="hidden sm:inline">Filters</span>
        {activeFilter !== 'All' && (
          <span className="bg-amber-400 text-slate-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            1
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-4 py-1.5">
              Filter by Status
            </p>
            {FILTER_OPTIONS.map((filter) => (
              <button
                key={filter}
                onClick={() => handleSelect(filter)}
                className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                  activeFilter === filter
                    ? 'bg-slate-50 text-slate-900 font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>{filter}</span>
                {activeFilter === filter && (
                  <span className="w-1.5 h-1.5 bg-slate-900 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
});

OrderFilterDropdown.displayName = 'OrderFilterDropdown';
export default OrderFilterDropdown;
