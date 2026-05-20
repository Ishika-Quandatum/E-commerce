import React from 'react';
import { Wallet } from 'lucide-react';

const WalletCard = React.memo(({ wallet }) => (
  <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/40 flex flex-col justify-center bg-indigo-50/30 relative overflow-hidden group">
    <div className="absolute top-0 right-0 p-8 text-indigo-100 group-hover:scale-110 transition-transform">
      <Wallet size={120} />
    </div>
    <div className="relative z-10 space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-200">
          <Wallet size={20} />
        </div>
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-tighter">My Wallet</h3>
      </div>
      <p className="text-5xl font-black text-indigo-600 italic tracking-tighter">₹{wallet?.balance || '0.00'}</p>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Available for Shopping</p>
    </div>
  </div>
));

WalletCard.displayName = 'WalletCard';
export default WalletCard;
