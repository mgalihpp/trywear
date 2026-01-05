import { Loader2 } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Try On",
};

export default function TryonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center mt-20">
          <Loader2 className="animate-spin" size={24} />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
