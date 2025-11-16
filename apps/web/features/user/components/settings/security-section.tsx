import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { sendEmail } from "@/actions/send-email";
import { useServerAction } from "@/hooks/useServerAction";
import { authClient } from "@/lib/auth-client";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Password lama wajib diisi"),
    newPassword: z.string().min(8, "Password minimal 8 karakter"),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
  });

export const SecuritySection = () => {
  const { data } = authClient.useSession();
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>(
    {},
  );

  const [runSendEmailAction, isPending] = useServerAction(sendEmail);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrors({});

    try {
      passwordSchema.parse(passwordData);

      authClient.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      runSendEmailAction({
        subject: "Password Changed",
        to: data?.user.email!,
        type: "password-changed",
      });
      toast.success("Password berhasil diubah");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setPasswordErrors(fieldErrors);
        toast.error("Mohon perbaiki data yang salah");
      }
    }
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">Keamanan Akun</h2>
      <form onSubmit={handlePasswordSubmit} className="space-y-6">
        <div>
          <Label htmlFor="currentPassword">Password Lama</Label>
          <Input
            id="currentPassword"
            autoComplete="current-password"
            type="password"
            value={passwordData.currentPassword}
            onChange={(e) =>
              setPasswordData({
                ...passwordData,
                currentPassword: e.target.value,
              })
            }
            className="mt-2"
          />
          {passwordErrors.currentPassword && (
            <p className="text-sm text-destructive mt-1">
              {passwordErrors.currentPassword}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="newPassword">Password Baru</Label>
          <Input
            id="newPassword"
            autoComplete="new-password"
            type="password"
            value={passwordData.newPassword}
            onChange={(e) =>
              setPasswordData({
                ...passwordData,
                newPassword: e.target.value,
              })
            }
            className="mt-2"
          />
          {passwordErrors.newPassword && (
            <p className="text-sm text-destructive mt-1">
              {passwordErrors.newPassword}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
          <Input
            id="confirmPassword"
            autoComplete="new-password"
            type="password"
            value={passwordData.confirmPassword}
            onChange={(e) =>
              setPasswordData({
                ...passwordData,
                confirmPassword: e.target.value,
              })
            }
            className="mt-2"
          />
          {passwordErrors.confirmPassword && (
            <p className="text-sm text-destructive mt-1">
              {passwordErrors.confirmPassword}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full md:w-auto" disabled={isPending}>
          Ubah Password
        </Button>
      </form>
    </div>
  );
};
