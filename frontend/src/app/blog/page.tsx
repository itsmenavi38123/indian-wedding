'use client';
// pages/blog.tsx
import React from 'react';
import Link from 'next/link';

const BlogPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <h1 className="text-6xl md:text-8xl font-extrabold mb-6 animate-pulse text-gold">
        Coming Soon
      </h1>
      <p className="text-lg md:text-2xl mb-8 text-center max-w-xl text-black">
        Our blog will soon feature expert advice, inspiration, and stories from Indian weddings
        across the country. Stay tuned to discover tips, trends, and vendor highlights for your
        perfect celebration.
      </p>
      <div className="flex gap-4">
        <a
          href="mailto:info@yourcompany.com"
          className="px-6 py-3 bg-gold text-white font-semibold rounded-lg shadow-md hover:bg-yellow-500 transition-colors"
        >
          Contact Us
        </a>
        <Link
          href="/"
          className="px-6 py-3 border-2 border-gold text-gold font-semibold rounded-lg hover:bg-gold hover:text-white transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default BlogPage;
