import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Zap, ShieldCheck, Globe, RefreshCcw, Banknote, Tag } from 'lucide-react';
import { productService } from '../../services/api';
import ProductCard from '../../components/ProductCard';
import HomeBanner from '../../components/Home/HomeBanner';
import { motion } from 'framer-motion';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          productService.getProducts({ is_featured: true }),
          productService.getCategories()
        ]);
        setFeaturedProducts(prodRes.data.slice(0, 8));
        setCategories(catRes.data);
      } catch (err) {
        console.error("Error fetching home data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-[70vh]">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-12 w-12 bg-primary-200 rounded-full mb-4"></div>
        <div className="h-4 w-32 bg-slate-200 rounded"></div>
      </div>
    </div>
  );

  return (
    <div className="space-y-12 pb-20">
      {/* Promotional Banner System */}
      <div className='pt-0'><HomeBanner /></div>
      
      {/* Trust Badges */}
      <section className="max-w-7xl mx-auto px-4 mt-2">
        <div className="border border-pink-200 rounded-lg py-4 px-6 bg-white shadow-sm flex flex-wrap justify-between items-center text-sm font-medium text-brand-navy">
          <div className="flex items-center gap-2 flex-1 justify-center border-r border-pink-100 last:border-0">
            <RefreshCcw size={18} className="text-brand-purple" />
            <span className="hidden sm:inline">7 Days Easy Return</span>
            <span className="sm:hidden text-xs">Easy Return</span>
          </div>
          <div className="flex items-center gap-2 flex-1 justify-center border-r border-pink-100 last:border-0">
            <Banknote size={18} className="text-brand-purple" />
            <span className="hidden sm:inline">Cash on Delivery</span>
            <span className="sm:hidden text-xs">COD</span>
          </div>
          <div className="flex items-center gap-2 flex-1 justify-center">
            <Tag size={18} className="text-brand-purple" />
            <span className="hidden sm:inline">Lowest Prices</span>
            <span className="sm:hidden text-xs">Lowest Price</span>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-black text-brand-navy font-title uppercase tracking-tight">Featured <span className="text-brand-purple">Categories</span></h2>
            <p className="text-brand-text-gray font-medium mt-1">Find exactly what you're looking for</p>
          </div>
          <Link to="/categories" className="text-brand-purple font-black text-sm uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
            See All <ArrowRight size={18} />
          </Link>
        </div>

        <div className="flex flex-wrap justify-center sm:justify-start gap-8 sm:gap-12 lg:gap-16">
          {categories.slice(0, 8).map((cat) => (
            <Link key={cat.id} to={`/products?category=${cat.slug || cat.id}`} className="group flex flex-col items-center w-[80px] sm:w-[100px] transition-all hover:-translate-y-1">
              <div className="w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] rounded-full overflow-hidden shadow-sm border border-slate-100 group-hover:border-brand-purple group-hover:shadow-lg transition-all duration-300 bg-white mb-3">
                <img
                  src={cat.image || `https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=60&w=400`}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <h3 className="text-center text-xs sm:text-sm font-bold text-brand-navy group-hover:text-brand-purple transition-colors leading-tight line-clamp-2">{cat.name}</h3>
            </Link>
          ))}
          {categories.length === 0 && Array(8).fill(0).map((_, i) => (
            <div key={i} className="flex flex-col items-center w-[80px] sm:w-[100px]">
               <div className="w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] bg-slate-100 rounded-full animate-pulse mb-3"></div>
               <div className="h-3 w-16 bg-slate-100 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-black text-brand-navy font-title uppercase tracking-tight">Premium <span className="text-brand-purple">Selection</span></h2>
            <p className="text-brand-text-gray font-medium mt-1">Handpicked items for the modern connoisseur</p>
          </div>
          <Link to="/products" className="text-brand-purple font-black text-sm uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
            Browse All <ArrowRight size={18} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
          {featuredProducts.length === 0 && Array(4).fill(0).map((_, i) => (
            <div key={i} className="aspect-[4/5] bg-slate-100 animate-pulse rounded-3xl"></div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
