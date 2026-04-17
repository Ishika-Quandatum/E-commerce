import React from 'react';
import { Phone, Mail, CreditCard, Landmark, Wallet, Globe, MessageCircle, Camera, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 pt-16 pb-8 border-t border-slate-900 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top & Links Section - Flex on large screens, Stack on small */}
        <div className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-24 mb-16">
          
          {/* LOGO + ABOUT Section */}
          <div className="lg:w-1/3 flex flex-col items-start text-left">
            <Link to="/" className="text-3xl font-black text-white italic tracking-tighter mb-4">
              QuanStore<span className="text-indigo-500">.</span>
            </Link>
            <p className="text-sm font-medium mb-8 max-w-sm">
              Your one-stop online shopping destination. We provide a pure premium shopping experience.
            </p>
            <div className="flex flex-col gap-3 text-sm font-bold text-slate-300">
              <a href="tel:+919876543210" className="flex items-center gap-3 hover:text-indigo-400 transition-colors">
                <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-indigo-500">
                  <Phone size={16} />
                </div>
                +91 9876543210
              </a>
              <a href="mailto:support@quanstore.com" className="flex items-center gap-3 hover:text-indigo-400 transition-colors">
                <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-indigo-500">
                  <Mail size={16} />
                </div>
                support@quanstore.com
              </a>
            </div>
          </div>

          {/* 4-COLUMN LINKS GRID */}
          <div className="lg:w-2/3 grid grid-cols-2 md:grid-cols-4 gap-8">
            
            {/* SHOP */}
            <div className="flex flex-col">
              <h3 className="text-white text-xs font-black uppercase tracking-widest mb-6">Shop</h3>
              <ul className="space-y-4 text-sm font-medium">
                <li><Link to="/products?category=fashion" className="hover:text-indigo-400 transition-colors">Fashion</Link></li>
                <li><Link to="/products?category=grocery" className="hover:text-indigo-400 transition-colors">Grocery</Link></li>
                <li><Link to="/products?category=electronics" className="hover:text-indigo-400 transition-colors">Electronics</Link></li>
                <li><Link to="/products?category=home" className="hover:text-indigo-400 transition-colors">Home & Kitchen</Link></li>
              </ul>
            </div>

            {/* HELP */}
            <div className="flex flex-col">
              <h3 className="text-white text-xs font-black uppercase tracking-widest mb-6">Help</h3>
              <ul className="space-y-4 text-sm font-medium">
                <li><Link to="/faq" className="hover:text-indigo-400 transition-colors">FAQ</Link></li>
                <li><Link to="/shipping" className="hover:text-indigo-400 transition-colors">Shipping</Link></li>
                <li><Link to="/returns" className="hover:text-indigo-400 transition-colors">Returns</Link></li>
                <li><Link to="/orders" className="hover:text-indigo-400 transition-colors">Order Status</Link></li>
              </ul>
            </div>

            {/* COMPANY */}
            <div className="flex flex-col">
              <h3 className="text-white text-xs font-black uppercase tracking-widest mb-6">Company</h3>
              <ul className="space-y-4 text-sm font-medium">
                <li><Link to="/about" className="hover:text-indigo-400 transition-colors">About Us</Link></li>
                <li><Link to="/careers" className="hover:text-indigo-400 transition-colors">Careers</Link></li>
                <li><Link to="/contact" className="hover:text-indigo-400 transition-colors">Contact</Link></li>
                <li><Link to="/blog" className="hover:text-indigo-400 transition-colors">Blog</Link></li>
              </ul>
            </div>

            {/* FOLLOW US */}
            <div className="flex flex-col">
              <h3 className="text-white text-xs font-black uppercase tracking-widest mb-6">Follow Us</h3>
              <ul className="space-y-4 text-sm font-medium">
                <li><a href="#" className="flex items-center gap-2 hover:text-indigo-400 transition-colors"><Globe size={16} /> Facebook</a></li>
                <li><a href="#" className="flex items-center gap-2 hover:text-indigo-400 transition-colors"><Camera size={16} /> Instagram</a></li>
                <li><a href="#" className="flex items-center gap-2 hover:text-indigo-400 transition-colors"><MessageCircle size={16} /> Twitter</a></li>
                <li><a href="#" className="flex items-center gap-2 hover:text-indigo-400 transition-colors"><Briefcase size={16} /> LinkedIn</a></li>
              </ul>
            </div>

          </div>
        </div>

        {/* PAYMENT METHODS */}
        <div className="py-6 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4">
           <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest">
              <span className="text-slate-500">Payment Methods:</span>
           </div>
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-slate-300 font-bold hover:text-white transition-colors cursor-pointer"><Landmark size={20} /> UPI</div>
              <div className="flex items-center gap-2 text-slate-300 font-bold hover:text-white transition-colors cursor-pointer"><CreditCard size={20} /> Visa</div>
              <div className="flex items-center gap-2 text-slate-300 font-bold hover:text-white transition-colors cursor-pointer"><CreditCard size={20} /> MasterCard</div>
              <div className="flex items-center gap-2 text-slate-300 font-bold hover:text-white transition-colors cursor-pointer"><Wallet size={20} /> COD</div>
           </div>
        </div>

        {/* COPYRIGHT */}
        <div className="py-6 border-t border-slate-900 text-center text-xs font-bold text-slate-600 uppercase tracking-widest mt-4">
          &copy; 2026 QuanStore. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;