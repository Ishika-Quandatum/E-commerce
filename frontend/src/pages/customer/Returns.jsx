import React from 'react';
import { RotateCcw, ShieldCheck, CheckCircle2, AlertTriangle, Clock, CreditCard, ArrowRight, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Returns = () => {
  const policies = [
    {
      title: "Return Eligibility",
      icon: <CheckCircle2 className="text-emerald-500" />,
      content: "Most items purchased from our platform are eligible for return within 7 days of delivery, provided they are in their original condition.",
      bullets: [
        "Unused and unwashed condition",
        "Original tags and packaging intact",
        "Freebies/coupons returned with product"
      ]
    },
    {
      title: "Refund Process",
      icon: <CreditCard className="text-blue-500" />,
      content: "Once we receive your returned item and verify its condition, we will initiate a refund to your original payment method.",
      bullets: [
        "Quality check within 24-48 hours",
        "Instant credit to wallet (optional)",
        "Bank transfer takes 5-7 business days"
      ]
    },
    {
      title: "Non-Returnable Items",
      icon: <AlertTriangle className="text-rose-500" />,
      content: "For hygiene and security reasons, certain categories are not eligible for returns or exchanges.",
      bullets: [
        "Personal care and cosmetics",
        "Innerwear and sleepwear",
        "Customized or personalized items"
      ]
    },
    {
      title: "Damaged Products",
      icon: <RotateCcw className="text-brand-purple" />,
      content: "If you receive a damaged or wrong product, please report it within 24 hours of delivery for an immediate replacement.",
      bullets: [
        "Take a photo/video of the package",
        "Keep the original shipping label",
        "Zero-cost pickup and replacement"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Hero Header */}
      <div className="bg-brand-navy pt-20 pb-32 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-rose-500/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-center gap-3 text-rose-400 font-black uppercase tracking-[0.3em] text-[10px] mb-4">
             <ShieldCheck size={14} /> Hassle-Free Returns
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter mb-6">
            Returns <span className="text-rose-400">& Refunds</span>
          </h1>
          <p className="text-white/60 text-sm md:text-lg max-w-2xl leading-relaxed">
            Your satisfaction is our priority. If you're not completely happy with your purchase, we're here to help make the return process smooth and efficient.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
             {policies.map((policy, idx) => (
               <motion.div 
                 key={idx}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-sm hover:shadow-xl transition-all group"
               >
                 <div className="flex items-center gap-6 mb-8">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                       {policy.icon}
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">{policy.title}</h2>
                 </div>
                 
                 <p className="text-slate-500 font-medium leading-relaxed mb-8">
                    {policy.content}
                 </p>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {policy.bullets.map((bullet, bIdx) => (
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
             <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                   <Clock className="text-brand-purple" />
                   <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Timeline</h3>
                </div>
                <div className="space-y-6">
                   <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Return Window</span>
                      <span className="text-sm font-black text-slate-900">7 Days</span>
                   </div>
                   <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Processing</span>
                      <span className="text-sm font-black text-slate-900">48 Hours</span>
                   </div>
                   <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Refund Credit</span>
                      <span className="text-sm font-black text-slate-900">5-7 Days</span>
                   </div>
                </div>
             </div>

             <div className="bg-brand-navy rounded-[2.5rem] p-8 text-white shadow-2xl shadow-rose-200">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                   <HelpCircle className="text-rose-400" />
                </div>
                <h3 className="text-xl font-black mb-4">Still Unsure?</h3>
                <p className="text-white/60 text-sm leading-relaxed mb-6 font-medium">
                  If your situation is unique or you need further clarification on our policies, our team is standing by to assist you.
                </p>
                <button className="w-full bg-white text-slate-900 h-14 rounded-2xl font-bold text-sm hover:bg-rose-400 hover:text-white transition-all">
                   Chat with Support
                </button>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Returns;
