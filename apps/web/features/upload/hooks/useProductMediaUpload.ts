import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { removeFile } from "@/actions/utApi";
import { useServerAction } from "@/hooks/useServerAction";
import { api } from "@/lib/api";
import { useUploadThing } from "@/lib/uploadthing";
import type { Attachment } from "@/types/index";
import { useUploadStore } from "../store/useUploadStore";

export function useProductMediaUpload() {
  const [runAction] = useServerAction(removeFile);
  const {
    attachments,
    uploadProgress,
    setAttachments,
    setUploadProgress,
    removeAttachmentByName,
    resetAttachments,
  } = useUploadStore();

  const deleteProductImagesMutation = useMutation({
    mutationFn: api.product.deleteImage,
  });

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

    if (attachments.length + files.length > 5) {
      toast.error("Maksimal 5 file yang bisa ditangguh");
      return;
    }

    startUpload(files);
  }

  // Funsi ini menghapus salah satuh gambar yang di unggah dan menghapus juga yang di cloud
  function removeAttachment(attachment: Attachment) {
    if (attachment.key) {
      runAction(attachment.key);
      deleteProductImagesMutation.mutate(attachment.id!, {
        onSuccess: () => {
          toast.success("Berhasil menghapus gambar produk");
        },
        onError: () => {
          toast.error("Gagal menghapus gambar produk");
        },
      });
    }
    removeAttachmentByName(attachment.file.name);
  }

  // Fungsi ini digunakan ketika gambar sudah di unggah namun ingin hapus semua
  // maka yang di cloud juga akan dihapus juga
  function reset() {
    const keysToDelete = attachments.filter((a) => a.key).map((a) => a.key!);

    if (keysToDelete.length > 0) {
      runAction(keysToDelete);

      attachments.forEach((a) => {
        if (a.id) {
          deleteProductImagesMutation.mutateAsync(a.id, {
            onSuccess: () => {
              toast.success("Berhasil menghapus seluruh gambar produk");
            },
            onError: () => {
              toast.error("Gagal menghapus seluruh gambar produk");
            },
          });
        }
      });
    }

    resetAttachments();
  }

  return {
    startUpload: handleStartUpload,
    attachments,
    setAttachments,
    isUploading,
    uploadProgress,
    removeAttachment,
    reset,
  };
}
