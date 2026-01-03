import { Card, CardContent } from "@repo/ui/components/card";
import Image from "next/image";
import Link from "next/link";
import ForgotPasswordForm from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-slate-950">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-amber-600 to-amber-800 dark:from-amber-900 dark:to-amber-950 p-12 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/20 rounded-full -mr-48 -mt-48"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-400/20 rounded-full -ml-36 -mb-36"></div>

          {/* Logo/Brand */}
          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-white mb-2">TryWear</h2>
            <p className="text-amber-100">Pemulihan akun menjadi mudah</p>
          </div>

          {/* Hero Image */}
          <div className="relative z-10 flex-1 flex items-center justify-center">
            <Image
              src="/image/forget-password.jpg"
              alt="Security illustration"
              width={400}
              height={400}
              className="drop-shadow-lg"
            />
          </div>

          {/* Info */}
          <div className="relative z-10 space-y-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="text-white font-medium">Pemulihan Cepat</p>
                <p className="text-amber-100 text-sm">
                  Reset password Anda dalam hitungan menit
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="text-white font-medium">Proses Aman</p>
                <p className="text-amber-100 text-sm">
                  Data Anda selalu terlindungi
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center p-4 lg:p-12">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Reset Password
              </h1>
              <p className="text-muted-foreground">
                Kami akan membantu memulihkan akun Anda
              </p>
            </div>

            {/* Forgot Password Card */}
            <Card className="border-0 shadow-none">
              {/* <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Forgot Password?</CardTitle>
              <CardDescription>
                  Enter your email address and we'll send you a link to reset
                  your password
                 </CardDescription>
              </CardHeader> */}
              <CardContent className="space-y-6">
                {/* Forgot Password Form */}
                <ForgotPasswordForm />

                {/* Footer Links */}
                <div className="space-y-3 text-sm text-center">
                  <div>
                    <Link
                      href="/login"
                      className="text-primary hover:underline font-medium"
                    >
                      Kembali ke Masuk
                    </Link>
                  </div>
                  <div className="text-muted-foreground">
                    Belum punya akun?{" "}
                    <Link
                      href="/register"
                      className="text-primary hover:underline font-medium"
                    >
                      Daftar
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
