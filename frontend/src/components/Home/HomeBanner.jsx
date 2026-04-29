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
        const bannerData = Array.isArray(res.data) ? res.data : (res.data?.results || []);
        setBanners(bannerData);
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
    <section className="w-full py-6 overflow-hidden">
      <div className="max-w-[1450px] mx-auto px-4">
        <Swiper
          spaceBetween={16}
          slidesPerView={1.1}
          centeredSlides={true}
          loop={banners.length > 3}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
            el: '.custom-swiper-pagination',
          }}
          breakpoints={{
            640: {
              slidesPerView: 1.2,
              spaceBetween: 16,
            },
            1024: {
              slidesPerView: 2.5,
              spaceBetween: 24,
            },
            1280: {
              slidesPerView: 'auto',
              centeredSlides: false,
              spaceBetween: 32, 
            }
          }}
          modules={[Autoplay, Pagination]}
          className="banner-swiper !pb-12"
        >
          {banners.map((banner) => (
            <SwiperSlide key={banner.id} className="!w-auto">
              <Link 
                to={`/product/${banner.product}`} 
                className="block relative w-[350px] sm:w-[460px] h-[180px] sm:h-[224.38px] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-500 group bg-white border border-slate-200"
                style={{ borderRadius: `${banner.border_radius || 16}px` }}
              >
                <div 
                  className={`w-full h-full flex relative transition-all duration-500 ${
                    banner.image_position === 'left' ? 'flex-row-reverse' : 
                    banner.image_position === 'center' ? 'flex-col justify-center' : 'flex-row'
                  }`}
                  style={{ background: banner.computed_background || banner.background_color || '#6D28D9' }}
                >
                  {/* Banner Image */}
                  {banner.image_url && (
                    <div className={`relative overflow-hidden ${
                      banner.image_position === 'center' ? 'absolute inset-0 w-full h-full' : 'w-1/2 h-full'
                    }`}>
                      <img 
                        src={banner.image_url} 
                        alt={banner.title}
                        className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-700 z-0"
                      />
                      {banner.image_position === 'center' && (
                        <div 
                          className="absolute inset-0 z-1" 
                          style={{ backgroundColor: `rgba(0,0,0,${banner.overlay_opacity || 0.2})` }}
                        ></div>
                      )}
                    </div>
                  )}
                  
                  {/* Content Overlay */}
                  <div className={`relative z-10 p-6 flex flex-col justify-center ${
                    banner.image_position === 'center' ? 'w-full items-center text-center' : 'w-1/2'
                  }`}>
                     {banner.badge_text && (
                       <span className="inline-block w-fit px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest bg-white/20 backdrop-blur-md mb-2 border border-white/10" style={{ color: banner.title_color || '#FFFFFF' }}>
                         {banner.badge_text}
                       </span>
                     )}
                     <h3 className="text-[10px] sm:text-xs font-bold opacity-90 uppercase tracking-widest mb-1" style={{ color: banner.title_color || '#FFFFFF' }}>
                       {banner.vendor_name}
                     </h3>
                     <h2 className="text-lg sm:text-2xl font-black mb-2 leading-tight tracking-tight" style={{ color: banner.title_color || '#FFFFFF' }}>
                       {banner.title}
                     </h2>
                     <p className="text-[10px] sm:text-sm opacity-90 mb-4 line-clamp-2 font-medium" style={{ color: banner.description_color || '#F3F4F6' }}>
                       {banner.short_description}
                     </p>
                     
                     <span 
                       className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold uppercase text-[10px] sm:text-xs tracking-wide hover:scale-105 transition-transform shadow-md w-fit"
                       style={{ 
                         backgroundColor: banner.button_bg_color || '#FFFFFF',
                         color: banner.button_text_color || '#0F172A'
                       }}
                     >
                       {banner.button_text || 'Shop Now'} <ArrowRight size={12} />
                     </span>
                  </div>

                  {/* AD Badge */}
                  <div className="absolute bottom-3 right-4 bg-black/30 backdrop-blur-md px-2 py-0.5 rounded-md text-[8px] font-bold text-white uppercase tracking-widest z-10 border border-white/10">
                    AD
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Centered Pagination Dots */}
        <div className="flex items-center justify-center relative z-20">
            <div className="custom-swiper-pagination flex items-center justify-center gap-1.5"></div>
        </div>
      </div>

      <style jsx global>{`
        .custom-swiper-pagination .swiper-pagination-bullet {
          background: #e2e8f0 !important;
          width: 6px !important;
          height: 6px !important;
          margin: 0 3px !important;
          opacity: 1 !important;
          transition: all 0.3s ease !important;
        }
        .custom-swiper-pagination .swiper-pagination-bullet-active {
          background: #64748b !important;
          width: 18px !important;
          border-radius: 3px !important;
        }
        .banner-swiper .swiper-slide {
          height: auto !important;
        }
      `}</style>
    </section>
  );
};

export default HomeBanner;
