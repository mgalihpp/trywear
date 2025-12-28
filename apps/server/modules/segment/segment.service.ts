import type { CustomerSegment } from "@repo/db";
import { db } from "@repo/db";
import type { CreateSegmentInput, UpdateSegmentInput } from "@repo/schema";
import { AppError } from "@/utils/appError";

export class SegmentService {
  private db = db;

  /**
   * Get all segments
   */
  async findAll(includeInactive = false) {
    return await this.db.customerSegment.findMany({
      where: includeInactive ? {} : { is_active: true },
      orderBy: { priority: "desc" },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });
  }

  /**
   * Get segment by ID
   */
  async findById(id: number) {
    const segment = await this.db.customerSegment.findUnique({
      where: { id },
      include: {
        _count: {
          select: { users: true },
        },
        segment_coupons: {
          include: {
            coupon: true,
          },
        },
      },
    });

    if (!segment) {
      throw AppError.notFound("Segment not found");
    }

    return segment;
  }

  /**
   * Get segment by slug
   */
  async findBySlug(slug: string) {
    const segment = await this.db.customerSegment.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    if (!segment) {
      throw AppError.notFound("Segment not found");
    }

    return segment;
  }

  /**
   * Create a new segment
   */
  async create(data: CreateSegmentInput): Promise<CustomerSegment> {
    // Check if slug already exists
    const existing = await this.db.customerSegment.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      throw AppError.badRequest("Segment with this slug already exists");
    }

    return await this.db.customerSegment.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        min_spend_cents: BigInt(data.min_spend_cents),
        max_spend_cents: data.max_spend_cents
          ? BigInt(data.max_spend_cents)
          : null,
        discount_percent: data.discount_percent,
        color: data.color,
        icon: data.icon,
        priority: data.priority,
        is_active: data.is_active,
      },
    });
  }

  /**
   * Update a segment
   */
  async update(id: number, data: UpdateSegmentInput): Promise<CustomerSegment> {
    // Check if segment exists
    const existing = await this.db.customerSegment.findUnique({
      where: { id },
    });

    if (!existing) {
      throw AppError.notFound("Segment not found");
    }

    // Check if slug already exists (if changing)
    if (data.slug && data.slug !== existing.slug) {
      const slugExists = await this.db.customerSegment.findUnique({
        where: { slug: data.slug },
      });

      if (slugExists) {
        throw AppError.badRequest("Segment with this slug already exists");
      }
    }

    return await this.db.customerSegment.update({
      where: { id },
      data: {
        ...data,
        min_spend_cents:
          data.min_spend_cents !== undefined
            ? BigInt(data.min_spend_cents)
            : undefined,
        max_spend_cents:
          data.max_spend_cents !== undefined
            ? data.max_spend_cents
              ? BigInt(data.max_spend_cents)
              : null
            : undefined,
        updated_at: new Date(),
      },
    });
  }

  /**
   * Delete a segment
   */
  async delete(id: number): Promise<void> {
    const existing = await this.db.customerSegment.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } },
    });

    if (!existing) {
      throw AppError.notFound("Segment not found");
    }

    // Unassign all users from this segment first
    if (existing._count.users > 0) {
      await this.db.user.updateMany({
        where: { segment_id: id },
        data: { segment_id: null },
      });
    }

    await this.db.customerSegment.delete({
      where: { id },
    });
  }

  /**
   * Calculate total spending for a user
   */
  async calculateUserSpending(userId: string): Promise<bigint> {
    const result = await this.db.orders.aggregate({
      _sum: { total_cents: true },
      where: {
        user_id: userId,
        status: { in: ["paid", "processing", "shipped", "delivered"] },
      },
    });

    return result._sum.total_cents || BigInt(0);
  }

  /**
   * Find the appropriate segment for a given spending amount
   */
  async findSegmentBySpending(spendingCents: bigint) {
    const segments = await this.db.customerSegment.findMany({
      where: { is_active: true },
      orderBy: { min_spend_cents: "desc" },
    });

    for (const segment of segments) {
      const minMet = spendingCents >= segment.min_spend_cents;
      const maxMet =
        segment.max_spend_cents === null ||
        spendingCents <= segment.max_spend_cents;

      if (minMet && maxMet) {
        return segment;
      }
    }

    // Return lowest tier segment if no match
    return segments[segments.length - 1] || null;
  }

  /**
   * Auto-assign segment to a user based on their spending
   */
  async assignSegmentToUser(userId: string) {
    const spending = await this.calculateUserSpending(userId);
    const segment = await this.findSegmentBySpending(spending);

    await this.db.user.update({
      where: { id: userId },
      data: {
        segment_id: segment?.id || null,
        lifetime_spent: spending,
      },
    });

    return { spending, segment };
  }

  /**
   * Recalculate segments for all users
   */
  async bulkRecalculateSegments() {
    const users = await this.db.user.findMany({
      select: { id: true },
    });

    let updated = 0;

    for (const user of users) {
      await this.assignSegmentToUser(user.id);
      updated++;
    }

    return { updated };
  }

  /**
   * Get segment statistics for dashboard
   */
  async getSegmentStats() {
    const segments = await this.db.customerSegment.findMany({
      where: { is_active: true },
      orderBy: { priority: "desc" },
      include: {
        _count: {
          select: { users: true },
        },
        users: {
          select: {
            lifetime_spent: true,
          },
        },
      },
    });

    return segments.map((segment) => {
      const totalSpent = segment.users.reduce(
        (sum, user) => sum + Number(user.lifetime_spent),
        0,
      );

      return {
        id: segment.id,
        name: segment.name,
        slug: segment.slug,
        color: segment.color,
        icon: segment.icon,
        customerCount: segment._count.users,
        totalSpent,
        discountPercent: segment.discount_percent,
      };
    });
  }

  /**
   * Get customers by segment slug
   */
  async getCustomersBySegment(segmentSlug: string, page = 1, limit = 20) {
    const segment = await this.findBySlug(segmentSlug);
    const skip = (page - 1) * limit;

    const [customers, total] = await Promise.all([
      this.db.user.findMany({
        where: { segment_id: segment.id },
        skip,
        take: limit,
        orderBy: { lifetime_spent: "desc" },
        include: {
          segment: true,
          orders: {
            select: { total_cents: true },
            take: 5,
            orderBy: { created_at: "desc" },
          },
        },
      }),
      this.db.user.count({ where: { segment_id: segment.id } }),
    ]);

    return {
      customers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
