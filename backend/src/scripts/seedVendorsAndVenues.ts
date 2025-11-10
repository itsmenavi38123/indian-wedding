import { PrismaClient, MediaType } from '@prisma/client';

const prisma = new PrismaClient();

// Helper to create password hash (simple for seed data)
const createPasswordHash = (password: string): string => {
  // For seed data, using a simple hash. In production, this would use bcrypt
  return `hashed_${password}`;
};

const vendorsData = [
  // VENUE VENDORS
  {
    name: 'Royal Palace Weddings',
    email: 'contact@royalpalace.com',
    password: createPasswordHash('vendor123'),
    contactNo: '9876543210',
    countryCode: '+91',
    serviceTypes: 'venue',
    minimumAmount: 500000,
    maximumAmount: 5000000,
  },
  {
    name: 'Beachside Events India',
    email: 'info@beachsideevents.com',
    password: createPasswordHash('vendor123'),
    contactNo: '9876543211',
    countryCode: '+91',
    serviceTypes: 'venue',
    minimumAmount: 300000,
    maximumAmount: 2000000,
  },
  {
    name: 'Luxury Resort Destinations',
    email: 'weddings@luxuryresorts.com',
    password: createPasswordHash('vendor123'),
    contactNo: '9876543212',
    countryCode: '+971',
    serviceTypes: 'venue',
    minimumAmount: 800000,
    maximumAmount: 8000000,
  },
  {
    name: 'Heritage Hotels & Palaces',
    email: 'events@heritagehotels.com',
    password: createPasswordHash('vendor123'),
    contactNo: '9876543213',
    countryCode: '+91',
    serviceTypes: 'venue',
    minimumAmount: 600000,
    maximumAmount: 4000000,
  },
  // PHOTOGRAPHY VENDORS
  {
    name: 'Candid Moments Studio',
    email: 'book@candidmoments.com',
    password: createPasswordHash('vendor123'),
    contactNo: '9876543214',
    countryCode: '+91',
    serviceTypes: 'photography',
    minimumAmount: 50000,
    maximumAmount: 500000,
  },
  {
    name: 'Royal Frame Photography',
    email: 'info@royalframe.com',
    password: createPasswordHash('vendor123'),
    contactNo: '9876543215',
    countryCode: '+91',
    serviceTypes: 'photography',
    minimumAmount: 80000,
    maximumAmount: 800000,
  },
  // CATERING VENDORS
  {
    name: 'Grand Feast Caterers',
    email: 'contact@grandfeast.com',
    password: createPasswordHash('vendor123'),
    contactNo: '9876543216',
    countryCode: '+91',
    serviceTypes: 'catering',
    minimumAmount: 200000,
    maximumAmount: 2000000,
  },
  {
    name: 'Spice Route Catering',
    email: 'bookings@spiceroute.com',
    password: createPasswordHash('vendor123'),
    contactNo: '9876543217',
    countryCode: '+91',
    serviceTypes: 'catering',
    minimumAmount: 150000,
    maximumAmount: 1500000,
  },
  // DECORATION VENDORS
  {
    name: 'Floral Dreams Decor',
    email: 'hello@floraldreams.com',
    password: createPasswordHash('vendor123'),
    contactNo: '9876543218',
    countryCode: '+91',
    serviceTypes: 'decoration',
    minimumAmount: 100000,
    maximumAmount: 1000000,
  },
  {
    name: 'Elegant Affairs Decorators',
    email: 'contact@elegantaffairs.com',
    password: createPasswordHash('vendor123'),
    contactNo: '9876543219',
    countryCode: '+91',
    serviceTypes: 'decoration',
    minimumAmount: 120000,
    maximumAmount: 1200000,
  },
  // ENTERTAINMENT VENDORS
  {
    name: 'Bollywood Beats Entertainment',
    email: 'book@bollywoodbeats.com',
    password: createPasswordHash('vendor123'),
    contactNo: '9876543220',
    countryCode: '+91',
    serviceTypes: 'entertainment',
    minimumAmount: 80000,
    maximumAmount: 800000,
  },
  // MAKEUP VENDORS
  {
    name: 'Bridal Beauty Studio',
    email: 'appointments@bridalbeauty.com',
    password: createPasswordHash('vendor123'),
    contactNo: '9876543221',
    countryCode: '+91',
    serviceTypes: 'makeup',
    minimumAmount: 30000,
    maximumAmount: 300000,
  },
];

const venueServices = [
  // UDAIPUR VENUES (Regal Royale)
  {
    title: 'Taj Lake Palace Udaipur',
    description:
      'A stunning white marble palace floating on Lake Pichola. This iconic venue offers unparalleled luxury and royal grandeur for your dream wedding.',
    category: 'venue',
    price: 2500000,
    country: 'India',
    state: 'Rajasthan',
    city: 'Udaipur',
    capacity: '150-300 guests',
    vendorEmail: 'contact@royalpalace.com',
    images: [
      'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=800',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
      'https://images.unsplash.com/photo-1519167758481-83f29da8c851?w=800',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=400',
  },
  {
    title: 'The Oberoi Udaivilas',
    description:
      'Sprawling palace with beautiful courtyards, fountains and traditional Rajasthani architecture. Perfect for grand royal weddings.',
    category: 'venue',
    price: 3000000,
    country: 'India',
    state: 'Rajasthan',
    city: 'Udaipur',
    capacity: '200-500 guests',
    vendorEmail: 'contact@royalpalace.com',
    images: [
      'https://images.unsplash.com/photo-1587271407850-8d438ca559e2?w=800',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1587271407850-8d438ca559e2?w=400',
  },
  {
    title: 'City Palace Heritage Venue',
    description:
      'Historic palace venue with stunning architecture and Lake Pichola views. Royal ceremonies and grand celebrations.',
    category: 'venue',
    price: 1800000,
    country: 'India',
    state: 'Rajasthan',
    city: 'Udaipur',
    capacity: '100-250 guests',
    vendorEmail: 'events@heritagehotels.com',
    images: [
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400',
  },

  // JAIPUR VENUES (Regal Royale / Desert)
  {
    title: 'Rambagh Palace Jaipur',
    description:
      'The jewel of Jaipur - a former royal residence turned luxury hotel. Exquisite gardens, grand halls, and regal elegance.',
    category: 'venue',
    price: 2800000,
    country: 'India',
    state: 'Rajasthan',
    city: 'Jaipur',
    capacity: '200-400 guests',
    vendorEmail: 'events@heritagehotels.com',
    images: [
      'https://images.unsplash.com/photo-1582719201952-947959d85cbc?w=800',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1582719201952-947959d85cbc?w=400',
  },
  {
    title: 'Fairmont Jaipur',
    description:
      'Palatial hotel inspired by Mughal architecture. Sprawling lawns, royal courtyards, and luxurious banquet halls.',
    category: 'venue',
    price: 2200000,
    country: 'India',
    state: 'Rajasthan',
    city: 'Jaipur',
    capacity: '300-600 guests',
    vendorEmail: 'contact@royalpalace.com',
    images: [
      'https://images.unsplash.com/photo-1519167758481-83f29da8c851?w=800',
      'https://images.unsplash.com/photo-1549294413-26f195200c16?w=800',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1519167758481-83f29da8c851?w=400',
  },

  // GOA VENUES (Coastal Escape)
  {
    title: 'The Leela Goa Beachfront',
    description:
      'Pristine beach location with luxurious amenities. Sunset ceremonies on the beach and elegant indoor ballrooms.',
    category: 'venue',
    price: 1500000,
    country: 'India',
    state: 'Goa',
    city: 'Goa',
    capacity: '150-350 guests',
    vendorEmail: 'info@beachsideevents.com',
    images: [
      'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400',
  },
  {
    title: 'Park Hyatt Goa Resort',
    description:
      'Boutique luxury on Arossim Beach. Intimate settings with ocean views, perfect for coastal weddings.',
    category: 'venue',
    price: 1200000,
    country: 'India',
    state: 'Goa',
    city: 'Goa',
    capacity: '100-200 guests',
    vendorEmail: 'info@beachsideevents.com',
    images: [
      'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800',
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=400',
  },
  {
    title: 'Taj Exotica Goa Beach Resort',
    description:
      'Mediterranean-style resort with private beach access. Lush gardens and contemporary elegance by the sea.',
    category: 'venue',
    price: 1600000,
    country: 'India',
    state: 'Goa',
    city: 'Goa',
    capacity: '200-400 guests',
    vendorEmail: 'info@beachsideevents.com',
    images: [
      'https://images.unsplash.com/photo-1540202404-a2f29016b523?w=800',
      'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1540202404-a2f29016b523?w=400',
  },

  // KERALA VENUES (Tropical Paradise)
  {
    title: 'Kumarakom Lake Resort',
    description:
      'Backwater paradise with traditional Kerala architecture. Floating ceremonies on houseboats and lush tropical settings.',
    category: 'venue',
    price: 1000000,
    country: 'India',
    state: 'Kerala',
    city: 'Kumarakom',
    capacity: '100-200 guests',
    vendorEmail: 'info@beachsideevents.com',
    images: [
      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800',
      'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=800',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400',
  },
  {
    title: 'Marari Beach Resort',
    description:
      'Secluded beach resort with coconut groves. Authentic Kerala charm meets luxury hospitality.',
    category: 'venue',
    price: 800000,
    country: 'India',
    state: 'Kerala',
    city: 'Marari',
    capacity: '80-150 guests',
    vendorEmail: 'info@beachsideevents.com',
    images: [
      'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=800',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=400',
  },

  // DUBAI VENUES (Desert Mirage / Urban Luxe)
  {
    title: 'Atlantis The Palm Dubai',
    description:
      'Iconic beachfront resort with Arabian luxury. Underwater venues, beach settings, and grand ballrooms.',
    category: 'venue',
    price: 5000000,
    country: 'UAE',
    state: 'Dubai',
    city: 'Dubai',
    capacity: '300-800 guests',
    vendorEmail: 'weddings@luxuryresorts.com',
    images: [
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400',
  },
  {
    title: 'Burj Al Arab Terrace',
    description:
      "The ultimate luxury venue - the world's most luxurious hotel. Unmatched opulence and service.",
    category: 'venue',
    price: 8000000,
    country: 'UAE',
    state: 'Dubai',
    city: 'Dubai',
    capacity: '150-300 guests',
    vendorEmail: 'weddings@luxuryresorts.com',
    images: [
      'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=400',
  },
  {
    title: 'Desert Safari Wedding Experience',
    description:
      'Authentic Arabian desert experience with luxury Bedouin tents, camel rides, and starlit ceremonies.',
    category: 'venue',
    price: 2000000,
    country: 'UAE',
    state: 'Dubai',
    city: 'Dubai',
    capacity: '100-250 guests',
    vendorEmail: 'weddings@luxuryresorts.com',
    images: [
      'https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?w=800',
      'https://images.unsplash.com/photo-1509681299613-3c24cc8022af?w=800',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?w=400',
  },

  // BALI VENUES (Tropical Paradise / Bohemian)
  {
    title: 'Ayana Resort Bali Clifftop',
    description:
      'Dramatic cliff-top location with ocean views. Tropical luxury meets Balinese culture.',
    category: 'venue',
    price: 3500000,
    country: 'Indonesia',
    state: 'Bali',
    city: 'Bali',
    capacity: '100-200 guests',
    vendorEmail: 'weddings@luxuryresorts.com',
    images: [
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400',
  },
  {
    title: 'Four Seasons Bali at Sayan',
    description: 'Jungle paradise with rice terrace views. Intimate luxury in the heart of Ubud.',
    category: 'venue',
    price: 2800000,
    country: 'Indonesia',
    state: 'Bali',
    city: 'Bali',
    capacity: '80-150 guests',
    vendorEmail: 'weddings@luxuryresorts.com',
    images: [
      'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=800',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=400',
  },

  // PHUKET VENUES (Tropical Paradise / Coastal)
  {
    title: 'The Pavilions Phuket Beachfront',
    description:
      'Intimate beachfront resort with Thai hospitality. Private villas and sunset ceremonies.',
    category: 'venue',
    price: 1800000,
    country: 'Thailand',
    state: 'Phuket',
    city: 'Phuket',
    capacity: '60-120 guests',
    vendorEmail: 'weddings@luxuryresorts.com',
    images: [
      'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=800',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=400',
  },

  // MALDIVES VENUES (Coastal Escape / Tropical Paradise)
  {
    title: 'Soneva Fushi Maldives',
    description: 'Barefoot luxury on a private island. Overwater ceremonies and pristine beaches.',
    category: 'venue',
    price: 6000000,
    country: 'Maldives',
    state: 'Maldives',
    city: 'Maldives',
    capacity: '50-100 guests',
    vendorEmail: 'weddings@luxuryresorts.com',
    images: [
      'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800',
      'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=400',
  },
  {
    title: 'One&Only Reethi Rah',
    description:
      'Ultra-luxury island resort with crystal waters. Exclusive and intimate celebrations.',
    category: 'venue',
    price: 7000000,
    country: 'Maldives',
    state: 'Maldives',
    city: 'Maldives',
    capacity: '40-80 guests',
    vendorEmail: 'weddings@luxuryresorts.com',
    images: [
      'https://images.unsplash.com/photo-1540202404-a2f29016b523?w=800',
      'https://images.unsplash.com/photo-1571401132706-4c098437b0b4?w=800',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1540202404-a2f29016b523?w=400',
  },

  // TUSCANY VENUES (Vineyard Romance / Bohemian)
  {
    title: 'Castello di Vincigliata',
    description:
      'Medieval castle in the Tuscan hills. Rolling vineyards, historic charm, and Italian romance.',
    category: 'venue',
    price: 4000000,
    country: 'Italy',
    state: 'Tuscany',
    city: 'Tuscany',
    capacity: '100-200 guests',
    vendorEmail: 'events@heritagehotels.com',
    images: [
      'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800',
      'https://images.unsplash.com/photo-1510076857177-7470076d4098?w=800',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=400',
  },
  {
    title: 'Villa Cora Florence',
    description:
      'Neoclassical villa with panoramic Florence views. Elegant gardens and Italian sophistication.',
    category: 'venue',
    price: 3500000,
    country: 'Italy',
    state: 'Tuscany',
    city: 'Tuscany',
    capacity: '80-150 guests',
    vendorEmail: 'events@heritagehotels.com',
    images: [
      'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800',
      'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=400',
  },

  // DELHI / MUMBAI VENUES (Urban Luxe / Traditional)
  {
    title: 'The Imperial New Delhi',
    description:
      'Colonial-era grandeur in the heart of Delhi. Historic elegance and modern luxury.',
    category: 'venue',
    price: 2000000,
    country: 'India',
    state: 'Delhi',
    city: 'Delhi',
    capacity: '200-500 guests',
    vendorEmail: 'contact@royalpalace.com',
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
      'https://images.unsplash.com/photo-1519167758481-83f29da8c851?w=800',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
  },
  {
    title: 'Taj Mahal Palace Mumbai',
    description:
      'Iconic heritage hotel overlooking the Gateway of India. Timeless elegance and impeccable service.',
    category: 'venue',
    price: 3500000,
    country: 'India',
    state: 'Maharashtra',
    city: 'Mumbai',
    capacity: '250-600 guests',
    vendorEmail: 'contact@royalpalace.com',
    images: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400',
  },
];

const otherServices = [
  // PHOTOGRAPHY SERVICES
  {
    title: 'Candid Wedding Photography Package',
    description:
      'Complete candid coverage with 2 photographers, pre-wedding shoot, and 500+ edited photos. Cinematic storytelling of your special day.',
    category: 'photography',
    price: 150000,
    country: 'India',
    state: 'Pan India',
    city: 'Available nationwide',
    vendorEmail: 'book@candidmoments.com',
    images: [
      'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800',
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=400',
  },
  {
    title: 'Traditional + Candid Photography',
    description:
      'Blend of traditional family portraits and candid moments. 3 photographers, videography included.',
    category: 'photography',
    price: 250000,
    country: 'India',
    state: 'Pan India',
    city: 'Available nationwide',
    vendorEmail: 'info@royalframe.com',
    images: [
      'https://images.unsplash.com/photo-1591604466107-ec97de705b63?w=800',
      'https://images.unsplash.com/photo-1522413452208-996ff3f3e740?w=800',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1591604466107-ec97de705b63?w=400',
  },
  {
    title: 'Premium Cinematic Wedding Film',
    description:
      'Hollywood-style wedding film with drone shots, slow-motion sequences, and professional color grading.',
    category: 'photography',
    price: 400000,
    country: 'India',
    state: 'Pan India',
    city: 'Available nationwide',
    vendorEmail: 'info@royalframe.com',
    images: [
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800',
      'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400',
  },

  // CATERING SERVICES
  {
    title: 'Multi-Cuisine Wedding Feast',
    description:
      'Pan-Indian and continental cuisines. Live counters, buffet setup for 500 guests. Premium ingredients and presentation.',
    category: 'catering',
    price: 800000,
    country: 'India',
    state: 'Pan India',
    city: 'Available nationwide',
    vendorEmail: 'contact@grandfeast.com',
    images: [
      'https://images.unsplash.com/photo-1555244162-803834f70033?w=800',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=400',
  },
  {
    title: 'Royal Rajasthani Catering',
    description:
      'Authentic Rajasthani cuisine with traditional Dal Baati Churma, Laal Maas, and royal desserts. Live cooking stations.',
    category: 'catering',
    price: 600000,
    country: 'India',
    state: 'Rajasthan',
    city: 'Jaipur, Udaipur',
    vendorEmail: 'bookings@spiceroute.com',
    images: [
      'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800',
      'https://images.unsplash.com/photo-1596040033229-a0b3b4a8bba6?w=800',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400',
  },

  // DECORATION SERVICES
  {
    title: 'Floral Paradise Decor Package',
    description:
      'Luxury floral arrangements with imported flowers. Complete venue transformation including stage, mandap, and entrance.',
    category: 'decoration',
    price: 500000,
    country: 'India',
    state: 'Pan India',
    city: 'Available nationwide',
    vendorEmail: 'hello@floraldreams.com',
    images: [
      'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800',
      'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400',
  },
  {
    title: 'Royal Traditional Mandap Setup',
    description:
      'Traditional mandap with marigold flowers, draped fabrics, and antique elements. Includes seating arrangement.',
    category: 'decoration',
    price: 350000,
    country: 'India',
    state: 'Pan India',
    city: 'Available nationwide',
    vendorEmail: 'contact@elegantaffairs.com',
    images: [
      'https://images.unsplash.com/photo-1587271407850-8d438ca559e2?w=800',
      'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?w=800',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1587271407850-8d438ca559e2?w=400',
  },
  {
    title: 'Modern Minimalist Decor',
    description:
      'Contemporary elegant design with clean lines, fairy lights, and sophisticated color palettes.',
    category: 'decoration',
    price: 400000,
    country: 'India',
    state: 'Pan India',
    city: 'Available nationwide',
    vendorEmail: 'contact@elegantaffairs.com',
    images: [
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800',
      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400',
  },

  // ENTERTAINMENT SERVICES
  {
    title: 'Bollywood Dance Troupe Performance',
    description:
      'Professional dancers performing Bollywood hits. 30-minute choreographed performance with costumes and props.',
    category: 'entertainment',
    price: 200000,
    country: 'India',
    state: 'Pan India',
    city: 'Available nationwide',
    vendorEmail: 'book@bollywoodbeats.com',
    images: [
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800',
      'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400',
  },
  {
    title: 'Live Band & DJ Combo',
    description:
      'Live band for ceremonies and professional DJ for sangeet and reception. Complete sound and lighting setup.',
    category: 'entertainment',
    price: 350000,
    country: 'India',
    state: 'Pan India',
    city: 'Available nationwide',
    vendorEmail: 'book@bollywoodbeats.com',
    images: [
      'https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7?w=800',
      'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7?w=400',
  },

  // MAKEUP SERVICES
  {
    title: 'Bridal Makeup & Hair Styling',
    description:
      'Complete bridal makeover with airbrush makeup, hair styling, and draping. Includes trial session.',
    category: 'makeup',
    price: 80000,
    country: 'India',
    state: 'Pan India',
    city: 'Available nationwide',
    vendorEmail: 'appointments@bridalbeauty.com',
    images: [
      'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400',
  },
  {
    title: 'Bridal Party Makeup Package',
    description:
      'Makeup for bride + 5 family members. Professional makeup artists with premium products.',
    category: 'makeup',
    price: 150000,
    country: 'India',
    state: 'Pan India',
    city: 'Available nationwide',
    vendorEmail: 'appointments@bridalbeauty.com',
    images: [
      'https://images.unsplash.com/photo-1560869713-7d0a29430803?w=800',
      'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?w=400',
  },
];

async function seedVendorsAndVenues() {
  try {
    console.log('Starting to seed vendors and venues...');

    // Clear existing data
    await prisma.vendorServiceMedia.deleteMany();
    await prisma.vendorService.deleteMany();
    await prisma.vendor.deleteMany({ where: { email: { contains: '@' } } });
    console.log('Cleared existing vendor data');

    // Create vendors
    const vendorMap: Record<string, any> = {};
    for (const vendorData of vendorsData) {
      const vendor = await prisma.vendor.create({
        data: vendorData,
      });
      vendorMap[vendorData.email] = vendor;
      console.log(`Created vendor: ${vendor.name}`);
    }

    // Create venue services
    for (const venueData of venueServices) {
      const vendor = vendorMap[venueData.vendorEmail];
      if (!vendor) {
        console.warn(`Vendor not found for email: ${venueData.vendorEmail}`);
        continue;
      }

      const { images, thumbnail, vendorEmail, ...serviceData } = venueData;

      const service = await prisma.vendorService.create({
        data: {
          ...serviceData,
          vendorId: vendor.id,
        },
      });

      // Create thumbnail
      if (thumbnail) {
        await prisma.vendorServiceMedia.create({
          data: {
            vendorServiceId: service.id,
            type: MediaType.THUMBNAIL,
            url: thumbnail,
          },
        });
      }

      // Create images
      for (const imageUrl of images) {
        await prisma.vendorServiceMedia.create({
          data: {
            vendorServiceId: service.id,
            type: MediaType.IMAGE,
            url: imageUrl,
          },
        });
      }

      console.log(`Created venue service: ${service.title}`);
    }

    // Create other vendor services
    for (const serviceData of otherServices) {
      const vendor = vendorMap[serviceData.vendorEmail];
      if (!vendor) {
        console.warn(`Vendor not found for email: ${serviceData.vendorEmail}`);
        continue;
      }

      const { images, thumbnail, vendorEmail, ...data } = serviceData;

      const service = await prisma.vendorService.create({
        data: {
          ...data,
          vendorId: vendor.id,
        },
      });

      // Create thumbnail
      if (thumbnail) {
        await prisma.vendorServiceMedia.create({
          data: {
            vendorServiceId: service.id,
            type: MediaType.THUMBNAIL,
            url: thumbnail,
          },
        });
      }

      // Create images
      for (const imageUrl of images) {
        await prisma.vendorServiceMedia.create({
          data: {
            vendorServiceId: service.id,
            type: MediaType.IMAGE,
            url: imageUrl,
          },
        });
      }

      console.log(`Created service: ${service.title} (${service.category})`);
    }

    const totalVenues = await prisma.vendorService.count({ where: { category: 'venue' } });
    const totalServices = await prisma.vendorService.count({
      where: { category: { not: 'venue' } },
    });

    console.log(`Successfully seeded ${vendorsData.length} vendors`);
    console.log(`Successfully seeded ${totalVenues} venues`);
    console.log(`Successfully seeded ${totalServices} other services`);
  } catch (error: any) {
    console.error(`Error seeding vendors and venues: ${error.message}`);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedVendorsAndVenues()
  .then(() => {
    console.log('Vendor and venue seeding completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error(`Vendor and venue seeding failed: ${error.message}`);
    process.exit(1);
  });
