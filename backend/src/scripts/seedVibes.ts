import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const weddingVibes = [
  {
    name: 'Coastal Escape',
    tagline: 'Sun, Sand & Sea Celebrations',
    description:
      'Imagine exchanging vows with the ocean as your backdrop. Beach weddings offer a relaxed, romantic atmosphere with natural beauty at every turn.',
    image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800',
    order: 1,
  },
  {
    name: 'Tropical Paradise',
    tagline: 'Exotic Island Bliss',
    description:
      'Lush greenery, vibrant flowers, and tropical sunsets create a dreamy paradise setting for your special day.',
    image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800',
    order: 2,
  },
  {
    name: 'Urban Luxe',
    tagline: 'Modern Metropolitan Elegance',
    description:
      'Sleek cityscapes, contemporary venues, and sophisticated styling for the modern couple.',
    image: 'https://images.unsplash.com/photo-1519167758481-83f29da8c851?w=800',
    order: 3,
  },
  {
    name: 'Regal Royale',
    tagline: 'Palace Grandeur & Heritage',
    description:
      'Step into a fairytale with palatial venues, regal decor, and timeless elegance fit for royalty.',
    image: 'https://images.unsplash.com/photo-1587271407850-8d438ca559e2?w=800',
    order: 4,
  },
  {
    name: 'Desert Mirage',
    tagline: 'Golden Sands & Arabian Nights',
    description:
      'Experience the magic of the desert with stunning dunes, luxurious tents, and Arabian-inspired celebrations.',
    image: 'https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?w=800',
    order: 5,
  },
  {
    name: 'Vineyard Romance',
    tagline: 'Wine Country Charm',
    description:
      'Rolling vineyards, rustic elegance, and wine-country sophistication create an intimate romantic setting.',
    image: 'https://images.unsplash.com/photo-1510076857177-7470076d4098?w=800',
    order: 6,
  },
  {
    name: 'Mountain Retreat',
    tagline: 'Himalayan Serenity',
    description:
      'Majestic mountain views, crisp air, and natural grandeur for an unforgettable celebration.',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    order: 7,
  },
  {
    name: 'Bohemian Garden',
    tagline: 'Whimsical Outdoor Magic',
    description:
      'Free-spirited celebrations with garden blooms, natural elements, and artistic touches.',
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
    order: 8,
  },
  {
    name: 'Art Deco Glam',
    tagline: 'Vintage Hollywood Glamour',
    description:
      '1920s-inspired elegance with geometric patterns, gold accents, and timeless sophistication.',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800',
    order: 9,
  },
  {
    name: 'Sustainable Chic',
    tagline: 'Eco-Friendly Celebrations',
    description:
      'Environmentally conscious weddings that combine style with sustainability and mindful choices.',
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800',
    order: 10,
  },
  {
    name: 'Traditional Heritage',
    tagline: 'Classic Indian Rituals',
    description:
      'Rich cultural traditions, vibrant colors, and timeless ceremonies honoring Indian heritage.',
    image: 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?w=800',
    order: 11,
  },
  {
    name: 'Fusion Festivities',
    tagline: 'East Meets West',
    description:
      'Blend traditions and modern elements for a unique celebration that honors multiple cultures.',
    image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800',
    order: 12,
  },
];

async function seedVibes() {
  try {
    console.log('Starting to seed wedding vibes...');

    // Clear existing vibes
    await prisma.weddingVibe.deleteMany();
    console.log('Cleared existing wedding vibes');

    // Create vibes
    for (const vibe of weddingVibes) {
      await prisma.weddingVibe.create({
        data: vibe,
      });
      console.log(`Created vibe: ${vibe.name}`);
    }

    console.log(`Successfully seeded ${weddingVibes.length} wedding vibes`);
  } catch (error: any) {
    console.error(`Error seeding vibes: ${error.message}`);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedVibes()
  .then(() => {
    console.log('Vibe seeding completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error(`Vibe seeding failed: ${error.message}`);
    process.exit(1);
  });
