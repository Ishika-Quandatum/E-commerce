import React from 'react';
import { Truck, Clock, ShieldCheck, Globe, CreditCard, AlertCircle, Info, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const ShippingInfo = () => {
  const sections = [
    {
      title: "Standard Delivery",
      icon: <Truck className="text-blue-500" />,
      content: "We offer reliable standard delivery across all major cities and rural areas. Our logistics partners are selected for their speed and care in handling your premium purchases.",
      bullets: [
        "Orders processed within 24-48 hours",
        "Safe and secure packaging",
        "Doorstep delivery with signature verification"
      ]
    },
    {
      title: "Delivery Times",
      icon: <Clock className="text-emerald-500" />,
      content: "Estimated delivery times depend on your location and the vendor's warehouse proximity.",
      bullets: [
        "Metros: 2-4 business days",
        "Tier 2 Cities: 3-5 business days",
        "Others: 5-7 business days"
      ]
    },
    {
      title: "Shipping Charges",
      icon: <CreditCard className="text-brand-purple" />,
      content: "We strive to keep shipping costs transparent and affordable.",
      bullets: [
        "Free shipping on orders above ₹999",
        "Flat rate of ₹49 for smaller orders",
        "No hidden handling fees"
      ]
    },
    {
      title: "International Shipping",
      icon: <Globe className="text-indigo-500" />,
      content: "Currently, we serve domestic customers only. We are working hard to bring our premium collection to the global market soon.",
      bullets: [
        "Serving 20,000+ pin codes in India",
        "Dedicated rural reach program",
        "Expansion to UAE and SE Asia coming soon"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Hero Header */}
      <div className="bg-brand-navy pt-20 pb-32 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-emerald-500/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-center gap-3 text-emerald-400 font-black uppercase tracking-[0.3em] text-[10px] mb-4">
             <ShieldCheck size={14} /> Guaranteed Delivery
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter mb-6">
            Shipping <span className="text-emerald-400">Policy</span>
          </h1>
          <p className="text-white/60 text-sm md:text-lg max-w-2xl leading-relaxed">
            Everything you need to know about how we get your favorite products from our vendors to your doorstep with speed and care.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
             {sections.map((section, idx) => (
               <motion.div 
                 key={idx}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-sm hover:shadow-xl transition-all group"
               >
                 <div className="flex items-center gap-6 mb-8">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                       {section.icon}
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">{section.title}</h2>
                 </div>
                 
                 <p className="text-slate-500 font-medium leading-relaxed mb-8">
                    {section.content}
                 </p>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {section.bullets.map((bullet, bIdx) => (
                      <div key={bIdx} className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                         <div className="mt-1">
                            <ArrowRight size={14} className="text-slate-300" />
                         </div>
                         <span className="text-xs font-bold text-slate-700 uppercase tracking-tight">{bullet}</span>
                      </div>
                    ))}
                 </div>
               </motion.div>
             ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
             <div className="bg-brand-navy rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-200">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                   <AlertCircle className="text-brand-purple" />
                </div>
                <h3 className="text-xl font-black mb-4">Important Notice</h3>
                <p className="text-white/60 text-sm leading-relaxed mb-6 font-medium">
                  Delivery times may be affected during public holidays, extreme weather conditions, or local restrictions. We appreciate your patience.
                </p>
                <div className="pt-6 border-t border-white/10 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-white/30">
                   <span>Last Updated</span>
                   <span>May 2026</span>
                </div>
             </div>

             <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                   <Info className="text-brand-purple" />
                   <h3 className="text-lg font-black text-slate-900">Need Help?</h3>
                </div>
                <p className="text-slate-500 text-xs font-medium mb-6 leading-relaxed uppercase tracking-wider">
                  If you have questions regarding your specific shipment, please contact our support team.
                </p>
                <button className="w-full bg-slate-50 text-slate-900 h-14 rounded-2xl font-bold text-sm hover:bg-brand-purple hover:text-white transition-all border border-slate-100">
                   Contact Logistics
                </button>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ShippingInfo;
