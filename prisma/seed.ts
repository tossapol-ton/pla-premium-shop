/**
 * Wipes the database and re-seeds sample products.
 * All products, prices and stock levels are MOCK data for the prototype.
 *
 *   npx prisma db seed
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type SeedProduct = {
  id: string;
  name: string;
  price: number;
  category: string;
  options: string[];
  stock: number;
  tag: string | null;
  description: string;
};

const products: SeedProduct[] = [
  {
    id: "umbrella",
    name: "ร่มพับอัตโนมัติ PLA",
    price: 390,
    category: "ไลฟ์สไตล์",
    options: ["กรมท่า", "ส้ม"],
    stock: 120,
    tag: "ขายดี",
    description: "ร่มพับ 3 ตอน กางและหุบด้วยปุ่มเดียว ผ้ากัน UV พิมพ์โลโก้ PhillipLife",
  },
  {
    id: "tumbler",
    name: "แก้วเก็บความเย็น 20 oz",
    price: 450,
    category: "ไลฟ์สไตล์",
    options: ["กรมท่า", "ขาว"],
    stock: 80,
    tag: null,
    description: "สแตนเลสสองชั้น เก็บความเย็นได้นาน พร้อมฝาปิดกันหก",
  },
  {
    id: "tote",
    name: "กระเป๋าผ้า Tote",
    price: 250,
    category: "กระเป๋า",
    options: ["ครีม", "กรมท่า"],
    stock: 200,
    tag: null,
    description: "ผ้าแคนวาสหนา ช่องใส่ของด้านใน ใช้แทนถุงพลาสติก",
  },
  {
    id: "notebook",
    name: "ชุดสมุดโน้ตและปากกา",
    price: 290,
    category: "เครื่องเขียน",
    options: ["กรมท่า"],
    stock: 150,
    tag: null,
    description: "สมุดปกแข็ง A5 พร้อมปากกาโลหะ บรรจุกล่องของขวัญ",
  },
  {
    id: "polo",
    name: "เสื้อโปโล PLA",
    price: 590,
    category: "เสื้อผ้า",
    options: ["S", "M", "L", "XL"],
    stock: 60,
    tag: "ใหม่",
    description: "ผ้าระบายอากาศดี ปักโลโก้ที่อก สีกรมท่า",
  },
  {
    id: "pillow",
    name: "หมอนรองคอเมมโมรี่โฟม",
    price: 490,
    category: "การเดินทาง",
    options: ["กรมท่า", "เทา"],
    stock: 40,
    tag: null,
    description: "รองรับสรีระ ถอดปลอกซักได้ พร้อมถุงเก็บ",
  },
  {
    id: "powerbank",
    name: "พาวเวอร์แบงก์ 10,000 mAh",
    price: 790,
    category: "อุปกรณ์",
    options: ["ขาว"],
    stock: 0,
    tag: null,
    description: "ชาร์จเร็ว รองรับ USB-C บางเบาพกพาง่าย",
  },
  {
    id: "giftset",
    name: "ชุดของขวัญพรีเมียม",
    price: 1290,
    category: "ชุดของขวัญ",
    options: ["มาตรฐาน"],
    stock: 25,
    tag: "ใหม่",
    description: "รวมแก้วเก็บความเย็น สมุดโน้ต และปากกา ในกล่องของขวัญ",
  },
];

async function main(): Promise<void> {
  // Wipe in dependency order: items -> orders -> products.
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();

  for (const [index, p] of products.entries()) {
    await prisma.product.create({
      data: {
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        category: p.category,
        options: JSON.stringify(p.options),
        stock: p.stock,
        tag: p.tag,
        // Illustrations from the Claude Design prototype, stored in public/products/.
        imageUrl: `/products/${p.id}.svg`,
        sortOrder: index,
      },
    });
  }

  console.log(`Seeded ${products.length} sample products (orders cleared).`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
