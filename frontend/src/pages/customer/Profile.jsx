import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { orderService, authService } from '../../services/api';

// ── Profile section components ──────────────────────────────────────────────
import ProfileOverview from '../../components/customer/profile/ProfileOverview';
import WalletCard from '../../components/customer/profile/WalletCard';
import SecurityCard from '../../components/customer/profile/SecurityCard';

// ── Order history components ─────────────────────────────────────────────────
import OrderHistoryHeader from '../../components/customer/orders/OrderHistoryHeader';
import OrderCard from '../../components/customer/orders/OrderCard';
import OrderSkeleton from '../../components/customer/orders/OrderSkeleton';
import EmptyOrders from '../../components/customer/orders/EmptyOrders';

// ── Modals (unchanged) ────────────────────────────────────────────────────────
import ReturnRequestModal from '../../components/customer/ReturnRequestModal';
import WriteReviewModal from '../../components/customer/WriteReviewModal';

// ─────────────────────────────────────────────────────────────────────────────
// Profile — orchestrates data fetching, modal state and filtered order list.
// All child components receive data/callbacks as props; no API calls below
// this level (except SecurityCard which is fully self-contained).
// ─────────────────────────────────────────────────────────────────────────────
const Profile = () => {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'profile';

  const { user } = useAuth();

  // ── Data state ──────────────────────────────────────────────────────────────
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet]   = useState(null);

  // ── Modal state ─────────────────────────────────────────────────────────────
  const [selectedOrderForReturn,  setSelectedOrderForReturn]  = useState(null);
  const [isReturnModalOpen,       setIsReturnModalOpen]       = useState(false);
  const [selectedProductForReview, setSelectedProductForReview] = useState(null);
  const [selectedRatingForReview,  setSelectedRatingForReview]  = useState(5);
  const [isReviewModalOpen,        setIsReviewModalOpen]        = useState(false);

  // ── Search / filter state ───────────────────────────────────────────────────
  const [searchQuery,  setSearchQuery]  = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  // ── Data fetching ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      try {
        const res = await orderService.getUserOrders();
        setOrders(Array.isArray(res.data) ? res.data : (res.data?.results ?? []));
      } catch (err) {
        console.error('Error fetching orders', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const fetchWallet = async () => {
      try {
        const res = await authService.getProfile();
        setWallet(res.data.wallet);
      } catch (err) {
        console.error('Error fetching wallet', err);
      }
    };
    fetchWallet();
  }, [user]);

  // ── Stable callbacks passed to child components ─────────────────────────────
  const handleOpenReview = useCallback((product, rating) => {
    setSelectedProductForReview(product);
    setSelectedRatingForReview(rating);
    setIsReviewModalOpen(true);
  }, []);

  const handleOpenReturn = useCallback((order) => {
    setSelectedOrderForReturn(order);
    setIsReturnModalOpen(true);
  }, []);

  const handleReviewSuccess = useCallback(async () => {
    try {
      const res = await orderService.getUserOrders();
      setOrders(Array.isArray(res.data) ? res.data : (res.data?.results ?? []));
    } catch (err) {
      console.error('Error refreshing orders', err);
    }
  }, []);

  // ── Filtered orders (memoised — only recomputes when deps change) ────────────
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Status filter
      if (activeFilter === 'Delivered'  && order.status !== 'Delivered')  return false;
      if (activeFilter === 'Cancelled'  && order.status !== 'Cancelled')  return false;
      if (activeFilter === 'Processing' && ['Delivered', 'Cancelled'].includes(order.status)) return false;
      if (activeFilter === 'Returned & Refunded') {
        if (!order.items?.some((item) => item.return_status)) return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q            = searchQuery.toLowerCase();
        const orderIdStr   = `#ord-${order.id.toString().padStart(5, '0')}`;
        const matchId      = orderIdStr.includes(q) || order.id.toString().includes(q);
        const matchProduct = order.items?.some((item) =>
          item.product?.name?.toLowerCase().includes(q)
        );
        return matchId || matchProduct;
      }

      return true;
    });
  }, [orders, activeFilter, searchQuery]);

  if (!user) return null;

  const hasFilters = searchQuery.trim() !== '' || activeFilter !== 'All';

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <main className="w-full">
        {/* ── Profile tab ──────────────────────────────────────────────────── */}
        {activeTab === 'profile' ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <ProfileOverview user={user} ordersCount={orders.length} />
              <WalletCard wallet={wallet} />
            </div>
            <SecurityCard user={user} />
          </div>
        ) : (
          /* ── Orders tab ──────────────────────────────────────────────────── */
          <div
            className="animate-in fade-in slide-in-from-right-4 duration-500"
            style={{ fontFamily: "'Manrope', sans-serif" }}
          >
            <OrderHistoryHeader
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
            />

            {loading ? (
              <OrderSkeleton />
            ) : filteredOrders.length === 0 ? (
              <EmptyOrders hasFilters={hasFilters} />
            ) : (
              <div className="space-y-6">
                {filteredOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onOpenReturn={handleOpenReturn}
                    onOpenReview={handleOpenReview}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── Modals — unchanged behaviour, unchanged API props ─────────────── */}
      {selectedOrderForReturn && (
        <ReturnRequestModal
          isOpen={isReturnModalOpen}
          onClose={() => setIsReturnModalOpen(false)}
          order={selectedOrderForReturn}
          onSuccess={() => window.location.reload()}
        />
      )}

      {selectedProductForReview && (
        <WriteReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          product={selectedProductForReview}
          initialRating={selectedRatingForReview}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  );
};

export default Profile;
