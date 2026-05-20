import React, { useState, useEffect } from 'react';
import { Star, X, AlertCircle, Plus, ShieldCheck } from 'lucide-react';
import { reviewService } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const WriteReviewModal = ({ isOpen, onClose, product, initialRating = 5, onSuccess }) => {
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRating(initialRating);
      setHoverRating(0);
      setComment('');
      setImages([]);
      setImagePreviews([]);
      setSubmitError('');
    }
  }, [isOpen, initialRating]);

  if (!isOpen || !product) return null;

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('product', product.id);
      formData.append('rating', rating);
      formData.append('comment', comment);
      
      if (images.length > 0) {
        images.forEach(img => {
          formData.append('images', img);
        });
      }

      await reviewService.createReview(formData);
      
      if (onSuccess) {
        onSuccess();
      }
      alert("Review submitted successfully!");
      onClose();
    } catch (err) {
      setSubmitError(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      alert("Maximum 5 images allowed");
      return;
    }
    const newImages = [...images, ...files];
    setImages(newImages);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const getRatingLabel = (val) => {
    const labels = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Very Good', 5: 'Excellent' };
    return labels[val] || '';
  };

  // Safe image path builder
  const getProductImage = () => {
    if (!product.primary_image) return "https://placehold.co/100";
    if (product.primary_image.startsWith('http') || product.primary_image.startsWith('blob:')) {
      return product.primary_image;
    }
    return `http://127.0.0.1:8000${product.primary_image}`;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden font-sans text-slate-800"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
            <div className="flex items-center gap-3">
              <img 
                src={getProductImage()} 
                alt={product.name} 
                className="w-10 h-10 object-cover rounded-lg border border-slate-200"
              />
              <div className="max-w-[280px]">
                <h3 className="text-base font-bold text-slate-900 leading-tight truncate">{product.name}</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Rate & Review Product</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 bg-white rounded-full hover:bg-slate-100 transition-all border border-slate-100"
            >
              <X size={18} />
            </button>
          </div>

          {/* Form Content */}
          <div className="overflow-y-auto p-8 custom-scrollbar">
            <form onSubmit={handleReviewSubmit}>
              {product.can_review && product.eligibility_message && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold rounded-2xl flex items-center gap-3">
                  <ShieldCheck size={18} className="shrink-0 text-emerald-500" />
                  <span>{product.eligibility_message}</span>
                </div>
              )}

              {submitError && (
                <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 text-sm font-medium rounded-xl flex items-start gap-3">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <span>{submitError}</span>
                </div>
              )}
              
              <div className="mb-6 flex flex-col items-center">
                <p className="text-sm font-bold text-slate-800 mb-3">Your Rating</p>
                <div className="flex items-center gap-3">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isLit = hoverRating ? star <= hoverRating : star <= rating;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="transition-all hover:scale-110 active:scale-95 cursor-pointer"
                      >
                        <Star 
                          size={38} 
                          fill={isLit ? "#fbbf24" : "none"} 
                          strokeWidth={1.5}
                          className={isLit ? "text-amber-400" : "text-slate-200"} 
                        />
                      </button>
                    );
                  })}
                </div>
                <span className="mt-3 text-xs font-black text-slate-400 uppercase tracking-wider">
                   {getRatingLabel(hoverRating || rating)}
                </span>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-800 mb-2">Your Review</label>
                <textarea
                  required
                  rows="4"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience with this product..."
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-[1.25rem] focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500 outline-none transition-all text-sm resize-none font-medium placeholder:text-slate-300"
                ></textarea>
                <div className="text-[10px] text-right mt-1 text-slate-400 font-bold">{comment.length}/1000</div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-800 mb-3">Add Photos <span className="text-slate-400 font-medium">(optional)</span></label>
                <div className="flex flex-wrap gap-3">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative w-16 h-16 group">
                      <img src={preview} className="w-full h-full object-cover rounded-xl border border-slate-200" />
                      <button 
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white p-1 rounded-full shadow-md scale-0 group-hover:scale-100 transition-all cursor-pointer"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                  {images.length < 5 && (
                    <label className="w-16 h-16 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-amber-400 hover:bg-amber-50/10 transition-all text-slate-400">
                      <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                      <Plus size={20} />
                    </label>
                  )}
                </div>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-[1.25rem] font-bold uppercase tracking-wider text-xs transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default WriteReviewModal;
