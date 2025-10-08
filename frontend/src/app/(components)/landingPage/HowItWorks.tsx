'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

interface HowItWorksProps {
  editable?: boolean;
  heading?: string;
  setHeading?: (value: string) => void;
  step1Title?: string;
  setStep1Title?: (value: string) => void;
  step1Desc?: string;
  setStep1Desc?: (value: string) => void;
  step2Title?: string;
  setStep2Title?: (value: string) => void;
  step2Desc?: string;
  setStep2Desc?: (value: string) => void;
  step3Title?: string;
  setStep3Title?: (value: string) => void;
  step3Desc?: string;
  setStep3Desc?: (value: string) => void;
  bgImage?: string | File;
  setBgImage?: (value: string | File) => void;
}

const HowItWorks: React.FC<HowItWorksProps> = ({
  editable = false,
  heading: initialHeading = 'How It Works',
  setHeading,
  step1Title,
  setStep1Title,
  step1Desc,
  setStep1Desc,
  step2Title,
  setStep2Title,
  step2Desc,
  setStep2Desc,
  step3Title,
  setStep3Title,
  step3Desc,
  setStep3Desc,
  bgImage,
  setBgImage,
}) => {
  const [editMode, setEditMode] = useState(false);
  const [localHeading, setLocalHeading] = useState(initialHeading);
  const headingToShow = setHeading ? initialHeading : localHeading;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (setHeading) {
      setHeading(value);
    } else {
      setLocalHeading(value);
    }
  };

  return (
    <section
      className="w-full how-work relative py-[60px] pb-[90px] px-[15px] lg:px-[20px] xl:px-[60px] 2xl:px-[150px] bg-[url('/landing/how-it-bg.png')] bg-cover bg-top md:bg-[right_center] bg-no-repeat"
      style={{
        backgroundImage: `url(${bgImage})`,
      }}
    >
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
          value={headingToShow}
          onChange={handleChange}
          className="text-center text-white text-[32px] md:text-[42px] 2xl:text-[52px] font-normal bg-transparent  border border-white border-dashed outline-none w-full max-w-[700px] mx-auto mb-8"
        />
      ) : (
        <h2 className="text-center relative z-10 text-white text-[32px] md:text-[42px] 2xl:text-[52px] font-normal leading-normal mb-[40px] 2xl:mb-[80px]">
          {headingToShow}
          <div className="w-16 h-[2px] bg-white mx-auto mt-2"></div>
        </h2>
      )}

      {editMode && (
        <>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.onload = () => {
                  if (typeof reader.result === 'string') {
                    if (setBgImage) setBgImage(reader.result);
                  }
                };
                reader.readAsDataURL(file);
              }
            }}
            className=" w-[220px] text-white text-sm bg-transparent border border-white outline-none mb-4 px-2 py-1"
          />
        </>
      )}

      {/* Left side */}
      <div className="w-full left-col relative z-10 md:w-full lg:w-1/2   text-white flex flex-col justify-center">
        <div className="relative ">
          {/* Vertical Line */}
          <div className="absolute hidden md:flex left-[25px] 2xl:left-[41px] top-[15px] bottom-[90px] 2xl:bottom-[70px] w-[2px] bg-white"></div>

          {/* Step 1 */}
          <div className="relative mb-[20px] 2xl:mb-10 md:pl-[80px] 2xl:pl-[105px]">
            <div className="sm:static md:absolute  -left-[0px] top-[15px] w-[50px] 2xl:w-[80px] h-[50px] 2xl:h-[80px] rounded-full text-[22px] 2xl:text-[36px] bg-white text-black  hidden md:flex items-center justify-center font-bold">
              1
            </div>

            {editMode ? (
              <>
                <input
                  value={step1Title}
                  onChange={(e) => setStep1Title && setStep1Title(e.target.value)}
                  className="w-full text-white text-[30px] 2xl:text-[36px] font-normal leading-normal bg-transparent  border-t border-l border-r border-white border-dashed outline-none mb-2"
                />
                <textarea
                  value={step1Desc}
                  onChange={(e) => setStep1Desc && setStep1Desc(e.target.value)}
                  className="w-full text-white font-montserrat font-normal text-[15px] 2xl:text-[18px] leading-[24px] 2xl:leading-[30px] bg-transparent  border border-white border-dashed outline-none"
                  rows={3}
                />
              </>
            ) : (
              <>
                <h3 className=" text-white text-[30px]  2xl:text-[36px] font-normal leading-normal">
                  {step1Title}{' '}
                </h3>
                <p className="text-white font-montserrat font-normal text-[15px] 2xl:text-[18px] leading-[24px] 2xl:leading-[30px]">
                  {step1Desc}
                </p>
              </>
            )}
          </div>

          {/* Step 2 */}
          <div className="relative mb-[20px] 2xl:mb-10 md:pl-[80px] 2xl:pl-[105px]">
            <div className="sm:static md:absolute -left-[0px] top-[15px] w-[50px] 2xl:w-[80px] h-[50px] 2xl:h-[80px] rounded-full text-[22px] 2xl:text-[36px] bg-white text-black hidden md:flex items-center justify-center font-bold">
              2
            </div>

            {editMode ? (
              <>
                <input
                  value={step2Title}
                  onChange={(e) => setStep2Title && setStep2Title(e.target.value)}
                  className="w-full text-white text-[30px] 2xl:text-[36px] font-normal leading-normal bg-transparent   border-t border-l border-r border-white border-dashed outline-none mb-2"
                />
                <textarea
                  value={step2Desc}
                  onChange={(e) => setStep2Desc && setStep2Desc(e.target.value)}
                  className="w-full text-white font-montserrat font-normal text-[15px] 2xl:text-[18px] leading-[24px] 2xl:leading-[30px] bg-transparent  border border-white border-dashed outline-none"
                  rows={3}
                />
              </>
            ) : (
              <>
                <h3 className=" text-white text-[30px] 2xl:text-[36px] font-normal leading-normal">
                  {step2Title}{' '}
                </h3>
                <p className="text-white font-montserrat font-normal text-[15px] 2xl:text-[18px] leading-[24px] 2xl:leading-[30px]">
                  {step2Desc}
                </p>
              </>
            )}
          </div>

          {/* Step 3 */}
          <div className="relative md:pl-[80px] 2xl:pl-[105px]">
            <div className="sm:static md:absolute -left-[0px] top-[15px] w-[50px] 2xl:w-[80px] h-[50px] 2xl:h-[80px] rounded-full text-[22px] 2xl:text-[36px] bg-white text-black hidden md:flex items-center justify-center font-bold">
              3
            </div>
            {editMode ? (
              <>
                <input
                  value={step3Title}
                  onChange={(e) => setStep3Title && setStep3Title(e.target.value)}
                  className="w-full text-white text-[30px] 2xl:text-[36px] font-normal leading-normal bg-transparent  border-t border-l border-r border-white border-dashed outline-none mb-2"
                />
                <textarea
                  value={step3Desc}
                  onChange={(e) => setStep3Desc && setStep3Desc(e.target.value)}
                  className="w-full text-white font-montserrat font-normal text-[15px] 2xl:text-[18px] leading-[24px] 2xl:leading-[30px] bg-transparent  border border-white border-dashed outline-none"
                  rows={3}
                />
              </>
            ) : (
              <>
                <h3 className=" text-white text-[30px]  2xl:text-[36px] font-normal leading-normal">
                  {step3Title}{' '}
                </h3>
                <p className="text-white font-montserrat font-normal text-[15px] 2xl:text-[18px] leading-[24px] 2xl:leading-[30px]">
                  {step3Desc}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right side */}
    </section>
  );
};

export default HowItWorks;
