import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { promotionService } from '../../services/api';
import { motion } from 'framer-motion';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const HomeBanner = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await promotionService.getBanners();
        setBanners(res.data);
      } catch (err) {
        console.error("Error fetching banners", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  if (loading || banners.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 relative group">
      <Swiper
        spaceBetween={30}
        centeredSlides={true}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        navigation={{
          nextEl: '.swiper-button-next-custom',
          prevEl: '.swiper-button-prev-custom',
        }}
        modules={[Autoplay, Pagination, Navigation]}
        className="mySwiper rounded-[2.5rem] overflow-hidden shadow-2xl h-[450px]"
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner.id}>
            <div 
              className="relative w-full h-full flex items-center p-8 md:p-16 overflow-hidden"
              style={{ backgroundColor: banner.background_color || '#6D28D9' }}
            >
              {/* Background Accents */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[80px] -mr-32 -mt-32" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-[60px] -ml-20 -mb-20" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center w-full z-10">
                <div className="text-white space-y-6">
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    className="inline-block px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-black uppercase tracking-widest"
                  >
                    {banner.discount_percent}% OFF Special Deal
                  </motion.div>
                  
                  <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl md:text-6xl font-black leading-tight tracking-tighter uppercase italic"
                  >
                    {banner.title}
                  </motion.h2>
                  
                  <motion.p 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-white/80 text-lg font-medium max-w-md line-clamp-2"
                  >
                    {banner.short_description}
                  </motion.p>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center gap-6"
                  >
                    <div className="flex flex-col">
                      <span className="text-white/60 text-xs font-black uppercase tracking-widest">Starts From</span>
                      <span className="text-3xl font-black">₹{banner.offer_price}</span>
                    </div>
                    
                    <Link 
                      to={`/product/${banner.product}`}
                      className="bg-white text-brand-navy px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-xl active:scale-95"
                    >
                      Shop Now <ArrowRight size={18} />
                    </Link>
                  </motion.div>
                  
                  {banner.vendor_name && (
                    <div className="pt-4 flex items-center gap-2 opacity-60">
                      <span className="w-8 h-[1px] bg-white"></span>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">By {banner.vendor_name}</span>
                    </div>
                  )}
                </div>
                
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
                  whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 100 }}
                  className="hidden md:flex justify-center"
                >
                  <div className="relative">
                    {/* Decorative Circle behind image */}
                    <div className="absolute inset-0 bg-white/10 rounded-full blur-3xl scale-150" />
                    <img 
                      src={banner.image_url || 'https://placehold.co/400'} 
                      alt={banner.title}
                      className="relative w-[350px] h-[350px] object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                </motion.div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Navigation Buttons */}
      <button className="swiper-button-prev-custom absolute left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0">
        <ChevronLeft size={24} />
      </button>
      <button className="swiper-button-next-custom absolute right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0">
        <ChevronRight size={24} />
      </button>

      <style jsx global>{`
        .swiper-pagination-bullet {
          background: rgba(255, 255, 255, 0.5) !important;
          width: 10px !important;
          height: 10px !important;
          opacity: 1 !important;
        }
        .swiper-pagination-bullet-active {
          background: white !important;
          width: 30px !important;
          border-radius: 5px !important;
        }
      `}</style>
    </section>
  );
};

export default HomeBanner;
