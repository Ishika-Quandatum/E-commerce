import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { Star, ShoppingCart, ShieldCheck, Truck, RotateCcw, Plus, Minus, Heart, Edit3, X, ThumbsUp, AlertCircle, ChevronRight, Tag, Banknote, ChevronsRight, Store } from 'lucide-react';
import { productService, reviewService, vendorService } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import WriteReviewModal from '../../components/customer/WriteReviewModal';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await productService.getProductDetail(id);
        setProduct(res.data);
        
        // Handle vendor details
        if (res.data.vendor) {
          if (typeof res.data.vendor === 'object') {
            setVendor(res.data.vendor);
          } else {
            const vRes = await vendorService.getVendorDetail(res.data.vendor);
            setVendor(vRes.data);
          }
        }
        
        if (res.data.images && res.data.images.length > 0) {
          setImages(res.data.images);
        } else if (res.data.primary_image) {
          setImages([{ image: res.data.primary_image }]);
        } else {
          setImages([{ image: 'https://placehold.co/800' }]);
        }

        // Removed default size selection to force user to select a size
        // if (res.data.sizes && res.data.sizes.length > 0) {
        //   setSelectedSize(res.data.sizes[0]);
        // }
      } catch (err) {
        console.error("Error fetching product details", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleCopy = () => {
      const text = `
Product: ${product.name}
Brand: ${product.brand_name || 'Generic'}
Category: ${product.category_name}
SKU: ${product.sku || 'N/A'}
      `.trim();
      
      navigator.clipboard.writeText(text);
      toast.success("Copied Successfully", {
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
          fontSize: '12px',
          fontWeight: 'bold'
        }
      });
  };

  useEffect(() => {
    if (product && new URLSearchParams(location.search).get('write_review') === 'true') {
      if (product.can_review) {
        setShowReviewModal(true);
      }
    }
  }, [product, location.search]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-bold text-slate-400 uppercase tracking-widest text-xs animate-pulse">Loading Premium Goods...</div>
  );

  if (!product) return <div className="min-h-screen flex items-center justify-center bg-slate-50 font-bold text-rose-500 uppercase tracking-widest text-xs">Product Not Found</div>;



  const handleHelpful = async (reviewId) => {
    try {
      await reviewService.markHelpful(reviewId);
      const res = await productService.getProductDetail(id);
      setProduct(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddToCart = async () => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast.error("please select the size then you can click add to cart", {
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
          fontSize: '12px',
          fontWeight: 'bold'
        }
      });
      return;
    }

    const token = localStorage.getItem("access_token");
    if (!token) {
      // Save pending cart data to handle it after login
      localStorage.setItem("pending_cart_product", product.id);
      localStorage.setItem("pending_cart_quantity", quantity);
      if (selectedSize) {
        localStorage.setItem("pending_cart_size", JSON.stringify(selectedSize));
      }
      
      toast.error("Please login to add items to cart", {
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
          fontSize: '12px',
          fontWeight: 'bold'
        }
      });
      navigate("/login");
      return;
    }

    try {
      await addToCart(product.id, quantity, selectedSize);
      toast.success("product is added to cart", {
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
          fontSize: '12px',
          fontWeight: 'bold'
        },
        icon: '🛒'
      });
    } catch (err) {
      console.error("Error adding to cart", err);
      toast.error("Failed to add to cart");
    }
  };

  const handleBuyNow = async () => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      alert("Please select a size first");
      return;
    }
    navigate('/checkout', { state: { directCheckoutItem: { product, quantity, size: selectedSize } } });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-[#f8fafc] min-h-screen">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-4 bg-white p-3 rounded-lg border border-slate-100">
        <Link to="/" className="hover:text-primary-600 transition-colors cursor-pointer">Home</Link> <ChevronRight size={12} />
        <Link to={`/products?category=${product.category}`} className="hover:text-primary-600 transition-colors cursor-pointer">{product.category_name}</Link> <ChevronRight size={12} />
        <span className="truncate max-w-[200px] font-bold text-slate-800">{product.name}</span>
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
                    className={`aspect-square rounded-md overflow-hidden border-2 transition-all cursor-pointer ${activeImage === idx ? 'border-[#6D28D9]' : 'border-slate-100'}`}
                  >
                    <img src={img.image} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              {/* Main Image View */}
              <div className="flex-1 aspect-[4/5] bg-white rounded-lg overflow-hidden border border-slate-50 relative group">
                {images.length > 0 ? (
                  <img
                    src={images[activeImage]?.image}
                    className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-50 flex items-center justify-center">
                    <ShieldCheck size={48} className="text-slate-200" />
                  </div>
                )}
              </div>
           </div>

           {/* Split Action Buttons */}
           <div className="flex gap-3">
              {product.stock === 0 ? (
                <div className="flex-1 h-14 bg-slate-100 text-slate-400 rounded-lg flex items-center justify-center font-bold text-base border border-slate-200">
                  Out of Stock
                </div>
              ) : (
                <>
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 h-14 bg-white border border-[#6D28D9] text-[#6D28D9] rounded-lg flex items-center justify-center gap-2 font-bold text-base transition-all active:scale-95 cursor-pointer"
                  >
                    <ShoppingCart size={20} />
                    Add to Cart
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="flex-1 h-14 bg-[#6D28D9] hover:bg-[#5B21B6] text-white rounded-lg flex items-center justify-center gap-2 font-bold text-base transition-all shadow-lg shadow-[#6D28D9]/20 active:scale-95 cursor-pointer"
                  >
                    <ChevronsRight size={20} className="text-white" />
                    Buy Now
                  </button>
                </>
              )}
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
               {product.sizes && product.sizes.length > 0 ? (
                 product.sizes.map((size) => (
                   <button 
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-5 py-2 rounded-full border-2 text-sm font-bold transition-all cursor-pointer ${size === selectedSize ? 'border-[#6D28D9] text-[#6D28D9] bg-[#6D28D9]/5' : 'border-slate-100 text-slate-600 hover:border-slate-200'}`}
                   >
                     {size}
                   </button>
                 ))
               ) : (
                 <p className="text-xs text-slate-400 italic">No specific sizes available for this product.</p>
               )}
            </div>
          </div>

          {/* Highlights */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Product Highlights</h3>
              <button 
                onClick={handleCopy}
                className="text-[#6D28D9] text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:underline"
              >
                Copy
              </button>
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
             <h4 className="font-bold text-slate-800 mb-4 uppercase text-xs tracking-wider">Sold By</h4>
             
             {vendor ? (
               <div className="flex items-center justify-between">
                  {/* Left Side: Avatar & Details */}
                  <div className="flex items-start gap-4">
                     <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 overflow-hidden shadow-sm flex-shrink-0">
                        {vendor.avatar ? (
                          <img src={vendor.avatar} alt={vendor.shop_name} className="w-full h-full object-cover" />
                        ) : (
                          <Store size={28} className="text-primary-600" />
                        )}
                     </div>
                     <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 mb-3">
                          <p className="font-bold text-slate-800 text-lg leading-none">{vendor.shop_name}</p>
                        </div>
                        
                        {/* Stats Row */}
                        <div className="flex items-center gap-6">
                           <div className="flex flex-col">
                             <div className="flex items-center justify-center gap-0.5 bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full text-[11px] font-bold w-fit mb-0.5">
                               {vendor.rating} <Star size={10} fill="currentColor" />
                             </div>
                             <p className="text-[11px] text-slate-500">{vendor.total_ratings.toLocaleString()} Ratings</p>
                           </div>
                           
                           <div className="flex flex-col">
                             <p className="text-sm font-bold text-slate-800 leading-none mb-1">{vendor.followers_count.toLocaleString()}</p>
                             <p className="text-[11px] text-slate-500">Followers</p>
                           </div>
                           
                           <div className="flex flex-col">
                             <p className="text-sm font-bold text-slate-800 leading-none mb-1">{vendor.products_count.toLocaleString()}</p>
                             <p className="text-[11px] text-slate-500">Products</p>
                           </div>
                        </div>
                     </div>
                  </div>
                  
                  {/* Right Side: Button */}
                  <Link 
                    to={`/vendor-shop/${vendor.id}`}
                    className="px-6 py-2 border border-primary-600 text-primary-600 rounded-lg text-sm font-bold hover:bg-primary-50 transition-all cursor-pointer bg-white"
                  >
                    View Shop
                  </Link>
               </div>
             ) : (
               <div className="flex items-center justify-between animate-pulse">
                  <div className="flex items-center gap-3">
                     <div className="w-12 h-12 bg-slate-100 rounded-full" />
                     <div className="space-y-2">
                        <div className="h-3 w-24 bg-slate-100 rounded" />
                        <div className="h-2 w-16 bg-slate-100 rounded" />
                     </div>
                  </div>
                  <div className="h-8 w-20 bg-slate-100 rounded-lg" />
               </div>
             )}
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
      <WriteReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        product={product}
        initialRating={5}
        onSuccess={async () => {
          try {
            const res = await productService.getProductDetail(id);
            setProduct(res.data);
          } catch (err) {
            console.error("Error refreshing product detail", err);
          }
        }}
      />
    </div>
  );
};

export default ProductDetail;
