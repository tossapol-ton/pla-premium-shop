# คู่มือ Deploy: Supabase + Vercel (การบ้านข้อ 3)

ทุกขั้นตอนทำผ่านเบราว์เซอร์ **ไม่ต้องติดตั้ง Node.js ในเครื่อง** · ใช้เวลาประมาณ 20–30 นาที
ทั้ง Supabase (Free plan) และ Vercel (Hobby plan) ไม่มีค่าใช้จ่ายสำหรับงานขนาดนี้

> **ข้อควรระวัง:** เว็บที่ deploy แล้วเป็น URL สาธารณะ ข้อมูลสินค้าเป็น mock แต่ถ้ามีคนกรอกชื่อ/เบอร์/ที่อยู่จริงตอนสั่งซื้อ
> ข้อมูลนั้นจะถูกเก็บจริงในฐานข้อมูลที่สิงคโปร์ แจ้งผู้ทดสอบให้ใช้ข้อมูลสมมติเท่านั้น (ดูหัวข้อ "ความปลอดภัยและ PDPA")

## ภาพรวม

| ลำดับ | ขั้นตอน | ทำที่ | ผลลัพธ์ |
|---|---|---|---|
| 0 | นำโค้ดเข้า branch `main` | GitHub | Vercel ใช้ `main` เป็น Production |
| 1 | สร้างฐานข้อมูล | supabase.com | `DATABASE_URL`, `DIRECT_URL` |
| 2 | ตั้งรหัสผ่าน Admin | เครื่องมือสร้างรหัสผ่าน | `ADMIN_PASSWORD` |
| 3 | Import โปรเจกต์และใส่ค่า | vercel.com | เว็บออนไลน์ + URL |
| 4 | ตั้ง Region ให้ใกล้ฐานข้อมูล | vercel.com | เว็บตอบเร็วขึ้น |
| 5 | ตรวจรับ | เบราว์เซอร์ | ผ่าน checklist |
| 6 | แชร์ลิงก์ | — | ส่ง URL ให้ทีม |

---

## ขั้นที่ 0 — นำโค้ดเข้า `main`

Vercel deploy branch `main` เป็น Production ตอนนี้โค้ดอยู่ใน branch
`claude/practical-edison-6n7ap3` ส่วน `main` ยังมีแค่ README

1. เปิด Pull Request จาก `claude/practical-edison-6n7ap3` → `main` (ให้ Claude สร้างให้ได้)
2. ตรวจ แล้วกด **Merge**

> ถ้ายังไม่อยาก merge: ทำขั้น 3 ไปก่อน แล้วไปที่ Vercel → Settings → Git → **Production Branch**
> เปลี่ยนเป็น `claude/practical-edison-6n7ap3`

## ขั้นที่ 1 — สร้างฐานข้อมูลบน Supabase

1. ไปที่ https://supabase.com → **Start your project** → Sign in with GitHub
2. **New project**
   - Name: `pla-premium-shop`
   - Database Password: กด **Generate a password** แล้ว**จดเก็บไว้** (ใช้ในขั้นถัดไป)
   - Region: **Southeast Asia (Singapore)** — ใกล้ไทยที่สุด
3. รอสร้างเสร็จ (~2 นาที)
4. กดปุ่ม **Connect** (ด้านบนของหน้า project) → แท็บ **ORMs** → เลือก **Prisma**
5. จะเห็นค่า 2 บรรทัด คัดลอกไว้ แล้ว**แทน `[YOUR-PASSWORD]` ด้วยรหัสผ่านจากข้อ 2**

| ตัวแปร | หน้าตา | หมายเหตุ |
|---|---|---|
| `DATABASE_URL` | `postgresql://postgres.xxxx:รหัส@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true` | **ต่อท้ายด้วย** `&connection_limit=1` |
| `DIRECT_URL` | `postgresql://postgres.xxxx:รหัส@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres` | ใช้ตอนสร้างตาราง (migrate) |

> ไม่ต้องสร้างตารางเอง Vercel จะสร้างตารางและใส่สินค้าตัวอย่าง 8 รายการให้อัตโนมัติตอน deploy ครั้งแรก
> ถ้ารหัสผ่านมีอักขระพิเศษ (`@ # / ? %`) ให้สร้างรหัสใหม่ที่มีแต่ตัวอักษรและตัวเลข เพื่อไม่ให้ URL เพี้ยน

## ขั้นที่ 2 — ตั้งรหัสผ่าน Admin

สร้างรหัสผ่านสำหรับหน้า `/admin` อย่างน้อย 12 ตัวอักษร (เช่นจาก password manager ขององค์กร)
นี่คือค่า `ADMIN_PASSWORD` ใครรู้รหัสนี้จะแก้ไขสินค้าและดูข้อมูลผู้รับของทุกคำสั่งซื้อได้ แชร์เฉพาะผู้ที่จำเป็น

## ขั้นที่ 3 — Deploy บน Vercel

1. ไปที่ https://vercel.com → **Sign Up / Log in** → Continue with GitHub
2. **Add New… → Project** → เลือก repo `tossapol-ton/pla-premium-shop` → **Import**
   (ถ้าไม่เห็น repo: กด **Adjust GitHub App Permissions** แล้วอนุญาต repo นี้)
3. หน้า Configure Project:
   - Framework Preset: **Next.js** (ตรวจพบอัตโนมัติ)
   - Build Command: **ไม่ต้องแก้** — โปรเจกต์มีสคริปต์ `vercel-build` ซึ่ง Vercel จะใช้เอง
     (`prisma migrate deploy` → ใส่สินค้าตัวอย่างถ้ายังว่าง → `next build`)
   - เปิด **Environment Variables** แล้วเพิ่ม 3 ค่า:

| Key | Value |
|---|---|
| `DATABASE_URL` | จากขั้นที่ 1 (ต่อท้าย `&connection_limit=1` แล้ว) |
| `DIRECT_URL` | จากขั้นที่ 1 |
| `ADMIN_PASSWORD` | จากขั้นที่ 2 |

4. กด **Deploy** รอ 1–3 นาที → ได้ URL เช่น `https://pla-premium-shop.vercel.app`

## ขั้นที่ 4 — ตั้ง Region (แนะนำ)

Vercel → Project → **Settings → Functions → Function Region** → เลือก **Singapore (sin1)** → Save
แล้วไปที่ **Deployments** → เมนู `…` ของ deployment ล่าสุด → **Redeploy**
(ถ้าไม่ตั้ง เซิร์ฟเวอร์อาจอยู่สหรัฐฯ และคุยกับฐานข้อมูลที่สิงคโปร์ช้า)

## ขั้นที่ 5 — ตรวจรับ (Acceptance checklist)

| ID | ทดสอบ | ผลที่คาดหวัง |
|---|---|---|
| UAT-01 | เปิด URL หน้าแรก | เห็นสินค้า 8 รายการพร้อมภาพประกอบ และป้าย "ข้อมูลตัวอย่าง" |
| UAT-02 | กดหมวด "เสื้อผ้า" | เหลือ 1 รายการ (เสื้อโปโล) |
| UAT-03 | พาวเวอร์แบงก์ | ปุ่ม "ใส่ตะกร้า" กดไม่ได้ (สต็อก 0) |
| UAT-04 | ใส่ตะกร้า 2–3 รายการ → ตะกร้า | ตัวเลขบนไอคอนตะกร้าและยอดรวมถูกต้อง |
| UAT-05 | ชำระเงิน กดยืนยันโดยไม่กรอก | ขึ้นข้อความ "กรุณากรอก…" ทุกช่อง |
| UAT-06 | กรอกข้อมูล**สมมติ** → ยืนยัน | ขึ้น "สั่งซื้อสำเร็จ" เลขที่ `PLA-2026-00001` สถานะ "รอชำระเงิน" ตะกร้าว่าง |
| UAT-07 | เปิด `/admin` | ถูกพาไปหน้า "เข้าสู่ระบบ Admin" |
| UAT-08 | ใส่รหัสผิด | ขึ้น "รหัสผ่านไม่ถูกต้อง" |
| UAT-09 | ใส่ `ADMIN_PASSWORD` → แท็บคำสั่งซื้อ | เห็นคำสั่งซื้อจาก UAT-06 |
| UAT-10 | แท็บสินค้า แก้ราคา → บันทึก → กลับหน้าแรก | ราคาใหม่แสดงบนหน้าร้าน |
| UAT-11 | เปิด `URL/api/orders` ในหน้าต่าง Incognito | ได้ `{"error":"กรุณาเข้าสู่ระบบ Admin"}` |
| UAT-12 | กด "ออกจากระบบ" แล้วเปิด `/admin` | กลับไปหน้าเข้าสู่ระบบ |

## ขั้นที่ 6 — แชร์ลิงก์

- ส่ง **Production URL** (ดูได้ที่ Vercel → Project → Domains) ใครก็เปิดได้ ไม่ต้องมีบัญชี
- ลิงก์ **Preview** (มีชื่อ branch/hash ใน URL) ปกติต้องล็อกอิน Vercel ก่อนเปิด
  ถ้าจะแชร์ preview: Settings → **Deployment Protection** (หรือส่งเฉพาะ Production URL)
- ทุกครั้งที่ push เข้า `main` Vercel จะ deploy ใหม่อัตโนมัติ ข้อมูลในฐานข้อมูลยังอยู่ครบ

## ความปลอดภัยและ PDPA

| ประเด็น | สถานะ | ข้อแนะนำ |
|---|---|---|
| รหัสผ่าน/connection string | เก็บใน Vercel Environment Variables ไม่อยู่ใน GitHub | ห้ามใส่ใน chat, issue หรือ commit |
| สิทธิ์ Admin | รหัสผ่านเดียวใช้ร่วมกัน session 8 ชั่วโมง | ก่อนใช้จริงเปลี่ยนเป็นบัญชีรายบุคคล (เช่น Supabase Auth) |
| ข้อมูลส่วนบุคคลผู้รับ | เก็บแบบ plain text ใน Supabase สิงคโปร์ (ส่งข้อมูลออกนอกประเทศ) | ใช้ข้อมูลสมมติเท่านั้นระหว่างทดลอง; ก่อนใช้จริงให้ DPO ประเมินตาม PDPA |
| Supabase Data API | ปิดด้วย Row Level Security (migration `enable_rls`) | ไม่ต้องทำอะไรเพิ่ม |
| การชำระเงิน | จำลอง ไม่มีการตัดเงิน | — |
| Brute-force รหัส Admin | ยังไม่มี rate limit | ใช้รหัสยาว; เพิ่ม rate limit ก่อนใช้จริง |

## แก้ปัญหาที่พบบ่อย

| อาการ | สาเหตุที่เป็นไปได้ | วิธีแก้ |
|---|---|---|
| Build ล้ม: `Environment variable not found: DATABASE_URL` | ยังไม่ได้ใส่ env หรือใส่ผิด environment | ใส่ทั้ง 3 ค่า ติ๊ก Production + Preview แล้ว Redeploy |
| Build ล้ม: `P1001 Can't reach database server` | URL/รหัสผิด หรือ project Supabase ถูก pause | ตรวจค่าจากหน้า Connect อีกครั้ง; Free project ที่ไม่มีการใช้งาน 7 วันจะถูก pause → กด Restore |
| Build ล้ม: `P1000 Authentication failed` | รหัสผ่านใน URL ผิด หรือมีอักขระพิเศษ | Reset database password (Settings → Database) แล้วอัปเดต env |
| หน้าเว็บขึ้น error หลัง deploy | `DATABASE_URL` ไม่ใช่ pooler port 6543 | ใช้ค่าจากแท็บ ORMs → Prisma และต่อท้าย `&connection_limit=1` |
| Login Admin ขึ้น "ยังไม่ได้ตั้งค่ารหัสผ่าน Admin" | ไม่มี `ADMIN_PASSWORD` | เพิ่ม env แล้ว Redeploy |
| ต้องการล้างข้อมูลกลับเป็นค่าเริ่มต้น | — | Supabase → SQL Editor: `TRUNCATE "OrderItem", "Order", "Product";` แล้ว Redeploy (ระบบจะใส่สินค้าตัวอย่างให้ใหม่) |

## ข้อมูลอ้างอิงสำหรับทีม Dev

- Build บน Vercel: `npm run vercel-build` = `prisma migrate deploy && tsx prisma/bootstrap.ts && next build`
- `prisma/bootstrap.ts` ใส่สินค้าตัวอย่าง**เฉพาะเมื่อตาราง Product ว่าง** ไม่ลบข้อมูลเดิม
- `npx prisma db seed` **ลบข้อมูลทั้งหมด** — อย่ารันกับฐานข้อมูล production
- Runtime ใช้ `DATABASE_URL` (Supavisor transaction pooler); migrate ใช้ `DIRECT_URL` (session pooler)
