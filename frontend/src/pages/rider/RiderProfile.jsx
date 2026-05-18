import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { authService, riderService } from "../../services/api";
import { 
  User, Mail, Phone, Shield, Eye, EyeOff, Lock, CheckCircle2, 
  AlertCircle, RefreshCw, MapPin, Calendar, Smartphone, 
  Briefcase, Truck, CreditCard, Landmark, Info, FileText,
  Clock, CheckCircle, XCircle, Camera, Edit2, ExternalLink, Hash, FileCheck, Pencil, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { toast } from "react-hot-toast";

const RiderProfile = () => {
    const { user: authUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    
    // Edit Form State
    const [editFormData, setEditFormData] = useState({
        rider_name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        date_of_birth: "",
        gender: "",
        vehicle_type: "",
        vehicle_number: "",
        rc_number: "",
        license_number: "",
        insurance_number: "",
        insurance_valid_till: "",
        account_holder_name: "",
        bank_account_number: "",
        ifsc_code: "",
        bank_name: "",
        emergency_contact_name: "",
        emergency_contact_phone: "",
        emergency_contact_relationship: ""
    });

    // Password state
    const [passwords, setPasswords] = useState({
        old_password: "",
        new_password: "",
        confirm_password: ""
    });
    
    const [visibility, setVisibility] = useState({
        old: false,
        new: false,
        confirm: false
    });

    const [passwordLoading, setPasswordLoading] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setProfileLoading(true);
            const res = await riderService.getMyProfile();
            setProfile(res.data);
            
            // Populate edit form
            setEditFormData({
                rider_name: res.data.rider_name || "",
                email: res.data.user?.email || "",
                phone: res.data.user?.phone || "",
                address: res.data.address || "",
                city: res.data.city || "",
                date_of_birth: res.data.date_of_birth || "",
                gender: res.data.gender || "",
                vehicle_type: res.data.vehicle_type || "",
                vehicle_number: res.data.vehicle_number || "",
                rc_number: res.data.rc_number || "",
                license_number: res.data.license_number || "",
                insurance_number: res.data.insurance_number || "",
                insurance_valid_till: res.data.insurance_valid_till || "",
                account_holder_name: res.data.account_holder_name || "",
                bank_account_number: res.data.bank_account_number || "",
                ifsc_code: res.data.ifsc_code || "",
                bank_name: res.data.bank_name || "",
                emergency_contact_name: res.data.emergency_contact_name || "",
                emergency_contact_phone: res.data.emergency_contact_phone || "",
                emergency_contact_relationship: res.data.emergency_contact_relationship || ""
            });
        } catch (err) {
            console.error("Error fetching profile", err);
            toast.error("Failed to load profile data");
        } finally {
            setProfileLoading(false);
        }
    };

    const handlePasswordChange = (e) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
        if (message.text) setMessage({ text: "", type: "" });
    };

    const toggleVisibility = (field) => {
        setVisibility({ ...visibility, [field]: !visibility[field] });
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwords.new_password !== passwords.confirm_password) {
            return setMessage({ text: "Passwords do not match!", type: "error" });
        }
        if (passwords.new_password.length < 6) {
            return setMessage({ text: "New password must be at least 6 characters.", type: "error" });
        }

        setPasswordLoading(true);
        try {
            await authService.changePassword({
                old_password: passwords.old_password,
                new_password: passwords.new_password
            });
            setMessage({ text: "Password updated successfully!", type: "success" });
            setPasswords({ old_password: "", new_password: "", confirm_password: "" });
            toast.success("Password updated successfully");
        } catch (err) {
            const errorMsg = err.response?.data?.old_password || err.response?.data?.detail || "Failed to update password.";
            setMessage({ text: errorMsg, type: "error" });
            toast.error(errorMsg);
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleEditChange = (e) => {
        setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setEditLoading(true);
        try {
            // Use FormData for compatibility with multipart/form-data backend
            const formData = new FormData();
            Object.keys(editFormData).forEach(key => {
                if (editFormData[key] !== null && editFormData[key] !== undefined) {
                    formData.append(key, editFormData[key]);
                }
            });

            const res = await riderService.updateMyProfile(formData);
            setProfile(res.data);
            setIsEditModalOpen(false);
            toast.success("Profile updated successfully!");
        } catch (err) {
            console.error("Error updating profile", err);
            toast.error("Failed to update profile. Please check your inputs.");
        } finally {
            setEditLoading(false);
        }
    };

    if (profileLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-brand-purple rounded-full animate-spin" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Loading Profile...</p>
            </div>
        );
    }

    return (
        <div className="max-w-full mx-auto space-y-6 animate-in fade-in duration-500 pb-12 p-2 font-sans overflow-x-hidden">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-brand-purple rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-purple/20">
                        <User size={20} className="md:size-6" />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">Rider Profile</h1>
                        <p className="text-slate-500 font-medium text-[10px] md:text-xs">Manage your personal information, documents and account settings.</p>
                    </div>
                </div>
                <button 
                    onClick={() => setIsEditModalOpen(true)}
                    className="px-6 h-9 bg-white border border-brand-purple/20 text-brand-purple rounded-xl font-bold text-[9px] uppercase tracking-widest hover:bg-brand-purple hover:text-white transition-all shadow-sm flex items-center gap-2"
                >
                    <Edit2 size={12} />
                    Edit Profile
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* 1. Personal Information (Left Column) */}
                <div className="lg:col-span-4 h-full">
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <FileText className="text-slate-400" size={18} />
                                <h3 className="text-sm font-black text-slate-900 tracking-tight">Personal Information</h3>
                            </div>
                            <div className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[8px] font-black uppercase tracking-widest border border-emerald-100">
                                ID
                            </div>
                        </div>

                        <div className="flex flex-col items-center mb-10">
                            <div className="relative">
                                <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-slate-50 border border-slate-100 shadow-sm overflow-hidden">
                                    {profile?.profile_photo ? (
                                        <img src={profile.profile_photo} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-200">
                                            <User size={48} />
                                        </div>
                                    )}
                                </div>
                                <button className="absolute bottom-1 right-1 w-8 h-8 bg-white rounded-full shadow-md border border-slate-100 flex items-center justify-center text-slate-400 hover:text-brand-purple transition-all">
                                    <Pencil size={14} className="text-slate-500" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4 flex-grow">
                            <ProfileInfoRow label="Full Name" value={profile?.rider_name} icon={<User size={16}/>} />
                            <ProfileInfoRow label="Email Address" value={profile?.user?.email} icon={<Mail size={16}/>} />
                            <ProfileInfoRow label="Mobile Number" value={profile?.user?.phone} icon={<Phone size={16}/>} />
                            <ProfileInfoRow label="Date of Birth" value={profile?.date_of_birth} icon={<Calendar size={16}/>} />
                            <ProfileInfoRow label="Gender" value={profile?.gender} icon={<User size={16}/>} />
                            <ProfileInfoRow label="Address" value={profile?.address} icon={<MapPin size={16}/>} />
                        </div>

                        <div className="mt-10 flex justify-center">
                            <div className="px-8 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-50 shadow-sm">
                                Account Verified
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column Container */}
                <div className="lg:col-span-8 space-y-6">
                    {/* 2. Vehicle Details */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-brand-purple/5 rounded-xl text-brand-purple">
                                <Truck size={18} />
                            </div>
                            <h3 className="text-sm font-black text-slate-900 tracking-tight">Vehicle Details</h3>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                            <div className="xl:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-y-6 md:gap-y-8 gap-x-6 md:gap-x-12">
                                <HorizontalInfoField label="Vehicle Type" value={profile?.vehicle_type} icon={<Truck size={14}/>} />
                                <HorizontalInfoField label="Insurance Number" value={profile?.insurance_number} icon={<Shield size={14}/>} />
                                <HorizontalInfoField label="Vehicle Number" value={profile?.vehicle_number} icon={<Hash size={14}/>} />
                                <HorizontalInfoField label="Insurance Valid Till" value={profile?.insurance_valid_till} icon={<Calendar size={14}/>} />
                                <HorizontalInfoField label="RC Number" value={profile?.rc_number} icon={<FileCheck size={14}/>} />
                            </div>
                            <div className="xl:col-span-5">
                                <div className="aspect-[16/10] bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden group relative">
                                    {profile?.vehicle_image ? (
                                        <img src={profile.vehicle_image} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-200">
                                            <Truck size={40} />
                                        </div>
                                    )}
                                    <div className="absolute bottom-2 right-2 px-3 py-1 bg-emerald-500 text-white rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg">
                                        Verified
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. Documents Section */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-brand-purple/5 rounded-xl text-brand-purple">
                                    <FileText size={18} />
                                </div>
                                <h3 className="text-sm font-black text-slate-900 tracking-tight">Documents</h3>
                            </div>
                            <button className="px-4 h-8 bg-slate-50 text-brand-purple rounded-lg font-bold text-[9px] uppercase tracking-widest hover:bg-brand-purple hover:text-white transition-all">
                                View All
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                            <DocCard label="Driving License" image={profile?.license_image} number={profile?.license_number} />
                            <DocCard label="Aadhaar Card" image={profile?.id_proof_image} number="XXXX XXXX 5678" />
                            <DocCard label="Bank Passbook" image={profile?.bank_proof_image} />
                        </div>
                    </div>
                </div>

                {/* 4. Bank Details */}
                <div className="lg:col-span-4">
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 h-full">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-brand-purple/5 rounded-xl text-brand-purple">
                                <Landmark size={18} />
                            </div>
                            <h3 className="text-sm font-black text-slate-900 tracking-tight">Bank Details</h3>
                        </div>
                        <div className="space-y-6">
                            <DataRow label="Account Holder Name" value={profile?.account_holder_name} />
                            <DataRow label="Account Number" value={profile?.bank_account_number} />
                            <DataRow label="IFSC Code" value={profile?.ifsc_code} />
                            <DataRow label="Bank Name" value={profile?.bank_name} />
                        </div>
                    </div>
                </div>

                {/* 5. Emergency Contact */}
                <div className="lg:col-span-4">
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 h-full">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-brand-purple/5 rounded-xl text-brand-purple">
                                <Phone size={18} />
                            </div>
                            <h3 className="text-sm font-black text-slate-900 tracking-tight">Emergency Contact</h3>
                        </div>
                        <div className="space-y-6">
                            <DataRow label="Contact Name" value={profile?.emergency_contact_name} />
                            <DataRow label="Contact Number" value={profile?.emergency_contact_phone} />
                            <DataRow label="Relationship" value={profile?.emergency_contact_relationship} />
                        </div>
                    </div>
                </div>

                {/* 6. Account Status */}
                <div className="lg:col-span-4">
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 h-full">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-brand-purple/5 rounded-xl text-brand-purple">
                                <Shield size={18} />
                            </div>
                            <h3 className="text-sm font-black text-slate-900 tracking-tight">Account Status</h3>
                        </div>
                        <div className="space-y-6">
                            <StatusRow label="KYC Status" value="Verified" type="success" />
                            <StatusRow label="Account Status" value="Active" type="success" />
                            <StatusRow label="Joined On" value={profile?.join_date ? new Date(profile.join_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : "Not Available"} />
                        </div>
                    </div>
                </div>

                {/* 7. Security / Change Password */}
                <div className="lg:col-span-12">
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="px-8 py-5 border-b border-slate-50 bg-slate-50/30 flex items-center gap-3">
                            <Shield className="text-brand-purple" size={16} />
                            <h3 className="font-black text-slate-900 uppercase tracking-[0.2em] text-[10px]">Security / Change Password</h3>
                        </div>
                        
                        <form onSubmit={handlePasswordSubmit} className="p-6 md:p-8 space-y-6">
                            {message.text && (
                                <div className={clsx(
                                    "p-3 rounded-xl flex items-center gap-3 border text-xs font-bold animate-in slide-in-from-top-1",
                                    message.type === "success" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-rose-50 text-rose-700 border-rose-100"
                                )}>
                                    {message.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                                    {message.text}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Old Password</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-purple transition-colors">
                                            <Lock size={14} />
                                        </div>
                                        <input 
                                            type={visibility.old ? "text" : "password"}
                                            name="old_password"
                                            value={passwords.old_password}
                                            onChange={handlePasswordChange}
                                            required
                                            className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-900 text-xs focus:outline-none focus:ring-4 focus:ring-brand-purple/5 focus:border-brand-purple transition-all"
                                            placeholder="••••••••"
                                        />
                                        <button type="button" onClick={() => toggleVisibility('old')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
                                            {visibility.old ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                                    <div className="relative">
                                        <input 
                                            type={visibility.new ? "text" : "password"}
                                            name="new_password"
                                            value={passwords.new_password}
                                            onChange={handlePasswordChange}
                                            required
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-900 text-xs focus:outline-none focus:ring-4 focus:ring-brand-purple/5 focus:border-brand-purple transition-all"
                                            placeholder="••••••••"
                                        />
                                        <button type="button" onClick={() => toggleVisibility('new')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
                                            {visibility.new ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm Password</label>
                                    <div className="relative">
                                        <input 
                                            type={visibility.confirm ? "text" : "password"}
                                            name="confirm_password"
                                            value={passwords.confirm_password}
                                            onChange={handlePasswordChange}
                                            required
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-900 text-xs focus:outline-none focus:ring-4 focus:ring-brand-purple/5 focus:border-brand-purple transition-all"
                                            placeholder="••••••••"
                                        />
                                        <button type="button" onClick={() => toggleVisibility('confirm')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
                                            {visibility.confirm ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-2">
                                <button 
                                    type="submit"
                                    disabled={passwordLoading}
                                    className="px-8 h-12 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-slate-900/10 hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {passwordLoading ? <RefreshCw className="animate-spin" size={14} /> : <Shield size={14} />}
                                    {passwordLoading ? "Updating..." : "Update Password"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            <AnimatePresence>
                {isEditModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-8">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsEditModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-full"
                        >
                            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-brand-purple text-white rounded-xl">
                                        <Edit2 size={18} />
                                    </div>
                                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Edit Profile Information</h2>
                                </div>
                                <button onClick={() => setIsEditModalOpen(false)} className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all shadow-sm">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleEditSubmit} className="flex-grow overflow-y-auto p-8 custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                    {/* Section Header */}
                                    <div className="col-span-full border-b border-slate-50 pb-2 mb-2">
                                        <h4 className="text-[10px] font-black text-brand-purple uppercase tracking-[0.2em]">Personal Details</h4>
                                    </div>
                                    
                                    <EditInputField label="Full Name" name="rider_name" value={editFormData.rider_name} onChange={handleEditChange} icon={<User size={14}/>} />
                                    <EditInputField label="Email" name="email" value={editFormData.email} onChange={handleEditChange} icon={<Mail size={14}/>} readOnly />
                                    <EditInputField label="Phone" name="phone" value={editFormData.phone} onChange={handleEditChange} icon={<Smartphone size={14}/>} />
                                    <EditInputField label="Date of Birth" name="date_of_birth" type="date" value={editFormData.date_of_birth} onChange={handleEditChange} icon={<Calendar size={14}/>} />
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gender</label>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-purple transition-colors">
                                                <User size={14} />
                                            </div>
                                            <select 
                                                name="gender" 
                                                value={editFormData.gender} 
                                                onChange={handleEditChange}
                                                className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl pl-11 pr-4 text-[12px] font-bold text-slate-900 outline-none focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/5 transition-all"
                                            >
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                    <EditInputField label="City" name="city" value={editFormData.city} onChange={handleEditChange} icon={<MapPin size={14}/>} />
                                    <div className="col-span-full">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">Full Address</label>
                                        <textarea 
                                            name="address" 
                                            value={editFormData.address} 
                                            onChange={handleEditChange}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-[12px] font-bold text-slate-900 outline-none focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/5 transition-all h-24"
                                        />
                                    </div>

                                    {/* Vehicle Details */}
                                    <div className="col-span-full border-b border-slate-50 pb-2 mt-4 mb-2">
                                        <h4 className="text-[10px] font-black text-brand-purple uppercase tracking-[0.2em]">Vehicle Information</h4>
                                    </div>
                                    <EditInputField label="Vehicle Type" name="vehicle_type" value={editFormData.vehicle_type} onChange={handleEditChange} icon={<Truck size={14}/>} />
                                    <EditInputField label="Vehicle Number" name="vehicle_number" value={editFormData.vehicle_number} onChange={handleEditChange} icon={<Hash size={14}/>} />
                                    <EditInputField label="RC Number" name="rc_number" value={editFormData.rc_number} onChange={handleEditChange} icon={<FileCheck size={14}/>} />
                                    <EditInputField label="License Number" name="license_number" value={editFormData.license_number} onChange={handleEditChange} icon={<FileCheck size={14}/>} />
                                    <EditInputField label="Insurance No" name="insurance_number" value={editFormData.insurance_number} onChange={handleEditChange} icon={<Shield size={14}/>} />
                                    <EditInputField label="Insurance Valid Till" name="insurance_valid_till" type="date" value={editFormData.insurance_valid_till} onChange={handleEditChange} icon={<Calendar size={14}/>} />

                                    {/* Bank Details */}
                                    <div className="col-span-full border-b border-slate-50 pb-2 mt-4 mb-2">
                                        <h4 className="text-[10px] font-black text-brand-purple uppercase tracking-[0.2em]">Banking & Emergency</h4>
                                    </div>
                                    <EditInputField label="Account Holder" name="account_holder_name" value={editFormData.account_holder_name} onChange={handleEditChange} icon={<User size={14}/>} />
                                    <EditInputField label="Account Number" name="bank_account_number" value={editFormData.bank_account_number} onChange={handleEditChange} icon={<CreditCard size={14}/>} />
                                    <EditInputField label="Bank Name" name="bank_name" value={editFormData.bank_name} onChange={handleEditChange} icon={<Landmark size={14}/>} />
                                    <EditInputField label="IFSC Code" name="ifsc_code" value={editFormData.ifsc_code} onChange={handleEditChange} icon={<Hash size={14}/>} />
                                    <EditInputField label="Emergency Contact" name="emergency_contact_name" value={editFormData.emergency_contact_name} onChange={handleEditChange} icon={<User size={14}/>} />
                                    <EditInputField label="Emergency Phone" name="emergency_contact_phone" value={editFormData.emergency_contact_phone} onChange={handleEditChange} icon={<Phone size={14}/>} />
                                    <EditInputField label="Emergency Relationship" name="emergency_contact_relationship" value={editFormData.emergency_contact_relationship} onChange={handleEditChange} icon={<User size={14}/>} />
                                </div>

                                <div className="mt-12 flex justify-end gap-4 pb-4">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="px-8 h-12 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={editLoading}
                                        className="px-10 h-12 bg-brand-purple text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-brand-purple/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                                    >
                                        {editLoading ? <RefreshCw className="animate-spin" size={14} /> : <CheckCircle size={14} />}
                                        {editLoading ? "Saving Changes..." : "Save Profile"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const EditInputField = ({ label, icon, ...props }) => (
    <div className="space-y-1.5">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
        <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-purple transition-colors">
                {icon}
            </div>
            <input 
                {...props}
                className={clsx(
                    "w-full h-12 bg-slate-50 border border-slate-100 rounded-xl pl-11 pr-4 text-[12px] font-bold text-slate-900 outline-none transition-all",
                    props.readOnly ? "opacity-60 cursor-not-allowed" : "focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/5"
                )}
            />
        </div>
    </div>
);

const ProfileInfoRow = ({ label, value, icon }) => (
    <div className="grid grid-cols-[1.2rem_1fr_1.5fr] gap-x-2 items-center py-1">
        <div className="text-slate-400 flex justify-start">{icon}</div>
        <label className="text-[10px] md:text-[11px] font-medium text-slate-500 whitespace-nowrap">{label}</label>
        <p className="font-bold text-slate-900 text-[10px] md:text-[11px] leading-tight truncate">{value || "Not Added"}</p>
    </div>
);

const HorizontalInfoField = ({ label, value, icon }) => (
    <div className="flex items-center gap-3">
        <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
            {icon}
        </div>
        <div className="min-w-0 flex-grow">
            <label className="block text-[7px] md:text-[8px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">{label}</label>
            <p className="font-black text-slate-900 text-[10px] md:text-[11px] truncate">{value || "Not Added"}</p>
        </div>
    </div>
);

const DataRow = ({ label, value }) => (
    <div className="flex items-center justify-between gap-2">
        <label className="text-[7px] md:text-[8px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{label}</label>
        <p className="font-black text-slate-900 text-[10px] md:text-[11px] truncate">{value || "Not Added"}</p>
    </div>
);

const StatusRow = ({ label, value, type }) => (
    <div className="flex items-center justify-between gap-2">
        <label className="text-[7px] md:text-[8px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{label}</label>
        {type === "success" ? (
            <div className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[7px] md:text-[8px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-1">
                <CheckCircle2 size={8} />
                {value}
            </div>
        ) : (
            <p className="font-black text-slate-900 text-[10px] md:text-[11px] truncate">{value}</p>
        )}
    </div>
);

const DocCard = ({ label, image, number }) => (
    <div className="bg-slate-50/50 rounded-2xl border border-slate-100 p-3 flex items-center gap-3 group transition-all hover:bg-white hover:shadow-md">
        <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-brand-purple relative overflow-hidden shrink-0">
            {image ? (
                <img src={image} alt="" className="w-full h-full object-cover" />
            ) : (
                <FileText size={18} className="opacity-20" />
            )}
        </div>
        <div className="flex-grow min-w-0">
            <h4 className="text-[8px] md:text-[9px] font-black text-slate-900 uppercase tracking-widest mb-0.5 leading-tight truncate">{label}</h4>
            <p className="text-[7px] md:text-[8px] font-bold text-slate-400 uppercase tracking-widest truncate">
                {number || "Document.jpg"}
            </p>
            <div className="mt-1 flex">
                <div className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded-md text-[6px] md:text-[7px] font-black uppercase tracking-widest border border-emerald-50">
                    Verified
                </div>
            </div>
        </div>
    </div>
);

export default RiderProfile;
