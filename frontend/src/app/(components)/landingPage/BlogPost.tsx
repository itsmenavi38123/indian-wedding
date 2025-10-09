'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import React, { useRef, useState } from 'react';

export interface Blog {
  id: number;
  category: string;
  title: string;
  description: string;
  image?: string | File;
  link?: string;
}

interface BlogPostProps {
  editable?: boolean;
  blogs: Blog[];
  setBlogs?: (blogs: Blog[]) => void;
  cardImages?: Record<number, File | null>;
  setCardImages?: (images: Record<number, File | null>) => void;
  sectionHeading: string;
  setSectionHeading?: (heading: string) => void;
  mainButtonLabel: string;
  setMainButtonLabel?: (label: string) => void;
  mainButtonLink: string;
  setMainButtonLink?: (link: string) => void;
}

const BlogPost: React.FC<BlogPostProps> = ({
  editable = false,
  blogs,
  setBlogs,
  cardImages = {},
  setCardImages,
  sectionHeading,
  setSectionHeading,
  mainButtonLabel,
  setMainButtonLabel,
  mainButtonLink,
  setMainButtonLink,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingCardId, setEditingCardId] = useState<number | null>(null);
  const [changingImageId, setChangingImageId] = useState<number | null>(null);
  const [isMainButtonEditing, setIsMainButtonEditing] = useState(false);
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, blogId: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (setCardImages) {
      setCardImages({ ...cardImages, [blogId]: file });
    }

    if (setBlogs) {
      const imageUrl = URL.createObjectURL(file);
      setBlogs(blogs.map((b) => (b.id === blogId ? { ...b, image: imageUrl } : b)));
    }
    setChangingImageId(null);
  };

  return (
    <section className="py-16 bg-[url('/landing/blog-bg.png')] bg-cover bg-[center_center] bg-no-repeat px-[15px] lg:px-[20px] xl:px-[60px] 2xl:px-[150px]">
      <div className="max-w-[100%] mx-auto text-center">
        {/* Section Title */}
        {isEditing ? (
          <textarea
            value={sectionHeading}
            onChange={(e) => setSectionHeading && setSectionHeading(e.target.value)}
            className="text-[32px] md:text-[52px] text-black border-2 border-dashed border-gray-400 p-2 w-full max-w-3xl text-center"
            rows={2}
          />
        ) : (
          <h2 className="text-[32px] lg:text-[36px] xl:text-[42px] 2xl:text-[52px] leading-[36px] md:leading-[56px] text-black mb-[15px]">
            {(() => {
              const words = (sectionHeading ?? '').trim().split(' ');
              const lastWord = words.pop();
              return (
                <>
                  {words.join(' ')} <span className="text-gold">{lastWord}</span>
                </>
              );
            })()}
          </h2>
        )}
        {editable && (
          <Button
            size="sm"
            className="bg-white text-black border cursor-pointer hover:bg-black hover:text-gold"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Done' : 'Edit'}
          </Button>
        )}

        <div className="w-[80px] h-[2px] bg-black mx-auto mb-12"></div>

        {/* Blog Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-[15px]">
          {(blogs ?? []).map((blog) => {
            const isCardEditing = editingCardId === blog.id;
            const isChangingImage = changingImageId === blog.id;
            const previewImage = cardImages[blog.id] ?? blog.image;

            return (
              <div key={blog.id} className="relative overflow-hidden shadow-lg group">
                {editable && (
                  <Button
                    size="sm"
                    className="absolute top-2 right-2 z-10 bg-white text-black border cursor-pointer hover:bg-black hover:text-gold"
                    onClick={() => {
                      if (isCardEditing) setChangingImageId(null);
                      setEditingCardId(isCardEditing ? null : blog.id);
                    }}
                  >
                    {isCardEditing ? 'Done' : 'Edit'}
                  </Button>
                )}

                <div className="aspect-[528.82/655]">
                  <Image
                    src={
                      previewImage instanceof File
                        ? URL.createObjectURL(previewImage)
                        : previewImage || '/placeholder.png'
                    }
                    width={528.82}
                    height={655}
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  {isCardEditing && (
                    <div className="absolute bottom-4 right-4 flex gap-2 z-20 pointer-events-auto">
                      {!isChangingImage ? (
                        <Button
                          size="sm"
                          className="bg-white text-black border hover:bg-black hover:text-gold cursor-pointer"
                          onClick={() => setChangingImageId(blog.id)}
                        >
                          Change Image
                        </Button>
                      ) : (
                        <div className="flex gap-2 items-center">
                          <Button
                            size="sm"
                            className="bg-green-600 text-white hover:bg-green-700 cursor-pointer"
                            onClick={() => fileInputRefs.current[blog.id]?.click()}
                          >
                            Upload
                          </Button>
                          <Button
                            size="sm"
                            className="bg-red-600 text-white hover:bg-red-700 cursor-pointer"
                            onClick={() => setChangingImageId(null)}
                          >
                            Cancel
                          </Button>
                          <input
                            type="file"
                            accept="image/*"
                            ref={(el) => {
                              fileInputRefs.current[blog.id] = el;
                            }}
                            className="hidden"
                            onChange={(e) => handleFileChange(e, blog.id)}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 card-bg flex flex-col justify-end p-[15px] xl:p-6 text-left">
                  {isCardEditing ? (
                    <input
                      type="text"
                      value={blog.category}
                      onChange={(e) => {
                        if (setBlogs) {
                          setBlogs(
                            blogs.map((b) =>
                              b.id === blog.id ? { ...b, category: e.target.value } : b
                            )
                          );
                        }
                      }}
                      className="text-[14px] text-white font-montserrat bg-black/50 border-b border-white p-1 mb-1 w-1/2"
                    />
                  ) : (
                    <p className="text-[14px] leading-1.5 text-white font-montserrat mb-[10px]">
                      {blog.category}
                    </p>
                  )}
                  {isCardEditing ? (
                    <input
                      type="text"
                      value={blog.title}
                      onChange={(e) => {
                        if (setBlogs) {
                          setBlogs(
                            blogs.map((b) =>
                              b.id === blog.id ? { ...b, title: e.target.value } : b
                            )
                          );
                        }
                      }}
                      className="text-[24px] text-white font-bold bg-black/50 border-b border-white p-1 mb-1 w-full"
                    />
                  ) : (
                    <h3 className="text-[24px] leading-[30px] md:text-[20px] md:leading-[20px] xl:text-[24px] xl:leading-[26px] text-white">
                      {blog.title}
                    </h3>
                  )}
                  {isCardEditing ? (
                    <textarea
                      value={blog.description}
                      onChange={(e) => {
                        if (setBlogs) {
                          setBlogs(
                            blogs.map((b) =>
                              b.id === blog.id ? { ...b, description: e.target.value } : b
                            )
                          );
                        }
                      }}
                      rows={3}
                      className="text-[14px] text-gray-300 mt-2 font-montserrat bg-black/50 border border-white p-2 w-full resize-none"
                    />
                  ) : (
                    <p className="text-[14px] text-gray-300 mt-2 line-clamp-2 font-montserrat">
                      {blog.description}
                    </p>
                  )}
                  <button
                    className="mt-3 flex gap-2 items-center text-[14px] xl:text-[16px] text-gold hover:text-white font-medium cursor-pointer font-montserrat"
                    onClick={() => window.open(blog.link || '#', '_blank')}
                  >
                    Read More{' '}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="25"
                      height="8"
                      viewBox="0 0 25 8"
                      fill="none"
                    >
                      {' '}
                      <path
                        d="M24.3474 4.35355C24.5427 4.15829 24.5427 3.84171 24.3474 3.64645L21.1655 0.464466C20.9702 0.269204 20.6536 0.269204 20.4584 0.464466C20.2631 0.659728 20.2631 0.976311 20.4584 1.17157L23.2868 4L20.4584 6.82843C20.2631 7.02369 20.2631 7.34027 20.4584 7.53553C20.6536 7.7308 20.9702 7.7308 21.1655 7.53553L24.3474 4.35355ZM0.515625 4V4.5H23.9939V4V3.5H0.515625V4Z"
                        fill="#AD8B3A"
                      />{' '}
                    </svg>
                  </button>
                  {isCardEditing && (
                    <input
                      type="text"
                      value={blog.link}
                      onChange={(e) => {
                        if (setBlogs) {
                          setBlogs(
                            blogs.map((b) =>
                              b.id === blog.id ? { ...b, link: e.target.value } : b
                            )
                          );
                        }
                      }}
                      placeholder="Read More link"
                      className="text-[14px] text-white font-montserrat bg-black/50 border-b border-white p-1 w-full mb-8"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Button */}
        <div className="mt-12">
          {/* <button className="px-6 py-3 bg-gold text-white rounded-md font-medium hover:bg-black transition cursor-pointer">
            View All Real Weddings & Articles
          </button> */}
          {editable && (
            <Button
              size="sm"
              className="absolute top-0 right-40 z-10 bg-white text-black border cursor-pointer hover:bg-black hover:text-gold"
              onClick={() => setIsMainButtonEditing((prev) => !prev)}
            >
              {isMainButtonEditing ? 'Done' : 'Edit'}
            </Button>
          )}

          {isMainButtonEditing ? (
            <div className="flex flex-col items-center gap-2">
              <input
                type="text"
                value={mainButtonLabel}
                onChange={(e) => setMainButtonLabel && setMainButtonLabel(e.target.value)}
                placeholder="Button Text"
                className="p-2 border border-gray-400 rounded w-1/2 text-center"
              />
              <input
                type="text"
                value={mainButtonLink}
                onChange={(e) => setMainButtonLink && setMainButtonLink(e.target.value)}
                placeholder="Button Link"
                className="p-2 border border-gray-400 rounded w-1/2 text-center"
              />
            </div>
          ) : (
            <Button
              className=" cursor-pointer flex items-center justify-center h-[50px] xl:h-[55px] mt-8 bg-gold hover:bg-black hover:text-white text-white text-[16px] xl:text-[20px] px-[25px] py-[10px] xl:px-8 xl:py-3 rounded-md transition-colors duration-200 mx-[auto]"
              onClick={() => mainButtonLink && window.open(mainButtonLink, '_blank')}
            >
              {mainButtonLabel}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
};

export default BlogPost;
