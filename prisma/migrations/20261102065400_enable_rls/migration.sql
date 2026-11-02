-- Supabase exposes tables in the `public` schema through its Data API (PostgREST).
-- Enabling Row Level Security with no policies blocks that API (anon/authenticated
-- roles see nothing). The app connects through Prisma as the table owner, which
-- bypasses RLS, so the shop keeps working.
ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderItem" ENABLE ROW LEVEL SECURITY;
