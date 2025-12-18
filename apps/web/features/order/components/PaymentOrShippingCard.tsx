import { Button } from "@repo/ui/components/button";
import { format } from "date-fns";
import type { PaymentDetail } from "@/types/midtrans";

type PaymentOrShippingCardProps = {
  transactionStatus: string;
  paymentStatus?: string | null;
  paymentDetail: PaymentDetail | null;
  paymentMethod?: string | null;
  shipmentMethod?: string | null;
  deliveredAt?: string | Date | null;
  trackingNumber?: string | null;
  onPay: () => void;
};

function InfoField({
  label,
  value,
  mono,
}: {
  label: string;
  value?: string | null;
  mono?: boolean;
}) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`font-medium text-foreground ${mono ? "font-mono" : ""}`}>
        {value}
      </p>
    </div>
  );
}

export function PaymentOrShippingCard({
  transactionStatus,
  paymentStatus,
  paymentDetail,
  paymentMethod,
  shipmentMethod,
  deliveredAt,
  trackingNumber,
  onPay,
}: PaymentOrShippingCardProps) {
  const displayStatus = paymentStatus || transactionStatus;
  const isPending = displayStatus === "pending";
  const isFailed = displayStatus === "failed";

  const deliveredDate = deliveredAt
    ? `${format(new Date(deliveredAt), "dd MMMM yyyy HH:mm")} WIB`
    : "-";

  if (isPending || !paymentDetail) {
    return (
      <div className="border border-border p-8 rounded-lg space-y-4">
        <h2 className="text-2xl font-bold mb-2">Informasi Pembayaran</h2>

        <div>
          <p className="text-sm text-muted-foreground">Metode Pembayaran</p>
          <p className="font-medium">{paymentDetail?.method}</p>
        </div>

        {paymentDetail?.bank && (
          <div>
            <p className="text-sm text-muted-foreground">Bank</p>
            <p className="font-medium">{paymentDetail.bank}</p>
          </div>
        )}

        {paymentDetail?.accountNumber && (
          <div>
            <p className="text-sm text-muted-foreground">No. Virtual Account</p>
            <p className="font-medium text-lg">{paymentDetail.accountNumber}</p>
          </div>
        )}

        {paymentDetail?.expiryTime && (
          <div>
            <p className="text-sm text-muted-foreground">
              Batas Waktu Pembayaran
            </p>
            <p className="font-medium text-yellow-600 text-lg">
              {paymentDetail.expiryTime}
            </p>
          </div>
        )}

        <Button className="w-full mt-2" onClick={onPay}>
          Bayar Sekarang
        </Button>
      </div>
    );
  }

  if (isFailed) {
    return (
      <div className="border border-border p-8 rounded-lg space-y-4">
        <h2 className="text-2xl font-bold mb-2">Informasi Pembayaran</h2>
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-2">
            Metode Pembayaran
          </p>
          <p className="font-medium">{paymentMethod || "Unknown"}</p>
          <p className="text-destructive text-sm mt-2">
            Pembayaran tidak berhasil diproses
          </p>
        </div>
        <Button className="w-full mt-4" variant="destructive">
          Coba Lagi
        </Button>
      </div>
    );
  }

  return (
    <div className="border border-border p-8 rounded-lg space-y-4">
      <h2 className="text-2xl font-bold mb-2">Informasi Pengiriman</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InfoField label="Tanggal Pembelian" value={paymentDetail?.paidAt} />
        <InfoField label="Kurir" value={shipmentMethod || "-"} />
        <InfoField label="Tanggal Terkirim" value={deliveredDate} />
        <InfoField label="No. Resi" value={trackingNumber || "-"} mono />
      </div>
    </div>
  );
}
