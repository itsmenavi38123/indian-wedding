// app/(gallerycomponents)/GalleryLayout.tsx
import React from 'react';

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return <div className="w-full max-w-7xl mx-auto px-4 mt-10 mb-20">{children}</div>;
}
