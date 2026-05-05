import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Star, ShoppingCart, ShieldCheck, Truck, RotateCcw, Plus, Minus, Heart, Edit3, X, ThumbsUp, AlertCircle, ChevronRight, Tag, Banknote, ChevronsRight } from 'lucide-react';
import { productService, reviewService } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '', images: [] });
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await productService.getProductDetail(id);
        setProduct(res.data);
      } catch (err) {
        console.error("Error fetching product", err);
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product && new URLSearchParams(location.search).get('write_review') === 'true') {
      if (product.can_review) {
        setShowReviewModal(true);
      }
    }
  }, [product, location.search]);

  if (loading) return (
    <div className="flex items-center justify-center h-[70vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
    </div>
  );

  if (!product) return null;

  const images = product.images?.length > 0 ? product.images : [{ image: 'https://placehold.co/800' }];

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('product', product.id);
      formData.append('rating', reviewForm.rating);
      formData.append('comment', reviewForm.comment);
      
      if (reviewForm.images.length > 0) {
        reviewForm.images.forEach(img => {
          formData.append('images', img);
        });
      }

      await reviewService.createReview(formData);
      setShowReviewModal(false);
      setReviewForm({ rating: 5, comment: '', images: [] });
      setImagePreviews([]);
      
      // Refresh product
      const res = await productService.getProductDetail(id);
      setProduct(res.data);
      alert("Review submitted successfully!");
    } catch (err) {
      setSubmitError(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + reviewForm.images.length > 5) {
      alert("Maximum 5 images allowed");
      return;
    }

    const newImages = [...reviewForm.images, ...files];
    setReviewForm({ ...reviewForm, images: newImages });

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const removeImage = (index) => {
    const newImages = reviewForm.images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setReviewForm({ ...reviewForm, images: newImages });
    setImagePreviews(newPreviews);
  };

  const getRatingLabel = (rating) => {
    const labels = {
      1: 'Poor',
      2: 'Fair',
      3: 'Good',
      4: 'Very Good',
      5: 'Excellent'
    };
    return labels[rating] || '';
  };

  const handleHelpful = async (reviewId) => {
    try {
      await reviewService.markHelpful(reviewId);
      const res = await productService.getProductDetail(id);
      setProduct(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBuyNow = async () => {
    try {
      await addToCart(product.id, quantity);
      navigate('/checkout');
    } catch (err) {
      console.error("Error in Buy Now", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-[#f8fafc] min-h-screen">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-4 bg-white p-3 rounded-lg border border-slate-100">
        <span>Home</span> <ChevronRight size={12} />
        <span>{product.category_name}</span> <ChevronRight size={12} />
        <span className="truncate max-w-[200px]">{product.name}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left Section: Images & Primary Actions */}
        <div className="w-full lg:w-[45%] flex flex-col gap-4">
           <div className="bg-white p-4 rounded-xl flex gap-4 border border-slate-100">
              {/* Vertical Thumbnails */}
              <div className="flex flex-col gap-2 w-16 shrink-0">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onMouseEnter={() => setActiveImage(idx)}
                    onClick={() => setActiveImage(idx)}
                    className={`aspect-square rounded-md overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-[#6D28D9]' : 'border-slate-100'}`}
                  >
                    <img src={img.image} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              {/* Main Image View */}
              <div className="flex-1 aspect-[4/5] bg-white rounded-lg overflow-hidden border border-slate-50 relative group">
                <img
                  src={images[activeImage].image}
                  className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                />
              </div>
           </div>

           {/* Split Action Buttons */}
           <div className="flex gap-3">
              <button
                onClick={() => addToCart(product.id, quantity)}
                className="flex-1 h-14 bg-white border border-[#6D28D9] text-[#6D28D9] rounded-lg flex items-center justify-center gap-2 font-bold text-base transition-all active:scale-95"
              >
                <ShoppingCart size={20} />
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 h-14 bg-[#6D28D9] hover:bg-[#5B21B6] text-white rounded-lg flex items-center justify-center gap-2 font-bold text-base transition-all shadow-lg shadow-[#6D28D9]/20 active:scale-95"
              >
                <ChevronsRight size={20} className="text-white" />
                Buy Now
              </button>
           </div>
        </div>

        {/* Right Section: Product Details */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Main Info Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <h1 className="text-lg font-medium text-slate-500 leading-tight mb-3">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl font-bold text-slate-900 tabular-nums">
                ₹{(product.discount_price || product.price).toLocaleString()}
              </span>
              {product.discount_price && (
                <>
                  <span className="text-base text-slate-400 line-through">₹{product.price.toLocaleString()}</span>
                  <span className="text-[#249b3e] font-bold text-sm">{product.discount_percentage}% off</span>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1 px-2 py-0.5 bg-[#249b3e] text-white rounded-full text-xs font-bold">
                <span>{product.rating || '0.0'}</span>
                <Star size={10} fill="currentColor" />
              </div>
              <span className="text-slate-400 text-xs font-medium">{product.review_metrics?.total || 0} Ratings, {product.reviews?.length || 0} Reviews</span>
            </div>

            <div className="bg-[#f9f9f9] px-3 py-2 rounded-lg inline-flex items-center gap-2 text-[11px] font-bold text-slate-600">
               <span className="bg-[#5c85e5] text-white px-1.5 py-0.5 rounded italic">Mall</span>
               <ShieldCheck size={14} className="text-blue-500" /> Original Brand
               <ShieldCheck size={14} className="text-blue-500" /> Authorised Seller
               <ChevronRight size={14} className="ml-auto" />
            </div>
          </div>

          {/* Size Selector */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wide">Select Size</h3>
            <div className="flex flex-wrap gap-2">
               {['Free Size', 'S', 'M', 'L', 'XL'].map((size) => (
                 <button 
                  key={size}
                  className={`px-5 py-2 rounded-full border-2 text-sm font-bold transition-all ${size === 'Free Size' ? 'border-[#6D28D9] text-[#6D28D9] bg-[#6D28D9]/5' : 'border-slate-100 text-slate-600 hover:border-slate-200'}`}
                 >
                   {size}
                 </button>
               ))}
            </div>
          </div>

          {/* Highlights */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Product Highlights</h3>
              <button className="text-[#6D28D9] text-[10px] font-bold uppercase tracking-widest">Copy</button>
            </div>
            <div className="grid grid-cols-2 gap-y-4 gap-x-8">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Category</p>
                <p className="text-xs font-bold text-slate-700">{product.category_name}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Brand</p>
                <p className="text-xs font-bold text-slate-700">{product.brand_name || 'Generic'}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">In Stock</p>
                <p className="text-xs font-bold text-slate-700">{product.stock} units</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">SKU</p>
                <p className="text-xs font-bold text-slate-700">{product.sku || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Sold By Section */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
             <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wide">Sold By</h3>
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                      <Truck size={20} />
                   </div>
                   <div>
                      <p className="text-sm font-bold text-slate-900">{product.vendor_name || 'Official Store'}</p>
                      <p className="text-[10px] text-emerald-500 font-bold uppercase">Certified Partner</p>
                   </div>
                </div>
                <button className="px-4 py-2 border border-[#6D28D9] text-[#6D28D9] rounded-lg text-xs font-bold hover:bg-[#6D28D9]/5 transition-all">View Shop</button>
             </div>
          </div>
 
          {/* Trust Badges */}
          <div className="bg-brand-orange/5 p-4 rounded-xl border border-brand-orange/10 flex items-center justify-around">
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                <Tag size={20} className="text-brand-orange" />
              </div>
              <span className="text-[10px] font-bold text-slate-700">Lowest Price</span>
            </div>
            <div className="w-px h-10 bg-brand-orange/10" />
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                <Banknote size={20} className="text-brand-orange" />
              </div>
              <span className="text-[10px] font-bold text-slate-700">Cash on Delivery</span>
            </div>
            <div className="w-px h-10 bg-brand-orange/10" />
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                <RotateCcw size={20} className="text-brand-orange" />
              </div>
              <span className="text-[10px] font-bold text-slate-700">7-day Returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Review Section */}
      <div className="mt-20">
        <div className="flex flex-col md:flex-row items-start gap-12">
          {/* Review Metrics */}
          <div className="w-full md:w-1/3 bg-slate-50 p-8 rounded-[2rem]">
            <h3 className="text-2xl font-extrabold text-slate-900 mb-6 tracking-tighter">Customer Reviews</h3>
            <div className="flex items-end gap-4 mb-8">
              <h4 className="text-6xl font-black text-slate-900 tracking-tighter">{product.rating || '0.0'}</h4>
              <div className="mb-2">
                <div className="flex text-amber-400 mb-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={20} fill={star <= Math.round(product.rating || 0) ? "currentColor" : "none"} strokeWidth={1.5} className={star <= Math.round(product.rating || 0) ? "" : "text-slate-300"} />
                  ))}
                </div>
                <p className="text-sm font-medium text-slate-500">Based on {product.review_metrics?.total || 0} reviews</p>
              </div>
            </div>

            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-12 text-sm font-medium text-slate-600">
                    {star} <Star size={14} className="text-slate-400" />
                  </div>
                  <div className="flex-grow h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-400 rounded-full" 
                      style={{ width: `${product.review_metrics?.breakdown?.[star] || 0}%` }}
                    />
                  </div>
                  <div className="w-8 text-right text-xs font-medium text-slate-500">
                    {product.review_metrics?.breakdown?.[star] || 0}%
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100">
              <p className="text-sm font-bold text-slate-900 mb-2">Review this product</p>
              <p className="text-xs text-slate-500 mb-6">{product.eligibility_message}</p>
              
              <button 
                onClick={() => setShowReviewModal(true)}
                disabled={!product.can_review}
                className={`w-full py-4 rounded-[1rem] font-bold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                  product.can_review 
                  ? "border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white" 
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
              >
                <Edit3 size={18} /> {product.reviews?.some(r => r.user === product.current_user_id) ? 'Already Reviewed' : 'Write a Review'}
              </button>
            </div>
          </div>

          {/* Review List */}
          <div className="w-full md:w-2/3 space-y-6">
            {product.reviews && product.reviews.length > 0 ? (
              product.reviews.map((review) => (
                <div key={review.id} className="bg-white border border-slate-100 p-8 rounded-[2rem] shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      {review.user_avatar ? (
                        <img src={review.user_avatar} alt={review.user_name} className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-lg font-bold text-slate-400 uppercase">
                          {review.user_name?.[0] || 'U'}
                        </div>
                      )}
                      <div>
                        <h5 className="font-bold text-slate-900">{review.user_name}</h5>
                        <p className="text-xs text-slate-400">{new Date(review.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex text-amber-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} size={16} fill={star <= review.rating ? "currentColor" : "none"} className={star <= review.rating ? "" : "text-slate-300"} />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-sm mb-4">{review.comment}</p>
                  
                  {review.images && review.images.length > 0 && (
                    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                      {review.images.map((img, i) => (
                        <img key={i} src={img.image} className="w-20 h-20 object-cover rounded-xl border border-slate-100" alt="Review" />
                      ))}
                    </div>
                  )}
                  <button 
                    onClick={() => handleHelpful(review.id)}
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-brand-purple transition-colors"
                  >
                    <ThumbsUp size={14} /> Helpful ({review.helpful_votes})
                  </button>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-20 text-center">
                <Star size={48} className="text-slate-200 mb-4" />
                <h4 className="text-xl font-bold text-slate-900 mb-2">No reviews yet</h4>
                <p className="text-slate-500">Be the first to review this product!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Write Review Modal */}
      <AnimatePresence>
        {showReviewModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="text-lg font-bold text-slate-900">Write a Review</h3>
                <button 
                  onClick={() => setShowReviewModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 bg-white rounded-full hover:bg-slate-100 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleReviewSubmit} className="p-8">
                {product.can_review && (
                  <div className="mb-8 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold rounded-2xl flex items-center gap-3">
                    <ShieldCheck size={20} className="shrink-0 text-emerald-500" />
                    <span>{product.eligibility_message}</span>
                  </div>
                )}

                {submitError && (
                  <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 text-sm font-medium rounded-xl flex items-start gap-3">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <span>{submitError}</span>
                  </div>
                )}
                
                <div className="mb-8 flex flex-col items-center">
                  <p className="text-sm font-bold text-slate-800 mb-4">Your Rating</p>
                  <div className="flex items-center gap-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm({...reviewForm, rating: star})}
                        className="transition-all hover:scale-110 active:scale-95"
                      >
                        <Star 
                          size={42} 
                          fill={star <= reviewForm.rating ? "#fbbf24" : "none"} 
                          strokeWidth={1.5}
                          className={star <= reviewForm.rating ? "text-amber-400" : "text-slate-200"} 
                        />
                      </button>
                    ))}
                    <span className="ml-2 min-w-[80px] text-sm font-black text-slate-400 uppercase tracking-tighter">
                       {getRatingLabel(reviewForm.rating)}
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-bold text-slate-800 mb-2">Your Review</label>
                  <textarea
                    required
                    rows="4"
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                    placeholder="Share your experience with this product..."
                    className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[1.25rem] focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500 outline-none transition-all text-sm resize-none font-medium placeholder:text-slate-300"
                  ></textarea>
                  <div className="text-[10px] text-right mt-2 text-slate-400 font-bold">{reviewForm.comment.length}/1000</div>
                </div>

                <div className="mb-8">
                  <label className="block text-sm font-bold text-slate-800 mb-3">Add Photos <span className="text-slate-400 font-medium">(optional)</span></label>
                  <div className="flex flex-wrap gap-3">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative w-20 h-20 group">
                        <img src={preview} className="w-full h-full object-cover rounded-xl border-2 border-slate-100" />
                        <button 
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-rose-500 text-white p-1 rounded-full shadow-lg scale-0 group-hover:scale-100 transition-all"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    {reviewForm.images.length < 5 && (
                      <label className="w-20 h-20 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-all text-slate-400 hover:text-primary-600">
                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                        <Plus size={24} />
                      </label>
                    )}
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-[1.25rem] font-bold uppercase tracking-widest text-sm transition-all shadow-xl shadow-primary-500/20 active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductDetail;
