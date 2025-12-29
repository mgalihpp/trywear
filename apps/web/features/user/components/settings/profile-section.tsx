import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { useQuery } from "@tanstack/react-query";
import { useDropzone } from "@uploadthing/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useUserMediaUpload } from "@/features/upload/hooks/useUserMediaUpload";
import { api } from "@/lib/api";
import { authClient } from "@/lib/auth-client";

const profileSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi").max(100),
  email: z.email("Email tidak valid").max(255),
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
  const [isDirty, setIsDirty] = useState(false);
  const initialDataRef = useRef(profileData);

  const {
    attachments,
    isUploading,
    startUpload,
    uploadProgress,
    setAttachments,
  } = useUserMediaUpload();

  const { data: segments } = useQuery({
    queryKey: ["segments"],
    queryFn: () => api.segment.getAll(),
  });

  const userSegment = segments?.find(
    (s) => s.id === (data?.user as any)?.segment_id,
  );

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

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (data?.user.id) {
      const initialData = {
        name: data?.user.name || "",
        email: data?.user.email || "",
        phone: "",
        avatar: data?.user.image || "",
      };

      initialDataRef.current = initialData;
      setProfileData(initialData);
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
      setIsDirty(false);
      initialDataRef.current = { ...profileData };
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
      setAttachments([]);
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
      console.error(err);
    }
  };

  const handleChange = (field: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));

    // Cek apakah ada perubahan
    const isChanged =
      JSON.stringify(profileData) !== JSON.stringify(initialDataRef.current);
    setIsDirty(isChanged);
  };

  // Update handler untuk semua input
  const updateName = (e: React.ChangeEvent<HTMLInputElement>) =>
    handleChange("name", e.target.value);

  const updatePhone = (e: React.ChangeEvent<HTMLInputElement>) =>
    handleChange("phone", e.target.value);

  const updateEmail = (e: React.ChangeEvent<HTMLInputElement>) =>
    handleChange("email", e.target.value);

  // ketika upload selesai, update avatar preview
  useEffect(() => {
    if (attachments.length > 0) {
      const uploadedUrl = attachments[0]?.url;
      if (uploadedUrl) {
        setProfileData((prev) => ({ ...prev, avatar: uploadedUrl }));
        setIsDirty(true);
      }
    }
  }, [attachments]);

  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Ada perubahan yang belum disimpan. Yakin mau keluar?";
      return "Ada perubahan yang belum disimpan. Yakin mau keluar?";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const isUpdating = isUploading || isLoading;

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
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-bold text-lg">{profileData.name}</h3>
            {userSegment && (
              <Badge
                variant="outline"
                style={{
                  backgroundColor: `${userSegment.color}10`,
                  color: userSegment.color ?? undefined,
                  borderColor: `${userSegment.color}40`,
                  fontWeight: 600,
                }}
              >
                {userSegment.name} Member
              </Badge>
            )}
          </div>
          <Button type="button" variant="outline" size="sm">
            Pilih Foto
          </Button>
        </div>
      </div>

      <form onSubmit={handleProfileSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 max-w-md">
          <div>
            <Label htmlFor="name">Nama Lengkap</Label>
            <Input
              id="name"
              value={profileData.name}
              onChange={updateName}
              className="mt-2"
            />
            {profileErrors.name && (
              <p className="text-sm text-destructive mt-1">
                {profileErrors.name}
              </p>
            )}
          </div>

          {/* <div>
            <Label htmlFor="phone">Nomor Telepon</Label>
            <Input
              id="phone"
              value={profileData.phone}
              onChange={updatePhone}
              className="mt-2"
            />
            {profileErrors.phone && (
              <p className="text-sm text-destructive mt-1">
                {profileErrors.phone}
              </p>
            )}
          </div> */}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={profileData.email}
              onChange={updateEmail}
              readOnly
              disabled
              className="mt-2"
            />
            {profileErrors.email && (
              <p className="text-sm text-destructive mt-1">
                {profileErrors.email}
              </p>
            )}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full md:w-auto"
          disabled={isUploading || isLoading}
        >
          {isUpdating ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      </form>
    </div>
  );
};

const CircularProgress = ({ progress }: { progress: number }) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="absolute text-white text-xs font-medium">{progress}%</div>
    </div>
  );
};
