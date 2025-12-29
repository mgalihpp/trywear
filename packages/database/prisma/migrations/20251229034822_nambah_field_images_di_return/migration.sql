-- AlterTable
ALTER TABLE "Coupons" ADD COLUMN     "usage_limit_per_user" INTEGER;

-- AlterTable
ALTER TABLE "Returns" ADD COLUMN     "images" JSONB;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "lifetime_spent" BIGINT NOT NULL DEFAULT 0,
ADD COLUMN     "segment_id" INTEGER;

-- CreateTable
CREATE TABLE "CustomerSegment" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "description" TEXT,
    "min_spend_cents" BIGINT NOT NULL DEFAULT 0,
    "max_spend_cents" BIGINT,
    "discount_percent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "color" VARCHAR(20),
    "icon" VARCHAR(50),
    "priority" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerSegment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SegmentCoupons" (
    "id" SERIAL NOT NULL,
    "segment_id" INTEGER NOT NULL,
    "coupon_id" UUID NOT NULL,

    CONSTRAINT "SegmentCoupons_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomerSegment_slug_key" ON "CustomerSegment"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "SegmentCoupons_segment_id_coupon_id_key" ON "SegmentCoupons"("segment_id", "coupon_id");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_segment_id_fkey" FOREIGN KEY ("segment_id") REFERENCES "CustomerSegment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SegmentCoupons" ADD CONSTRAINT "SegmentCoupons_segment_id_fkey" FOREIGN KEY ("segment_id") REFERENCES "CustomerSegment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SegmentCoupons" ADD CONSTRAINT "SegmentCoupons_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "Coupons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
