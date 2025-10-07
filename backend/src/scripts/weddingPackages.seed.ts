import { PrismaClient, PackageCategory } from '@prisma/client';

const prisma = new PrismaClient();

const weddingPackages = [
  {
    name: 'Basic Wedding Package',
    description: 'Essential services for a beautiful wedding',
    totalPrice: 150000,
    category: PackageCategory.BASIC,
    services: [
      {
        name: 'Wedding Photography',
        description: '6 hours coverage with basic editing',
        price: 35000,
        order: 0,
      },
      {
        name: 'Bridal Makeup',
        description: 'Professional bridal makeup for the big day',
        price: 25000,
        order: 1,
      },
      {
        name: 'Floral Decoration',
        description: 'Basic floral arrangements for ceremony',
        price: 20000,
        order: 2,
      },
      {
        name: 'Wedding Invitation Cards',
        description: '100 printed invitation cards',
        price: 15000,
        order: 3,
      },
      {
        name: 'Wedding Catering',
        description: 'Lunch/dinner for 100 guests',
        price: 55000,
        order: 4,
      },
    ],
  },
  {
    name: 'Standard Wedding Package',
    description: 'Complete wedding experience with enhanced services',
    totalPrice: 275000,
    category: PackageCategory.STANDARD,
    services: [
      {
        name: 'Wedding Photography & Videography',
        description: '8 hours coverage with cinematic editing',
        price: 65000,
        order: 0,
      },
      {
        name: 'Bridal Makeup & Hair',
        description: 'Professional makeup and hair styling',
        price: 35000,
        order: 1,
      },
      {
        name: 'Premium Floral Decoration',
        description: 'Enhanced floral arrangements with centerpieces',
        price: 40000,
        order: 2,
      },
      {
        name: 'Designer Wedding Cards',
        description: '150 premium invitation cards with RSVP',
        price: 25000,
        order: 3,
      },
      {
        name: 'Premium Wedding Catering',
        description: 'Multi-cuisine buffet for 150 guests',
        price: 85000,
        order: 4,
      },
      {
        name: 'DJ & Sound System',
        description: 'Professional DJ with quality sound system',
        price: 25000,
        order: 5,
      },
    ],
  },
  {
    name: 'Premium Wedding Package',
    description: 'Luxury wedding with comprehensive services',
    totalPrice: 450000,
    category: PackageCategory.PREMIUM,
    services: [
      {
        name: 'Cinematic Wedding Film',
        description: '12 hours coverage with drone shots',
        price: 95000,
        order: 0,
      },
      {
        name: 'Luxury Bridal Services',
        description: 'Complete bridal package with trial',
        price: 55000,
        order: 1,
      },
      {
        name: 'Luxury Floral & Decor',
        description: 'Complete venue decoration with lighting',
        price: 75000,
        order: 2,
      },
      {
        name: 'Premium Invitation Suite',
        description: '200 luxury cards with gift packaging',
        price: 45000,
        order: 3,
      },
      {
        name: 'Gourmet Wedding Catering',
        description: 'Multi-cuisine feast for 200 guests',
        price: 120000,
        order: 4,
      },
      {
        name: 'Live Entertainment',
        description: 'Live band and professional DJ',
        price: 45000,
        order: 5,
      },
      {
        name: 'Wedding Coordination',
        description: 'Full-day wedding planning and coordination',
        price: 15000,
        order: 6,
      },
    ],
  },
  {
    name: 'Luxury Destination Wedding',
    description: 'Ultimate luxury wedding experience',
    totalPrice: 750000,
    category: PackageCategory.LUXURY,
    services: [
      {
        name: 'Destination Wedding Planning',
        description: 'Complete destination wedding coordination',
        price: 85000,
        order: 0,
      },
      {
        name: 'Celebrity Makeup Artist',
        description: 'Top-tier makeup and styling team',
        price: 95000,
        order: 1,
      },
      {
        name: 'Royal Decoration Package',
        description: 'Luxury venue transformation with themes',
        price: 150000,
        order: 2,
      },
      {
        name: 'Luxury Invitation Experience',
        description: '300 designer cards with delivery service',
        price: 75000,
        order: 3,
      },
      {
        name: 'Royal Feast Catering',
        description: 'Premium multi-cuisine for 300 guests',
        price: 200000,
        order: 4,
      },
      {
        name: 'Celebrity Entertainment',
        description: 'Live performances and celebrity appearances',
        price: 95000,
        order: 5,
      },
      {
        name: 'Helicopter Entry',
        description: 'Grand helicopter entry for the couple',
        price: 50000,
        order: 6,
      },
    ],
  },
];

export async function seedWeddingPackages() {
  try {
    console.log('🌱 Seeding wedding packages...');

    // Clear existing packages (optional)
    await prisma.weddingPackageService.deleteMany();
    await prisma.weddingPackage.deleteMany();

    // Create packages with services
    for (const packageData of weddingPackages) {
      const { services, ...packageInfo } = packageData;

      await prisma.weddingPackage.create({
        data: {
          ...packageInfo,
          isSystem: true,
          isActive: true,
          services: {
            create: services,
          },
        },
      });
    }

    console.log('✅ Wedding packages seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding wedding packages:', error);
    throw error;
  }
}

// Run directly if called
if (require.main === module) {
  seedWeddingPackages()
    .then(() => {
      console.log('✅ Seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
