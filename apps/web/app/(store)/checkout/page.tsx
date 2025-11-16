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
import { AlertCircle, ArrowLeft, Info } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCartStore } from "@/features/cart/store/useCartStore";
import { AddressSelector } from "@/features/checkout/components/address-selector";
import { CheckoutOrderSummary } from "@/features/checkout/components/checkout-order-summary";
import { ShippingMethodSelector } from "@/features/checkout/components/shipping-method-selector";
import AddressDialog from "@/features/user/components/settings/address/address-dialog";
import { useAddresses } from "@/features/user/queries/useAddressQuery";
import type { ShippingMethod } from "@/types/index";

const SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: "standard",
    name: "Standard Shipping",
    description: "Delivery to your address",
    price: 5000,
    estimatedDays: 5,
  },
  {
    id: "express",
    name: "Express Shipping",
    description: "Faster delivery available",
    price: 7500,
    estimatedDays: 2,
  },
  {
    id: "overnight",
    name: "Overnight Shipping",
    description: "Next business day delivery",
    price: 10000,
    estimatedDays: 1,
  },
];

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCartStore();
  const { data: addresses = [] } = useAddresses();

  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null,
  );
  const [selectedShippingId, setSelectedShippingId] =
    useState<string>("standard");

  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Addresses | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

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
  const shippingCost = selectedShipping?.price || 0;
  const tax = subtotal * 0.1;
  const total = subtotal + tax + shippingCost;

  const handleCheckout = async () => {
    if (!selectedAddressId) {
      alert("Please select a delivery address");
      return;
    }

    setIsProcessing(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Clear cart and redirect
      clearCart();
      // In real app, redirect to order confirmation
      alert("Order placed successfully!");
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
        {items.length === 0 ? (
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
                isProcessing={isProcessing}
                onCheckout={handleCheckout}
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
