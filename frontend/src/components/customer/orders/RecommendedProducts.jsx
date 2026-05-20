import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../../../services/api';
import { Sparkles, Heart } from 'lucide-react';

const RecommendedProducts = React.memo(() => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommended = async () => {
      try {
        const res = await productService.getProducts({ limit: 12 });
        const productData = Array.isArray(res.data) ? res.data : (res.data.results || []);
        setProducts(productData);
      } catch (err) {
        console.error('Error fetching recommended products', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecommended();
  }, []);

  const getProductImage = (product) => {
    if (!product?.primary_image) return 'https://placehold.co/150';
    return product.primary_image.startsWith('http')
      ? product.primary_image
      : `http://127.0.0.1:8000${product.primary_image}`;
  };

  const getOfferText = (index) => {
    const offers = [
      'Min. 50% Off',
      'Special Offer',
      'Deal of the Day',
      'Flat 30% Off',
      'Limited Time Offer',
      'Min. 40% Off'
    ];
    return offers[index % offers.length];
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-6 w-48 bg-slate-200 rounded-lg" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-[4/5] bg-slate-100 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) return null;

  // Split products for the two different sections
  const firstSection = products.slice(0, 6);
  const secondSection = products.slice(6, 12).length > 0 ? products.slice(6, 12) : products.slice(0, 6).reverse();

  const renderProductGrid = (productList) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
      {productList.map((product, idx) => (
        <div
          key={product.id}
          onClick={() => navigate(`/products/${product.id}`)}
          className="bg-white rounded-3xl border border-slate-100 p-4 shadow-sm hover:shadow-lg hover:border-slate-200 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
        >
          <div>
            {/* Aspect Locked Thumbnail */}
            <div className="aspect-[4/5] w-full rounded-2xl overflow-hidden bg-slate-50 relative mb-4">
              <img
                src={getProductImage(product)}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            </div>

            {/* Offer Tag */}
            <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider inline-block mb-3 border border-emerald-100">
              {getOfferText(product.id || idx)}
            </div>

            {/* Product Title */}
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-800 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
              {product.name}
            </h4>
          </div>

          {/* Pricing detail */}
          <p className="text-sm font-black text-slate-900 mt-2.5">
            ₹{Math.round(product.discount_price || product.price).toLocaleString('en-IN')}
          </p>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-12">
      {/* First Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-2.5">
          <Sparkles className="text-amber-500 w-5 h-5 shrink-0" />
          <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight uppercase">
            You might also be interested in
          </h3>
        </div>
        {renderProductGrid(firstSection)}
      </div>

      {/* Second Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-2.5">
          <Heart className="text-rose-500 w-5 h-5 shrink-0" />
          <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight uppercase">
            You May Also Like
          </h3>
        </div>
        {renderProductGrid(secondSection)}
      </div>
    </div>
  );
});

RecommendedProducts.displayName = 'RecommendedProducts';
export default RecommendedProducts;
