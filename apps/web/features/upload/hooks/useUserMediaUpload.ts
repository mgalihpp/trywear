import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { useUploadThing } from "@/lib/uploadthing";
import type { Attachment } from "@/types/index";
import { useUploadStore } from "../store/useUploadStore";

export function useUserMediaUpload() {
  const {
    attachments,
    uploadProgress,
    setAttachments,
    setUploadProgress,
    removeAttachmentByName,
  } = useUploadStore();

  const { startUpload, isUploading } = useUploadThing("imageUploader", {
    onBeforeUploadBegin(files) {
      const renamedFiles = files.map((file) => {
        const extension = file.name.split(".").pop();
        return new File(
          [file],
          `trywear_attachment_${crypto.randomUUID()}.${extension}`,
          {
            type: file.type,
          },
        );
      });
      setAttachments((prev) => [
        ...prev,
        ...renamedFiles.map((f) => ({ file: f, isUploading: true })),
      ]);
      return renamedFiles;
    },
    onUploadProgress: setUploadProgress,
    async onClientUploadComplete(res) {
      setAttachments((prev) =>
        prev.map((a) => {
          const uploadResult = res.find((r) => r.name === a.file.name);
          if (!uploadResult) return a;
          return {
            ...a,
            key: uploadResult.key,
            url: uploadResult.ufsUrl,
            isUploading: false,
          };
        }),
      );
    },
    onUploadError(e) {
      // setAttachments((prev) => prev.filter((a) => !a.isUploading));
      toast.error(e.message);
    },
  });

  function handleStartUpload(files: File[]) {
    if (isUploading) {
      toast.info("Mohon tunggu hingga proses unggah selesai");
      return;
    }

    if (attachments.length + files.length > 1) {
      toast.error("Maksimal 1 file yang bisa ditangguh");
      return;
    }

    startUpload(files);
  }

  async function removeAttachment(attachment: Attachment) {
    await authClient.updateUser({
      image: null,
    });
    removeAttachmentByName(attachment.file.name);
  }

  return {
    startUpload: handleStartUpload,
    attachments,
    setAttachments,
    isUploading,
    uploadProgress,
    removeAttachment,
  };
}
