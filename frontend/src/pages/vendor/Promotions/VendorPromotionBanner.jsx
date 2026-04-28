import React, { useState, useEffect } from 'react';
import { adminService, promotionService } from '../../../services/api';
import { Megaphone, Plus, Trash2, Calendar, Tag, Image as ImageIcon, Loader2, Edit2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VendorPromotionBanner = () => {
  const [products, setProducts] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const initialFormState = {
    product: '',
    title: '',
    short_description: '',
    offer_price: '',
    discount_percent: '',
    background_color: '#6D28D9',
    start_date: new Date().toISOString().slice(0, 16),
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    priority: 0,
    banner_image: null
  };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [prodRes, promoRes] = await Promise.all([
        adminService.getProducts(),
        promotionService.getVendorBanners()
      ]);
      setProducts(prodRes.data);
      setPromotions(promoRes.data);
    } catch (err) {
      console.error("Error fetching vendor promotion data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, banner_image: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'id') return;
      if (formData[key] !== null && formData[key] !== '') {
        if (key === 'banner_image' && typeof formData[key] === 'string') {
          return; // Skip sending image if it is just a URL string
        }
        data.append(key, formData[key]);
      } else if (key === 'banner_image' && (formData[key] === null || formData[key] === '')) {
        data.append(key, ''); // Explicitly send empty string to clear the image in backend
      }
    });

    try {
      if (formData.id) {
        await promotionService.updateBanner(formData.id, data);
      } else {
        await promotionService.submitBanner(data);
      }
      setShowForm(false);
      setFormData(initialFormState);
      fetchData();
    } catch (err) {
      console.error("Error submitting promotion", err);
      alert(err.response?.data?.error || "Failed to submit promotion");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (promo) => {
    setFormData({
      id: promo.id,
      product: promo.product?.id || promo.product || '',
      title: promo.title || '',
      short_description: promo.short_description || '',
      offer_price: promo.offer_price || '',
      discount_percent: promo.discount_percent || '',
      background_color: promo.background_color || '#6D28D9',
      start_date: promo.start_date ? new Date(promo.start_date).toISOString().slice(0, 16) : '',
      end_date: promo.end_date ? new Date(promo.end_date).toISOString().slice(0, 16) : '',
      priority: promo.priority || 0,
      banner_image: promo.image_url || null
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this promotion?")) return;
    try {
      await promotionService.deleteBanner(id);
      fetchData();
    } catch (err) {
      console.error("Error deleting promotion", err);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-brand-navy flex items-center gap-3 italic uppercase tracking-tighter">
            <Megaphone className="text-brand-purple" />
            Promotion <span className="text-brand-purple not-italic tracking-normal">Banners</span>
          </h1>
          <p className="text-brand-text-gray font-medium mt-1">Submit your products for homepage features.</p>
        </div>
        
        <button 
          onClick={() => {
             if (showForm) {
               setShowForm(false);
               setFormData(initialFormState);
             } else {
               setFormData(initialFormState);
               setShowForm(true);
             }
          }}
          className="bg-brand-purple text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-lg active:scale-95"
        >
          {showForm ? 'Cancel Submission' : <><Plus size={20} /> New Promotion</>}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-[2.5rem] p-10 shadow-2xl mb-12 border border-slate-100"
          >
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-brand-navy mb-2">Select Product</label>
                  <select 
                    name="product" 
                    value={formData.product} 
                    onChange={handleInputChange} 
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-brand-purple/20 transition-all font-medium"
                  >
                    <option value="">Choose a product...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} - (₹{p.price})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-brand-navy mb-2">Banner Title</label>
                  <input 
                    type="text" 
                    name="title" 
                    placeholder="e.g. Summer Special Tech Sale"
                    value={formData.title} 
                    onChange={handleInputChange} 
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-brand-purple/20 transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-brand-navy mb-2">Short Description</label>
                  <textarea 
                    name="short_description" 
                    placeholder="Briefly describe the offer..."
                    value={formData.short_description} 
                    onChange={handleInputChange} 
                    required
                    rows="3"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-brand-purple/20 transition-all font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-brand-navy mb-2">Offer Price (₹)</label>
                    <input 
                      type="number" 
                      name="offer_price" 
                      value={formData.offer_price} 
                      onChange={handleInputChange} 
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-brand-purple/20 transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-brand-navy mb-2">Discount %</label>
                    <input 
                      type="number" 
                      name="discount_percent" 
                      value={formData.discount_percent} 
                      onChange={handleInputChange} 
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-brand-purple/20 transition-all font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-brand-navy mb-2">Start Date</label>
                    <input 
                      type="datetime-local" 
                      name="start_date" 
                      value={formData.start_date} 
                      onChange={handleInputChange} 
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-brand-purple/20 transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-brand-navy mb-2">End Date</label>
                    <input 
                      type="datetime-local" 
                      name="end_date" 
                      value={formData.end_date} 
                      onChange={handleInputChange} 
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-brand-purple/20 transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-brand-navy mb-2">Background Color</label>
                  <div className="flex gap-4 items-center">
                    <input 
                      type="color" 
                      name="background_color" 
                      value={formData.background_color} 
                      onChange={handleInputChange} 
                      className="w-16 h-16 rounded-2xl border-none cursor-pointer"
                    />
                    <span className="text-sm font-bold text-slate-500 uppercase">{formData.background_color}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-brand-navy mb-2">Custom Banner Image (Optional)</label>
                  <div className="w-full h-40 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-all group relative overflow-hidden">
                    {formData.banner_image ? (
                      <>
                        <img 
                          src={typeof formData.banner_image === 'string' ? formData.banner_image : URL.createObjectURL(formData.banner_image)} 
                          className="w-full h-full object-cover" 
                        />
                        <button 
                          type="button"
                          onClick={(e) => {
                             e.preventDefault();
                             e.stopPropagation();
                             setFormData({...formData, banner_image: null});
                          }}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                        >
                           <X size={32} />
                        </button>
                      </>
                    ) : (
                      <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                        <ImageIcon className="text-slate-300 group-hover:text-brand-purple transition-colors mb-2" size={32} />
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Click to upload</span>
                        <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                      </label>
                    )}
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full bg-brand-navy text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-brand-purple transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? <><Loader2 className="animate-spin" size={18} /> Submitting...</> : formData.id ? 'Update Promotion' : 'Launch Promotion'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        <h3 className="text-lg font-black text-brand-navy uppercase tracking-widest mb-4">Your Campaigns</h3>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map(i => <div key={i} className="h-48 bg-slate-100 animate-pulse rounded-[2.5rem]"></div>)}
          </div>
        ) : promotions.length === 0 ? (
          <div className="bg-slate-50 rounded-[2.5rem] p-16 text-center border-2 border-dashed border-slate-200">
            <Megaphone className="mx-auto text-slate-300 mb-4" size={48} />
            <p className="text-slate-400 font-bold">No active campaigns yet. Create one to boost your sales!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {promotions.map(promo => (
              <div key={promo.id} className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-50 group hover:-translate-y-1 transition-all duration-300">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: promo.background_color }}>
                      <Tag size={20} />
                    </div>
                    <div>
                      <h4 className="font-black text-brand-navy uppercase tracking-tight">{promo.title}</h4>
                      <p className="text-xs text-brand-text-gray font-bold uppercase tracking-widest">₹{promo.offer_price}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEdit(promo)}
                      className="p-3 text-slate-300 hover:text-brand-purple hover:bg-brand-purple/10 transition-all rounded-xl"
                    >
                      <Edit2 size={20} />
                    </button>
                    <button 
                      onClick={() => handleDelete(promo.id)}
                      className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all rounded-xl"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-xs text-slate-500 font-bold">
                    <Calendar size={14} className="text-brand-purple" />
                    <span>
                      Active: {promo.start_date ? new Date(promo.start_date).toLocaleDateString() : 'N/A'} - {promo.end_date ? new Date(promo.end_date).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  
                  <div className="relative h-20 bg-slate-50 rounded-2xl overflow-hidden flex items-center p-4">
                    <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white/20 to-transparent z-10" />
                    <p className="text-xs font-medium text-slate-500 line-clamp-2 pr-20">{promo.short_description}</p>
                    <img 
                      src={promo.image_url || 'https://placehold.co/100?text=No+Image'} 
                      className="absolute right-4 w-12 h-12 object-contain rounded-lg shadow-sm"
                      onError={(e) => e.target.src = 'https://placehold.co/100?text=No+Image'}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorPromotionBanner;
