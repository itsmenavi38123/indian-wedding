'use client';
import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

// Dummy reviews data
const reviews = [
  {
    id: 1,
    stars: 5,
    text: 'Planning Our Wedding Was Effortless And Magical. The Platform Made Everything Stress-Free, From Vendor Booking To Guest RSVPs.',
    name: 'Priya & Arjun',
    location: 'Dubai',
    image: '/landing/user-dummy.png', // Place image in public/images/
  },
  {
    id: 2,
    stars: 5,
    text: 'The AI Tools Helped Us Discover Vendors We Never Would Have Found. Our Wedding Felt Both Traditional And Uniquely Ours.',
    name: 'Ananya & Rohit',
    location: 'Mumbai',
    image: '/landing/user-dummy.png',
  },
  {
    id: 3,
    stars: 5,
    text: 'Seamless, Stylish, And Stress-Free. This Is The Future Of Wedding Planning.',
    name: 'Meera & Karan',
    location: 'New York',
    image: '/landing/user-dummy.png',
  },
  {
    id: 4,
    stars: 5,
    text: 'Planning Our Wedding Was Effortless And Magical. The Platform Made Everything Stress-Free, From Vendor Booking To Guest RSVPs.',
    name: 'Priya & Arjun',
    location: 'Dubai',
    image: '/landing/user-dummy.png',
  },
  {
    id: 5,
    stars: 5,
    text: 'Planning Our Wedding Was Effortless And Magical. The Platform Made Everything Stress-Free, From Vendor Booking To Guest RSVPs.',
    name: 'Priya & Arjun',
    location: 'Dubai',
    image: '/landing/user-dummy.png',
  },
];
interface ReviewProps {
  editable?: boolean;
  heading?: string;
  setHeading?: (value: string) => void;
}

const Review: React.FC<ReviewProps> = ({ editable = false, heading, setHeading }) => {
  const [editMode, setEditMode] = useState(false);
  return (
    <section className="  bg-[#E8E7E7] review_outer py-[50px]  max-w-screen px-[15px] md:px-[20px] xl:px-[60px] ">
      <div>
        {editable && (
          <Button
            onClick={() => setEditMode(!editMode)}
            className="bg-white text-black border cursor-pointer hover:bg-black hover:text-gold"
          >
            {editMode ? 'Done' : 'Edit'}
          </Button>
        )}
        {editMode ? (
          <input
            type="text"
            value={heading}
            onChange={(e) => setHeading?.(e.target.value)}
            className="text-[30px] md:text-[42px] xl:text-[52px] xl:leading-[56px] text-black text-center border-b-2 border-gray-400 bg-transparent outline-none w-full max-w-[800px] mx-auto"
          />
        ) : (
          <h2 className="text-[30px] md:text-[42px] xl:text-[52px] xl:leading-[56px]   text-black text-center mb-[30px] md:mb-[40px] ">
            {heading}
          </h2>
        )}
      </div>
      <Swiper
        modules={[Pagination]}
        spaceBetween={30}
        pagination={{ clickable: true }}
        breakpoints={{
          640: { slidesPerView: 1, spaceBetween: 20 },
          768: { slidesPerView: 2, spaceBetween: 20 },
          1300: { slidesPerView: 4, spaceBetween: 30 },
        }}
      >
        {reviews.map((review) => (
          <SwiperSlide key={review.id}>
            <div className="bg-white rounded-[6px] shadow-md p-[20px] md:p-[20px] xl:p-[30px] h-full flex flex-col justify-between mb-[50px]">
              {/* Stars */}
              <div className="text-yellow-400 text-2xl mb-[10px]">{'★'.repeat(review.stars)}</div>

              {/* Review text */}
              <p className="mt-2 text-[14px] lg:text-[16px] text-black leading-[26px] font-montserrat line-clamp-3 h-[78px]">
                {review.text}
              </p>

              {/* User */}
              <div className="flex items-center mt-[15px]">
                <div className="w-[54px] h-[54px] rounded-4xl overflow-hidden mr-4">
                  <Image
                    src={review.image}
                    alt={review.name}
                    width={54}
                    height={54}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <div className="flex">
                  <p className="text-[15px] font-normal leading-[20px] capitalize text-[rgba(51,51,51,0.75)]">
                    {review.name} {review.location}
                  </p>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default Review;
