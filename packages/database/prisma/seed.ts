import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

// Helper to read JSON files
function readJsonFile<T>(filename: string): T {
  const filePath = path.join(__dirname, "../../../mock", filename);
  const content = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(content);
}

// Helper to read from data folder (master data)
function readDataFile<T>(filename: string): T {
  const filePath = path.join(__dirname, "../../../data", filename);
  const content = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(content);
}

async function main() {
  console.log("🌱 Starting database seed...\n");

  // ============================================
  // MASTER DATA (from data/ folder)
  // ============================================

  // 1. Categories
  console.log("📁 Seeding Categories...");
  const categories = readDataFile<any[]>("Categories_rows.json");
  for (const cat of categories) {
    await prisma.categories.upsert({
      where: { id: cat.id },
      update: {},
      create: {
        id: cat.id,
        parent_id: cat.parent_id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
      },
    });
  }
  console.log(`   ✓ ${categories.length} categories seeded`);

  // 2. CustomerSegment
  console.log("📁 Seeding CustomerSegments...");
  const segments = readDataFile<any[]>("CustomerSegment_rows.json");
  for (const seg of segments) {
    await prisma.customerSegment.upsert({
      where: { id: seg.id },
      update: {},
      create: {
        id: seg.id,
        name: seg.name,
        slug: seg.slug,
        description: seg.description,
        min_spend_cents: BigInt(seg.min_spend_cents),
        max_spend_cents: seg.max_spend_cents
          ? BigInt(seg.max_spend_cents)
          : null,
        discount_percent: seg.discount_percent,
        color: seg.color,
        icon: seg.icon,
        priority: seg.priority,
        is_active: seg.is_active,
        created_at: new Date(seg.created_at),
        updated_at: new Date(seg.updated_at),
      },
    });
  }
  console.log(`   ✓ ${segments.length} customer segments seeded`);

  // 3. Shipment Methods
  console.log("📁 Seeding Shipment Methods...");
  const shipmentMethods = readDataFile<any[]>("Shipment_Method_rows.json");
  for (const sm of shipmentMethods) {
    await prisma.shipment_Method.upsert({
      where: { id: sm.id },
      update: {},
      create: {
        id: sm.id,
        name: sm.name,
        carrier_code: sm.carrier_code,
      },
    });
  }
  console.log(`   ✓ ${shipmentMethods.length} shipment methods seeded`);

  // 4. Products
  console.log("📁 Seeding Products...");
  const products = readDataFile<any[]>("Product_rows.json");
  for (const prod of products) {
    await prisma.product.upsert({
      where: { id: prod.id },
      update: {},
      create: {
        id: prod.id,
        supplier_id: prod.supplier_id,
        category_id: prod.category_id,
        title: prod.title,
        slug: prod.slug,
        sku: prod.sku,
        description: prod.description,
        price_cents: BigInt(prod.price_cents),
        currency: prod.currency,
        status: prod.status,
        created_at: new Date(prod.created_at),
        updated_at: new Date(prod.updated_at),
      },
    });
  }
  console.log(`   ✓ ${products.length} products seeded`);

  // 5. Product Images
  console.log("📁 Seeding Product Images...");
  const productImages = readDataFile<any[]>("ProductImages_rows.json");
  for (const img of productImages) {
    await prisma.productImages.upsert({
      where: { id: img.id },
      update: {},
      create: {
        id: img.id,
        product_id: img.product_id,
        url: img.url,
        alt: img.alt,
        sort_order: img.sort_order,
        key: img.key,
      },
    });
  }
  console.log(`   ✓ ${productImages.length} product images seeded`);

  // 6. Product Variants
  console.log("📁 Seeding Product Variants...");
  const productVariants = readDataFile<any[]>("ProductVariants_rows.json");
  for (const variant of productVariants) {
    await prisma.productVariants.upsert({
      where: { id: variant.id },
      update: {},
      create: {
        id: variant.id,
        product_id: variant.product_id,
        sku: variant.sku,
        option_values: JSON.parse(variant.option_values),
        additional_price_cents: BigInt(variant.additional_price_cents),
        created_at: new Date(variant.created_at),
      },
    });
  }
  console.log(`   ✓ ${productVariants.length} product variants seeded`);

  // 7. Inventory
  console.log("📁 Seeding Inventory...");
  const inventory = readDataFile<any[]>("Inventory_rows.json");
  for (const inv of inventory) {
    await prisma.inventory.upsert({
      where: { variant_id: inv.variant_id },
      update: {},
      create: {
        id: inv.id,
        variant_id: inv.variant_id,
        stock_quantity: inv.stock_quantity,
        reserved_quantity: inv.reserved_quantity,
        safety_stock: inv.safety_stock,
      },
    });
  }
  console.log(`   ✓ ${inventory.length} inventory records seeded`);

  // ============================================
  // MOCK DATA (from mock/ folder)
  // ============================================

  // 8. Users
  console.log("📁 Seeding Users...");
  const users = readJsonFile<any[]>("User_rows.json");
  for (const user of users) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt),
        role: user.role,
        banned: user.banned,
        banReason: user.banReason,
        banExpires: user.banExpires ? new Date(user.banExpires) : null,
        segment_id: user.segment_id,
        lifetime_spent: BigInt(user.lifetime_spent),
      },
    });
  }
  console.log(`   ✓ ${users.length} users seeded`);

  // 9. Addresses
  console.log("📁 Seeding Addresses...");
  const addresses = readJsonFile<any[]>("Addresses_rows.json");
  for (const addr of addresses) {
    await prisma.addresses.upsert({
      where: { id: addr.id },
      update: {},
      create: {
        id: addr.id,
        user_id: addr.user_id,
        recipient_name: addr.recipient_name,
        label: addr.label,
        address_line1: addr.address_line1,
        address_line2: addr.address_line2,
        city: addr.city,
        province: addr.province,
        postal_code: addr.postal_code,
        country: addr.country,
        phone: addr.phone,
        lat: addr.lat,
        lng: addr.lng,
        is_default: addr.is_default,
      },
    });
  }
  console.log(`   ✓ ${addresses.length} addresses seeded`);

  // 10. Coupons
  console.log("📁 Seeding Coupons...");
  const coupons = readJsonFile<any[]>("Coupons_rows.json");
  for (const coupon of coupons) {
    await prisma.coupons.upsert({
      where: { id: coupon.id },
      update: {},
      create: {
        id: coupon.id,
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        expires_at: coupon.expires_at ? new Date(coupon.expires_at) : null,
        usage_limit: coupon.usage_limit,
        usage_limit_per_user: coupon.usage_limit_per_user,
      },
    });
  }
  console.log(`   ✓ ${coupons.length} coupons seeded`);

  // 11. SegmentCoupons
  console.log("📁 Seeding SegmentCoupons...");
  const segmentCoupons = readJsonFile<any[]>("SegmentCoupons_rows.json");
  for (const sc of segmentCoupons) {
    await prisma.segmentCoupons.upsert({
      where: {
        segment_id_coupon_id: {
          segment_id: sc.segment_id,
          coupon_id: sc.coupon_id,
        },
      },
      update: {},
      create: {
        id: sc.id,
        segment_id: sc.segment_id,
        coupon_id: sc.coupon_id,
      },
    });
  }
  console.log(`   ✓ ${segmentCoupons.length} segment coupons seeded`);

  // 12. Orders
  console.log("📁 Seeding Orders...");
  const orders = readJsonFile<any[]>("Orders_rows.json");
  for (const order of orders) {
    await prisma.orders.upsert({
      where: { id: order.id },
      update: {},
      create: {
        id: order.id,
        user_id: order.user_id,
        address_id: order.address_id,
        status: order.status,
        subtotal_cents: BigInt(order.subtotal_cents),
        shipping_cents: BigInt(order.shipping_cents),
        tax_cents: BigInt(order.tax_cents),
        discount_cents: BigInt(order.discount_cents),
        total_cents: BigInt(order.total_cents),
        coupon_code: order.coupon_code,
        created_at: new Date(order.created_at),
        updated_at: new Date(order.updated_at),
      },
    });
  }
  console.log(`   ✓ ${orders.length} orders seeded`);

  // 13. Order Items
  console.log("📁 Seeding Order Items...");
  const orderItems = readJsonFile<any[]>("OrderItems_rows.json");
  for (const item of orderItems) {
    await prisma.orderItems.upsert({
      where: { id: item.id },
      update: {},
      create: {
        id: item.id,
        order_id: item.order_id,
        variant_id: item.variant_id,
        sku: item.sku,
        title: item.title,
        unit_price_cents: BigInt(item.unit_price_cents),
        quantity: item.quantity,
        total_price_cents: BigInt(item.total_price_cents),
      },
    });
  }
  console.log(`   ✓ ${orderItems.length} order items seeded`);

  // 14. Payments
  console.log("📁 Seeding Payments...");
  const payments = readJsonFile<any[]>("Payments_rows.json");
  for (const payment of payments) {
    await prisma.payments.upsert({
      where: { order_id: payment.order_id },
      update: {},
      create: {
        id: payment.id,
        order_id: payment.order_id,
        provider: payment.provider,
        provider_payment_id: payment.provider_payment_id,
        status: payment.status,
        amount_cents: BigInt(payment.amount_cents),
        currency: payment.currency,
        paid_at: payment.paid_at ? new Date(payment.paid_at) : null,
      },
    });
  }
  console.log(`   ✓ ${payments.length} payments seeded`);

  // 15. Shipments
  console.log("📁 Seeding Shipments...");
  const shipments = readJsonFile<any[]>("Shipments_rows.json");
  for (const ship of shipments) {
    await prisma.shipments.upsert({
      where: { order_id: ship.order_id },
      update: {},
      create: {
        id: ship.id,
        order_id: ship.order_id,
        shipment_method_id: ship.shipment_method_id,
        tracking_number: ship.tracking_number,
        status: ship.status,
        shipped_at: ship.shipped_at ? new Date(ship.shipped_at) : null,
        delivered_at: ship.delivered_at ? new Date(ship.delivered_at) : null,
      },
    });
  }
  console.log(`   ✓ ${shipments.length} shipments seeded`);

  // 16. Returns
  console.log("📁 Seeding Returns...");
  const returns = readJsonFile<any[]>("Returns_rows.json");
  for (const ret of returns) {
    await prisma.returns.upsert({
      where: { id: ret.id },
      update: {},
      create: {
        id: ret.id,
        order_id: ret.order_id,
        user_id: ret.user_id,
        reason: ret.reason,
        images: ret.images,
        status: ret.status,
        created_at: new Date(ret.created_at),
      },
    });
  }
  console.log(`   ✓ ${returns.length} returns seeded`);

  // 17. Return Items
  console.log("📁 Seeding Return Items...");
  const returnItems = readJsonFile<any[]>("ReturnItems_rows.json");
  for (const ri of returnItems) {
    await prisma.returnItems.upsert({
      where: { id: ri.id },
      update: {},
      create: {
        id: ri.id,
        return_id: ri.return_id,
        order_item_id: ri.order_item_id,
        quantity: ri.quantity,
      },
    });
  }
  console.log(`   ✓ ${returnItems.length} return items seeded`);

  // 18. Reviews
  console.log("📁 Seeding Reviews...");
  const reviews = readJsonFile<any[]>("Reviews_rows.json");
  for (const review of reviews) {
    await prisma.reviews.upsert({
      where: { id: review.id },
      update: {},
      create: {
        id: review.id,
        user_id: review.user_id,
        product_id: review.product_id,
        rating: review.rating,
        title: review.title,
        body: review.body,
        status: review.status,
        is_reported: review.is_reported,
        report_reason: review.report_reason,
        created_at: new Date(review.created_at),
        updated_at: new Date(review.updated_at),
      },
    });
  }
  console.log(`   ✓ ${reviews.length} reviews seeded`);

  console.log("\n✅ Database seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
