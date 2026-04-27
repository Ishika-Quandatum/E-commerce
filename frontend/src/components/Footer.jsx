import React from 'react';
import { Phone, Mail, CreditCard, Landmark, Wallet, Globe, MessageCircle, Camera, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePlatform } from '../context/PlatformContext';

const Footer = () => {
  const { platformName } = usePlatform();

  return (
    <footer className="bg-brand-navy text-white/70 pt-20 pb-8 border-t border-brand-purple/10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top & Links Section - Flex on large screens, Stack on small */}
        <div className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-24 mb-20">
          
          {/* LOGO + ABOUT Section */}
          <div className="lg:w-1/3 flex flex-col items-start text-left">
            <Link to="/" className="text-3xl font-black text-white italic tracking-tighter mb-6">
              {platformName}<span className="text-brand-purple">.</span>
            </Link>
            <p className="text-sm font-medium mb-8 max-w-sm leading-relaxed">
              Your one-stop online shopping destination. We provide a pure premium shopping experience with curated essentials.
            </p>
            <div className="flex flex-col gap-4 text-sm font-bold">
              <a href="tel:+919876543210" className="flex items-center gap-4 hover:text-brand-purple transition-all group">
                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-purple group-hover:bg-brand-purple group-hover:text-white transition-all">
                  <Phone size={18} />
                </div>
                <span>+91 9876543210</span>
              </a>
              <a href="mailto:support@quanstore.com" className="flex items-center gap-4 hover:text-brand-purple transition-all group">
                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-purple group-hover:bg-brand-purple group-hover:text-white transition-all">
                  <Mail size={18} />
                </div>
                <span>support@quanstore.com</span>
              </a>
            </div>
          </div>

          {/* LINKS GRID */}
          <div className="lg:w-2/3 grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
            
            {/* SHOP */}
            <div className="flex flex-col">
              <h3 className="text-white text-[11px] font-black uppercase tracking-[0.2em] mb-8">Shop</h3>
              <ul className="space-y-4 text-sm font-bold">
                <li><Link to="/products" className="text-white/60 hover:text-brand-purple transition-all">New Arrivals</Link></li>
                <li><Link to="/categories" className="text-white/60 hover:text-brand-purple transition-all">Categories</Link></li>
                <li><Link to="/products" className="text-white/60 hover:text-brand-purple transition-all">Best Sellers</Link></li>
                <li><Link to="/products" className="text-white/60 hover:text-brand-purple transition-all">Offers</Link></li>
              </ul>
            </div>

            {/* HELP */}
            <div className="flex flex-col">
              <h3 className="text-white text-[11px] font-black uppercase tracking-[0.2em] mb-8">Help</h3>
              <ul className="space-y-4 text-sm font-bold">
                <li><Link to="/track-order" className="text-white/60 hover:text-brand-purple transition-all">Track Order</Link></li>
                <li><Link to="/shipping" className="text-white/60 hover:text-brand-purple transition-all">Shipping Info</Link></li>
                <li><Link to="/returns" className="text-white/60 hover:text-brand-purple transition-all">Returns</Link></li>
                <li><Link to="/contact" className="text-white/60 hover:text-brand-purple transition-all">Contact Us</Link></li>
              </ul>
            </div>

            {/* COMPANY */}
            <div className="flex flex-col">
              <h3 className="text-white text-[11px] font-black uppercase tracking-[0.2em] mb-8">Company</h3>
              <ul className="space-y-4 text-sm font-bold">
                <li><Link to="/about-us" className="text-white/60 hover:text-brand-purple transition-all">About Us</Link></li>
                <li><Link to="/careers" className="text-white/60 hover:text-brand-purple transition-all">Careers</Link></li>
                <li><Link to="/become-seller" className="text-white/60 hover:text-brand-purple transition-all">Sell with Us</Link></li>
                <li><Link to="/blog" className="text-white/60 hover:text-brand-purple transition-all">Blog</Link></li>
              </ul>
            </div>

            {/* FOLLOW US */}
            <div className="flex flex-col">
              <h3 className="text-white text-[11px] font-black uppercase tracking-[0.2em] mb-8">Follow Us</h3>
              <ul className="space-y-4 text-sm font-bold">
                <li><a href="#" className="flex items-center gap-3 text-white/60 hover:text-brand-purple transition-all"><Globe size={18} /> Facebook</a></li>
                <li><a href="#" className="flex items-center gap-3 text-white/60 hover:text-brand-purple transition-all"><Camera size={18} /> Instagram</a></li>
                <li><a href="#" className="flex items-center gap-3 text-white/60 hover:text-brand-purple transition-all"><MessageCircle size={18} /> Twitter</a></li>
                <li><a href="#" className="flex items-center gap-3 text-white/60 hover:text-brand-purple transition-all"><Briefcase size={18} /> LinkedIn</a></li>
              </ul>
            </div>

          </div>
        </div>

        {/* PAYMENT METHODS */}
        <div className="py-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em]">
              <span className="text-white/30">Secure Payment:</span>
           </div>
           <div className="flex items-center gap-8">
              <div className="flex items-center gap-2 text-white/40 font-bold hover:text-brand-purple transition-all cursor-pointer"><Landmark size={20} /> UPI</div>
              <div className="flex items-center gap-2 text-white/40 font-bold hover:text-brand-purple transition-all cursor-pointer"><CreditCard size={20} /> Visa</div>
              <div className="flex items-center gap-2 text-white/40 font-bold hover:text-brand-purple transition-all cursor-pointer"><CreditCard size={20} /> MasterCard</div>
              <div className="flex items-center gap-2 text-white/40 font-bold hover:text-brand-purple transition-all cursor-pointer"><Wallet size={20} /> COD</div>
           </div>
        </div>

        {/* COPYRIGHT */}
        <div className="py-8 border-t border-white/5 text-center text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mt-4">
          &copy; 2026 {platformName}. Excellence in every detail.
        </div>
      </div>
    </footer>
  );
};

export default Footer;