'use client';
import React from 'react';

const WeddingsPage = () => {
  return (
    <div className="pt-24 min-h-screen flex flex-col items-center justify-center bg-[#fffaf0] text-black px-4">
      <h1 className="text-6xl md:text-8xl font-extrabold mb-6 animate-pulse text-gold">
        Coming Soon
      </h1>
      <p className="text-lg md:text-2xl mb-8 text-center max-w-xl">
        Find inspiration for your dream wedding. From traditional ceremonies to modern celebrations,
        plan your perfect day with Indian Weddings.
      </p>
      <div className="flex gap-4">
        <a
          href="mailto:info@yourcompany.com"
          className="px-6 py-3 bg-gold text-white font-semibold rounded-lg shadow-lg hover:bg-yellow-600 transition"
        >
          Contact Us
        </a>
        <a
          href="/"
          className="px-6 py-3 border-2 border-gold text-gold font-semibold rounded-lg hover:bg-gold hover:text-white transition"
        >
          Go Home
        </a>
      </div>
    </div>
  );
};

export default WeddingsPage;
