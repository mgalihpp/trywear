"use client";

import type { Addresses } from "@repo/db";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@repo/ui/components/breadcrumb";
import { Button } from "@repo/ui/components/button";
import { Card } from "@repo/ui/components/card";
import { Separator } from "@repo/ui/components/separator";
import { Skeleton } from "@repo/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Info } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearCart as ClearCartItems } from "@/actions/cart";
import { cancelOrder, updatePaymentStatus } from "@/actions/payment";
import { useCartStore } from "@/features/cart/store/useCartStore";
import { AddressSelector } from "@/features/checkout/components/address-selector";
import { CheckoutOrderSummary } from "@/features/checkout/components/checkout-order-summary";
import { ShippingMethodSelector } from "@/features/checkout/components/shipping-method-selector";
import { useCreateOrder } from "@/features/checkout/mutations/useOrderMutation";
import { SHIPPING_METHODS } from "@/features/order/constants/shipment";
import AddressDialog from "@/features/user/components/settings/address/address-dialog";
import { useAddresses } from "@/features/user/queries/useAddressQuery";
import { useServerAction } from "@/hooks/useServerAction";
import { api } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import type { Snap } from "@/types/midtrans";

declare global {
  interface Window {
    snap?: Snap;
  }
}

const scriptId = "midtrans-snap-script";

export default function CheckoutPage() {
  const router = useRouter();
  const { data } = authClient.useSession();
  const {
    items,
    loading: isCartLoading,
    totalPrice,
    clearCart,
  } = useCartStore();
  const { data: addresses = [], isLoading: isAddressesLoading } =
    useAddresses();
  const orderMutation = useCreateOrder();
  const [runUpdatePaymentStatusAction] = useServerAction(updatePaymentStatus);
  const [runCancelOrderAction] = useServerAction(cancelOrder);
  const [runClearCartItemsAction] = useServerAction(ClearCartItems);

  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null,
  );
  const [selectedShippingId, setSelectedShippingId] = useState<number>(1);

  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Addresses | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);

  const { data: segments } = useQuery({
    queryKey: ["segments"],
    queryFn: () => api.segment.getAll(),
  });

  useEffect(() => {
    if (typeof window === "undefined" || window.snap) return;

    const script = document.createElement("script");
    script.id = scriptId;
    script.src =
      process.env.NODE_ENV === "production"
        ? "https://app.sandbox.midtrans.com/snap/snap.js"
        : "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute(
      "data-client-key",
      process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY as string,
    );
    script.async = true;

    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById(scriptId);
      existingScript?.remove();
    };
  }, []);

  // Set default address on load
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find((a) => a.is_default);
      setSelectedAddressId(defaultAddr?.id || (addresses[0]?.id as number));
    }
  }, [addresses, selectedAddressId]);

  const subtotal = totalPrice();
  const selectedShipping = SHIPPING_METHODS.find(
    (m) => m.id === selectedShippingId,
  );
  const shippingCost = selectedShipping?.basePrice || 0;
  const tax = subtotal * 0.1;
  const userSegment = segments?.find(
    (s) => s.id === (data?.user as any)?.segment_id, // Type cast if segment_id missing in type
  );

  const segmentDiscount =
    userSegment && userSegment.discount_percent > 0
      ? (subtotal * userSegment.discount_percent) / 100
      : 0;

  const total = Math.max(
    0,
    subtotal + tax + shippingCost - discountAmount - segmentDiscount,
  );

  const handleCheckout = async () => {
    if (!selectedAddressId) {
      alert("Please select a delivery address");
      return;
    }

    if (!window.snap) {
      alert(
        "Sistem pembayaran sedang tidak tersedia. Silakan refresh halaman.",
      );
      return;
    }

    setIsProcessing(true);
    try {
      orderMutation.mutate(
        {
          user_id: data?.user.id as string,
          items: items.map((it) => ({
            variant_id: it.variant_id,
            quantity: it.quantity,
          })),
          address_id: selectedAddressId,
          shipment_method_id: selectedShippingId,
          coupon_code: couponCode || undefined,
        },
        {
          onSuccess: async (data) => {
            const token = data.snap.token;

            window.snap?.pay(token, {
              language: "id",
              onSuccess: async (result) => {
                console.log(result);
                clearCart();
                await runClearCartItemsAction({});
                await runUpdatePaymentStatusAction({
                  order_id: result.order_id,
                  status: "settlement",
                });
                router.push(`${result.finish_redirect_url}`);
              },
              onPending: async (result) => {
                console.log(result);
                clearCart();
                await runClearCartItemsAction({});
                router.push(`${result.finish_redirect_url}`);
              },
              onError: async (result) => {
                console.log(result);

                await runUpdatePaymentStatusAction({
                  order_id: data.order.id, //tidak menggunakan result.order_id karena terjadi error
                  status: "failed",
                });

                // Langunsung cancel order
                await runCancelOrderAction(data.order.id);

                router.push(`${result.finish_redirect_url}`);
              },
              onClose: async () => {
                // Jika user menutup snap
                await runCancelOrderAction(data.order.id);
                router.push(`/cart?payment_cancelled=true`);
              },
            });
          },
        },
      );

      // In real app, redirect to order confirmation
      // alert("Order placed successfully!");
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to place order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditAddress = (address: Addresses) => {
    setEditingAddress(address);
    setAddressDialogOpen(true);
  };

  const handleAddNewAddress = () => {
    setEditingAddress(null);
    setAddressDialogOpen(true);
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Checkout</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-2xl sm:text-3xl font-bold mt-4">Checkout</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-2 py-8">
        {isAddressesLoading || isCartLoading ? (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6 space-y-4">
                <Skeleton className="h-5 w-40" />
                <div className="space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-1/2" />
                </div>
              </Card>

              <Separator className="my-2 sm:my-0" />

              <Card className="p-6 space-y-4">
                <Skeleton className="h-5 w-48" />
                <div className="grid sm:grid-cols-2 gap-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </Card>

              <Separator className="my-2 sm:my-0" />

              <Card className="p-6 space-y-4">
                <Skeleton className="h-5 w-52" />
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-4 w-56" />
              </Card>
            </div>

            <div>
              <Card className="p-6 space-y-4">
                <Skeleton className="h-6 w-32" />
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
                <Skeleton className="h-10 w-full" />
              </Card>
            </div>
          </div>
        ) : items.length === 0 ? (
          // Empty Cart State
          <Card className="p-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">
              Keranjang Anda kosong
            </h2>
            <p className="text-muted-foreground mb-6">
              Tambahkan item ke keranjang Anda sebelum melanjutkan ke pembayaran
            </p>
            <Link href="/products">
              <Button>Lanjutkan Berbelanja</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Address Section */}
              <Card className="p-6">
                <AddressSelector
                  addresses={addresses}
                  selectedAddressId={selectedAddressId}
                  onSelect={setSelectedAddressId}
                  onAdd={handleAddNewAddress}
                  onEdit={(address) => {
                    // Handle address editing/adding
                    handleEditAddress(address);
                  }}
                />
              </Card>

              <Separator className="my-2 sm:my-0" />

              {/* Shipping Section */}
              <Card className="p-6">
                <ShippingMethodSelector
                  methods={SHIPPING_METHODS}
                  selectedMethodId={selectedShippingId}
                  onSelect={setSelectedShippingId}
                />
              </Card>

              <Separator className="my-2 sm:my-0" />

              {/* Payment Section */}
              <Card className="p-6">
                <h2 className="text-base sm:text-lg font-semibold mb-6">
                  Metode Pembayaran
                </h2>
                <div className="space-y-4">
                  <Card className="p-4 border-2 border-primary">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm sm:text-base">
                          Credit / Debit Card
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Visa, Mastercard, American Express
                        </p>
                      </div>
                      <div className="text-2xl flex-shrink-0">💳</div>
                    </div>
                  </Card>
                  <p className="text-xs text-muted-foreground inline-flex sm:items-center gap-2">
                    <Info className="size-4" /> Detail pembayaran akan diproses
                    dengan aman. Kami tidak pernah menyimpan informasi kartu
                    Anda.
                  </p>
                </div>
              </Card>
            </div>

            {/* Order Summary Sidebar */}
            <div>
              <CheckoutOrderSummary
                items={items}
                subtotal={subtotal}
                tax={tax}
                shipping={shippingCost}
                total={total}
                isProcessing={isProcessing || orderMutation.isPending}
                onCheckout={handleCheckout}
                onCouponChange={setCouponCode}
                onApplyDiscount={setDiscountAmount}
                segmentDiscount={segmentDiscount}
                segmentName={userSegment?.name}
              />
            </div>
          </div>
        )}
      </div>

      <AddressDialog
        open={addressDialogOpen}
        onOpenChange={setAddressDialogOpen}
        editAddress={editingAddress}
      />
    </main>
  );
}
