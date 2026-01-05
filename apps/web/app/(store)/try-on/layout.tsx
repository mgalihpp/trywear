import { Loader2 } from "lucide-react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Try On",
};

export default async function TryonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

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
