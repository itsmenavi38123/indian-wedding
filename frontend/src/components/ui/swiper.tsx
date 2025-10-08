'use client';

import { FC, ReactNode } from 'react';
import { Swiper as SwiperJS, SwiperSlide, SwiperProps as SwiperJSProps } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import Image from 'next/image';

interface SlideItem {
  title: string;
  img: string;
  alt: string;
}

interface CustomSwiperProps extends Omit<SwiperJSProps, 'children'> {
  slides: SlideItem[];
  heading?: ReactNode;
  backgroundImage?: string;
}

const Swiper: FC<CustomSwiperProps> = ({ slides, heading, backgroundImage, ...swiperProps }) => {
  return (
    <section
      className="w-full py-20 relative"
      style={{
        backgroundImage: backgroundImage ? `url('${backgroundImage}')` : undefined,
        backgroundPosition: 'right center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="w-full max-w-7xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        {heading && (
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-black mb-12">
            {heading}
          </h2>
        )}

        <SwiperJS
          modules={[Navigation, Pagination, Autoplay]}
          navigation={{ nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' }}
          {...swiperProps}
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={index} className="flex justify-center">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col w-full max-w-[300px] sm:max-w-[320px] md:max-w-[340px] hover:scale-105 transition-transform duration-300 ease-in-out">
                <div className="w-full aspect-[4/3]">
                  <Image src={slide.img} alt={slide.alt} className="w-full h-full object-cover" />
                </div>
                <div className="px-4 py-4">
                  <h3 className="text-center text-base sm:text-lg md:text-xl font-semibold text-black">
                    {slide.title}
                  </h3>
                </div>
              </div>
            </SwiperSlide>
          ))}

          {/* Navigation Buttons */}
          <div className="swiper-button-prev !text-black" />
          <div className="swiper-button-next !text-black" />
        </SwiperJS>
      </div>
    </section>
  );
};

export default Swiper;
