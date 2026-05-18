import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, XCircle, Eye, Search, 
  MapPin, Truck, Landmark, Smartphone,
  ExternalLink, Clock, AlertCircle, FileText,
  User, Mail, Calendar, ShieldCheck
} from 'lucide-react';
import { riderService } from '../../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

const RiderRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRider, setSelectedRider] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionInput, setShowRejectionInput] = useState(false);
  const [stats, setStats] = useState({ total_pending: 0, total_approved: 0, total_rejected: 0 });
  const [statusFilter, setStatusFilter] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchRequests();
    fetchStats();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await riderService.getRiders();
      setRequests(res.data);
    } catch (err) {
      console.error("Error fetching requests", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await riderService.getRequestStats();
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching request stats", err);
    }
  };

  const handleAction = async (id, status, reason = '') => {
    try {
      setActionLoading(true);
      await riderService.updateVerificationStatus(id, { status, reason });
      await fetchRequests();
      await fetchStats();
      setIsModalOpen(false);
      setSelectedRider(null);
      setShowRejectionInput(false);
      setRejectionReason('');
    } catch (err) {
      alert("Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredRequests = requests.filter(r => {
    // 1. Text Search Filter
    const matchesSearch = 
      r.rider_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.city?.toLowerCase().includes(searchTerm.toLowerCase());

    // 2. Status Filter
    const matchesStatus = statusFilter === "All" || r.verification_status === statusFilter;

    // 3. Date Filter
    let matchesDate = true;
    if (r.join_date) {
      const joinDate = new Date(r.join_date).setHours(0, 0, 0, 0);
      if (startDate) {
        const start = new Date(startDate).setHours(0, 0, 0, 0);
        if (joinDate < start) matchesDate = false;
      }
      if (endDate) {
        const end = new Date(endDate).setHours(23, 59, 59, 999);
        if (joinDate > end) matchesDate = false;
      }
    } else {
      if (startDate || endDate) matchesDate = false;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Rider Requests</h1>
          <p className="text-slate-500 font-medium mt-1">Verify and approve new delivery partner applications.</p>
        </div>
        
        <div className="flex items-center bg-white rounded-2xl px-4 py-2.5 w-full md:w-96 border border-slate-200 shadow-sm focus-within:border-brand-purple focus-within:ring-4 focus-within:ring-brand-purple/5 transition-all">
          <Search size={18} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name, email or city..." 
            className="bg-transparent border-none outline-none text-sm ml-3 w-full font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Total Pending" value={stats.total_pending} icon={<Clock className="text-amber-500" />} bg="bg-amber-50" />
        <StatCard label="Total Approved" value={stats.total_approved} icon={<CheckCircle className="text-green-500" />} bg="bg-green-50" />
        <StatCard label="Total Rejected" value={stats.total_rejected} icon={<XCircle className="text-rose-500" />} bg="bg-rose-50" />
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="flex flex-col gap-1 w-full sm:w-auto">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Filter by Status</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/5 transition-all min-w-[150px]"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending Verification</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>

          <div className="flex flex-col gap-1 w-full sm:w-auto">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/5 transition-all"
            />
          </div>

          <div className="flex flex-col gap-1 w-full sm:w-auto">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/5 transition-all"
            />
          </div>
        </div>

        {(statusFilter !== "All" || startDate || endDate) && (
          <button
            onClick={() => {
              setStatusFilter("All");
              setStartDate("");
              setEndDate("");
              setCurrentPage(1);
            }}
            className="text-xs font-bold text-rose-500 hover:text-rose-600 uppercase tracking-widest self-end md:self-center transition-colors mr-2 mb-1"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Rider Info</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Location & Vehicle</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Applied On</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                 <tr>
                    <td colSpan="5" className="px-8 py-20 text-center">
                        <div className="w-10 h-10 border-4 border-slate-200 border-t-brand-purple rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Applications...</p>
                    </td>
                </tr>
              ) : currentItems.length > 0 ? (
                currentItems.map((rider) => (
                  <tr key={rider.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden shrink-0 border border-slate-100 shadow-sm">
                          {rider.profile_photo ? (
                            <img src={rider.profile_photo} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User size={20} />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-brand-purple transition-colors">{rider.rider_name}</p>
                          <p className="text-xs font-medium text-slate-500">{rider.user?.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Smartphone size={12} className="text-slate-300" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{rider.user?.phone}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-slate-300" />
                          <p className="text-sm font-bold text-slate-700">{rider.city}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Truck size={14} className="text-slate-300" />
                          <p className="text-xs font-medium text-slate-500">{rider.vehicle_type} ({rider.vehicle_number})</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Calendar size={14} />
                        <p className="text-sm font-medium">{new Date(rider.join_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider inline-flex items-center justify-center ${
                        rider.verification_status === 'Approved' ? 'bg-green-50 text-green-600 border border-green-100' :
                        rider.verification_status === 'Rejected' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                        rider.verification_status === 'Suspended' ? 'bg-slate-100 text-slate-500 border border-slate-200' :
                        'bg-amber-50 text-amber-600 border border-amber-100'
                      }`}>
                        {rider.verification_status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => { setSelectedRider(rider); setIsModalOpen(true); }}
                          className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-brand-purple hover:text-white transition-all shadow-sm"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        {rider.verification_status === 'Pending' && (
                          <>
                            <button 
                              onClick={() => handleAction(rider.id, 'Approved')}
                              className="p-2.5 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm"
                              title="Approve"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button 
                              onClick={() => { setSelectedRider(rider); setShowRejectionInput(true); setIsModalOpen(true); }}
                              className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                              title="Reject"
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-8 py-20 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                        <AlertCircle size={24} />
                    </div>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No requests found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination UI */}
        {totalPages > 1 && (
          <div className="border-t border-slate-100 px-8 py-5 flex items-center justify-between bg-slate-50/20">
            <p className="text-xs font-semibold text-slate-500">
              Showing <span className="font-bold text-slate-800">{indexOfFirstItem + 1}</span> to{" "}
              <span className="font-bold text-slate-800">
                {Math.min(indexOfLastItem, filteredRequests.length)}
              </span>{" "}
              of <span className="font-bold text-slate-800">{filteredRequests.length}</span> requests
            </p>

            <div className="flex items-center gap-2">
              {/* Previous Button */}
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white transition-all flex items-center gap-1 shadow-sm"
              >
                &lt; Previous
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 rounded-xl text-xs font-black transition-all flex items-center justify-center ${
                      currentPage === page
                        ? "bg-brand-purple text-white shadow-md shadow-brand-purple/20"
                        : "border border-slate-200 text-slate-600 bg-white hover:bg-slate-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              {/* Next Button */}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white transition-all flex items-center gap-1 shadow-sm"
              >
                Next &gt;
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {isModalOpen && selectedRider && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => { setIsModalOpen(false); setShowRejectionInput(false); }}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-[2.5rem] shadow-2xl border border-slate-100"
            >
              <div className="p-8 sm:p-10">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Rider Application</h2>
                  <div className="flex items-center gap-3">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      selectedRider.verification_status === 'Approved' ? 'bg-green-50 text-green-600 border-green-100' :
                      selectedRider.verification_status === 'Rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                      selectedRider.verification_status === 'Suspended' ? 'bg-slate-100 text-slate-500 border-slate-200' :
                      'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                      {selectedRider.verification_status || 'Pending'}
                    </span>
                    <button 
                      onClick={() => { setIsModalOpen(false); setShowRejectionInput(false); }}
                      className="p-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"
                      title="Close"
                    >
                      <XCircle size={18} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {/* Basic Info */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Rider Details</h3>
                      <div className="space-y-4">
                         <DetailItem label="Full Name" value={selectedRider.rider_name} />
                         <DetailItem label="Email" value={selectedRider.user?.email} />
                         <DetailItem label="Phone" value={selectedRider.user?.phone} />
                         <DetailItem label="Date of Birth" value={selectedRider.date_of_birth} />
                         <DetailItem label="Gender" value={selectedRider.gender} />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Location & Address</h3>
                      <div className="space-y-4">
                         <DetailItem label="City" value={selectedRider.city} />
                         <DetailItem label="Full Address" value={selectedRider.address} />
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Emergency Contact</h3>
                      <div className="space-y-4">
                         <DetailItem label="Contact Name" value={selectedRider.emergency_contact_name} />
                         <DetailItem label="Contact Number" value={selectedRider.emergency_contact_phone} />
                         <DetailItem label="Relationship" value={selectedRider.emergency_contact_relationship} />
                      </div>
                    </div>
                  </div>

                  {/* Vehicle & Documents */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Vehicle Info</h3>
                      <div className="space-y-4">
                         <DetailItem label="Type" value={selectedRider.vehicle_type} />
                         <DetailItem label="Number" value={selectedRider.vehicle_number} />
                         <DetailItem label="RC Number" value={selectedRider.rc_number} />
                         <DetailItem label="License Number" value={selectedRider.license_number} />
                         <DetailItem label="Insurance Number" value={selectedRider.insurance_number} />
                         <DetailItem label="Insurance Valid Till" value={selectedRider.insurance_valid_till} />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Bank Information</h3>
                      <div className="space-y-4">
                         <DetailItem label="Account Holder" value={selectedRider.account_holder_name} />
                         <DetailItem label="Account Number" value={selectedRider.bank_account_number} />
                         <DetailItem label="IFSC Code" value={selectedRider.ifsc_code} />
                         <DetailItem label="Bank Name" value={selectedRider.bank_name} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Documents Grid */}
                <div className="mt-8 pt-8 border-t border-slate-100">
                   <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">KYC Documents</h3>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <DocCard label="Profile Photo" image={selectedRider.profile_photo} />
                      <DocCard label="License" image={selectedRider.license_image} />
                      <DocCard label="ID Proof" image={selectedRider.id_proof_image} />
                      <DocCard label="Vehicle Image" image={selectedRider.vehicle_image} />
                      <DocCard label="Bank Proof" image={selectedRider.bank_proof_image} />
                   </div>
                </div>

                {selectedRider.verification_status === 'Pending' ? (
                  <>
                    {showRejectionInput && (
                      <div className="mt-8 p-6 bg-rose-50 rounded-2xl border border-rose-100 animate-in slide-in-from-top-2">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-rose-500 mb-2">Rejection Reason</label>
                        <textarea 
                          className="w-full bg-white border border-rose-200 rounded-xl p-4 text-sm font-bold text-slate-700 focus:border-rose-500 outline-none transition-all"
                          placeholder="Explain why the application was rejected..."
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                        />
                      </div>
                    )}

                    <div className="mt-10 flex gap-4">
                      {showRejectionInput ? (
                        <>
                          <button 
                            onClick={() => handleAction(selectedRider.id, 'Rejected', rejectionReason)}
                            disabled={actionLoading || !rejectionReason.trim()}
                            className="flex-1 h-14 bg-rose-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-rose-200 hover:bg-rose-700 transition-all disabled:opacity-50"
                          >
                            Confirm Rejection
                          </button>
                          <button 
                            onClick={() => setShowRejectionInput(false)}
                            className="px-8 h-14 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-200 transition-all"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            onClick={() => handleAction(selectedRider.id, 'Approved')}
                            disabled={actionLoading}
                            className="flex-1 h-14 bg-green-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-green-200 hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                          >
                            <CheckCircle size={18} /> Approve Rider
                          </button>
                          <button 
                            onClick={() => setShowRejectionInput(true)}
                            disabled={actionLoading}
                            className="flex-1 h-14 bg-rose-50 text-rose-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-rose-100 transition-all flex items-center justify-center gap-2"
                          >
                            <XCircle size={18} /> Reject
                          </button>
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    {selectedRider.verification_status === 'Approved' && (
                      <div className="mt-8 p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-3 text-green-700 font-bold text-xs">
                        <CheckCircle size={18} />
                        This rider application has been approved and is currently active.
                      </div>
                    )}
                    {selectedRider.verification_status === 'Rejected' && (
                      <div className="mt-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex flex-col gap-2 text-rose-700 font-bold text-xs">
                        <div className="flex items-center gap-3">
                          <XCircle size={18} />
                          This rider application has been rejected and cannot be approved.
                        </div>
                        {selectedRider.rejection_reason && (
                          <div className="text-[10px] text-rose-500 font-medium ml-7 bg-white/50 p-2.5 rounded-xl border border-rose-100/50">
                            Reason: {selectedRider.rejection_reason}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StatCard = ({ label, value, icon, bg }) => (
  <div className={clsx("p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5 bg-white")}>
    <div className={clsx("w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner", bg)}>
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
      <p className="text-2xl font-black text-slate-900">{value}</p>
    </div>
  </div>
);

const DetailItem = ({ label, value }) => (
  <div>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">{label}</p>
    <p className="text-sm font-bold text-slate-800 leading-tight">{value || 'N/A'}</p>
  </div>
);

const DocCard = ({ label, image }) => (
  <div className="space-y-2">
    <div className="aspect-[4/3] bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden group relative cursor-pointer">
      {image ? (
        <>
          <img src={image} alt={label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
          <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
             <a href={image} target="_blank" rel="noreferrer" className="p-2 bg-white rounded-xl text-brand-purple shadow-xl">
               <ExternalLink size={18} />
             </a>
          </div>
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
          <FileText size={24} />
          <span className="text-[8px] font-black uppercase tracking-widest mt-2">No File</span>
        </div>
      )}
    </div>
    <p className="text-[9px] font-black uppercase tracking-widest text-center text-slate-400">{label}</p>
  </div>
);

export default RiderRequests;
