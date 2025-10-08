'use client';

import { ChangeEvent, FC } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';

export const features = [
  { title: 'All in One Planning', img: '/landing/collection-one.png', alt: 'All in One Planning' },
  { title: 'Guest Management', img: '/landing/collection-two.png', alt: 'Guest Management' },
  { title: 'Certified Vendors', img: '/landing/collection-three.png', alt: 'Certified Vendors' },
  { title: 'AI Powered', img: '/landing/collection-four.png', alt: 'AI Powered' },
  { title: 'Guest Management', img: '/landing/collection-two.png', alt: 'Guest Management' },
];
export interface Feature {
  title: string;
  img: string;
  alt: string;
  link?: string;
  imagePath?: string;
}

interface CollectionSliderProps {
  features?: Feature[];
  title?: string;
  setTitle?: (value: string) => void;
  setFeatures?: (value: Feature[]) => void;
  editable?: boolean;
  cardImages?: Record<string, File | null>;
  setCardImages?: React.Dispatch<React.SetStateAction<Record<string, File | null>>>;
}

const CollectionSlider: FC<CollectionSliderProps> = ({
  features = [],
  title,
  setTitle,
  setFeatures,
  editable = false,
  // cardImages,
  setCardImages,
}) => {
  const handleCardTitleChange = (index: number, newTitle: string) => {
    if (!setFeatures) return;
    const updated = [...features];
    updated[index].title = newTitle;
    setFeatures(updated);
  };

  const handleCardImageChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    if (!setFeatures || !e.target.files?.[0]) return;

    const file = e.target.files[0];
    const imgUrl = URL.createObjectURL(file);

    const updated = [...features];
    updated[index].img = imgUrl;
    setFeatures(updated);

    if (setCardImages) {
      setCardImages((prev) => ({
        ...prev,
        [`card${index}`]: file,
      }));
    }
  };

  const handleAddCard = () => {
    if (!setFeatures) return;
    const newCard: Feature = {
      title: 'New Feature',
      img: '/placeholder.png',
      alt: 'New Feature',
    };
    setFeatures([...features, newCard]);
  };

  const handleRemoveCard = (index: number) => {
    if (!setFeatures) return;
    const updated = [...features];
    updated.splice(index, 1);
    setFeatures(updated);

    if (setCardImages) {
      setCardImages((prev) => {
        const copy = { ...prev };
        delete copy[`card${index}`];
        return copy;
      });
    }
  };

  const handleCardLinkChange = (index: number, newLink: string) => {
    if (!setFeatures) return;
    const updated = [...features];
    updated[index].link = newLink;
    setFeatures(updated);
  };
  return (
    <section className="home-collection w-screen bg-no-repeat bg-cover py-[50px] md:py-20 px-[5px] md:px-[10px] xl:px-[60px] bg-[url('/landing/collection-bg.png')]bg-[right_center]bg-no-repeatbg-cover">
      {editable && (
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleAddCard}
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex justify-end-safe transition"
          >
            <Plus />
          </button>
        </div>
      )}

      <div className="w-full max-w-[1920px] mx-auto text-center">
        {editable ? (
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle && setTitle(e.target.value)}
            className="text-4xl md:text-5xl font-serif text-black mb-12 px-3 w-[70%] max-w-[1920px] mx-auto text-center border-gold border-dashed border-2"
          />
        ) : (
          <h2 className="text-[32px] leading-[36px] md:text-[42px] md:leading-[46px] xl:text-[52px] xl:leading-[56px] font-serif text-black mb-[20px] md:mb-12 px-3">
            Everything You <span className="text-gold">Need</span>, One{' '}
            <span className="text-gold">Platform</span>
            <div className="w-16 h-[2px] bg-black mx-auto mt-2"></div>
          </h2>
        )}

        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={0}
          slidesPerView={1}
          // navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          loop
          breakpoints={{
            480: { slidesPerView: 1 },
            640: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            1300: { slidesPerView: 4 },
          }}
          preventClicks={false}
          preventClicksPropagation={false}
          simulateTouch={true}
          onSwiper={(swiper) => {
            swiper.allowTouchMove = true;
          }}
          noSwipingClass="swiper-no-swiping"
          noSwipingSelector=".swiper-no-swiping"
        >
          {features.map((feature, index) => (
            <SwiperSlide
              key={index}
              className="flex flex-col items-center justify-center pb-12 px-[12px] mb-4"
            >
              <div className=" bg-white">
                <div className="w-full aspect-[435/330]">
                  {' '}
                  <Image src={feature.img} alt={feature.alt} className="w-full h-full object-cover" />
                </div>

                {/* Edit image */}
                {editable && (
                  <div className="absolute top-2 right-2 flex gap-2">
                    <label className="px-2 py-1 text-xs bg-blue-600 text-white rounded cursor-pointer swiper-no-swiping">
                      Change Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleCardImageChange(index, e)}
                        className="hidden "
                      />
                    </label>
                    <button
                      onClick={() => handleRemoveCard(index)}
                      className="px-2 py-1 text-xs bg-red-200 text-red-500 cursor-pointer hover:opacity-90 rounded swiper-no-swiping"
                    >
                      <Trash2 />
                    </button>
                  </div>
                )}

                <div className="px-[10px] py-[10px]  lg:px-8 lg:py-5 drop-shadow-custom bg-white">
                  {' '}
                  {editable ? (
                    <>
                      <div>
                        <input
                          type="text"
                          value={feature.title}
                          onChange={(e) => handleCardTitleChange(index, e.target.value)}
                          className="text-black text-[20px] font-normal rounded w-full text-center border-gold border-dashed border-2 swiper-no-swiping"
                        />
                      </div>

                      <div>
                        <input
                          type="text"
                          value={feature.link || ''}
                          onChange={(e) => handleCardLinkChange(index, e.target.value)}
                          className="text-black text-[16px] font-normal rounded w-full text-center border-gold border-dashed border-2 swiper-no-swiping"
                          placeholder="Card Link (URL)"
                        />
                      </div>
                    </>
                  ) : (
                    <h3 className="text-black text-[20px] font-normal leading-normal text-left">
                      {feature.title}
                    </h3>
                  )}
                  <button className="cursor-pointer p-0  border-0  text-[16px] text-gold flex items-center gap-[2px]">
                    More{' '}
                    <Image
                    alt='navigate'
                      src="/landing/navigate-next.svg"
                      className="cursor-pointer relative top-[3px]"
                    />
                  </button>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default CollectionSlider;
