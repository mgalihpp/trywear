import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@repo/ui/components/empty";
import { Progress } from "@repo/ui/components/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { useDropzone } from "@uploadthing/react";
import { Image, Upload, X } from "lucide-react";
import { type ClipboardEvent, useRef } from "react";
import { toast } from "sonner";
import { useProductMediaUpload } from "@/features/upload/hooks/useProductMediaUpload";

export const ProductImageUpload = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const {
    attachments,
    isUploading,
    removeAttachment,
    reset,
    startUpload,
    uploadProgress,
  } = useProductMediaUpload();

  const { getInputProps, getRootProps, isDragActive } = useDropzone({
    maxFiles: 5 - attachments.length,
    onDrop: startUpload,
  });

  const { onClick: _, ...rootProps } = getRootProps();

  function onPaste(e: ClipboardEvent<HTMLInputElement>) {
    const files = Array.from(e.clipboardData.items)
      .filter((item) => item.kind === "file")
      .map((item) => item.getAsFile()) as File[];

    startUpload(files);
  }

  console.log(attachments);

  return (
    <Card className="mb-8">
      <CardHeader>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild className="w-fit">
              <CardTitle className="flex items-center gap-2 cursor-help border-dashed border-b border-foreground">
                Upload Gambar Produk
              </CardTitle>
            </TooltipTrigger>
            <TooltipContent className="w-56">
              Unggah gambar produk utama dan tambahan untuk ditampilkan di
              katalog atau halaman detail. Maksimal hingga 5
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <CardDescription>
          Unggah gambar produk Anda dengan mudah
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {attachments.length < 5 && (
          <div
            {...rootProps}
            className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-all duration-300 ease-in-out ${
              isDragActive
                ? "border-primary bg-primary/5 shadow-lg scale-[1.02]"
                : "border-muted-foreground/25 hover:border-primary/50 hover:bg-accent"
            }`}
            onPaste={onPaste}
          >
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
              multiple
              {...getInputProps()}
            />

            <label
              htmlFor="file-upload"
              className="flex cursor-pointer flex-col items-center justify-center gap-4"
            >
              <div className="rounded-full bg-primary/10 p-6 transition-transform duration-300">
                <Upload className="h-12 w-12 text-primary" />
              </div>

              <div className="space-y-2">
                <p className="text-xl font-semibold text-foreground">
                  Seret & lepas gambar di sini
                </p>
                <p className="text-sm text-muted-foreground">
                  atau klik untuk memilih file
                </p>
              </div>

              <Button
                type="button"
                variant="default"
                size="lg"
                className="mt-2"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("file-upload")?.click();
                }}
              >
                Pilih Gambar
              </Button>

              <p className="mt-4 text-xs text-muted-foreground">
                Format: JPG, PNG, WEBP, GIF • Maksimal: 5MB per file
              </p>
            </label>
          </div>
        )}
        {attachments.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Gambar Terupload ({attachments.length})</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    reset();
                    toast.success("Semua gambar dihapus");
                  }}
                >
                  Hapus Semua
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {attachments.map((attachment) => (
                  <div
                    key={attachment.id ? attachment.id : attachment.file.name}
                    className="group relative overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-md"
                  >
                    <div className="aspect-square relative">
                      <img
                        src={
                          attachment.url
                            ? attachment.url
                            : URL.createObjectURL(attachment.file)
                        }
                        alt={attachment.file.name}
                        className="h-full w-full object-cover"
                      />

                      {/*  Progress bar overlay */}
                      {isUploading && attachment.isUploading && (
                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/60">
                          <Progress
                            value={uploadProgress ?? 0}
                            indicatorClassName="bg-green-500"
                            className="h-2 bg-white"
                          />
                          <p className="text-xs text-white mt-1 text-right">
                            {Math.round(uploadProgress ?? 0)}%
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                    <div className="absolute bottom-0 left-0 right-0 p-3 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <p className="truncate text-sm font-medium">
                        {attachment.file.name}
                      </p>
                      <p className="text-xs text-white/80">
                        {(attachment.file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>

                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute right-2 top-2 h-8 w-8 opacity-0 shadow-lg transition-opacity duration-300 group-hover:opacity-100"
                      onClick={() => removeAttachment(attachment)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {attachments.length === 0 && (
          <Card className="text-center">
            <CardContent className="py-12">
              <Empty className="border border-dashed">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Image />
                  </EmptyMedia>
                  <EmptyTitle>Foto produk kosong</EmptyTitle>
                  <EmptyDescription>
                    Unggah berkas untuk menambahkan foto produk.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleButtonClick}
                  >
                    Unggah Berkas
                  </Button>
                </EmptyContent>
              </Empty>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};
