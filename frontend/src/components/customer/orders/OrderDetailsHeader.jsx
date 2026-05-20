import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OrderDetailsHeader = React.memo(() => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-4 md:px-6 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/profile?tab=orders')}
          className="w-10 h-10 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors active:scale-95 cursor-pointer"
          aria-label="Back to orders"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg md:text-xl font-extrabold text-slate-900 tracking-tight">
          Order Details
        </h1>
      </div>
      
      <button
        onClick={() => navigate('/contact-us')}
        className="px-4 py-2 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-xl text-xs md:text-sm font-bold text-slate-700 transition-all active:scale-95 cursor-pointer"
      >
        Help
      </button>
    </header>
  );
});

OrderDetailsHeader.displayName = 'OrderDetailsHeader';
export default OrderDetailsHeader;
