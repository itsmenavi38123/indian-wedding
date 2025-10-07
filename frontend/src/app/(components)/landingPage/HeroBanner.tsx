'use client';

import { landingContent } from '@/app/admin/constants';
import { Button } from '@/components/ui/button';
import { useUpdateSection1 } from '@/hooks/use-landingpage';
import { useRouter } from 'next/navigation';
import React, { useRef, useState } from 'react';

interface HeroBannerProps {
  editable?: boolean;
}

const HeroBanner: React.FC<HeroBannerProps> = ({ editable = false }) => {
  const router = useRouter();
  const updateSection1Mutation = useUpdateSection1();
  const [title, setTitle] = useState(landingContent.heroSectionTitle);
  const [videoUrl, setVideoUrl] = useState(landingContent.heroSectionVideoUrl);
  const [button1Text, setButton1Text] = useState(landingContent.heroSectionButton1Text);
  const [heroSectionButton1Visible, setHeroSectionButton1Visible] = useState(true);
  const [button2Text, setButton2Text] = useState(landingContent.heroSectionButton2Text);
  const [button2Visible, setButton2Visible] = useState(true);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editVideoMode, setEditVideoMode] = useState(false);

  const handleSaveSection1 = () => {
    const formData = new FormData();
    formData.append('text1', title);
    formData.append('buttons[0][label]', button1Text);
    formData.append('buttons[0][show]', String(heroSectionButton1Visible));
    formData.append('buttons[1][label]', button2Text);
    formData.append('buttons[1][show]', String(button2Visible));
    if (videoFile) {
      formData.append('video', videoFile);
    }
    updateSection1Mutation.mutate(formData);
  };

  const handleVideoClick = () => {
    if (editable && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newVideoUrl = URL.createObjectURL(file);
      if (setVideoFile) setVideoFile(file);
      if (setVideoUrl) setVideoUrl(newVideoUrl);
    }
  };
  return (
    <>
      <div className="relative flex flex-col min-h-screen">
        {editable && (
          <button
            onClick={() => setEditVideoMode((prev) => !prev)}
            className="absolute top-4 right-4 z-50 bg-white text-black px-4 py-3 text-sm border border-gray-300 rounded shadow hover:bg-gray-100 transition cursor-pointer"
          >
            {editVideoMode ? 'Cancel ' : 'Change Video'}
          </button>
        )}

        <input
          type="file"
          accept="video/*"
          style={{ display: 'none' }}
          ref={fileInputRef}
          onChange={handleVideoChange}
        />

        <video
          key={videoUrl}
          className="absolute top-0 left-0 w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        <div className="absolute inset-0 bg-gradient-to-b bg-[image:var(--Hero-gradient)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(81,81,81,0)] to-[rgba(0,0,0,0.7)] pointer-events-none"></div>
        <section
          className="relative z-10 flex w-full flex-col items-center justify-end text-center flex-1 px-[15px] pb-[60px] md:pb-[100px]"
          style={{ pointerEvents: 'auto' }}
        >
          {editable ? (
            <textarea
              className="text-white text-5xl md:text-6xl font-serif mb-6 max-w-[750px] bg-transparent border-dashed border-b-white border-4 resize-none text-center focus:outline-none"
              value={title}
              onChange={(e) => setTitle && setTitle(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              rows={3}
            />
          ) : (
            <h1 className="text-white text-[32px] leading-[36px] md:text-[42px] md:leading-[52px] xl:text-[56px] xl:leading-[60px] font-serif mb-6 md:max-w-[470px] xl:max-w-[750px]">
              Plan Your Dream Indian Wedding in 15 Minutes.
            </h1>
          )}
          <div className=" flex flex-wrap md:flex-nowrap gap-4 justify-center">
            <>
              {heroSectionButton1Visible ? (
                editable ? (
                  <input
                    type="text"
                    className="h-[55px] flex justify-center items-center bg-gold text-white text-[18px] font-normal tracking-[1px] hover:text-gold hover:bg-white transition-colors px-[36px] py-[12px] rounded-md"
                    value={button1Text}
                    onChange={(e) => setButton1Text && setButton1Text(e.target.value)}
                  />
                ) : (
                  <Button
                    size="sm"
                    onClick={() => router.push('/gallery')}
                    className="h-[50px]   md:mb-0 md:h-[55px] w-[220px] md:w-auto flex justify-center items-center bg-gold text-white text-[16px] md:text-[18px] font-normal tracking-[1px] hover:text-gold hover:bg-white transition-colors px-[20px] py-[10px]  sm:px-[25px] sm:py-[12px] cursor-pointer"
                  >
                    {landingContent.heroSectionButton1Text}
                  </Button>
                )
              ) : null}

              {editable && (
                <button
                  className="text-sm  bg-white text-black border p-2 cursor-pointer mt-3 w-[70%]"
                  onClick={() =>
                    setHeroSectionButton1Visible &&
                    setHeroSectionButton1Visible(!heroSectionButton1Visible)
                  }
                >
                  {heroSectionButton1Visible ? 'Hide Button' : 'Show Button'}
                </button>
              )}
            </>
            <>
              {button2Visible ? (
                editable ? (
                  <input
                    type="text"
                    className="h-[55px] flex justify-center items-center bg-white text-gold text-[18px] font-normal tracking-[1px] hover:text-white hover:bg-gold transition-colors px-[36px] py-[12px]"
                    value={button2Text}
                    onChange={(e) => setButton2Text && setButton2Text(e.target.value)}
                  />
                ) : (
                  <Button
                    size="sm"
                    className="h-[50px] md:h-[55px] w-[220px] md:w-auto flex justify-center items-center bg-white text-gold text-[16px] md:text-[18px] font-normal tracking-[1px] hover:text-white hover:bg-gold transition-colors px-[20px] py-[10px]  sm:px-[25px] sm:py-[12px] cursor-pointer"
                  >
                    Explore Real Weddings
                  </Button>
                )
              ) : null}
              {editable && (
                <button
                  className="text-sm  bg-white text-black border p-2 cursor-pointer mt-3 w-[70%]"
                  onClick={() => setButton2Visible && setButton2Visible(!button2Visible)}
                >
                  {button2Visible ? 'Hide Button' : 'Show Button'}
                </button>
              )}
            </>
          </div>
        </section>
        {editable && editVideoMode && (
          <div
            className="absolute top-0 left-0 w-full h-full z-0"
            onClick={handleVideoClick}
            style={{ cursor: 'pointer' }}
          />
        )}
      </div>
    </>
  );
};

export default HeroBanner;
