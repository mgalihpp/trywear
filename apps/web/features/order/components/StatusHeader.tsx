import { AlertCircle } from "lucide-react";
import type { StatusConfig } from "../types";

type StatusHeaderProps = {
  orderId?: string | number;
  config: StatusConfig;
  isPending: boolean;
  isFailedOrCancelled: boolean;
  expiryTime?: string;
  message: string;
};

export function StatusHeader({
  orderId,
  config,
  isPending,
  isFailedOrCancelled,
  expiryTime,
  message,
}: StatusHeaderProps) {
  const Icon = config.icon;

  return (
    <div className="text-center space-y-4 border border-border p-8 rounded-lg">
      <div
        className={`w-16 h-16 ${config.bgColor} text-background rounded-full flex items-center justify-center mx-auto`}
      >
        <Icon className="h-8 w-8" />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{config.title}</h1>
        <p className="text-lg text-muted-foreground">Order ID: #{orderId}</p>
      </div>

      {isPending && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mt-2">
          <div className="flex items-center justify-center gap-2 text-yellow-600">
            <AlertCircle className="h-5 w-5" />
            <p className="font-semibold">
              Selesaikan pembayaran sebelum {expiryTime}
            </p>
          </div>
        </div>
      )}

      {isFailedOrCancelled && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mt-2">
          <p className="text-destructive font-semibold">{message}</p>
        </div>
      )}
    </div>
  );
}
