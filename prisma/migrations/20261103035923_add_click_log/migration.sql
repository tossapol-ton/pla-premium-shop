-- CreateTable
CREATE TABLE "ClickLog" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "href" TEXT,
    "page" TEXT NOT NULL,
    "disabled" BOOLEAN NOT NULL DEFAULT false,
    "clickedAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClickLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClickLog_createdAt_idx" ON "ClickLog"("createdAt");

-- Supabase's Data API must not read the click log (Prisma connects as the table owner, which bypasses RLS).
ALTER TABLE "ClickLog" ENABLE ROW LEVEL SECURITY;
