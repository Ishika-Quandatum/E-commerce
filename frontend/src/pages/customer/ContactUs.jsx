import React from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePlatform } from '../../context/PlatformContext';

const ContactUs = () => {
  const { platformName } = usePlatform();

  return (
    <div className="bg-white pb-20">
      {/* Hero Section */}
      <section className="bg-brand-navy py-24 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-purple rounded-full blur-[120px] opacity-20 -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-pink rounded-full blur-[100px] opacity-10 -ml-32 -mb-32" />
        
        <div className="relative z-10 max-w-3xl mx-auto px-4">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-brand-purple-light font-black text-sm uppercase tracking-[0.3em] mb-4 block"
          >
            Get In Touch
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black text-white mb-8 uppercase italic tracking-tighter"
          >
            Contact <span className="text-brand-purple not-italic tracking-normal">Us</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-white/70 font-medium"
          >
            Have questions about an order or want to partner with {platformName}? We're here to help you 24/7.
          </motion.p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Contact Info Cards */}
          <div className="lg:col-span-1 space-y-6">
            {[
              { icon: <Phone size={24} />, title: "Call Us", content: "+91 98765 43210", sub: "Mon-Sat, 9am-6pm" },
              { icon: <Mail size={24} />, title: "Email Us", content: "support@rainbowstore.com", sub: "24/7 Support" },
              { icon: <MapPin size={24} />, title: "Visit Us", content: "123 Business Street", sub: "City Center, India" },
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 group hover:bg-brand-purple transition-all duration-500"
              >
                <div className="w-14 h-14 bg-brand-purple/5 text-brand-purple rounded-2xl flex items-center justify-center mb-6 group-hover:bg-white transition-all shadow-sm">
                  {item.icon}
                </div>
                <h4 className="text-sm font-black text-brand-navy uppercase tracking-widest mb-1 group-hover:text-white/70 transition-colors">{item.title}</h4>
                <p className="text-lg font-black text-brand-navy group-hover:text-white transition-colors">{item.content}</p>
                <p className="text-xs font-medium text-brand-text-gray group-hover:text-white/60 transition-colors mt-2">{item.sub}</p>
              </motion.div>
            ))}
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-10 md:p-16 rounded-[3.5rem] shadow-2xl border border-slate-50"
            >
              <div className="mb-10">
                <h2 className="text-3xl font-black text-brand-navy uppercase italic tracking-tighter mb-2">Send us a <span className="text-brand-purple not-italic tracking-normal">Message</span></h2>
                <p className="text-brand-text-gray font-medium">Fill out the form below and we'll get back to you shortly.</p>
              </div>

              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-navy/60 px-2">Full Name</label>
                    <input type="text" placeholder="John Doe" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-brand-purple/20 transition-all font-medium outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-navy/60 px-2">Email Address</label>
                    <input type="email" placeholder="john@example.com" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-brand-purple/20 transition-all font-medium outline-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-navy/60 px-2">Subject</label>
                  <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-brand-purple/20 transition-all font-medium outline-none">
                    <option>General Inquiry</option>
                    <option>Order Support</option>
                    <option>Vendor Partnership</option>
                    <option>Technical Issue</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-navy/60 px-2">Your Message</label>
                  <textarea rows="5" placeholder="How can we help you?" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-brand-purple/20 transition-all font-medium outline-none resize-none"></textarea>
                </div>

                <button className="w-full bg-brand-purple text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:scale-[1.02] transition-all shadow-xl shadow-brand-purple/20 flex items-center justify-center gap-2 active:scale-95">
                  Send Message <Send size={18} />
                </button>
              </form>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ContactUs;
