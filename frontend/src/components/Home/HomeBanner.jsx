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
    <section className="w-full relative group">
      <Swiper
        spaceBetween={0}
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
        className="mySwiper w-full h-[250px] sm:h-[350px] md:h-[450px] lg:h-[500px]"
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner.id}>
            <Link to={`/product/${banner.product}`} className="block w-full h-full bg-slate-100">
              {banner.image_url ? (
                <img 
                  src={banner.image_url} 
                  alt={banner.title}
                  className="w-full h-full object-cover object-center"
                />
              ) : (
                <div 
                  className="w-full h-full flex items-center justify-center p-8 text-white text-center"
                  style={{ backgroundColor: banner.background_color || '#6D28D9' }}
                >
                  <div className="max-w-2xl">
                    <h2 className="text-3xl md:text-5xl font-black mb-4 uppercase">{banner.title}</h2>
                    <p className="text-lg md:text-xl mb-6">{banner.short_description}</p>
                    <span className="inline-flex items-center gap-2 bg-white text-brand-navy px-8 py-3 rounded-full font-black uppercase text-sm tracking-widest hover:scale-105 transition-transform shadow-lg">
                      Shop Now <ArrowRight size={18} />
                    </span>
                  </div>
                </div>
              )}
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Navigation Buttons */}
      <button className="swiper-button-prev-custom absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 bg-white/30 hover:bg-white/60 backdrop-blur-md rounded-full flex items-center justify-center text-brand-navy shadow-lg transition-all opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0">
        <ChevronLeft size={24} />
      </button>
      <button className="swiper-button-next-custom absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 bg-white/30 hover:bg-white/60 backdrop-blur-md rounded-full flex items-center justify-center text-brand-navy shadow-lg transition-all opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0">
        <ChevronRight size={24} />
      </button>

      <style jsx global>{`
        .swiper-pagination-bullet {
          background: rgba(255, 255, 255, 0.7) !important;
          width: 8px !important;
          height: 8px !important;
          opacity: 1 !important;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .swiper-pagination-bullet-active {
          background: white !important;
          width: 24px !important;
          border-radius: 4px !important;
        }
      `}</style>
    </section>
  );
};

export default HomeBanner;
