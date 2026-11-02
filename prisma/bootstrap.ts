/**
 * NON-destructive first-run setup: inserts the sample products only when the
 * Product table is empty. Safe to run on every deploy (Vercel runs it in
 * `npm run vercel-build`). Existing products and orders are never touched.
 *
 *   npm run db:bootstrap
 */
import { PrismaClient } from "@prisma/client";
import { SAMPLE_PRODUCTS, toCreateData } from "./sample-products";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const count = await prisma.product.count();
  if (count > 0) {
    console.log(`Bootstrap skipped: ${count} products already exist.`);
    return;
  }
  await prisma.product.createMany({ data: SAMPLE_PRODUCTS.map(toCreateData), skipDuplicates: true });
  console.log(`Bootstrap inserted ${SAMPLE_PRODUCTS.length} sample products.`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
