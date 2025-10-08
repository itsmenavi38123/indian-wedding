'use client';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import React, { useRef, useState } from 'react';

export const logos = [
  '/landing/logoone.png',
  '/landing/logotwo.png',
  '/landing/logothree.png',
  // add more logos here if needed
];

interface ClientLogoProps {
  editable?: boolean;
  logos: (string | File)[];
  setLogos?: React.Dispatch<React.SetStateAction<(string | File)[]>>;
  heading?: string;
  setHeading?: React.Dispatch<React.SetStateAction<string>>;
  paragraph?: string;
  setParagraph?: React.Dispatch<React.SetStateAction<string>>;
}

const ClientLogo: React.FC<ClientLogoProps> = ({
  editable = false,
  logos,
  setLogos,
  heading: propHeading,
  setHeading: setPropHeading,
  paragraph: propParagraph,
  setParagraph: setPropParagraph,
}) => {
  const [isHeadingEditing, setIsHeadingEditing] = useState(false);
  const [isParagraphEditing, setIsParagraphEditing] = useState(false);

  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleFileChange = (idx: number, file: File) => {
    if (!setLogos) return;
    setLogos((prev) => prev.map((logo, i) => (i === idx ? file : logo)));
  };

  const heading = propHeading ?? 'As Seen In';
  const paragraph =
    propParagraph ?? 'Trusted by the world’s leading wedding & lifestyle publications.';

  const getLogoUrl = (logo: string | File) =>
    logo instanceof File ? URL.createObjectURL(logo) : logo;
  return (
    <section className="py-12 bg-white xl:py-[30px] px-[15px] md:px-[20px] lg:px-[20px] xl:px-[60px] 2xl:px-[150px]">
      <div className="max-w-[100%] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-6">
          {/* Left: Heading + subtitle */}
          <div className="lg:col-span-5 text-center md:text-left">
            {editable && (
              <div className="flex gap-2 mb-2">
                <Button
                  size="sm"
                  className="bg-white text-black border hover:bg-black hover:text-gold"
                  onClick={() => setIsHeadingEditing((prev) => !prev)}
                >
                  {isHeadingEditing ? 'Done' : 'Edit Heading'}
                </Button>
                <Button
                  size="sm"
                  className="bg-white text-black border hover:bg-black hover:text-gold"
                  onClick={() => setIsParagraphEditing((prev) => !prev)}
                >
                  {isParagraphEditing ? 'Done' : 'Edit Paragraph'}
                </Button>
              </div>
            )}
            {isHeadingEditing && setPropHeading ? (
              <input
                type="text"
                value={heading}
                onChange={(e) => setPropHeading(e.target.value)}
                className="w-full p-2 border border-dashed border-gray-400 text-[30px] md:text-[42px] lg:text-[52px] font-bold text-black"
              />
            ) : (
              <h2 className="text-[30px] md:text-[42px] lg:text-[52px] md:leading-[52px] lg:leading-[62px]  text-black">
                {heading}{' '}
              </h2>
            )}
            {isParagraphEditing && setPropParagraph ? (
              <textarea
                value={paragraph}
                onChange={(e) => setPropParagraph(e.target.value)}
                className="w-full p-2 border border-dashed border-gray-400 text-[14px] md:text-[16px] text-black leading-[26px] font-montserrat"
              />
            ) : (
              <p className="mt-2 text-[14px] md:text-[16px] text-black leading-[26px] font-montserrat">
                {paragraph}
              </p>
            )}
          </div>

          {/* Right: Logos */}
          <div className="lg:col-span-7 ">
            <div className=" w-full flex flex-wrap  items-center justify-between gap-[10px] md:gap-8">
              {logos?.map((src, idx) => (
                <div key={idx} className="flex flex-col items-center justify-center">
                  <Image
                    src={getLogoUrl(src)}
                    alt={`logo-${idx}`}
                    className=" max-h-[30px] md:max-h-[40px] lg:max-h-[77px] w-fit object-contain"
                    loading="lazy"
                  />
                  {editable && (
                    <input
                      type="file"
                      accept="image/*"
                      ref={(el) => {
                        fileInputRefs.current[idx] = el;
                      }}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileChange(idx, e.target.files[0]);
                        }
                      }}
                      className="mt-2 text-sm max-w-34"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClientLogo;
