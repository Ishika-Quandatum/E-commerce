import React from 'react';

const EmptyOrders = React.memo(({ hasFilters }) => (
  <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-20 text-center">
    <h3 className="text-xl font-bold text-slate-800 mb-2">
      {hasFilters ? 'No matching orders found' : 'No orders yet'}
    </h3>
    <p className="text-slate-500">
      {hasFilters
        ? 'Try adjusting your search or filter parameters.'
        : 'Your shopping journey is just beginning.'}
    </p>
  </div>
));

EmptyOrders.displayName = 'EmptyOrders';
export default EmptyOrders;
