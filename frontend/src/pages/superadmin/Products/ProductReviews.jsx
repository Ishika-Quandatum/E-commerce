import React, { useState, useEffect } from "react";
import { 
  Search, 
  ArrowLeft,
  Star,
  CheckCircle2,
  XCircle,
  Trash2,
  MessageSquare
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { reviewService } from "../../../services/api";
import clsx from "clsx";

const ProductReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await reviewService.getReviews();
      setReviews(Array.isArray(res.data) ? res.data : (res.data?.results || []));
    } catch (err) {
      console.error("Failed to fetch reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleToggleApproval = async (id, currentStatus) => {
    try {
      await reviewService.updateReview(id, { is_approved: !currentStatus });
      fetchReviews();
    } catch (err) {
      alert("Failed to update review status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this review? This action cannot be undone.")) return;
    try {
      await reviewService.deleteReview(id);
      fetchReviews();
    } catch (err) {
      alert("Failed to delete review");
    }
  };

  const filteredReviews = reviews.filter(r => 
    r.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.comment?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && reviews.length === 0) {
      return (
          <div className="h-96 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-purple"></div>
          </div>
      );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-24">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate("/admin/products")}
            className="w-14 h-14 bg-white border border-slate-200 rounded-3xl flex items-center justify-center hover:bg-slate-50 transition-all shadow-sm"
          >
            <ArrowLeft size={24} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-4xl font-medium text-slate-900 tracking-tight font-title italic tracking-tighter">Product <span className="text-brand-purple not-italic">Reviews</span></h1>
            <p className="text-slate-500 font-normal mt-1">Moderate customer reviews and ratings</p>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[4rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
        <div className="p-10 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-2xl border border-slate-100 shadow-sm w-full md:w-96 group focus-within:ring-2 focus-within:ring-brand-purple/20 transition-all">
            <Search className="text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by User or Comment..."
              className="bg-transparent border-none focus:ring-0 text-sm font-normal w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-6 text-[10px] font-medium text-slate-400 uppercase tracking-widest border-b border-slate-100">Reviewer & Date</th>
                <th className="px-10 py-6 text-[10px] font-medium text-slate-400 uppercase tracking-widest border-b border-slate-100">Rating</th>
                <th className="px-10 py-6 text-[10px] font-medium text-slate-400 uppercase tracking-widest border-b border-slate-100">Comment</th>
                <th className="px-10 py-6 text-[10px] font-medium text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Status</th>
                <th className="px-10 py-6 text-[10px] font-medium text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredReviews.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-medium text-xs text-slate-500 uppercase">
                          {r.user_name?.[0] || 'U'}
                       </div>
                       <div>
                          <div className="text-sm font-medium text-slate-900">{r.user_name}</div>
                          <div className="text-[10px] font-normal text-slate-400 uppercase tracking-tighter">
                             {new Date(r.created_at).toLocaleDateString()}
                          </div>
                       </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                     <div className="flex text-amber-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} size={14} fill={star <= r.rating ? "currentColor" : "none"} className={star <= r.rating ? "" : "text-slate-300"} />
                      ))}
                     </div>
                  </td>
                  <td className="px-10 py-8 max-w-xs">
                     <p className="text-xs text-slate-600 line-clamp-2" title={r.comment}>{r.comment}</p>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex justify-center">
                        <span className={clsx(
                            "px-3 py-1 rounded-lg text-[9px] font-medium uppercase tracking-widest flex items-center gap-1",
                            r.is_approved ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                        )}>
                            {r.is_approved ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                            {r.is_approved ? 'Approved' : 'Hidden'}
                        </span>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex items-center justify-end gap-2">
                        <button 
                            onClick={() => handleToggleApproval(r.id, r.is_approved)}
                            className={clsx(
                                "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm",
                                r.is_approved ? "bg-rose-50 text-rose-600 hover:bg-rose-100" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                            )}
                        >
                            {r.is_approved ? 'Hide' : 'Approve'}
                        </button>
                        <button 
                            onClick={() => handleDelete(r.id)}
                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredReviews.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-10 py-20 text-center text-slate-400 font-normal uppercase tracking-widest">
                    <div className="flex flex-col items-center justify-center">
                        <MessageSquare size={32} className="text-slate-200 mb-3" />
                        No reviews found.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductReviews;
