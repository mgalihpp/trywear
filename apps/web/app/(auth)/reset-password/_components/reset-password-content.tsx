"use client";

import { Card, CardContent } from "@repo/ui/components/card";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ResetPasswordForm from "@/components/auth/reset-password-form";

export default function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  if (!token) {
    return (
      <main className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto lg:mx-0 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Tautan Reset Password Tidak Valid
          </h1>
          <p className="text-muted-foreground mb-6">
            Tautan reset password hilang atau tidak valid. Silakan minta tautan
            reset password baru.
          </p>
          <Link
            href="/forgot-password"
            className="text-primary hover:underline font-medium"
          >
            Ke Lupa Password
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl flex justify-center gap-8 lg:gap-12 items-center">
        <div className="w-full max-w-md mx-auto lg:mx-0">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Buat Password Baru
            </h1>
            <p className="text-muted-foreground">
              Masukkan password yang kuat untuk mengamankan akun Anda
            </p>
          </div>

          {/* Reset Password Card */}
          <Card className="border-0 shadow-none">
            <CardContent className="space-y-6">
              {/* Reset Password Form */}
              <ResetPasswordForm />

              {/* Footer Links */}
              <div className="text-center text-sm space-y-2">
                <p className="text-muted-foreground">
                  Ingat password Anda?{" "}
                  <Link
                    href="/login"
                    className="text-primary hover:underline font-medium"
                  >
                    Masuk
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
