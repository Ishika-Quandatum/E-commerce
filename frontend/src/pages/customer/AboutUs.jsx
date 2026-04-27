import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Award, 
  Users, 
  Truck, 
  CreditCard, 
  RefreshCcw, 
  Headphones, 
  MapPin,
  TrendingUp,
  Eye,
  Target,
  ArrowRight,
  Shirt,
  Smartphone,
  ShoppingBasket,
  Home,
  Sparkles,
  Watch
} from 'lucide-react';
import { motion } from 'framer-motion';
import { usePlatform } from '../../context/PlatformContext';

const AboutUs = () => {
  const { platformName } = usePlatform();

  const categories = [
    { name: "Fashion", icon: <Shirt size={32} />, color: "bg-pink-50 text-pink-500" },
    { name: "Electronics", icon: <Smartphone size={32} />, color: "bg-blue-50 text-blue-500" },
    { name: "Grocery", icon: <ShoppingBasket size={32} />, color: "bg-green-50 text-green-500" },
    { name: "Home & Living", icon: <Home size={32} />, color: "bg-orange-50 text-orange-500" },
    { name: "Beauty & Personal Care", icon: <Sparkles size={32} />, color: "bg-purple-50 text-purple-500" },
    { name: "Accessories", icon: <Watch size={32} />, color: "bg-indigo-50 text-indigo-500" },
  ];

  const stats = [
    { label: "Happy Customers", value: "10,000+" },
    { label: "Products", value: "500+" },
    { label: "Trusted Sellers", value: "100+" },
    { label: "Cities Served", value: "50+" },
  ];

  const features = [
    { title: "Best prices and exciting offers", icon: <TrendingUp size={20} /> },
    { title: "Quality checked products", icon: <ShieldCheck size={20} /> },
    { title: "Multiple payment options", icon: <CreditCard size={20} /> },
    { title: "Quick delivery network", icon: <Truck size={20} /> },
    { title: "Real-time order updates", icon: <RefreshCcw size={20} /> },
    { title: "Trusted vendor marketplace", icon: <Users size={20} /> },
    { title: "Easy shopping experience", icon: <Award size={20} /> },
  ];

  return (
    <div className="bg-white overflow-hidden">
      {/* 1. Hero Section */}
      <section className="relative min-h-[80vh] flex items-center bg-brand-purple-light py-20">
        <div className="absolute inset-0 z-0 opacity-30">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-purple rounded-full blur-[120px] -mr-64 -mt-64" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-pink rounded-full blur-[100px] -ml-48 -mb-48" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-7xl font-black text-brand-navy mb-6 leading-tight uppercase italic tracking-tighter">
                About <span className="text-brand-purple not-italic tracking-normal">Us</span>
              </h1>
              <h2 className="text-2xl md:text-3xl font-bold text-brand-purple mb-6">
                Your Trusted Destination for Smart Shopping
              </h2>
              <p className="text-lg text-brand-text-gray mb-10 leading-relaxed font-medium max-w-lg">
                Welcome to {platformName}. We believe shopping should be simple, secure, and enjoyable. Our platform brings customers quality products at the best prices.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/products" className="bg-brand-purple hover:bg-brand-purple/90 text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-brand-purple/20 active:scale-95 flex items-center gap-2">
                  Shop Now <ArrowRight size={20} />
                </Link>
                <Link to="/contact" className="bg-white hover:bg-slate-50 text-brand-purple border border-brand-purple/20 px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg active:scale-95">
                  Contact Us
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-white/20 backdrop-blur-2xl rounded-[3rem] -rotate-3 border border-white/50" />
              <img 
                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1000" 
                alt="Shopping" 
                className="relative z-10 rounded-[3rem] shadow-2xl hover:rotate-2 transition-transform duration-700"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. Our Story Section */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="order-2 lg:order-1"
          >
            <img 
              src="https://images.unsplash.com/photo-1556740734-7f95826913b8?auto=format&fit=crop&q=80&w=800" 
              alt="Our Story" 
              className="rounded-[3rem] shadow-2xl"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="order-1 lg:order-2 space-y-8"
          >
            <div>
              <span className="text-brand-purple font-black text-sm uppercase tracking-[0.3em] mb-4 block">Our Story</span>
              <h2 className="text-4xl md:text-5xl font-black text-brand-navy leading-tight uppercase">Who We <span className="text-brand-purple">Are</span></h2>
            </div>
            
            <p className="text-brand-text-gray text-lg font-medium leading-relaxed italic">
              "At {platformName}, we connect trusted vendors with smart buyers, creating a marketplace where convenience meets value. From daily essentials to fashion, electronics, home needs, beauty products, and more — we make online shopping easier than ever."
            </p>

            <div className="grid grid-cols-1 gap-6 pt-4">
              {[
                { title: "Trusted Sellers", icon: <Users className="text-brand-purple" />, text: "Verified partners you can rely on" },
                { title: "Quality Assured", icon: <ShieldCheck className="text-brand-purple" />, text: "Rigorous standards for every item" },
                { title: "Customer First", icon: <Headphones className="text-brand-purple" />, text: "24/7 support dedicated to you" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-6 p-4 bg-slate-50 rounded-3xl group hover:bg-brand-purple transition-all duration-500">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-black text-brand-navy group-hover:text-white transition-colors">{item.title}</h4>
                    <p className="text-xs text-brand-text-gray group-hover:text-white/70 transition-colors font-medium uppercase tracking-widest">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. What We Offer Section */}
      <section className="py-24 bg-brand-navy relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-white to-transparent opacity-10" />
        
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <span className="text-brand-purple-light font-black text-sm uppercase tracking-[0.3em] mb-4 block">What We Offer</span>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-16 leading-tight uppercase italic tracking-tighter">
            Everything You Need, <span className="text-brand-purple not-italic tracking-normal">All in One Place</span>
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((cat, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-[2.5rem] flex flex-col items-center group cursor-pointer hover:bg-brand-purple transition-all duration-500"
              >
                <div className={`w-16 h-16 ${cat.color} rounded-2xl flex items-center justify-center mb-6 group-hover:bg-white group-hover:scale-110 transition-all shadow-xl`}>
                  {cat.icon}
                </div>
                <h4 className="text-white font-black text-xs uppercase tracking-widest text-center">{cat.name}</h4>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Why Choose Rainbow Store */}
      <section className="py-24 max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          className="space-y-10"
        >
          <div>
            <span className="text-brand-purple font-black text-sm uppercase tracking-[0.3em] mb-4 block">Why Choose Us</span>
            <h2 className="text-4xl md:text-5xl font-black text-brand-navy leading-tight uppercase italic tracking-tighter">
              The {platformName} <span className="text-brand-purple not-italic tracking-normal">Difference</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {features.map((item, i) => (
              <div key={i} className="flex items-center gap-4 group">
                <div className="w-10 h-10 bg-brand-purple/5 text-brand-purple rounded-xl flex items-center justify-center group-hover:bg-brand-purple group-hover:text-white transition-all shadow-sm">
                  {item.icon}
                </div>
                <span className="text-lg font-bold text-brand-navy group-hover:translate-x-2 transition-transform">{item.title}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-8">
          {[
            { title: "Our Mission", icon: <Target className="text-white" />, content: "Our mission is to provide a fast, affordable, and reliable shopping experience for every customer. We support local and growing vendors.", bg: "bg-brand-purple" },
            { title: "Our Vision", icon: <Eye className="text-brand-purple" />, content: "To become one of the most trusted and customer-friendly online marketplaces.", bg: "bg-brand-navy" },
          ].map((card, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.02 }}
              className={`${card.bg} p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group`}
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-150 transition-transform duration-1000">
                {React.cloneElement(card.icon, { size: 120 })}
              </div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
                  {React.cloneElement(card.icon, { size: 28 })}
                </div>
                <h3 className="text-2xl font-black uppercase mb-4 italic tracking-tight">{card.title}</h3>
                <p className="text-white/80 font-medium leading-relaxed">{card.content}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 5. Statistics Counter */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white p-10 rounded-[2.5rem] shadow-xl text-center border border-slate-100 group hover:bg-brand-purple transition-all duration-500">
              <h3 className="text-4xl md:text-5xl font-black text-brand-purple group-hover:text-white transition-colors mb-2 tracking-tighter">{stat.value}</h3>
              <p className="text-xs font-black text-brand-text-gray group-hover:text-white/70 uppercase tracking-[0.2em]">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. For Vendors Section */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-brand-navy rounded-[4rem] p-12 md:p-20 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-purple rounded-full blur-[100px] opacity-20 -mr-48 -mt-48" />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
            <div className="space-y-8">
              <span className="text-brand-purple-light font-black text-sm uppercase tracking-[0.3em]">Vendor Program</span>
              <h2 className="text-4xl md:text-6xl font-black leading-tight uppercase italic tracking-tighter">Grow With <span className="text-brand-purple not-italic tracking-normal">Rainbow Store</span></h2>
              <p className="text-lg text-white/70 font-medium leading-relaxed max-w-lg">
                We help businesses grow online by giving vendors tools to manage:
              </p>
              <div className="grid grid-cols-2 gap-4">
                {['Products', 'Orders', 'Dispatch', 'Payments', 'Promotions'].map((tool, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm font-black uppercase tracking-widest text-brand-purple-light">
                    <div className="w-2 h-2 bg-brand-purple rounded-full" />
                    {tool}
                  </div>
                ))}
              </div>
              <Link to="/become-seller" className="inline-flex bg-brand-purple text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-2xl active:scale-95">
                Become a Vendor
              </Link>
            </div>
            <div className="hidden lg:block">
               <img 
                 src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800" 
                 alt="Vendor Dashboard" 
                 className="rounded-[3rem] shadow-2xl border border-white/10 rotate-3"
               />
            </div>
          </div>
        </div>
      </section>

      {/* 7. Our Promise Section */}
      <section className="py-24 text-center max-w-4xl mx-auto px-4">
        <div className="w-20 h-20 bg-brand-purple/10 rounded-full flex items-center justify-center mx-auto mb-10 shadow-inner">
           <ShieldCheck size={40} className="text-brand-purple" />
        </div>
        <h2 className="text-4xl font-black text-brand-navy mb-8 uppercase italic tracking-tighter">Our <span className="text-brand-purple not-italic tracking-normal">Promise</span></h2>
        <p className="text-2xl font-medium text-brand-text-gray leading-relaxed italic">
          "We are committed to building trust, delivering value, and making every order a happy experience."
        </p>
      </section>

      {/* 8. CTA Banner Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto bg-brand-purple rounded-[3.5rem] p-12 md:p-24 text-center text-white relative overflow-hidden shadow-[0_40px_80px_-20px_rgba(109,40,217,0.4)]">
          <div className="absolute inset-0 opacity-20">
             <div className="absolute top-0 left-0 w-96 h-96 bg-brand-orange rounded-full blur-[100px] -ml-48 -mt-48" />
             <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-pink rounded-full blur-[100px] -mr-48 -mb-48" />
          </div>
          
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight uppercase italic tracking-tighter">Ready to Start <span className="text-brand-orange not-italic tracking-normal">Shopping?</span></h2>
            <p className="text-brand-purple-light text-lg md:text-xl mb-12 font-medium">Explore thousands of products and enjoy a seamless shopping experience.</p>
            <Link to="/products" className="bg-white text-brand-purple px-14 py-5 rounded-2xl font-black text-sm uppercase tracking-[0.3em] hover:scale-110 transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3 mx-auto w-fit">
              Explore Products <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
