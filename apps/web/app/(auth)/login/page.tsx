import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import Image from "next/image";
import Link from "next/link";
import LoginForm from "@/components/auth/login-form";
import SocialLoginButtons from "@/components/auth/social-login-buttons";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-slate-950">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-900 dark:to-blue-950 p-12 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full -mr-48 -mt-48"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-400/20 rounded-full -ml-36 -mb-36"></div>

          {/* Logo/Brand */}
          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-white mb-2">TryWear</h2>
            <p className="text-blue-100">Platform e-commerce terpercaya Anda</p>
          </div>

          {/* Hero Image */}
          <div className="relative z-10 flex-1 flex items-center justify-center">
            <Image
              src="/image/hero-login.jpg"
              alt=""
              width={400}
              height={400}
              className="drop-shadow-lg"
            />
          </div>

          {/* Benefits */}
          <div className="relative z-10 space-y-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-400 flex items-center justify-center">
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
                <p className="text-white font-medium">Pembayaran Aman</p>
                <p className="text-blue-100 text-sm">
                  Enkripsi standar industri
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-400 flex items-center justify-center">
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
                <p className="text-white font-medium">Pengiriman Cepat</p>
                <p className="text-blue-100 text-sm">
                  Pengiriman cepat dan terpercaya
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-400 flex items-center justify-center">
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
                <div>
                  <p className="text-white font-medium">Dukungan 24/7</p>
                  <p className="text-blue-100 text-sm">Selalu siap membantu</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center p-4 lg:p-12">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Selamat Datang Kembali
              </h1>
              <p className="text-muted-foreground">
                Masuk ke akun TryWear Anda
              </p>
            </div>

            {/* Login Card */}
            <Card className="border-0 shadow-none">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl">Masuk</CardTitle>
                <CardDescription>
                  Masukkan kredensial Anda untuk mengakses akun
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Login Form */}
                <LoginForm />

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-card text-muted-foreground">
                      Atau lanjutkan dengan
                    </span>
                  </div>
                </div>

                {/* Social Login */}
                <SocialLoginButtons />

                {/* Footer Links */}
                <div className="space-y-3 text-sm">
                  <div className="text-center text-muted-foreground">
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

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg">
              <div className="flex gap-3">
                <div className="flex-shrink-0 text-blue-600 dark:text-blue-400">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Kami tidak pernah membagikan password Anda. Akun Anda
                  dilindungi dengan enkripsi standar industri.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
