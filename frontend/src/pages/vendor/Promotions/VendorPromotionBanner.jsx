import React, { useState, useEffect } from 'react';
import { adminService, promotionService } from '../../../services/api';
import { Megaphone, Plus, Trash2, Calendar, Tag, Image as ImageIcon, Loader2, Edit2, X, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VendorPromotionBanner = () => {
  const [products, setProducts] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  const initialFormState = {
    product: '',
    title: '',
    short_description: '',
    offer_price: '',
    discount_percent: '',
    background_color: '#6D28D9',
    gradient_color_1: '#6D28D9',
    gradient_color_2: '#4F46E5',
    gradient_direction: '135deg',
    title_color: '#FFFFFF',
    description_color: '#F3F4F6',
    button_text: 'Shop Now',
    button_text_color: '#0F172A',
    button_bg_color: '#FFFFFF',
    image_position: 'right',
    border_radius: 16,
    overlay_opacity: 0.2,
    badge_text: '',
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
      const productsData = Array.isArray(prodRes.data) ? prodRes.data : (prodRes.data?.results || []);
      setProducts(productsData);
      const promotionsData = Array.isArray(promoRes.data) ? promoRes.data : (promoRes.data?.results || []);
      setPromotions(promotionsData);
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
      if (key === 'banner_image' && formData[key]) {
        if (typeof formData[key] === 'string') return;
        data.append(key, formData[key]);
      } else if (key === 'banner_image' && !formData[key]) {
        data.append(key, '');
      } else if (formData[key] !== null) {
        data.append(key, formData[key]);
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
      gradient_color_1: promo.gradient_color_1 || '#6D28D9',
      gradient_color_2: promo.gradient_color_2 || '#4F46E5',
      gradient_direction: promo.gradient_direction || '135deg',
      title_color: promo.title_color || '#FFFFFF',
      description_color: promo.description_color || '#F3F4F6',
      button_text: promo.button_text || 'Shop Now',
      button_text_color: promo.button_text_color || '#0F172A',
      button_bg_color: promo.button_bg_color || '#FFFFFF',
      image_position: promo.image_position || 'right',
      border_radius: promo.border_radius || 16,
      overlay_opacity: promo.overlay_opacity || 0.2,
      badge_text: promo.badge_text || '',
      start_date: promo.start_date ? new Date(promo.start_date).toISOString().slice(0, 16) : '',
      end_date: promo.end_date ? new Date(promo.end_date).toISOString().slice(0, 16) : '',
      priority: promo.priority || 0,
      banner_image: promo.image_url || null
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this promotion?")) return;
    try {
      await promotionService.deleteBanner(id);
      fetchData();
    } catch (err) {
      console.error("Error deleting promotion", err);
    }
  };

  const getComputedBackground = (data) => {
    if (data.gradient_color_1 && data.gradient_color_2) {
      return `linear-gradient(${data.gradient_direction}, ${data.gradient_color_1}, ${data.gradient_color_2})`;
    }
    return data.background_color;
  };

  const [viewMode, setViewMode] = useState('grid');

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-brand-purple" size={48} /></div>;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-black text-brand-navy flex items-center gap-3 italic uppercase tracking-tighter">
            <Megaphone className="text-brand-purple" size={36} />
            Premium <span className="text-brand-purple not-italic tracking-normal">Banners</span>
          </h1>
          <p className="text-brand-text-gray font-bold mt-1 uppercase text-xs tracking-widest">Flipkart Style Ad Manager</p>
        </div>
        
        <div className="flex flex-wrap gap-4 items-center">
          {/* View Mode Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white shadow-md text-brand-purple' : 'text-slate-400 hover:text-slate-600'}`}
              title="Grid View"
            >
              <Plus size={20} className="rotate-45" /> {/* Using Plus as a placeholder for grid icon if not imported */}
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white shadow-md text-brand-purple' : 'text-slate-400 hover:text-slate-600'}`}
              title="List View"
            >
              <div className="w-5 h-5 flex flex-col gap-1 justify-center items-center">
                 <div className="w-4 h-0.5 bg-current"></div>
                 <div className="w-4 h-0.5 bg-current"></div>
                 <div className="w-4 h-0.5 bg-current"></div>
              </div>
            </button>
          </div>

          <button 
            onClick={() => setShowPreview(!showPreview)}
            className="px-6 py-3 rounded-2xl font-bold border-2 border-slate-200 text-slate-500 hover:border-brand-purple hover:text-brand-purple transition-all hidden sm:block"
          >
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
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
            className="bg-brand-purple text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2 hover:scale-105 transition-all shadow-xl active:scale-95 uppercase text-sm tracking-widest"
          >
            {showForm ? 'Cancel Submission' : <><Plus size={20} /> Launch Campaign</>}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col xl:flex-row gap-8 mb-16"
          >

            {/* FORM SIDE */}
            <form onSubmit={handleSubmit} className="flex-grow bg-white rounded-[2.5rem] p-6 sm:p-10 shadow-2xl border border-slate-100 space-y-12">
              
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                  <Tag className="text-brand-purple" size={20} />
                  <h3 className="font-black text-brand-navy uppercase tracking-widest text-sm">Basic Details</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Select Product</label>
                    <select name="product" value={formData.product} onChange={handleInputChange} required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-brand-purple/20 transition-all font-bold text-brand-navy">
                      <option value="">Choose a product...</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name} - (₹{p.price})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Banner Title</label>
                    <input type="text" name="title" placeholder="e.g. Summer Special" value={formData.title} onChange={handleInputChange} required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-brand-purple/20 transition-all font-bold text-brand-navy" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Short Description</label>
                    <textarea name="short_description" placeholder="Describe the offer..." value={formData.short_description} onChange={handleInputChange} required rows="2" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-brand-purple/20 transition-all font-bold text-brand-navy" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Offer Price (₹)</label>
                    <input type="number" name="offer_price" value={formData.offer_price} onChange={handleInputChange} required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-brand-purple/20 transition-all font-bold text-brand-navy" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Discount %</label>
                    <input type="number" name="discount_percent" value={formData.discount_percent} onChange={handleInputChange} required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-brand-purple/20 transition-all font-bold text-brand-navy" />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                  <Edit2 className="text-brand-purple" size={20} />
                  <h3 className="font-black text-brand-navy uppercase tracking-widest text-sm">Design Settings</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Base Background</label>
                    <input type="color" name="background_color" value={formData.background_color} onChange={handleInputChange} className="w-full h-12 rounded-xl cursor-pointer" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Gradient 1</label>
                    <input type="color" name="gradient_color_1" value={formData.gradient_color_1} onChange={handleInputChange} className="w-full h-12 rounded-xl cursor-pointer" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Gradient 2</label>
                    <input type="color" name="gradient_color_2" value={formData.gradient_color_2} onChange={handleInputChange} className="w-full h-12 rounded-xl cursor-pointer" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Direction</label>
                    <select name="gradient_direction" value={formData.gradient_direction} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-xs">
                      <option value="to right">Horizontal</option>
                      <option value="to bottom">Vertical</option>
                      <option value="135deg">Diagonal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Title Color</label>
                    <input type="color" name="title_color" value={formData.title_color} onChange={handleInputChange} className="w-full h-12 rounded-xl cursor-pointer" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Desc Color</label>
                    <input type="color" name="description_color" value={formData.description_color} onChange={handleInputChange} className="w-full h-12 rounded-xl cursor-pointer" />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                  <Megaphone className="text-brand-purple" size={20} />
                  <h3 className="font-black text-brand-navy uppercase tracking-widest text-sm">CTA Button</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Button Text</label>
                    <input type="text" name="button_text" value={formData.button_text} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-xs" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Text Color</label>
                    <input type="color" name="button_text_color" value={formData.button_text_color} onChange={handleInputChange} className="w-full h-12 rounded-xl cursor-pointer" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">BG Color</label>
                    <input type="color" name="button_bg_color" value={formData.button_bg_color} onChange={handleInputChange} className="w-full h-12 rounded-xl cursor-pointer" />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                  <ImageIcon className="text-brand-purple" size={20} />
                  <h3 className="font-black text-brand-navy uppercase tracking-widest text-sm">Layout Settings</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Image Position</label>
                    <select name="image_position" value={formData.image_position} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-xs">
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                      <option value="center">Center / Full</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Radius (px)</label>
                    <input type="number" name="border_radius" value={formData.border_radius} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-xs" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Overlay</label>
                    <input type="number" step="0.1" max="1" min="0" name="overlay_opacity" value={formData.overlay_opacity} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-xs" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Badge Text</label>
                    <input type="text" name="badge_text" placeholder="e.g. New" value={formData.badge_text} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-xs" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Image</label>
                    <input type="file" onChange={handleFileChange} className="w-full text-[8px]" accept="image/*" />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                  <Calendar className="text-brand-purple" size={20} />
                  <h3 className="font-black text-brand-navy uppercase tracking-widest text-sm">Schedule</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <input type="datetime-local" name="start_date" value={formData.start_date} onChange={handleInputChange} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-xs" />
                  <input type="datetime-local" name="end_date" value={formData.end_date} onChange={handleInputChange} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-xs" />
                  <input type="number" name="priority" value={formData.priority} onChange={handleInputChange} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-xs" placeholder="Priority" />
                </div>
              </div>

              <button type="submit" disabled={submitting} className="w-full bg-brand-navy text-white py-6 rounded-3xl font-black text-lg uppercase tracking-[0.3em] hover:bg-brand-purple transition-all shadow-2xl disabled:opacity-50 flex items-center justify-center gap-3">
                {submitting ? <Loader2 className="animate-spin" /> : formData.id ? 'Update' : 'Launch'}
              </button>
            </form>

            {/* PREVIEW SIDE */}
            {showPreview && (
              <div className="xl:w-[500px] space-y-6">
                <div className="sticky top-10">
                  <div className="flex items-center justify-between mb-4">
                     <h3 className="text-xs font-black uppercase tracking-widest text-brand-navy">Live Preview</h3>
                     <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 uppercase"><div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div> Live</span>
                  </div>
                  <div className="relative w-full h-[224.38px] overflow-hidden shadow-2xl border border-slate-200" style={{ borderRadius: `${formData.border_radius}px`, background: getComputedBackground(formData) }}>
                     <div className={`w-full h-full flex relative ${formData.image_position === 'left' ? 'flex-row-reverse' : formData.image_position === 'center' ? 'flex-col justify-center' : 'flex-row'}`}>
                        {formData.banner_image && (
                          <div className={`relative overflow-hidden ${formData.image_position === 'center' ? 'absolute inset-0 w-full h-full' : 'w-1/2 h-full'}`}>
                            <img src={typeof formData.banner_image === 'string' ? formData.banner_image : URL.createObjectURL(formData.banner_image)} className="w-full h-full object-cover" />
                            {formData.image_position === 'center' && <div className="absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${formData.overlay_opacity})` }}></div>}
                          </div>
                        )}
                        <div className={`relative z-10 p-6 flex flex-col justify-center ${formData.image_position === 'center' ? 'w-full items-center text-center' : 'w-1/2'}`}>
                           {formData.badge_text && <span className="inline-block w-fit px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest bg-white/20 backdrop-blur-md mb-2 border border-white/10" style={{ color: formData.title_color }}>{formData.badge_text}</span>}
                           <h3 className="text-[10px] font-bold opacity-90 uppercase tracking-widest mb-1" style={{ color: formData.title_color }}>{formData.vendor_name || 'Vendor'}</h3>
                           <h2 className="text-xl font-black mb-2 leading-tight" style={{ color: formData.title_color }}>{formData.title || 'Title'}</h2>
                           <p className="text-[10px] opacity-90 mb-4 line-clamp-2" style={{ color: formData.description_color }}>{formData.short_description || 'Desc'}</p>
                           <span className="px-4 py-2 rounded-xl font-bold uppercase text-[10px] shadow-md w-fit" style={{ backgroundColor: formData.button_bg_color, color: formData.button_text_color }}>{formData.button_text} <ArrowRight size={12} className="inline ml-1" /></span>
                        </div>
                        <div className="absolute bottom-3 right-4 bg-black/30 backdrop-blur-md px-2 py-0.5 rounded-md text-[8px] font-bold text-white uppercase tracking-widest z-10">AD</div>
                     </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* PROMOTIONS LIST/GRID SECTION */}
      <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "space-y-4"}>
        {promotions.map((promo) => (
          <div 
            key={promo.id} 
            className={`bg-white rounded-[2rem] shadow-xl border border-slate-100 hover:shadow-2xl transition-all overflow-hidden flex ${
              viewMode === 'grid' ? 'flex-col p-6' : 'flex-row items-center p-4 gap-6'
            }`}
          >
            {/* Thumbnail/Banner Preview */}
            <div 
              className={`rounded-2xl overflow-hidden relative flex-shrink-0 ${
                viewMode === 'grid' ? 'h-40 w-full mb-6' : 'h-24 w-40'
              }`} 
              style={{ background: promo.computed_background || promo.background_color }}
            >
              {promo.image_url && <img src={promo.image_url} alt={promo.title} className="w-full h-full object-cover" />}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-3 flex flex-col justify-end">
                <span className="text-[8px] font-black text-white/80 uppercase tracking-widest">{promo.vendor_name}</span>
                <h3 className={`text-white font-black uppercase leading-tight ${viewMode === 'grid' ? 'text-lg' : 'text-sm'}`}>{promo.title}</h3>
              </div>
            </div>

            {/* Details */}
            <div className={`flex-grow ${viewMode === 'grid' ? 'space-y-4' : 'flex items-center justify-between'}`}>
              <div className={viewMode === 'list' ? 'flex flex-col' : 'space-y-3'}>
                <div className="flex items-center gap-3">
                   <div className="flex items-center gap-1.5 text-[10px] font-bold text-brand-navy bg-slate-50 px-3 py-1.5 rounded-lg">
                    <Calendar size={12} className="text-brand-purple" />
                    {new Date(promo.start_date).toLocaleDateString()} - {new Date(promo.end_date).toLocaleDateString()}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${new Date(promo.end_date) > new Date() ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {new Date(promo.end_date) > new Date() ? 'Active' : 'Expired'}
                  </span>
                </div>
                {viewMode === 'grid' && (
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Priority: {promo.priority}
                  </div>
                )}
              </div>

              {/* Actions Area */}
              <div className={`flex items-center gap-2 ${viewMode === 'grid' ? 'pt-4 border-t border-slate-100 mt-2' : ''}`}>
                <button 
                  onClick={() => handleEdit(promo)} 
                  className="flex items-center gap-2 bg-slate-50 text-brand-navy px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-purple hover:text-white transition-all"
                >
                  <Edit2 size={14} /> {viewMode === 'list' ? 'Edit' : ''}
                </button>
                <button 
                  onClick={() => handleDelete(promo.id)} 
                  className="flex items-center gap-2 bg-slate-50 text-rose-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all"
                >
                  <Trash2 size={14} /> {viewMode === 'list' ? 'Delete' : ''}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VendorPromotionBanner;
