"use client";

import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import {
  AlertCircle,
  Camera,
  Download,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { usePoseDetection } from "../hooks/use-pose-detection";
import {
  calculateBodyMeasurements,
  drawClothingOverlay,
  drawPoseLandmarks,
  type NormalizedLandmark,
  type PoseResults,
} from "../utils/clothing-overlay";

interface VirtualTryOnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productImage?: string;
  productName?: string;
}

export default function VirtualTryOnDialog({
  open,
  onOpenChange,
  productImage,
  productName,
}: VirtualTryOnDialogProps) {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const clothingImageRef = useRef<HTMLImageElement | null>(null);

  const [showLandmarks, setShowLandmarks] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Load clothing image
  useEffect(() => {
    if (!productImage) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      clothingImageRef.current = img;
      setImageLoaded(true);
    };
    img.onerror = () => {
      console.error("Failed to load product image");
      setImageLoaded(false);
    };
    img.src = productImage;

    return () => {
      clothingImageRef.current = null;
      setImageLoaded(false);
    };
  }, [productImage]);

  // Handle pose results - draw overlay
  const handleResults = useCallback(
    (results: PoseResults) => {
      const canvas = canvasRef.current;
      const video = webcamRef.current?.video;

      if (!canvas || !video) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Set canvas size to match video
      const videoWidth = video.videoWidth || 640;
      const videoHeight = video.videoHeight || 480;

      canvas.width = videoWidth;
      canvas.height = videoHeight;

      // Clear canvas
      ctx.clearRect(0, 0, videoWidth, videoHeight);

      // Draw mirrored video frame
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(video, -videoWidth, 0, videoWidth, videoHeight);
      ctx.restore();

      // If we have pose landmarks, draw clothing overlay
      if (results.poseLandmarks) {
        // Mirror landmarks for overlay calculation
        const mirroredLandmarks: NormalizedLandmark[] =
          results.poseLandmarks.map((landmark) => ({
            ...landmark,
            x: 1 - landmark.x, // Mirror x coordinate
          }));

        const measurements = calculateBodyMeasurements(
          { poseLandmarks: mirroredLandmarks },
          videoWidth,
          videoHeight,
        );

        // Draw clothing overlay
        if (measurements && clothingImageRef.current && imageLoaded) {
          drawClothingOverlay(
            ctx,
            clothingImageRef.current,
            measurements,
            videoWidth,
            videoHeight,
          );
        }

        // Draw debug landmarks if enabled
        if (showLandmarks && mirroredLandmarks) {
          drawPoseLandmarks(ctx, mirroredLandmarks, videoWidth, videoHeight);
        }
      }
    },
    [imageLoaded, showLandmarks],
  );

  const { isLoading, isReady, error, startDetection, stopDetection } =
    usePoseDetection({
      onResults: handleResults,
      enabled: open,
    });

  // Start detection when dialog opens and pose is ready
  useEffect(() => {
    if (open && isReady && webcamRef.current?.video && hasPermission) {
      startDetection(webcamRef.current.video);
    }

    return () => {
      if (!open) {
        stopDetection();
      }
    };
  }, [open, isReady, hasPermission, startDetection, stopDetection]);

  // Handle webcam ready
  const handleWebcamReady = useCallback(() => {
    setHasPermission(true);
    if (isReady && webcamRef.current?.video) {
      startDetection(webcamRef.current.video);
    }
  }, [isReady, startDetection]);

  // Handle webcam error
  const handleWebcamError = useCallback(() => {
    setHasPermission(false);
  }, []);

  // Capture screenshot
  const captureScreenshot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `virtual-try-on-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, []);

  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      stopDetection();
      setHasPermission(null);
    }
  }, [open, stopDetection]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Virtual Try-On
            {productName && (
              <span className="text-muted-foreground font-normal">
                - {productName}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="relative bg-black aspect-video w-full">
          {/* Loading state */}
          {(isLoading || !isReady) && hasPermission !== false && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-10">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <p className="text-sm text-muted-foreground">
                Memuat model pose detection...
              </p>
            </div>
          )}

          {/* Error state */}
          {(error || hasPermission === false) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background z-10">
              <AlertCircle className="w-12 h-12 text-destructive mb-4" />
              <p className="text-sm text-muted-foreground text-center max-w-md px-4">
                {error ||
                  "Tidak dapat mengakses kamera. Pastikan Anda telah memberikan izin akses kamera di browser."}
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => onOpenChange(false)}
              >
                Tutup
              </Button>
            </div>
          )}

          {/* Hidden webcam - used as video source */}
          <Webcam
            ref={webcamRef}
            audio={false}
            mirrored={false}
            onUserMedia={handleWebcamReady}
            onUserMediaError={handleWebcamError}
            className="absolute opacity-0 pointer-events-none"
            videoConstraints={{
              width: 640,
              height: 480,
              facingMode: "user",
            }}
          />

          {/* Canvas for rendering overlay */}
          <canvas ref={canvasRef} className="w-full h-full object-contain" />
        </div>

        {/* Controls */}
        <div className="p-4 flex items-center justify-between gap-4 border-t">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLandmarks(!showLandmarks)}
            >
              {showLandmarks ? (
                <EyeOff className="w-4 h-4 mr-2" />
              ) : (
                <Eye className="w-4 h-4 mr-2" />
              )}
              {showLandmarks ? "Sembunyikan Pose" : "Tampilkan Pose"}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={captureScreenshot}
              disabled={!isReady || hasPermission === false}
            >
              <Download className="w-4 h-4 mr-2" />
              Screenshot
            </Button>
            <Button size="sm" onClick={() => onOpenChange(false)}>
              Selesai
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
