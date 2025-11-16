import type { Addresses } from "@repo/db";
import { Button } from "@repo/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { MapPin, MoreVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useAddresses,
  useDeleteAddress,
  useUpdateAddress,
} from "@/features/user/queries/useAddressQuery";
import AddressDialog from "./address-dialog";

export const AddressSection = () => {
  const { data: addresses } = useAddresses();
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Addresses | null>(null);
  const updateAddressMutation = useUpdateAddress();
  const deleteAddressMutation = useDeleteAddress();

  const handleDeleteAddress = (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus alamat ini?")) {
      deleteAddressMutation.mutate(id, {
        onSuccess: () => {
          toast.success("Alamat berhasil dihapus");
        },
      });
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

  const setDefaultAddress = (id: number) => {
    updateAddressMutation.mutate({
      id,
      data: {
        is_default: true,
      },
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Daftar Alamat</h2>
        <Button onClick={handleAddNewAddress}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Alamat
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {addresses?.map((address) => (
          <div
            key={address.id}
            className="border border-border rounded-lg p-6 space-y-4"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">{address.label}</h3>
                {address.is_default && (
                  <span className="inline-block mt-1 px-2 py-1 bg-foreground text-background text-xs font-medium rounded">
                    Alamat Utama
                  </span>
                )}
              </div>
              <div className="flex justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">Buka menu</span>
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem
                      onClick={() => handleEditAddress(address)}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      <span>Edit</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => handleDeleteAddress(address.id)}
                      disabled={address.is_default}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Hapus</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="text-sm text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">
                {address.recipient_name}
              </p>
              <p>{address.phone}</p>
              <p>{address.address_line1}</p>
              <p>
                {address.city}, {address.postal_code}
              </p>
            </div>

            {!address.is_default && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  setDefaultAddress(address.id);
                  toast.success("Alamat utama berhasil diubah");
                }}
              >
                Jadikan Alamat Utama
              </Button>
            )}
          </div>
        ))}
      </div>

      {addresses?.length === 0 && (
        <div className="text-center py-16 border border-border rounded-lg">
          <MapPin className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">
            Belum ada alamat tersimpan
          </p>
          <Button onClick={handleAddNewAddress}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Alamat Pertama
          </Button>
        </div>
      )}

      <AddressDialog
        open={addressDialogOpen}
        onOpenChange={setAddressDialogOpen}
        editAddress={editingAddress}
      />
    </div>
  );
};
