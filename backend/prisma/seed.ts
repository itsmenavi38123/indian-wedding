import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // await prisma.kanbanBoard.createMany({
  //   data: [{ name: 'Inquiry' }, { name: 'Proposal' }, { name: 'Booked' }, { name: 'Completed' }],
  // });
  // console.log('Seeded Kanban boards!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
