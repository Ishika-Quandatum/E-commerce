import React from 'react';
import { User as UserIcon, Calendar, Package } from 'lucide-react';

const ProfileOverview = React.memo(({ user, ordersCount }) => (
  <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/40 flex flex-col md:flex-row items-center gap-10">
    <div className="w-32 h-32 bg-primary-50 text-primary-500 rounded-full flex items-center justify-center shrink-0 border-4 border-white shadow-xl shadow-primary-100/50">
      <UserIcon size={64} />
    </div>
    <div className="flex-1 text-center md:text-left space-y-4">
      <div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">{user.first_name} {user.last_name}</h2>
        <p className="text-slate-400 font-bold mt-1">@{user.username} • {user.email}</p>
      </div>
      <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 pt-4 border-t border-slate-50">
        <div className="flex items-center gap-2 text-slate-500">
          <Calendar size={18} className="text-primary-500" />
          <span className="text-sm font-bold uppercase tracking-wider">Joined April 2026</span>
        </div>
        <div className="flex items-center gap-2 text-slate-500">
          <Package size={18} className="text-primary-500" />
          <span className="text-sm font-bold uppercase tracking-wider">{ordersCount} Total Orders</span>
        </div>
      </div>
    </div>
  </div>
));

ProfileOverview.displayName = 'ProfileOverview';
export default ProfileOverview;
