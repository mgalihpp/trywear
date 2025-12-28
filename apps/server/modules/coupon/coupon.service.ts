import type { Coupons } from "@repo/db";
import type {
  CreateCouponInput,
  UpdateCouponInput,
} from "@repo/schema/couponSchema";
import { AppError } from "@/utils/appError";
import { BaseService } from "../service";

export class CouponService extends BaseService<Coupons, "coupons"> {
  constructor() {
    super("coupons");
  }

  async findAll() {
    const coupons = await this.db.coupons.findMany({
      include: {
        segment_coupons: {
          include: {
            segment: true,
          },
        },
      },
      orderBy: { expires_at: "asc" },
    });

    const usageCounts = await this.db.orders.groupBy({
      by: ["coupon_code"],
      where: {
        coupon_code: { in: coupons.map((c) => c.code) },
      },
      _count: { coupon_code: true },
    });

    return coupons.map((c) => ({
      ...c,
      _count: {
        orders:
          usageCounts.find((u) => u.coupon_code === c.code)?._count
            .coupon_code || 0,
      },
    }));
  }

  async findByCode(code: string) {
    return this.db.coupons.findUnique({
      where: { code },
      include: {
        segment_coupons: {
          include: {
            segment: true,
          },
        },
      },
    });
  }

  async getById(id: string) {
    return this.db.coupons.findUnique({
      where: { id },
      include: {
        segment_coupons: {
          include: {
            segment: true,
          },
        },
      },
    });
  }

  async createCoupon(input: CreateCouponInput) {
    const { segment_ids, ...data } = input;
    return this.db.coupons.create({
      data: {
        ...data,
        segment_coupons: {
          create: segment_ids?.map((id) => ({ segment_id: id })),
        },
      },
      include: {
        segment_coupons: {
          include: {
            segment: true,
          },
        },
      },
    });
  }

  async updateCoupon(id: string, input: UpdateCouponInput) {
    const { segment_ids, ...data } = input;

    // Transaction to update coupon details and usage segments
    return this.db.$transaction(async (tx) => {
      // 1. Update basic info
      const coupon = await tx.coupons.update({
        where: { id },
        data: data,
      });

      // 2. Sync segments if provided
      if (segment_ids) {
        // Remove old relations
        await tx.segmentCoupons.deleteMany({
          where: { coupon_id: id },
        });

        // Add new relations
        if (segment_ids.length > 0) {
          await tx.segmentCoupons.createMany({
            data: segment_ids.map((segId) => ({
              coupon_id: id,
              segment_id: segId,
            })),
          });
        }
      }

      return tx.coupons.findUnique({
        where: { id },
        include: {
          segment_coupons: {
            include: {
              segment: true,
            },
          },
        },
      });
    });
  }

  async validateCoupon(
    code: string,
    userId: string,
    subtotal: number,
    userSegmentId?: number | null,
  ) {
    const coupon = await this.db.coupons.findUnique({
      where: { code },
      include: {
        segment_coupons: true,
      },
    });

    if (!coupon) {
      throw AppError.notFound("Kupon tidak ditemukan");
    }

    // 1. Check expiration
    if (coupon.expires_at && new Date() > coupon.expires_at) {
      throw AppError.badRequest("Kupon sudah kadaluarsa");
    }

    // 2. Check usage limit
    if (coupon.usage_limit) {
      const usedCount = await this.db.orders.count({
        where: { coupon_code: code },
      });
      if (usedCount >= coupon.usage_limit) {
        throw AppError.badRequest("Kuota kupon sudah habis");
      }
    }

    // 3. Check segment restriction
    const restrictedSegments = coupon.segment_coupons.map(
      (sc) => sc.segment_id,
    );
    if (restrictedSegments.length > 0) {
      if (!userSegmentId || !restrictedSegments.includes(userSegmentId)) {
        throw AppError.badRequest(
          "Kupon ini tidak berlaku untuk segmen member Anda",
        );
      }
    }

    // 4. Calculate discount
    let discountAmount = 0;
    if (coupon.discount_type === "percentage") {
      discountAmount = (subtotal * (coupon.discount_value || 0)) / 100;
    } else {
      discountAmount = coupon.discount_value || 0;
    }

    return {
      coupon,
      discountAmount,
    };
  }

  async getCouponUsage(id: string) {
    const coupon = await this.db.coupons.findUnique({
      where: { id },
      select: { code: true },
    });

    if (!coupon) throw AppError.notFound("Kupon tidak ditemukan");

    return this.db.orders.findMany({
      where: { coupon_code: coupon.code },
      select: {
        id: true,
        created_at: true,
        total_cents: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
      take: 100, // Limit to 100 latest usages for performance
    });
  }

  async getAvailableCoupons(userSegmentId?: number | null) {
    const now = new Date();

    const coupons = await this.db.coupons.findMany({
      where: {
        AND: [
          // 1. Not expired
          {
            OR: [{ expires_at: null }, { expires_at: { gt: now } }],
          },
          // 2. Usage limit check is simpler in code, or complex query.
          // For list, we might show all non-expired, and check limit later
          // OR checking limit here if possible.
          // For now let's filter purely by segment and time.
        ],
      },
      include: {
        segment_coupons: true,
      },
      orderBy: { expires_at: "asc" },
    });

    // Client-side filtering for complex logic (segment match)
    return coupons.filter((coupon) => {
      // Check segment
      const restrictedSegments = coupon.segment_coupons.map(
        (sc) => sc.segment_id,
      );
      if (restrictedSegments.length > 0) {
        if (!userSegmentId || !restrictedSegments.includes(userSegmentId)) {
          return false; // User not in allowed segment
        }
      }

      // Check limit (if we want to hide fully used coupons)
      // This might be N+1 lazy loading if we query usage for each.
      // For list view, maybe we skip strict used check or doing it if list is small.
      // Let's assume we show them, validation will catch full usage.

      return true;
    });
  }
}
