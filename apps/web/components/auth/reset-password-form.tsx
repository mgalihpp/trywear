"use client";

import { Alert, AlertDescription } from "@repo/ui/components/alert";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import type React from "react";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const validatePassword = (pwd: string) => {
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasLowerCase = /[a-z]/.test(pwd);
    const hasNumbers = /\d/.test(pwd);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    const isLongEnough = pwd.length >= 8;

    return {
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
      isLongEnough,
      isValid:
        hasUpperCase &&
        hasLowerCase &&
        hasNumbers &&
        hasSpecialChar &&
        isLongEnough,
    };
  };

  const passwordValidation = validatePassword(formData.password);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Validation
    if (!formData.password || !formData.confirmPassword) {
      setError("Silakan isi semua kolom");
      setIsLoading(false);
      return;
    }

    if (!passwordValidation.isValid) {
      setError("Password tidak memenuhi persyaratan");
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Password tidak cocok");
      setIsLoading(false);
      return;
    }

    const { data, error } = await authClient.resetPassword({
      newPassword: formData.password,
      token: token!,
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
            Reset Password Berhasil
          </h3>
          <p className="text-sm text-muted-foreground">
            Password Anda berhasil direset. Anda sekarang dapat masuk dengan password baru Anda.
          </p>
        </div>
        <Button className="w-full" onClick={() => router.push("/login")}>
          Kembali ke Halaman Masuk
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

      {/* Password Field */}
      <div className="space-y-2">
        <label
          htmlFor="password"
          className="text-sm font-medium text-foreground"
        >
          Password Baru
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            className="pl-10 pr-10"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            disabled={isLoading}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Password Strength Indicator */}
        {formData.password && (
          <div className="space-y-2 mt-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <p className="text-xs font-medium text-foreground">
              Persyaratan Password:
            </p>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordValidation.hasUpperCase ? "bg-green-500" : "bg-slate-300"}`}
                >
                  {passwordValidation.hasUpperCase && (
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  )}
                </div>
                <span
                  className={
                    passwordValidation.hasUpperCase
                      ? "text-green-700 dark:text-green-300"
                      : "text-muted-foreground"
                  }
                >
                  Huruf besar
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordValidation.hasLowerCase ? "bg-green-500" : "bg-slate-300"}`}
                >
                  {passwordValidation.hasLowerCase && (
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  )}
                </div>
                <span
                  className={
                    passwordValidation.hasLowerCase
                      ? "text-green-700 dark:text-green-300"
                      : "text-muted-foreground"
                  }
                >
                  Huruf kecil
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordValidation.hasNumbers ? "bg-green-500" : "bg-slate-300"}`}
                >
                  {passwordValidation.hasNumbers && (
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  )}
                </div>
                <span
                  className={
                    passwordValidation.hasNumbers
                      ? "text-green-700 dark:text-green-300"
                      : "text-muted-foreground"
                  }
                >
                  Angka
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordValidation.hasSpecialChar ? "bg-green-500" : "bg-slate-300"}`}
                >
                  {passwordValidation.hasSpecialChar && (
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  )}
                </div>
                <span
                  className={
                    passwordValidation.hasSpecialChar
                      ? "text-green-700 dark:text-green-300"
                      : "text-muted-foreground"
                  }
                >
                  Karakter spesial (!@#$%^&*)
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordValidation.isLongEnough ? "bg-green-500" : "bg-slate-300"}`}
                >
                  {passwordValidation.isLongEnough && (
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  )}
                </div>
                <span
                  className={
                    passwordValidation.isLongEnough
                      ? "text-green-700 dark:text-green-300"
                      : "text-muted-foreground"
                  }
                >
                  Minimal 8 karakter
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Password Field */}
      <div className="space-y-2">
        <label
          htmlFor="confirmPassword"
          className="text-sm font-medium text-foreground"
        >
          Konfirmasi Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="pl-10 pr-10"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            disabled={isLoading}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={isLoading || !passwordValidation.isValid}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Mereset Password...
          </>
        ) : (
          "Reset Password"
        )}
      </Button>
    </form>
  );
}
