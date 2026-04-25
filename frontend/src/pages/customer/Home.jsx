import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Zap, ShieldCheck, Globe } from 'lucide-react';
import { productService } from '../../services/api';
import ProductCard from '../../components/ProductCard';
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
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center overflow-hidden bg-brand-purple-light">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-purple-light via-transparent to-transparent z-10" />
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=2000"
            alt="Hero"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-brand-purple/10 border border-brand-purple/20 text-brand-purple text-sm font-bold mb-6">
              New Summer Collection 2026
            </span>
            <h1 className="text-5xl md:text-7xl font-black leading-tight mb-8 text-brand-navy">
              Elevate Your <span className="text-brand-purple">Digital</span> Lifestyle.
            </h1>
            <p className="text-lg md:text-xl text-brand-text-gray mb-10 leading-relaxed font-medium">
              Experience the pinnacle of premium tech and lifestyle products. Curated for those who demand excellence in every detail.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/products" className="bg-brand-purple hover:bg-brand-purple/90 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-brand-purple/20 active:scale-95">
                Explore Shop <ArrowRight size={20} />
              </Link>
              <Link to="/categories" className="bg-white hover:bg-slate-50 text-brand-purple border border-brand-purple/20 px-8 py-4 rounded-2xl font-bold flex items-center justify-center transition-all shadow-lg active:scale-95">
                View Categories
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
        {[
          { icon: <ShoppingBag />, title: "Free Shipping", text: "On orders over ₹999" },
          { icon: <Zap />, title: "Express Delivery", text: "24-48 hour arrival" },
          { icon: <ShieldCheck />, title: "Secure Payment", text: "100% encrypted" },
          { icon: <Globe />, title: "Global Warranty", text: "Coverage worldwide" },
        ].map((item, idx) => (
          <div key={idx} className="flex flex-col items-center text-center group">
            <div className="w-16 h-16 bg-brand-purple/5 text-brand-purple rounded-3xl flex items-center justify-center mb-4 group-hover:bg-brand-purple group-hover:text-white transition-all duration-500 shadow-sm">
              {React.cloneElement(item.icon, { size: 30 })}
            </div>
            <h4 className="font-black text-brand-navy uppercase tracking-widest text-xs">{item.title}</h4>
            <p className="text-xs font-medium text-brand-text-gray mt-1">{item.text}</p>
          </div>
        ))}
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

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.slice(0, 4).map((cat) => (
            <Link key={cat.id} to={`/products?category=${cat.id}`} className="relative group h-72 rounded-[2rem] overflow-hidden shadow-xl transition-all duration-500 hover:-translate-y-2">
              <img
                src={cat.image || `https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=60&w=400`}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/90 via-brand-navy/20 to-transparent flex flex-col justify-end p-8">
                <h3 className="text-white text-xl font-black uppercase tracking-tight">{cat.name}</h3>
                <span className="text-brand-purple-light text-xs font-black uppercase tracking-[0.2em] mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Explore</span>
              </div>
            </Link>
          ))}
          {categories.length === 0 && Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-slate-100 animate-pulse h-72 rounded-[2rem]"></div>
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

      {/* Call to Action */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-brand-purple rounded-[3.5rem] p-12 md:p-24 text-center text-white relative overflow-hidden shadow-[0_40px_80px_-20px_rgba(109,40,217,0.3)]">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-pink rounded-full blur-[100px] opacity-20 -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-orange rounded-full blur-[100px] opacity-20 -ml-48 -mb-48" />

          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight uppercase italic tracking-tighter">Join the Elite <span className="text-brand-orange not-italic tracking-normal">Shopping</span> Circle.</h2>
            <p className="text-brand-purple-light text-lg md:text-xl mb-12 font-medium">Get exclusive access to limited drops, priority delivery, and personalized style recommendations.</p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/register" className="bg-white text-brand-purple px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-2xl active:scale-95">
                Create Account
              </Link>
              <Link to="/login" className="bg-brand-navy text-white px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-brand-navy/90 transition-all active:scale-95">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
