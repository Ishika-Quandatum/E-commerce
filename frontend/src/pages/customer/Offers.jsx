import React, { useState, useEffect } from 'react';
import { Filter, SlidersHorizontal, ChevronDown, Search, Package, Tag, Percent } from 'lucide-react';
import { productService } from '../../services/api';
import ProductCard from '../../components/ProductCard';
import { clsx } from 'clsx';

const Offers = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    sort: 'price_asc'
  });

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        offer: 'true',
        sort: filters.sort
      };
      const res = await productService.getProducts(params);
      const productData = Array.isArray(res.data) ? res.data : (res.data.results || []);
      setProducts(productData);
    } catch (err) {
      console.error("Error fetching offer products", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/30 pb-20">
      {/* Hero Banner */}
      <div className="bg-brand-navy pt-20 pb-32 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-rose-500/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-center gap-3 text-rose-500 font-black uppercase tracking-[0.3em] text-[10px] mb-4">
             <Percent size={14} /> Maximum Savings
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter mb-6">
            Exclusive <span className="text-rose-500">Offers</span>
          </h1>
          <p className="text-white/60 text-sm md:text-lg max-w-xl leading-relaxed">
            Unbeatable deals on top-quality products. Grab your favorites at the lowest prices of the season before they're gone!
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-20">
        {/* Filter Bar */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 p-4 md:p-6 mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
               <Tag size={20} />
            </div>
            <div>
               <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Active Deals</h3>
               <p className="text-[10px] text-slate-400 font-bold uppercase">{products.length} Products Found</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sort By:</span>
            <select 
              value={filters.sort}
              onChange={(e) => setFilters({...filters, sort: e.target.value})}
              className="bg-slate-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-rose-500 outline-none cursor-pointer appearance-none pr-10 relative"
            >
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="newest">Recently Added</option>
              <option value="popularity">Most Popular</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-white rounded-3xl border border-slate-100 animate-pulse shadow-sm" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-32 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
              <Tag size={40} />
            </div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">No Active Offers</h3>
            <p className="text-slate-500 text-sm mb-8">We're cooking up some new deals. Check back very soon!</p>
            <button 
              onClick={() => window.history.back()}
              className="px-8 py-3 bg-brand-navy text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-500 transition-all shadow-lg shadow-indigo-100"
            >
              Go Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Offers;
