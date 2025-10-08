'use client';
import { Button } from '@/components/ui/button';
import React, { useRef, useState } from 'react';

interface CreateWebsiteProps {
  editable?: boolean;
  heading?: string;
  setHeading?: (text: string) => void;
  description?: string;
  setDescription?: (text: string) => void;
  buttonLabel?: string;
  setButtonLabel?: (text: string) => void;
  buttonLink?: string;
  setButtonLink?: (link: string) => void;
  buttonVisible?: boolean;
  setButtonVisible?: (show: boolean) => void;
  backgroundImage?: File | null | any;
  setBackgroundImage?: (file: File) => void;
}

const CreateWebsite: React.FC<CreateWebsiteProps> = ({
  editable = false,
  heading,
  setHeading,
  description,
  setDescription,
  buttonLabel,
  setButtonLabel,
  buttonLink,
  setButtonLink,
  buttonVisible = true,
  setButtonVisible,
  backgroundImage,
  setBackgroundImage,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isButtonEditing, setIsButtonEditing] = useState(false);
  const [isBgEditing, setIsBgEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [hasUploadedBg, setHasUploadedBg] = useState(false);

  const handleBgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (setBackgroundImage) setBackgroundImage(file);
    setHasUploadedBg(true);
  };

  const bgUrl =
    backgroundImage instanceof File ? URL.createObjectURL(backgroundImage) : backgroundImage;

  return (
    <section
      className={`create_website relative w-full bg-[url(${backgroundImage})] bg-cover bg-[center_center] bg-no-repeat px-[15px] py-[60px]  lg:py-[90px] xl:py-[210px] lg:px-[20px] xl:px-[100px]`}
      style={{ backgroundImage: `url(${bgUrl})` }}
    >
      <div className="w-full mx-auto flex flex-col lg:flex-row">
        {/* Left: Image */}
        <div className="xl:w-1/2 w-full"></div>

        {/* Right: Content */}
        <div className="md:w-full xl:w-1/2 w-full flex items-center relative z-10 ">
          <div className="text-white max-w-[780px] ml-[auto]">
            {/* Background Edit */}
            {editable && (
              <div className="mb-4 flex gap-2 items-center">
                {!isBgEditing ? (
                  <Button
                    size="sm"
                    className="bg-white text-black border hover:bg-black hover:text-gold"
                    onClick={() => setIsBgEditing(true)}
                  >
                    Edit Image
                  </Button>
                ) : (
                  <>
                    {!hasUploadedBg ? (
                      <>
                        <Button
                          size="sm"
                          className="bg-white text-black border hover:bg-black hover:text-gold"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Upload
                        </Button>
                        <Button
                          size="sm"
                          className="bg-white text-black border hover:bg-black hover:text-gold"
                          onClick={() => setIsBgEditing(false)}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        className="bg-white text-black border hover:bg-black hover:text-gold"
                        onClick={() => {
                          setIsBgEditing(false);
                          setHasUploadedBg(false); // reset for next edit
                        }}
                      >
                        Done
                      </Button>
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleBgChange}
                      className="hidden"
                    />
                  </>
                )}
              </div>
            )}

            {editable && (
              <Button
                size="sm"
                className="bg-white text-black border cursor-pointer hover:bg-black hover:text-gold"
                onClick={() => setIsEditing((prev) => !prev)}
              >
                {isEditing ? 'Done' : 'Edit'}
              </Button>
            )}
            {isEditing ? (
              <textarea
                value={heading}
                onChange={(e) => setHeading && setHeading(e.target.value)}
                className="text-[30px] lg:text-[36px] xl:text-[43px] leading-[1.2] mb-5 p-2 border-2 border-dashed border-gray-400 w-full resize-none text-gold"
                rows={3}
              />
            ) : (
              <h2 className="text-[30px] lg:text-[36px] xl:text-[43px] leading-[1.2] mb-5">
                {heading || (
                  <>
                    Already Planned your Wedding? <span className="text-gold">Create</span> your
                    beautiful <span className="text-gold">Wedding Website</span> and manage your
                    details with Indian Weddings
                  </>
                )}
              </h2>
            )}

            {/* Description */}
            {isEditing ? (
              <textarea
                value={description}
                onChange={(e) => setDescription && setDescription(e.target.value)}
                rows={5}
                className="text-[28px] text-white mt-2 leading-[28px] font-montserrat border-2 border-dashed border-gray-400 w-full  bg-black/50 p-2 resize-none"
              />
            ) : (
              <p className="text-[16px] xl:text-[18px] text-white mt-2 leading-[24px] xl:leading-[28px] font-montserrat">
                Easily design a stunning wedding website to showcase your story, share event details
                with guests, and keep everything organized in one place. From managing your guest
                list to updating schedules and sharing memories, Indian Weddings makes your
                experience seamless—even after all the planning is done. seamless—even after all the
                planning is done.
              </p>
            )}

            {editable && (
              <Button
                size="sm"
                className="absolute top-0 right-40 z-10 bg-white text-black border cursor-pointer hover:bg-black hover:text-gold"
                onClick={() => setIsButtonEditing((prev) => !prev)}
              >
                {isButtonEditing ? 'Done' : 'Edit'}
              </Button>
            )}
            {isButtonEditing ? (
              <div className="flex flex-col gap-2 mt-2">
                <input
                  type="text"
                  value={buttonLabel}
                  onChange={(e) => setButtonLabel && setButtonLabel(e.target.value)}
                  placeholder="Button Text"
                  className="p-2 border border-gray-400 rounded w-1/2"
                />
                <input
                  type="text"
                  value={buttonLink}
                  onChange={(e) => setButtonLink && setButtonLink(e.target.value)}
                  placeholder="Button Link"
                  className="p-2 border border-gray-400 rounded w-1/2"
                />
                {setButtonVisible && (
                  <label className="text-white flex items-center gap-2 mt-1">
                    <input
                      type="checkbox"
                      checked={buttonVisible}
                      onChange={(e) => setButtonVisible(e.target.checked)}
                    />
                    Show Button
                  </label>
                )}
              </div>
            ) : (
              buttonVisible && (
                <Button className=" cursor-pointer flex items-center justify-center h-[50px] xl:h-[55px] mt-8 bg-gold hover:bg-white hover:text-gold text-white text-[16px] xl:text-[20px] px-[25px] py-[10px] xl:px-8 xl:py-3 rounded-md transition-colors duration-200 ">
                  Create Your Website
                </Button>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CreateWebsite;
