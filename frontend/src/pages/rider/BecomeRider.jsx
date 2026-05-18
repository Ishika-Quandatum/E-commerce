import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Mail, Phone, Lock, MapPin, Truck, 
  CreditCard, PhoneCall, Upload, CheckCircle2, 
  AlertCircle, Building, Hash, Smartphone,
  FileText, Landmark, ShieldCheck, Calendar,
  Briefcase, Heart
} from 'lucide-react';
import { riderService } from '../../services/api';
import { useNavigate, Link } from 'react-router-dom';
import clsx from 'clsx';

const BecomeRider = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    address: '',
    city: '',
    date_of_birth: '',
    gender: 'Male',
    vehicle_type: 'Bike',
    vehicle_number: '',
    rc_number: '',
    license_number: '',
    insurance_number: '',
    insurance_valid_till: '',
    bank_account_number: '',
    ifsc_code: '',
    account_holder_name: '',
    bank_name: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: ''
  });

  const [files, setFiles] = useState({
    license_image: null,
    id_proof_image: null,
    profile_photo: null,
    vehicle_image: null,
    bank_proof_image: null
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    if (selectedFiles && selectedFiles[0]) {
      setFiles(prev => ({ ...prev, [name]: selectedFiles[0] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError('');

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key]) data.append(key, formData[key]);
    });
    Object.keys(files).forEach(key => {
      if (files[key]) data.append(key, files[key]);
    });

    try {
      await riderService.register(data);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 5000);
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 text-center border border-slate-100"
        >
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-3xl font-black text-brand-navy mb-4">Application Submitted!</h2>
          <p className="text-slate-500 font-medium leading-relaxed mb-8">
            Your registration is successful. Our team will verify your documents and approve your account within 24-48 hours.
          </p>
          <p className="text-brand-purple font-bold text-sm">Redirecting to login...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-black text-brand-navy tracking-tight mb-4"
          >
            Become a <span className="text-brand-purple">Delivery Partner</span>
          </motion.h1>
          <p className="text-slate-500 font-medium text-lg">Join our fleet and start earning with flexible hours.</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
        >
          <form onSubmit={handleSubmit} className="p-8 sm:p-12">
            {error && (
              <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 font-bold text-sm">
                <AlertCircle size={18} /> {error}
              </div>
            )}

            <div className="space-y-12">
              {/* 1. Personal Details */}
              <section>
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 bg-brand-purple/10 rounded-lg text-brand-purple">
                    <User size={18} />
                  </div>
                  <h3 className="text-lg font-black text-brand-navy uppercase tracking-widest">Personal Details</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField label="Full Name" name="full_name" icon={<User size={18}/>} value={formData.full_name} onChange={handleInputChange} required />
                  <InputField label="Email Address" name="email" type="email" icon={<Mail size={18}/>} value={formData.email} onChange={handleInputChange} required />
                  <InputField label="Mobile Number" name="phone" icon={<Smartphone size={18}/>} value={formData.phone} onChange={handleInputChange} required />
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Date of Birth" name="date_of_birth" type="date" icon={<Calendar size={18}/>} value={formData.date_of_birth} onChange={handleInputChange} required />
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Gender</label>
                      <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold text-brand-navy outline-none focus:border-brand-purple">
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <InputField label="Password" name="password" type="password" icon={<Lock size={18}/>} value={formData.password} onChange={handleInputChange} required />
                  <InputField label="Confirm Password" name="confirm_password" type="password" icon={<Lock size={18}/>} value={formData.confirm_password} onChange={handleInputChange} required />
                </div>
              </section>

              {/* 2. Vehicle Details */}
              <section className="pt-10 border-t border-slate-100">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 bg-brand-purple/10 rounded-lg text-brand-purple">
                    <Truck size={18} />
                  </div>
                  <h3 className="text-lg font-black text-brand-navy uppercase tracking-widest">Vehicle Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Vehicle Type</label>
                    <select name="vehicle_type" value={formData.vehicle_type} onChange={handleInputChange} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold text-brand-navy outline-none focus:border-brand-purple">
                      <option value="Bike">Bike</option>
                      <option value="Scooter">Scooter</option>
                      <option value="Cycle">Bicycle</option>
                      <option value="Van">Delivery Van</option>
                    </select>
                  </div>
                  <InputField label="Vehicle Number" name="vehicle_number" icon={<Hash size={18}/>} value={formData.vehicle_number} onChange={handleInputChange} required />
                  <InputField label="RC Number" name="rc_number" icon={<FileText size={18}/>} value={formData.rc_number} onChange={handleInputChange} required />
                  <InputField label="Driving License No." name="license_number" icon={<FileText size={18}/>} value={formData.license_number} onChange={handleInputChange} required />
                  <InputField label="Insurance Number" name="insurance_number" icon={<ShieldCheck size={18}/>} value={formData.insurance_number} onChange={handleInputChange} required />
                  <InputField label="Insurance Valid Till" name="insurance_valid_till" type="date" icon={<Calendar size={18}/>} value={formData.insurance_valid_till} onChange={handleInputChange} required />
                </div>
              </section>

              {/* 3. Bank & Documents */}
              <section className="pt-10 border-t border-slate-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-brand-purple/10 rounded-lg text-brand-purple">
                        <Landmark size={18} />
                      </div>
                      <h3 className="text-lg font-black text-brand-navy uppercase tracking-widest">Bank Details</h3>
                    </div>
                    <div className="space-y-4">
                      <InputField label="Account Holder Name" name="account_holder_name" icon={<User size={18}/>} value={formData.account_holder_name} onChange={handleInputChange} required />
                      <InputField label="Account Number" name="bank_account_number" icon={<CreditCard size={18}/>} value={formData.bank_account_number} onChange={handleInputChange} required />
                      <InputField label="IFSC Code" name="ifsc_code" icon={<Hash size={18}/>} value={formData.ifsc_code} onChange={handleInputChange} required />
                      <InputField label="Bank Name" name="bank_name" icon={<Building size={18}/>} value={formData.bank_name} onChange={handleInputChange} required />
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-brand-purple/10 rounded-lg text-brand-purple">
                        <Upload size={18} />
                      </div>
                      <h3 className="text-lg font-black text-brand-navy uppercase tracking-widest">KYC Documents</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FileUpload label="Profile Photo" name="profile_photo" onChange={handleFileChange} file={files.profile_photo} />
                      <FileUpload label="Vehicle Image" name="vehicle_image" onChange={handleFileChange} file={files.vehicle_image} />
                      <FileUpload label="Driving License" name="license_image" onChange={handleFileChange} file={files.license_image} />
                      <FileUpload label="ID Proof (Aadhaar)" name="id_proof_image" onChange={handleFileChange} file={files.id_proof_image} />
                      <FileUpload label="Bank Proof" name="bank_proof_image" onChange={handleFileChange} file={files.bank_proof_image} />
                    </div>
                  </div>
                </div>
              </section>

              {/* 4. Emergency & Address */}
              <section className="pt-10 border-t border-slate-100">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   <div className="space-y-8">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-purple/10 rounded-lg text-brand-purple">
                          <PhoneCall size={18} />
                        </div>
                        <h3 className="text-lg font-black text-brand-navy uppercase tracking-widest">Emergency Contact</h3>
                      </div>
                      <div className="space-y-4">
                        <InputField label="Contact Name" name="emergency_contact_name" icon={<User size={18}/>} value={formData.emergency_contact_name} onChange={handleInputChange} required />
                        <InputField label="Contact Number" name="emergency_contact_phone" icon={<Smartphone size={18}/>} value={formData.emergency_contact_phone} onChange={handleInputChange} required />
                        <InputField label="Relationship" name="emergency_contact_relationship" icon={<Heart size={18}/>} value={formData.emergency_contact_relationship} onChange={handleInputChange} required />
                      </div>
                   </div>

                   <div className="space-y-8">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-purple/10 rounded-lg text-brand-purple">
                          <MapPin size={18} />
                        </div>
                        <h3 className="text-lg font-black text-brand-navy uppercase tracking-widest">Location</h3>
                      </div>
                      <div className="space-y-4">
                        <InputField label="City" name="city" icon={<Building size={18}/>} value={formData.city} onChange={handleInputChange} required />
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Full Address</label>
                          <textarea name="address" value={formData.address} onChange={handleInputChange} required className="w-full h-32 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold text-brand-navy outline-none focus:border-brand-purple" />
                        </div>
                      </div>
                   </div>
                 </div>
              </section>
            </div>

            <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 pt-10 border-t border-slate-100">
              <p className="text-sm font-bold text-brand-text-gray">
                Already registered? <Link to="/login" className="text-brand-purple hover:underline">Sign In</Link>
              </p>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-12 h-14 bg-brand-purple text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-brand-purple/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Submit Application
                    <CheckCircle2 size={18} />
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

const InputField = ({ label, icon, ...props }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">{label}</label>
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-purple transition-colors">
        {icon}
      </div>
      <input 
        {...props}
        className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 text-sm font-bold text-brand-navy placeholder:text-slate-300 focus:border-brand-purple focus:ring-0 transition-all outline-none"
      />
    </div>
  </div>
);

const FileUpload = ({ label, onChange, name, file }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">{label}</label>
    <div className="relative group">
      <input 
        type="file" 
        id={name}
        name={name} 
        onChange={onChange} 
        className="hidden" 
        accept="image/*" 
        required={!file} 
      />
      <label 
        htmlFor={name}
        className={clsx(
          "flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl cursor-pointer transition-all overflow-hidden text-center p-2",
          file 
            ? "bg-green-50 border-green-200" 
            : "bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-brand-purple/30"
        )}
      >
        {file ? (
          <div className="flex flex-col items-center gap-1">
            <CheckCircle2 size={24} className="text-green-500" />
            <span className="text-[10px] font-bold text-green-600 truncate max-w-full px-1">{file.name}</span>
          </div>
        ) : (
          <>
            <Upload size={18} className="text-slate-400 mb-1" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Upload</span>
          </>
        )}
      </label>
    </div>
  </div>
);


export default BecomeRider;
