import type { Addresses } from "@repo/db";
import { updateAddressSchema } from "@repo/schema/addressSchema";
import { Button } from "@repo/ui/components/button";
import { Checkbox } from "@repo/ui/components/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@repo/ui/components/drawer";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Textarea } from "@repo/ui/components/textarea";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import {
  useAddAddress,
  useUpdateAddress,
} from "@/features/user/queries/useAddressQuery";

interface AddressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editAddress?: Addresses | null;
}

const createAddressSchema = z.object({
  recipient_name: z.string().min(3, "Nama penerima minimal 3 karakter").max(50),
  label: z.string().min(1, "Label alamat wajib diisi").max(50),
  address_line1: z.string().min(10, "Alamat lengkap minimal 10 karakter"),
  address_line2: z.string().optional().nullable(),
  city: z.string().min(1, "Kota wajib diisi").max(100),
  province: z.string().max(100).optional().nullable(),
  postal_code: z.string().min(5, "Kode pos minimal 5 karakter").max(20),
  phone: z.string().min(10, "Nomor telepon minimal 10 karakter").max(50),
  country: z.string().max(100).optional().nullable(),
  lat: z.number().optional().nullable(),
  lng: z.number().optional().nullable(),
  is_default: z.boolean().optional().default(false),
});

const AddressDialog = ({
  open,
  onOpenChange,
  editAddress,
}: AddressDialogProps) => {
  const addAddressMutation = useAddAddress();
  const updateAddressMutation = useUpdateAddress();

  const [formData, setFormData] = useState({
    recipient_name: "",
    phone: "",
    label: "",
    country: "",
    is_default: false,
    address_line1: "",
    city: "",
    postal_code: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isMobile = useIsMobile();

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (editAddress) {
      setFormData({
        recipient_name: editAddress.recipient_name ?? "",
        phone: editAddress.phone ?? "",
        label: editAddress.label ?? "",
        country: editAddress.country ?? "Indonesia",
        is_default: !!editAddress.is_default,
        address_line1: editAddress.address_line1 ?? "",
        city: editAddress.city ?? "",
        postal_code: editAddress.postal_code ?? "",
      });
    } else {
      setFormData({
        recipient_name: formData.recipient_name,
        phone: formData.phone,
        label: formData.label,
        country: "Indonesia",
        is_default: formData.is_default,
        address_line1: formData.address_line1,
        city: formData.city,
        postal_code: formData.postal_code,
      });
    }
    setErrors({});
  }, [editAddress]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      if (editAddress) {
        updateAddressSchema.parse(formData);
        updateAddressMutation.mutate({
          id: editAddress.id,
          data: formData,
        });
        toast.success("Alamat berhasil diperbarui");
      } else {
        createAddressSchema.parse(formData);
        addAddressMutation.mutate({
          recipient_name: formData.recipient_name,
          phone: formData.phone,
          label: formData.label,
          country: "Indonesia",
          is_default: formData.is_default,
          address_line1: formData.address_line1,
          city: formData.city,
          postal_code: formData.postal_code,
        });
        toast.success("Alamat berhasil ditambahkan");
      }
      onOpenChange(false);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.log(error);
        const fieldErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
        toast.error("Mohon lengkapi semua data dengan benar");
      }
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-6 pt-4">
      <div>
        <Label htmlFor="label">Label Alamat *</Label>
        <Input
          id="label"
          value={formData.label}
          onChange={(e) => setFormData({ ...formData, label: e.target.value })}
          placeholder="Rumah, Kantor, Apartemen..."
          className="mt-2"
          aria-invalid={!!errors.label}
        />
        {errors.label && (
          <p className="text-sm text-destructive mt-1">{errors.label}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="recipientName">Nama Penerima *</Label>
          <Input
            id="recipientName"
            value={formData.recipient_name}
            onChange={(e) =>
              setFormData({ ...formData, recipient_name: e.target.value })
            }
            placeholder="Nama Penerima"
            className="mt-2"
            aria-invalid={!!errors.recipient_name}
          />
          {errors.recipient_name && (
            <p className="text-sm text-destructive mt-1">
              {errors.recipient_name}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="phone">Nomor Telepon *</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            placeholder="0825247......"
            className="mt-2"
            aria-invalid={!!errors.phone}
          />
          {errors.phone && (
            <p className="text-sm text-destructive mt-1">{errors.phone}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="address">Alamat Lengkap *</Label>
        <Textarea
          id="address"
          value={formData.address_line1}
          onChange={(e) =>
            setFormData({ ...formData, address_line1: e.target.value })
          }
          placeholder="Jl. Mawar No. 123..."
          className="mt-2"
          rows={3}
          aria-invalid={!!errors.address_line1}
        />
        {errors.address_line1 && (
          <p className="text-sm text-destructive mt-1">
            {errors.address_line1}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">Kota *</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="mt-2"
            placeholder="Bandung"
            aria-invalid={!!errors.city}
          />
          {errors.city && (
            <p className="text-sm text-destructive mt-1">{errors.city}</p>
          )}
        </div>
        <div>
          <Label htmlFor="postalCode">Kode Pos *</Label>
          <Input
            id="postalCode"
            value={formData.postal_code}
            onChange={(e) =>
              setFormData({ ...formData, postal_code: e.target.value })
            }
            className="mt-2"
            placeholder="12345"
            aria-invalid={!!errors.postal_code}
          />
          {errors.postal_code && (
            <p className="text-sm text-destructive mt-1">
              {errors.postal_code}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="isDefault"
          checked={formData.is_default}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, is_default: !!checked })
          }
        />
        <label
          htmlFor="isDefault"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
        >
          Jadikan alamat utama
        </label>
      </div>

      <div className="sticky bottom-0 flex gap-4 pt-4 pb-2 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:backdrop-blur">
        <Button
          type="button"
          variant="outline"
          className="flex-1 h-12"
          onClick={() => onOpenChange(false)}
        >
          Batal
        </Button>
        <Button
          type="submit"
          className="flex-1 h-12"
          disabled={addAddressMutation.isPending}
        >
          {addAddressMutation.isPending
            ? editAddress
              ? "Menyimpan Perubahan..."
              : "Menyimpan..."
            : editAddress
              ? "Simpan Perubahan"
              : "Tambah Alamat"}
        </Button>
      </div>
    </form>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="w-full rounded-t-3xl px-6 pb-6 gap-0">
          <DrawerHeader>
            <DrawerTitle className="text-2xl font-bold">
              {editAddress ? "Edit Alamat" : "Tambah Alamat Baru"}
            </DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto px-1">{formContent}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {editAddress ? "Edit Alamat" : "Tambah Alamat Baru"}
          </DialogTitle>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
};

export default AddressDialog;

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
};
