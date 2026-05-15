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

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await riderService.getPendingRequests();
      setRequests(res.data);
    } catch (err) {
      console.error("Error fetching requests", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, status, reason = '') => {
    try {
      setActionLoading(true);
      await riderService.updateVerificationStatus(id, { status, reason });
      setRequests(prev => prev.filter(r => r.id !== id));
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

  const filteredRequests = requests.filter(r => 
    r.rider_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <StatCard label="Total Pending" value={requests.length} icon={<Clock className="text-amber-500" />} bg="bg-amber-50" />
        <StatCard label="Approved Today" value="0" icon={<CheckCircle className="text-green-500" />} bg="bg-green-50" />
        <StatCard label="Rejected Today" value="0" icon={<XCircle className="text-rose-500" />} bg="bg-rose-50" />
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
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                 <tr>
                    <td colSpan="4" className="px-8 py-20 text-center">
                        <div className="w-10 h-10 border-4 border-slate-200 border-t-brand-purple rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Applications...</p>
                    </td>
                </tr>
              ) : filteredRequests.length > 0 ? (
                filteredRequests.map((rider) => (
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
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => { setSelectedRider(rider); setIsModalOpen(true); }}
                          className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-brand-purple hover:text-white transition-all shadow-sm"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
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
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No pending requests found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100"
            >
              <div className="p-8 sm:p-10">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Rider Application</h2>
                  <div className="px-4 py-1.5 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100">
                    Pending Verification
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
                         <DetailItem label="Emergency Contact" value={selectedRider.emergency_contact} />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Location & Address</h3>
                      <div className="space-y-4">
                         <DetailItem label="City" value={selectedRider.city} />
                         <DetailItem label="Full Address" value={selectedRider.address} />
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
                         <DetailItem label="License Number" value={selectedRider.license_number} />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Bank Information</h3>
                      <div className="space-y-4">
                         <DetailItem label="Account Number" value={selectedRider.bank_account_number} />
                         <DetailItem label="IFSC Code" value={selectedRider.ifsc_code} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Documents Grid */}
                <div className="mt-8 pt-8 border-t border-slate-100">
                   <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">KYC Documents</h3>
                   <div className="grid grid-cols-3 gap-4">
                      <DocCard label="License" image={selectedRider.license_image} />
                      <DocCard label="ID Proof" image={selectedRider.id_proof_image} />
                      <DocCard label="Profile Photo" image={selectedRider.profile_photo} />
                   </div>
                </div>

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
