import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, ShieldCheck, Truck, RotateCcw, Plus, Minus, Heart, Edit3, X, ThumbsUp, AlertCircle } from 'lucide-react';
import { productService, reviewService } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      await reviewService.createReview({
        product: product.id,
        rating: reviewForm.rating,
        comment: reviewForm.comment
      });
      setShowReviewModal(false);
      setReviewForm({ rating: 5, comment: '' });
      // Refresh product
      const res = await productService.getProductDetail(id);
      setProduct(res.data);
    } catch (err) {
      setSubmitError(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Images */}
        <div className="space-y-4">
          <motion.div
            layoutId={`image-${id}`}
            className="aspect-square bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/50"
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                src={images[activeImage].image}
                className="w-full h-full object-contain p-8"
              />
            </AnimatePresence>
          </motion.div>

          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={`flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-primary-600 p-1' : 'border-transparent hover:border-slate-300'}`}
              >
                <img src={img.image} className="w-full h-full object-cover rounded-xl" />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Info */}
        <div className="flex flex-col">
          <div className="mb-8">
            <div className="flex items-center gap-2 text-primary-600 font-bold text-sm uppercase tracking-widest mb-2">
              <span>{product.category_name}</span>
              <span className="w-1 h-1 bg-slate-300 rounded-full" />
              <span>In Stock: {product.stock}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">{product.name}</h1>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-sm font-bold border border-amber-100">
                <Star size={16} fill="currentColor" />
                <span>{product.rating || '0.0'}</span>
              </div>
              <span className="text-slate-400 text-sm">{product.review_metrics?.total || 0} Reviews</span>
            </div>

            <div className="flex items-center gap-6 mb-8 pt-4 border-t border-slate-50">
               <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Selling Price</span>
                  <div className="flex items-baseline gap-4">
                    <span className="text-5xl font-black text-slate-900 tabular-nums">
                      ₹{(product.discount_price && product.discount_price < product.price ? product.discount_price : product.price).toLocaleString()}
                    </span>
                    {product.discount_price && product.discount_price < product.price && (
                      <div className="flex flex-col">
                        <span className="text-xl text-slate-300 line-through font-bold">₹{product.price.toLocaleString()}</span>
                        <span className="text-sm font-black text-emerald-500 uppercase tracking-tighter">{product.discount_percentage}% DIRECT SAVINGS</span>
                      </div>
                    )}
                  </div>
               </div>
            </div>

            <p className="text-slate-600 leading-relaxed mb-8 text-lg">
              {product.description}
            </p>
          </div>

          <div className="space-y-8 mt-auto">
            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="font-bold text-slate-800">Quantity</span>
              <div className="flex items-center bg-slate-100 rounded-2xl p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white hover:bg-slate-50 shadow-sm transition-all"
                >
                  <Minus size={18} />
                </button>
                <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white hover:bg-slate-50 shadow-sm transition-all"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => addToCart(product.id, quantity)}
                className="flex-grow bg-primary-600 hover:bg-primary-700 text-white h-16 rounded-[1.25rem] flex items-center justify-center gap-3 font-bold text-lg transition-all shadow-xl shadow-primary-500/25 active:scale-95"
              >
                <ShoppingCart size={24} />
                Add to Cart
              </button>
              <button className="w-16 h-16 bg-white border border-slate-200 rounded-[1.25rem] flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all active:scale-95">
                <Heart size={24} />
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-10 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center">
                  <Truck size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Fast Delivery</h4>
                  <p className="text-[10px] text-slate-500">2-4 business days</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">2 Year Warranty</h4>
                  <p className="text-[10px] text-slate-500">Certified secure</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                  <RotateCcw size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Easy Returns</h4>
                  <p className="text-[10px] text-slate-500">30 days money back</p>
                </div>
              </div>
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

            <button 
              onClick={() => setShowReviewModal(true)}
              className="mt-8 w-full py-4 border-2 border-slate-900 text-slate-900 rounded-[1rem] font-bold text-sm uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <Edit3 size={18} /> Write a Review
            </button>
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
                  <p className="text-slate-600 leading-relaxed text-sm mb-6">{review.comment}</p>
                  <button 
                    onClick={() => handleHelpful(review.id)}
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-brand-blue transition-colors"
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
                {submitError && (
                  <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 text-sm font-medium rounded-xl flex items-start gap-3">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <span>{submitError}</span>
                  </div>
                )}
                
                <div className="mb-8 flex flex-col items-center">
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Tap to rate</p>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm({...reviewForm, rating: star})}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star 
                          size={36} 
                          fill={star <= reviewForm.rating ? "#fbbf24" : "none"} 
                          strokeWidth={1.5}
                          className={star <= reviewForm.rating ? "text-amber-400" : "text-slate-300"} 
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Your Review</label>
                  <textarea
                    required
                    rows="4"
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                    placeholder="What did you like or dislike? What should other shoppers know?"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-all text-sm resize-none"
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-brand-blue text-white rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-slate-900 transition-all disabled:opacity-50"
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
