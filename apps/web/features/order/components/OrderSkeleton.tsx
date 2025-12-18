import { Skeleton } from "@repo/ui/components/skeleton";

export function OrderSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <Skeleton className="w-16 h-16 rounded-full mx-auto" />
            <Skeleton className="h-10 w-64 mx-auto" />
            <Skeleton className="h-6 w-40 mx-auto" />
          </div>

          {/* Timeline */}
          <div className="border border-border p-8">
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="hidden md:flex justify-between">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col items-center flex-1">
                  <Skeleton className="w-12 h-12 rounded-full mb-3" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24 mt-2" />
                </div>
              ))}
            </div>
            <div className="md:hidden space-y-6">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-start gap-4">
                  <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detail Pesanan */}
          <div className="border border-border p-8">
            <div className="flex justify-between items-center mb-6">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-8 w-24" />
            </div>
            <div className="space-y-6">
              {[0, 1].map((i) => (
                <div key={i} className="flex gap-6 pb-6 border-b">
                  <Skeleton className="w-24 h-24 rounded-md flex-shrink-0" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-6 w-64" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 space-y-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-40" />
                </div>
              ))}
            </div>
          </div>

          {/* Alamat + Info Pembayaran/Pengiriman */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="border border-border p-8 space-y-4">
              <Skeleton className="h-8 w-48 mb-4" />
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-4 w-64" />
              ))}
            </div>
            <div className="border border-border p-8 space-y-4">
              <Skeleton className="h-8 w-56 mb-4" />
              {[0, 1, 2].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-48" />
                </div>
              ))}
              <Skeleton className="h-12 w-full mt-6" />
            </div>
          </div>

          {/* Tombol */}
          <div className="flex max-sm:flex-col gap-4">
            <Skeleton className="h-12 flex-1" />
            <Skeleton className="h-12 flex-1" />
          </div>
        </div>
      </main>
    </div>
  );
}
