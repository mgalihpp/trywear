"use client";

import { Alert, AlertDescription } from "@repo/ui/components/alert";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { getBaseUrl } from "@repo/ui/lib/utils";
import { AlertCircle, CheckCircle2, Loader2, Mail } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Validation
    if (!email) {
      setError("Silakan masukkan alamat email Anda");
      setIsLoading(false);
      return;
    }

    if (!email.includes("@")) {
      setError("Silakan masukkan alamat email yang valid");
      setIsLoading(false);
      return;
    }

    // Simulate API call
    // setTimeout(() => {
    //   setSuccess(true);
    //   setIsLoading(false);
    // }, 1500);

    const { data, error } = await authClient.requestPasswordReset({
      email,
      redirectTo: `${getBaseUrl()}/reset-password`,
    });

    if (error) {
      setError(error.message!);
      setIsLoading(false);
      return;
    }

    if (data) {
      setSuccess(true);
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-4 text-center">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-foreground mb-2">
            Periksa Email Anda
          </h3>
          <p className="text-sm text-muted-foreground">
            Kami telah mengirimkan tautan reset password ke{" "}
            <span className="font-medium text-foreground">{email}</span>
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Tautan akan kedaluwarsa dalam 24 jam. Jika Anda tidak melihat email tersebut, periksa folder spam Anda.
        </p>
        <Button
          variant="outline"
          className="w-full bg-transparent"
          onClick={() => {
            setSuccess(false);
            setEmail("");
          }}
        >
          Coba Email Lain
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Email Field */}
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-foreground">
          Alamat Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="anda@contoh.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10"
            disabled={isLoading}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Masukkan alamat email yang terdaftar pada akun Anda
        </p>
      </div>

      {/* Submit Button */}
      <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Mengirim...
          </>
        ) : (
          "Kirim Tautan Reset"
        )}
      </Button>
    </form>
  );
}
