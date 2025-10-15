'use client';
import Link from 'next/link';
import React from 'react';

const VendorsPage = () => {
  return (
    <div className="pt-24 min-h-screen flex flex-col items-center justify-center bg-[#fef8f0] text-black px-4">
      <h1 className="text-6xl md:text-8xl font-extrabold mb-6 animate-pulse text-gold">
        Coming Soon
      </h1>
      <p className="text-lg md:text-2xl mb-8 text-center max-w-xl">
        Discover trusted Indian wedding vendors. From photographers and decorators to caterers and
        makeup artists, find the best partners for your celebration.
      </p>
      <div className="flex gap-4">
        <Link
          href="mailto:info@yourcompany.com"
          className="px-6 py-3 bg-gold text-white font-semibold rounded-lg shadow-lg hover:bg-yellow-600 transition"
        >
          Contact Us
        </Link>
        <Link
          href="/"
          className="px-6 py-3 border-2 border-gold text-gold font-semibold rounded-lg hover:bg-gold hover:text-white transition"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default VendorsPage;
