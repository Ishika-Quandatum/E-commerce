import React from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import clsx from "clsx";

const SettlementStatusAlert = ({ pendingCodAmount }) => {
  const amount = parseFloat(pendingCodAmount || 0);
  const hasPending = amount > 0;

  return (
    <div 
      className={clsx(
        "p-4 rounded-2xl flex items-center gap-4 border transition-all",
        hasPending 
          ? "bg-amber-50 border-amber-100 text-amber-800 shadow-lg shadow-amber-500/5" 
          : "bg-emerald-50 border-emerald-100 text-emerald-800"
      )}
      role="alert"
    >
      <div 
        className={clsx(
          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
          hasPending ? "bg-amber-100" : "bg-emerald-100"
        )}
      >
        {hasPending ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} />}
      </div>
      <div>
        <p className="text-sm font-bold">
          {hasPending ? "Pending Cash Submission" : "All COD Collections Settled"}
        </p>
        <p className="text-xs font-medium opacity-80">
          {hasPending 
            ? `Please submit ₹${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} collected from customers to avoid account suspension.`
            : "Excellent! You have no outstanding cash to submit to the admin."
          }
        </p>
      </div>
    </div>
  );
};

export default SettlementStatusAlert;
