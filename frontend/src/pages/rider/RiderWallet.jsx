import React, { useState, useEffect } from "react";
import { Plus, FileDown } from "lucide-react";
import { riderService } from "../../services/api";
import toast from "react-hot-toast";

// Sub-components
import StatsGrid from "../../components/rider/wallet/StatsGrid";
import SettlementStatusAlert from "../../components/rider/wallet/SettlementStatusAlert";
import LedgerTable from "../../components/rider/wallet/LedgerTable";
import PayNowModal from "../../components/rider/wallet/PayNowModal";
import DetailModal from "../../components/rider/wallet/DetailModal";

const RiderWallet = () => {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Collections");
  
  // Modals state
  const [showPayModal, setShowPayModal] = useState(false);
  const [activeCodId, setActiveCodId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [walletRes, transRes] = await Promise.all([
        riderService.getWallet(),
        riderService.getWalletTransactions()
      ]);
      setWallet(walletRes.data);
      setTransactions(transRes.data);
    } catch (err) {
      console.error("Error syncing wallet ledger data", err);
      toast.error("Failed to sync wallet data");
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = (cod = null) => {
    setActiveCodId(cod ? cod.id : null);
    setShowPayModal(true);
  };

  const handleViewDetails = (item) => {
    setSelectedItem(item);
    setShowViewModal(true);
  };

  const handleSubmitPayment = async (formData) => {
    try {
      await riderService.submitWalletCOD(formData);
      toast.success("COD submission recorded! Awaiting admin verification.");
      setShowPayModal(false);
      fetchData();
    } catch (err) {
      toast.error("Submission failed. Please check details.");
      throw err; // Let the modal catch it to stop loading state
    }
  };

  // Determine initial payment amount based on active COD selection
  const initialPaymentAmount = activeCodId 
    ? (wallet?.recent_cod_collections?.find(c => c.id === activeCodId)?.amount || "")
    : (wallet?.pending_cod_amount || "");

  if (loading) {
    return (
      <div 
        className="flex flex-col items-center justify-center h-[70vh] gap-4"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="w-12 h-12 border-4 border-brand-purple border-t-transparent rounded-full animate-spin" />
        <p className="font-bold text-slate-400 animate-pulse uppercase tracking-widest text-xs">
          Syncing Ledger...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight font-title">
            Wallet / <span className="text-brand-purple">COD Collections</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Manage customer cash collections and platform settlements.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => handlePayNow(null)}
            className="flex items-center gap-2 bg-brand-purple text-white px-6 py-4 rounded-2xl font-bold text-sm hover:scale-[1.02] transition-all shadow-xl shadow-brand-purple/20 active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-purple/50"
            aria-label="Submit settlement payment to admin"
          >
            <Plus size={18} aria-hidden="true" />
            <span>Pay to Admin</span>
          </button>
          <button 
            className="p-4 bg-white border border-slate-100 text-slate-400 rounded-2xl hover:text-brand-purple transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple"
            aria-label="Export ledger data"
          >
            <FileDown size={20} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Stats Grid component */}
      <StatsGrid wallet={wallet} />

      {/* Settlement Status Alert component */}
      <SettlementStatusAlert pendingCodAmount={wallet?.pending_cod_amount} />

      {/* Main Ledger Table component */}
      <LedgerTable 
        wallet={wallet}
        transactions={transactions}
        filter={filter}
        setFilter={setFilter}
        onPayNow={handlePayNow}
        onViewDetails={handleViewDetails}
      />

      {/* Settlement submission modal */}
      <PayNowModal 
        isOpen={showPayModal}
        onClose={() => setShowPayModal(false)}
        initialAmount={initialPaymentAmount}
        activeCodId={activeCodId}
        onSubmit={handleSubmitPayment}
      />

      {/* Transaction details modal */}
      <DetailModal 
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        selectedItem={selectedItem}
      />
    </div>
  );
};

export default RiderWallet;
