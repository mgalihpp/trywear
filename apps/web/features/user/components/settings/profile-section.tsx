import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { useDropzone } from "@uploadthing/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useUserMediaUpload } from "@/features/upload/hooks/useUserMediaUpload";
import { authClient } from "@/lib/auth-client";

const profileSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi").max(100),
  email: z.email("Email tidak valid").max(255),
  phone: z.string().trim().min(10, "Nomor telepon minimal 10 digit").max(15),
});

export const ProfileSection = () => {
  const { data } = authClient.useSession();
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    avatar: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const { attachments, isUploading, startUpload, uploadProgress } =
    useUserMediaUpload();

  const { getInputProps, getRootProps } = useDropzone({
    maxFiles: 1,
    accept: {
      "image/jpeg": [".jpeg", ".jpg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
      "image/gif": [".gif"],
    },
    onDrop: startUpload,
  });

  const { ...rootProps } = getRootProps();

  useEffect(() => {
    if (data?.user.id) {
      setProfileData({
        name: data.user.name,
        email: data.user.email,
        phone: "",
        avatar: data.user.image ?? "",
      });
    }
  }, [data?.user.id]);

  const [profileErrors, setProfileErrors] = useState<Record<string, string>>(
    {},
  );

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setProfileErrors({});

    try {
      profileSchema.parse(profileData);

      await authClient.updateUser({
        image: profileData.avatar,
        name: profileData.name,
      });

      toast.success("Profil berhasil diperbarui");
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setProfileErrors(fieldErrors);
        toast.error("Mohon perbaiki data yang salah");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      startUpload(Array.from(files));
    } catch (err) {
      toast.error("Gagal mengunggah foto");
    }
  };

  // ketika upload selesai, update avatar preview
  useEffect(() => {
    if (attachments.length > 0) {
      const uploadedUrl = attachments[0]?.url;
      if (uploadedUrl) {
        setProfileData((prev) => ({ ...prev, avatar: uploadedUrl }));
      }
    }
  }, [attachments]);

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold mb-6">Biodata Diri</h2>

      {/* Foto Profil */}
      <div
        className="flex items-center gap-6 mb-8 pb-8 border-b border-border"
        {...rootProps}
      >
        <div className="relative w-24 h-24">
          {profileData.avatar ? (
            <img
              src={profileData.avatar}
              alt="Avatar"
              className="w-full h-full rounded-full object-cover border-2 border-border"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-secondary border-2 border-border flex items-center justify-center text-4xl font-bold">
              {profileData.name.charAt(0)}
            </div>
          )}

          {/* Progress bar overlay */}
          {isUploading && (
            <div className="absolute inset-0 bg-black/70 rounded-full flex items-center justify-center">
              <div className="relative w-20 h-20">
                {/* Circular Progress */}
                <CircularProgress progress={uploadProgress} />

                {/* Optional: Spinner kecil di tengah */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="flex-1">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            {...getInputProps()}
            onChange={handleFileChange}
          />
          <h3 className="font-bold text-lg mb-2">{profileData.name}</h3>
          <Button type="button" variant="outline" size="sm">
            Pilih Foto
          </Button>
        </div>
      </div>

      <form onSubmit={handleProfileSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="name">Nama Lengkap</Label>
            <Input
              id="name"
              value={profileData.name}
              onChange={(e) =>
                setProfileData({ ...profileData, name: e.target.value })
              }
              className="mt-2"
            />
            {profileErrors.name && (
              <p className="text-sm text-destructive mt-1">
                {profileErrors.name}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="phone">Nomor Telepon</Label>
            <Input
              id="phone"
              value={profileData.phone}
              onChange={(e) =>
                setProfileData({ ...profileData, phone: e.target.value })
              }
              className="mt-2"
            />
            {profileErrors.phone && (
              <p className="text-sm text-destructive mt-1">
                {profileErrors.phone}
              </p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={profileData.email}
            onChange={(e) =>
              setProfileData({ ...profileData, email: e.target.value })
            }
            className="mt-2"
          />
          {profileErrors.email && (
            <p className="text-sm text-destructive mt-1">
              {profileErrors.email}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full md:w-auto"
          disabled={isUploading || isLoading}
        >
          Simpan Perubahan
        </Button>
      </form>
    </div>
  );
};

const CircularProgress = ({ progress }: { progress: number }) => {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="absolute text-white text-xs font-medium">{progress}%</div>
    </div>
  );
};
