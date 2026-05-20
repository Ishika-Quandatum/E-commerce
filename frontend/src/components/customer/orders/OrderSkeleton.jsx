import React from 'react';

const OrderSkeleton = React.memo(() => (
  <div className="space-y-6">
    {[1, 2].map((i) => (
      <div key={i} className="h-48 bg-slate-100 animate-pulse rounded-[2rem]" />
    ))}
  </div>
));

OrderSkeleton.displayName = 'OrderSkeleton';
export default OrderSkeleton;
