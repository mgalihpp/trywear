"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "StreetWear Shop API",
            version: "1.0.0",
            description: "API documentation for StreetWear clothing store (hoodies, tees, apparel)",
            contact: {
                name: "StreetWear Team",
                email: "support@streetwear.com",
            },
        },
        servers: [
            {
                url: "http://localhost:5000",
                description: "Development server",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
            schemas: {
                Product: {
                    type: "object",
                    properties: {
                        id: {
                            type: "string",
                            format: "uuid",
                            description: "Unique product identifier",
                        },
                        title: {
                            type: "string",
                            description: "Product title",
                            example: "Hoodie Oversize Fleece",
                        },
                        slug: {
                            type: "string",
                            description: "URL-friendly product identifier",
                            example: "hoodie-oversize-fleece",
                        },
                        description: {
                            type: "string",
                            description: "Product description",
                            example: "Premium fleece hoodie with oversized fit",
                        },
                        sku: {
                            type: "string",
                            description: "Stock Keeping Unit",
                            example: "HD-OVRZ-BLK-M",
                        },
                        price_cents: {
                            type: "integer",
                            format: "int64",
                            description: "Product price in cents",
                            example: 39900000,
                        },
                        currency: {
                            type: "string",
                            description: "Currency code",
                            example: "IDR",
                            default: "IDR",
                        },
                        status: {
                            type: "string",
                            description: "Product status",
                            example: "active",
                            default: "active",
                        },
                        category_id: {
                            type: "integer",
                            description: "Category ID",
                            example: 1,
                        },
                        supplier_id: {
                            type: "integer",
                            description: "Supplier ID",
                            example: 1,
                        },
                        category: {
                            $ref: "#/components/schemas/Category",
                        },
                        product_images: {
                            type: "array",
                            items: {
                                $ref: "#/components/schemas/ProductImage",
                            },
                        },
                        product_variants: {
                            type: "array",
                            items: {
                                $ref: "#/components/schemas/ProductVariant",
                            },
                        },
                        created_at: {
                            type: "string",
                            format: "date-time",
                            description: "Creation timestamp",
                        },
                        updated_at: {
                            type: "string",
                            format: "date-time",
                            description: "Last update timestamp",
                        },
                    },
                },
                Category: {
                    type: "object",
                    properties: {
                        id: { type: "integer", description: "Unique category identifier" },
                        name: {
                            type: "string",
                            description: "Category name",
                            example: "Hoodies",
                        },
                        slug: {
                            type: "string",
                            description: "URL-friendly category identifier",
                            example: "hoodies",
                        },
                        description: {
                            type: "string",
                            description: "Category description",
                            example: "Hoodies and sweatshirts",
                        },
                        parent_id: {
                            type: "integer",
                            description: "Parent category ID for hierarchical categories",
                            example: null,
                        },
                    },
                },
                ProductVariant: {
                    type: "object",
                    properties: {
                        id: {
                            type: "string",
                            format: "uuid",
                            description: "Unique variant identifier",
                        },
                        product_id: {
                            type: "string",
                            format: "uuid",
                            description: "Parent product ID",
                        },
                        sku: {
                            type: "string",
                            description: "Stock Keeping Unit",
                            example: "HD-OVRZ-BLK-M",
                        },
                        option_values: {
                            type: "object",
                            description: "Variant options (color, size, etc.)",
                            example: { color: "Black", size: "M" },
                        },
                        additional_price_cents: {
                            type: "integer",
                            format: "int64",
                            description: "Additional price for this variant",
                            example: 0,
                        },
                        inventory: {
                            type: "array",
                            items: {
                                $ref: "#/components/schemas/Inventory",
                            },
                        },
                        created_at: {
                            type: "string",
                            format: "date-time",
                            description: "Creation timestamp",
                        },
                    },
                },
                Inventory: {
                    type: "object",
                    properties: {
                        id: { type: "integer", description: "Unique inventory identifier" },
                        variant_id: {
                            type: "string",
                            format: "uuid",
                            description: "Product variant ID",
                        },
                        stock_quantity: {
                            type: "integer",
                            description: "Available stock quantity",
                            example: 50,
                        },
                        reserved_quantity: {
                            type: "integer",
                            description: "Reserved stock quantity",
                            example: 5,
                        },
                        safety_stock: {
                            type: "integer",
                            description: "Minimum stock level",
                            example: 10,
                        },
                    },
                },
                Error: {
                    type: "object",
                    properties: {
                        success: { type: "boolean", example: false },
                        message: {
                            type: "string",
                            description: "Error message",
                            example: "Product not found",
                        },
                        error: {
                            type: "string",
                            description: "Error details",
                            example: "Validation failed",
                        },
                    },
                },
                SuccessResponse: {
                    type: "object",
                    properties: {
                        success: { type: "boolean", example: true },
                        message: {
                            type: "string",
                            description: "Success message",
                            example: "Operation completed successfully",
                        },
                        data: { type: "object", description: "Response data" },
                    },
                },
                ProductImage: {
                    type: "object",
                    properties: {
                        id: { type: "integer", description: "Image ID" },
                        product_id: {
                            type: "string",
                            format: "uuid",
                            description: "Product ID",
                        },
                        url: {
                            type: "string",
                            format: "uri",
                            description: "Image URL",
                            example: "https://example.com/images/hoodie-black-front.jpg",
                        },
                        key: {
                            type: "string",
                            description: "A key used for delete the image",
                            example: "D0ajijkoaff2wafjai299jSIJI",
                        },
                        alt: {
                            type: "string",
                            description: "Alt text for accessibility",
                            example: "Black oversized hoodie front view",
                        },
                        sort_order: {
                            type: "integer",
                            description: "Display order",
                            example: 1,
                        },
                    },
                },
                User: {
                    type: "object",
                    properties: {
                        id: { type: "string", description: "User ID" },
                        name: {
                            type: "string",
                            description: "User full name",
                            example: "John Doe",
                        },
                        email: {
                            type: "string",
                            format: "email",
                            description: "User email address",
                            example: "john.doe@example.com",
                        },
                        emailVerified: {
                            type: "boolean",
                            description: "Email verification status",
                            example: true,
                        },
                        image: {
                            type: "string",
                            format: "uri",
                            description: "User profile image URL",
                            example: "https://example.com/avatars/john.jpg",
                        },
                        role: {
                            type: "string",
                            description: "User role",
                            example: "customer",
                        },
                        banned: {
                            type: "boolean",
                            description: "Account ban status",
                            example: false,
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                            description: "Account creation timestamp",
                        },
                        updatedAt: {
                            type: "string",
                            format: "date-time",
                            description: "Last update timestamp",
                        },
                    },
                },
                Order: {
                    type: "object",
                    properties: {
                        id: { type: "string", format: "uuid", description: "Order ID" },
                        user_id: { type: "string", description: "User ID" },
                        status: {
                            type: "string",
                            description: "Order status",
                            example: "pending",
                            enum: [
                                "ready",
                                "pending",
                                "processing",
                                "shipped",
                                "in_transit",
                                "delivered",
                                "failed",
                                "returned",
                                "cancelled",
                            ],
                        },
                        subtotal_cents: {
                            type: "integer",
                            format: "int64",
                            description: "Subtotal in cents",
                            example: 39900000,
                        },
                        shipping_cents: {
                            type: "integer",
                            format: "int64",
                            description: "Shipping cost in cents",
                            example: 2000000,
                        },
                        tax_cents: {
                            type: "integer",
                            format: "int64",
                            description: "Tax amount in cents",
                            example: 3990000,
                        },
                        discount_cents: {
                            type: "integer",
                            format: "int64",
                            description: "Discount amount in cents",
                            example: 0,
                        },
                        total_cents: {
                            type: "integer",
                            format: "int64",
                            description: "Total amount in cents",
                            example: 45890000,
                        },
                        coupon_code: {
                            type: "string",
                            description: "Applied coupon code",
                            example: "SAVE10",
                        },
                        created_at: {
                            type: "string",
                            format: "date-time",
                            description: "Order creation timestamp",
                        },
                        updated_at: {
                            type: "string",
                            format: "date-time",
                            description: "Last update timestamp",
                        },
                    },
                },
                OrderItem: {
                    type: "object",
                    properties: {
                        id: { type: "integer", description: "Order item ID" },
                        order_id: { type: "string", format: "uuid" },
                        variant_id: {
                            type: "string",
                            format: "uuid",
                            nullable: true,
                            description: "Related product variant ID",
                        },
                        sku: {
                            type: "string",
                            nullable: true,
                            description: "SKU at the time of purchase",
                        },
                        title: {
                            type: "string",
                            nullable: true,
                            description: "Product title at the time of purchase",
                        },
                        unit_price_cents: {
                            type: "integer",
                            format: "int64",
                            description: "Unit price (cents) captured at checkout",
                        },
                        quantity: { type: "integer", description: "Quantity purchased" },
                        total_price_cents: {
                            type: "integer",
                            format: "int64",
                            description: "Line total in cents",
                        },
                    },
                },
                OrderItemWithVariant: {
                    allOf: [
                        { $ref: "#/components/schemas/OrderItem" },
                        {
                            type: "object",
                            properties: {
                                variant: {
                                    allOf: [
                                        { $ref: "#/components/schemas/ProductVariant" },
                                        {
                                            type: "object",
                                            properties: {
                                                product: { $ref: "#/components/schemas/Product" },
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                    ],
                },
                Address: {
                    type: "object",
                    properties: {
                        id: { type: "integer", description: "Address ID" },
                        user_id: { type: "string", description: "Owner user ID" },
                        recipient_name: { type: "string", description: "Recipient name" },
                        label: {
                            type: "string",
                            nullable: true,
                            description: "Label for the address (Home, Office, etc.)",
                        },
                        address_line1: {
                            type: "string",
                            nullable: true,
                            description: "Street address line 1",
                        },
                        address_line2: {
                            type: "string",
                            nullable: true,
                            description: "Street address line 2",
                        },
                        city: { type: "string", nullable: true },
                        province: { type: "string", nullable: true },
                        postal_code: { type: "string", nullable: true },
                        country: { type: "string", nullable: true },
                        phone: { type: "string", nullable: true },
                        lat: { type: "number", nullable: true },
                        lng: { type: "number", nullable: true },
                        is_default: {
                            type: "boolean",
                            description: "Whether this address is the default for the user",
                        },
                    },
                },
                Payment: {
                    type: "object",
                    properties: {
                        id: { type: "string", format: "uuid" },
                        order_id: { type: "string", format: "uuid" },
                        provider: { type: "string", description: "Payment provider" },
                        provider_payment_id: {
                            type: "string",
                            nullable: true,
                            description: "Provider payment reference / token",
                        },
                        status: {
                            type: "string",
                            nullable: true,
                            description: "Payment status reported by provider",
                        },
                        amount_cents: {
                            type: "integer",
                            format: "int64",
                            description: "Amount in cents",
                        },
                        currency: {
                            type: "string",
                            description: "Currency code",
                            example: "IDR",
                        },
                        paid_at: {
                            type: "string",
                            format: "date-time",
                            nullable: true,
                            description: "Time payment was captured",
                        },
                    },
                },
                ShipmentMethod: {
                    type: "object",
                    properties: {
                        id: { type: "integer", description: "Shipment method ID" },
                        name: { type: "string", nullable: true },
                        carrier_code: { type: "string", nullable: true },
                    },
                },
                Shipment: {
                    type: "object",
                    properties: {
                        id: { type: "string", format: "uuid" },
                        order_id: { type: "string", format: "uuid" },
                        shipment_method_id: {
                            type: "integer",
                            nullable: true,
                            description: "Reference to shipment method",
                        },
                        tracking_number: {
                            type: "string",
                            nullable: true,
                            description: "Tracking number from carrier",
                        },
                        status: {
                            type: "string",
                            description: "Shipment status",
                            enum: [
                                "ready",
                                "pending",
                                "processing",
                                "shipped",
                                "in_transit",
                                "delivered",
                                "failed",
                                "returned",
                                "cancelled",
                            ],
                        },
                        shipped_at: {
                            type: "string",
                            format: "date-time",
                            nullable: true,
                            description: "Timestamp when package shipped",
                        },
                        delivered_at: {
                            type: "string",
                            format: "date-time",
                            nullable: true,
                            description: "Timestamp when package delivered",
                        },
                        shipment_method: {
                            $ref: "#/components/schemas/ShipmentMethod",
                        },
                    },
                },
                Return: {
                    type: "object",
                    properties: {
                        id: { type: "string", format: "uuid" },
                        order_id: { type: "string", format: "uuid", nullable: true },
                        user_id: { type: "string", nullable: true },
                        reason: { type: "string", nullable: true },
                        status: {
                            type: "string",
                            description: "Return request status",
                            example: "requested",
                        },
                        created_at: {
                            type: "string",
                            format: "date-time",
                            description: "Return request created at",
                        },
                    },
                },
                MidtransSnapTransaction: {
                    type: "object",
                    properties: {
                        token: { type: "string", description: "Snap token" },
                        redirect_url: {
                            type: "string",
                            format: "uri",
                            description: "URL to redirect user to Midtrans payment page",
                        },
                    },
                },
                PaymentStatus: {
                    type: "object",
                    properties: {
                        status_code: { type: "string", example: "200" },
                        status_message: {
                            type: "string",
                            example: "Success, transaction found",
                        },
                        transaction_id: { type: "string" },
                        order_id: { type: "string" },
                        gross_amount: {
                            type: "string",
                            description: "Gross amount in currency units",
                        },
                        transaction_status: {
                            type: "string",
                            example: "settlement",
                        },
                        fraud_status: { type: "string", example: "accept" },
                        payment_type: { type: "string", example: "gopay" },
                        currency: { type: "string", example: "IDR" },
                        transaction_time: {
                            type: "string",
                            example: "2024-11-25 10:15:30",
                        },
                    },
                    additionalProperties: true,
                },
                OrderCreationResult: {
                    type: "object",
                    properties: {
                        order: {
                            allOf: [
                                { $ref: "#/components/schemas/Order" },
                                {
                                    type: "object",
                                    properties: {
                                        order_items: {
                                            type: "array",
                                            items: { $ref: "#/components/schemas/OrderItem" },
                                        },
                                    },
                                },
                            ],
                        },
                        payment: {
                            type: "object",
                            properties: {
                                provider_payment_id: {
                                    type: "string",
                                    description: "Snap token used to complete payment",
                                },
                            },
                        },
                        snap: { $ref: "#/components/schemas/MidtransSnapTransaction" },
                    },
                },
                OrderWithRelations: {
                    allOf: [
                        { $ref: "#/components/schemas/Order" },
                        {
                            type: "object",
                            properties: {
                                order_items: {
                                    type: "array",
                                    items: { $ref: "#/components/schemas/OrderItemWithVariant" },
                                },
                                payments: {
                                    type: "array",
                                    items: { $ref: "#/components/schemas/Payment" },
                                },
                                shipments: {
                                    type: "array",
                                    items: { $ref: "#/components/schemas/Shipment" },
                                },
                                address: { $ref: "#/components/schemas/Address" },
                                user: { $ref: "#/components/schemas/User" },
                                returns: {
                                    type: "array",
                                    items: { $ref: "#/components/schemas/Return" },
                                },
                            },
                        },
                    ],
                },
                Review: {
                    type: "object",
                    properties: {
                        id: { type: "string", format: "uuid" },
                        user_id: { type: "string" },
                        product_id: { type: "string", format: "uuid" },
                        rating: { type: "integer", example: 5 },
                        title: { type: "string", nullable: true },
                        body: { type: "string", nullable: true },
                        created_at: {
                            type: "string",
                            format: "date-time",
                            description: "When the review was created",
                        },
                    },
                },
                ProductFilterOptions: {
                    type: "object",
                    properties: {
                        colors: {
                            type: "array",
                            items: { type: "string" },
                        },
                        sizes: {
                            type: "array",
                            items: { type: "string" },
                        },
                    },
                },
            },
            parameters: {
                ProductId: {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "string", format: "uuid" },
                    description: "Product ID",
                },
                ProductImageId: {
                    name: "imageId",
                    in: "path",
                    required: true,
                    schema: { type: "integer" },
                    description: "Product Image ID",
                },
                CategoryId: {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "integer" },
                    description: "Category ID",
                },
                VariantId: {
                    name: "variantId",
                    in: "path",
                    required: true,
                    schema: { type: "string", format: "uuid" },
                    description: "Product Variant ID",
                },
                PageQuery: {
                    name: "page",
                    in: "query",
                    schema: { type: "string", default: "1" },
                    description: "Page number for pagination",
                },
                LimitQuery: {
                    name: "limit",
                    in: "query",
                    schema: { type: "string", default: "12" },
                    description: "Number of items per page",
                },
                SearchQuery: {
                    name: "q",
                    in: "query",
                    schema: { type: "string" },
                    description: "Search query",
                },
                CategoryQuery: {
                    name: "category",
                    in: "query",
                    schema: { type: "string" },
                    description: "Filter by category slug",
                },
                OrderId: {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "string", format: "uuid" },
                    description: "Order ID",
                },
                ShipmentId: {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "string", format: "uuid" },
                    description: "Shipment ID",
                },
                CustomerId: {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "string" },
                    description: "Customer ID",
                },
                OrderStatusQuery: {
                    name: "status",
                    in: "query",
                    schema: {
                        type: "string",
                        enum: [
                            "ready",
                            "pending",
                            "processing",
                            "shipped",
                            "in_transit",
                            "delivered",
                            "failed",
                            "returned",
                            "cancelled",
                        ],
                    },
                    description: "Filter orders by current status",
                },
                AddressId: {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "integer" },
                    description: "Address ID",
                },
            },
        },
    },
    apis: [
        `${__dirname}/../modules/**/*.route.ts`,
        `${__dirname}/../routes/*.ts`,
    ],
};
const swaggerDocs = (0, swagger_jsdoc_1.default)(swaggerOptions);
exports.default = swaggerDocs;
