import React from 'react';
import { Phone, Mail, CreditCard, Landmark, Wallet, Globe, Camera, MessageCircle, Briefcase, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePlatform } from '../context/PlatformContext';

const Footer = () => {
  const { platformName, settings } = usePlatform();

  return (
    <footer className="bg-brand-navy text-white/60 mt-auto">

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-10">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">

          {/* Brand Column */}
          <div className="lg:w-72 shrink-0 flex flex-col gap-6">
            <Link to="/" className="text-3xl font-black text-white italic tracking-tighter">
              {platformName}<span className="text-brand-purple">.</span>
            </Link>
            <p className="text-base leading-relaxed text-white/70">
              Your one-stop premium shopping destination with curated essentials delivered with care.
            </p>
            <div className="flex flex-col gap-3 text-base">
              {settings?.support_phone && (
                <a href={`tel:${settings.support_phone}`} className="flex items-center gap-3 text-white/70 hover:text-brand-purple transition-colors group">
                  <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-purple group-hover:bg-brand-purple group-hover:text-white transition-all shrink-0">
                    <Phone size={15} />
                  </div>
                  <span>{settings.support_phone}</span>
                </a>
              )}
              {settings?.support_email && (
                <a href={`mailto:${settings.support_email}`} className="flex items-center gap-3 text-white/70 hover:text-brand-purple transition-colors group">
                  <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-purple group-hover:bg-brand-purple group-hover:text-white transition-all shrink-0">
                    <Mail size={15} />
                  </div>
                  <span>{settings.support_email}</span>
                </a>
              )}
              {settings?.store_address && (
                <div className="flex items-center gap-3 text-white/70 group">
                  <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-purple shrink-0">
                    <Globe size={15} />
                  </div>
                  <span className="text-sm leading-snug">{settings.store_address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="hidden lg:block w-px bg-white/5 self-stretch" />

          {/* Links Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 flex-1">

            {/* SHOP */}
            <div>
              <h3 className="text-white text-sm font-black uppercase tracking-[0.2em] mb-6">Shop</h3>
              <ul className="space-y-3.5 text-base">
                <li><Link to="/new-arrivals" className="text-white/70 hover:text-brand-purple transition-colors">New Arrivals</Link></li>
                <li><Link to="/categories" className="text-white/70 hover:text-brand-purple transition-colors">Categories</Link></li>
                <li><Link to="/best-sellers" className="text-white/70 hover:text-brand-purple transition-colors">Best Sellers</Link></li>
                <li><Link to="/offers" className="text-white/70 hover:text-brand-purple transition-colors">Offers</Link></li>
              </ul>
            </div>

            {/* HELP */}
            <div>
              <h3 className="text-white text-sm font-black uppercase tracking-[0.2em] mb-6">Help</h3>
              <ul className="space-y-3.5 text-base">
                <li><Link to="/track-order" className="text-white/70 hover:text-brand-purple transition-colors">Track Order</Link></li>
                <li><Link to="/shipping-info" className="text-white/70 hover:text-brand-purple transition-colors">Shipping Info</Link></li>
                <li><Link to="/returns" className="text-white/70 hover:text-brand-purple transition-colors">Returns</Link></li>
                <li><Link to="/contact-us" className="text-white/70 hover:text-brand-purple transition-colors">Contact Us</Link></li>
              </ul>
            </div>

            {/* COMPANY */}
            <div>
              <h3 className="text-white text-sm font-black uppercase tracking-[0.2em] mb-6">Company</h3>
              <ul className="space-y-3.5 text-base">
                <li><Link to="/about-us" className="text-white/70 hover:text-brand-purple transition-colors">About Us</Link></li>
                <li><Link to="/become-seller" className="text-white/70 hover:text-brand-purple transition-colors">Sell with Us</Link></li>
              </ul>
            </div>

            {/* FOLLOW US */}
            {(settings?.facebook_link || settings?.instagram_link || settings?.twitter_link || settings?.linkedin_link) && (
              <div>
                <h3 className="text-white text-sm font-black uppercase tracking-[0.2em] mb-6">Follow Us</h3>
                <ul className="space-y-3.5 text-base">
                  {settings?.facebook_link && (
                    <li><a href={settings.facebook_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/70 hover:text-brand-purple transition-colors"><Globe size={14} /> Facebook</a></li>
                  )}
                  {settings?.instagram_link && (
                    <li><a href={settings.instagram_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/70 hover:text-brand-purple transition-colors"><Camera size={14} /> Instagram</a></li>
                  )}
                  {settings?.twitter_link && (
                    <li><a href={settings.twitter_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/70 hover:text-brand-purple transition-colors"><MessageCircle size={14} /> Twitter</a></li>
                  )}
                  {settings?.linkedin_link && (
                    <li><a href={settings.linkedin_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/70 hover:text-brand-purple transition-colors"><Briefcase size={14} /> LinkedIn</a></li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Strip */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-center gap-4">

          {/* Copyright */}
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em] text-center">
            &copy; 2026 {platformName}. Excellence in every detail.
          </p>

        </div>
      </div>

    </footer>
  );
};

export default Footer;