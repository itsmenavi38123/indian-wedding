// app/data/types.ts
export type GalleryImage = {
  id: number;
  url: string;
  vendorId: number;
  category: string;
  location: string;
};

export type Vendor = {
  id: number;
  name: string;
  category: string;
  location: string;
  rating: string;
  reviews: number;
  price: string;
  image: string;
  description: string;
};

// app/data/galleryData.ts

export const GALLERY_IMAGES: GalleryImage[] = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  url: `https://picsum.photos/id/${i + 50}/400/600`, // ✅ using picsum for free dummy images
  vendorId: (i % 10) + 1,
  category: ['Venue', 'Decor', 'Photography', 'Catering', 'Floral'][i % 5],
  location: ['Mumbai', 'Delhi', 'Bangalore', 'Chandigarh', 'Goa'][i % 5],
}));

export const categories = [
  'Venue',
  'Decor',
  'Photography',
  'Catering',
  'Floral',
  'Planning',
  'Makeup',
  'Entertainment',
  'Transport',
  'Lighting',
];

export const names = [
  'Venues',
  'Decorators',
  'Photographers',
  'Caterers',
  'Florists',
  'Planners',
  'Makeup Artists',
  'DJ Services',
  'Transport',
  'Lighting',
];

export const locations = ['Mumbai', 'Delhi', 'Bangalore', 'Chandigarh', 'Goa'];
export const prices = ['₹₹₹₹', '₹₹₹', '₹₹', '₹₹₹₹', '₹₹₹'];

export const VENDORS: Vendor[] = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  name: `Premium ${names[i]} Co.`,
  category: categories[i],
  location: locations[i % locations.length],
  rating: (4 + Math.random()).toFixed(1), // e.g. "4.3"
  reviews: Math.floor(Math.random() * 500) + 50,
  price: prices[i % prices.length],
  image: `https://picsum.photos/id/${i + 100}/300/300`, // ✅ free dummy vendor images
  description:
    'Exceptional service with attention to detail. Creating memorable experiences for your special day.',
}));
