/**
 * WIPES the database (orders + products) and re-seeds the sample products.
 * All products, prices and stock levels are MOCK data for the prototype.
 *
 *   npx prisma db seed
 *
 * Do not run against a database whose orders you want to keep.
 * For a first deploy use `npm run db:bootstrap` (non-destructive) instead.
 */
import { PrismaClient } from "@prisma/client";
import { SAMPLE_PRODUCTS, toCreateData } from "./sample-products";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  await prisma.$transaction([
    prisma.clickLog.deleteMany(),
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.product.deleteMany(),
    prisma.product.createMany({ data: SAMPLE_PRODUCTS.map(toCreateData) }),
  ]);
  console.log(`Seeded ${SAMPLE_PRODUCTS.length} sample products (orders cleared).`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
