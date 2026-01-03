import type { Product } from "@repo/db";
import {
  type CreateProductReviewInput,
  createProductReviewSchema,
} from "@repo/schema";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@repo/ui/components/drawer";
import { Textarea } from "@repo/ui/components/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { api } from "@/lib/api";

interface ReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
}

const ReviewDialog = ({ open, onOpenChange, product }: ReviewDialogProps) => {
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createProductReviewMutation = useMutation({
    mutationFn: (input: CreateProductReviewInput) =>
      api.product.review.create(input),
    onSuccess: () => {
      // Invalidate user orders to refresh review status
      queryClient.invalidateQueries({ queryKey: ["user-order"] });
    },
  });

  const isSubmitting = createProductReviewMutation.isPending;

  const resetForm = () => {
    setRating(0);
    setHoveredRating(0);
    setComment("");
    setErrors({});
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const parsed = createProductReviewSchema.parse({
        product_id: product.id,
        rating,
        body: comment,
      });

      await createProductReviewMutation.mutateAsync(parsed, {
        onSuccess: () => {
          toast.success("Ulasan berhasil dikirim. Terima kasih!");
          handleClose();
        },
        onError: () => {
          toast.error("Terjadi kesalahan saat mengirim ulasan");
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
        toast.error("Mohon lengkapi ulasan Anda");
        return;
      }
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-6 pt-4">
      <div>
        <p className="text-sm font-medium mb-2">Produk</p>
        <p className="text-muted-foreground">{product.title}</p>
      </div>

      <div>
        <p className="text-sm font-medium mb-3">Rating *</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                disabled={isSubmitting}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`h-8 w-8 transition-colors ${
                    star <= (hoveredRating || rating)
                      ? "fill-current text-foreground"
                      : "text-border"
                  }`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <span className="ml-2 text-sm text-muted-foreground">
              {rating} dari 5
            </span>
          )}
        </div>
        {errors.rating && (
          <p className="text-sm text-destructive mt-1">{errors.rating}</p>
        )}
      </div>

      <div>
        <p className="text-sm font-medium mb-2">Ulasan Anda *</p>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Ceritakan pengalaman Anda dengan produk ini..."
          rows={5}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground mt-1">
          {comment.length}/500 karakter
        </p>
        {errors.comment && (
          <p className="text-sm text-destructive mt-1">{errors.comment}</p>
        )}
      </div>

      <div className="flex gap-4 pt-4">
        <Button
          type="button"
          variant="outline"
          className="flex-1 h-12"
          onClick={handleClose}
          disabled={isSubmitting}
        >
          Batal
        </Button>
        <Button type="submit" className="flex-1 h-12" disabled={isSubmitting}>
          {isSubmitting ? "Mengirim..." : "Kirim Ulasan"}
        </Button>
      </div>
    </form>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="w-full rounded-t-3xl px-6 pb-6 gap-0">
          <DrawerHeader>
            <DrawerTitle className="text-2xl font-bold">
              Tulis Ulasan
            </DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto px-1">{formContent}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Tulis Ulasan</DialogTitle>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
};

export default ReviewDialog;

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
};
