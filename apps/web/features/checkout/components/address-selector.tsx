"use client";

import type { Addresses } from "@repo/db";
import { Button } from "@repo/ui/components/button";
import { Card } from "@repo/ui/components/card";
import { Label } from "@repo/ui/components/label";
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/radio-group";
import { Edit2, MapPin, Plus } from "lucide-react";

interface AddressSelectorProps {
  addresses: Addresses[];
  selectedAddressId: number | null;
  onSelect: (id: number) => void;
  onAdd: () => void;
  onEdit: (address: Addresses) => void;
}

export function AddressSelector({
  addresses,
  selectedAddressId,
  onSelect,
  onAdd,
  onEdit,
}: AddressSelectorProps) {
  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h2 className="text-sm sm:text-base lg:text-lg font-semibold">
          Alamat Pengiriman
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={onAdd}
          className="gap-1 sm:gap-2 text-xs"
        >
          <Plus className="w-3 h-3" />
          <span className="hidden sm:inline">Tambah Alamat</span>
          <span className="sm:hidden">Tambah</span>
        </Button>
      </div>

      <RadioGroup
        value={selectedAddressId?.toString() || ""}
        onValueChange={(value) => onSelect(parseInt(value))}
      >
        <div className="space-y-2 sm:space-y-3">
          {addresses.length === 0 ? (
            <Card className="p-4 sm:p-6 text-center">
              <MapPin className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-2 sm:mb-3 opacity-50" />
              <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                Belum ada alamat yang tersimpan
              </p>
              <Button variant="default" onClick={onAdd} size="sm">
                Tambahkan alamat kamu
              </Button>
            </Card>
          ) : (
            addresses.map((address) => (
              <Card
                key={address.id}
                className={`p-3 sm:p-4 cursor-pointer transition-all ${
                  selectedAddressId === address.id
                    ? "border-primary ring-1 ring-primary"
                    : "hover:border-foreground/50"
                }`}
                onClick={() => onSelect(address.id)}
              >
                <div className="flex items-start gap-2 sm:gap-3">
                  <RadioGroupItem
                    value={address.id.toString()}
                    id={`address-${address.id}`}
                    className="mt-1 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <Label
                      htmlFor={`address-${address.id}`}
                      className="cursor-pointer block"
                    >
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-semibold text-xs sm:text-sm">
                          {address.recipient_name}
                        </span>
                        {address.label && (
                          <span className="text-xs bg-muted px-1.5 py-0.5 rounded flex-shrink-0">
                            {address.label}
                          </span>
                        )}
                        {address.is_default && (
                          <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded flex-shrink-0">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground break-words">
                        {address.address_line1}
                        {address.address_line2 && `, ${address.address_line2}`}
                      </p>
                      <p className="text-xs text-muted-foreground break-words">
                        {address.city}, {address.province} {address.postal_code}
                      </p>
                      <p className="text-xs text-muted-foreground break-words">
                        {address.country}
                      </p>
                      {address.phone && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {address.phone}
                        </p>
                      )}
                    </Label>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(address);
                    }}
                    className="flex-shrink-0 h-8 w-8 p-0"
                  >
                    <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </RadioGroup>
    </div>
  );
}
