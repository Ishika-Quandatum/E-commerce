import React from 'react';
import { Search } from 'lucide-react';

const OrderSearchBar = React.memo(({ value, onChange }) => (
  <div className="relative flex-1 md:w-80">
    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search your order..."
      className="w-full bg-slate-50 border border-slate-200/80 rounded-full py-3.5 pl-11 pr-4 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100 transition-all outline-none"
    />
  </div>
));

OrderSearchBar.displayName = 'OrderSearchBar';
export default OrderSearchBar;
