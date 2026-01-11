"use client";

import { Button } from "@repo/ui/components/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/tabs";
import {
  AlertCircle,
  Camera,
  ChevronLeft,
  Download,
  Eye,
  EyeOff,
  ImagePlus,
  Loader2,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import AiTryOnMode from "@/features/product/components/ai-tryon-mode";
import { usePoseDetection } from "@/features/product/hooks/use-pose-detection";
import {
  calculateBodyMeasurements,
  calculateMeshCorners,
  drawClothingOverlay,
  drawPoseLandmarks,
  type NormalizedLandmark,
  type PoseResults,
} from "@/features/product/utils/clothing-overlay";
import { WebGLClothingRenderer } from "@/features/product/utils/webgl-clothing-renderer";
import axios from "@/lib/axios";

export default function VirtualTryOnPage() {
  const searchParams = useSearchParams();
  const productImage = searchParams.get("image");
  const productName = searchParams.get("name");
  const productId = searchParams.get("productId");

  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const webglCanvasRef = useRef<HTMLCanvasElement>(null);
  const clothingImageRef = useRef<HTMLImageElement | null>(null);
  const webglRendererRef = useRef<WebGLClothingRenderer | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeMode, setActiveMode] = useState<"camera" | "ai">("camera");
  const [showLandmarks, setShowLandmarks] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [useWebGL, setUseWebGL] = useState(true);
  const [currentImage, setCurrentImage] = useState<string | null>(productImage);
  const [currentName, setCurrentName] = useState<string | null>(productName);

  // Initialize WebGL renderer
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let disposed = false;

    const initWebGL = () => {
      if (disposed) return;

      if (webglCanvasRef.current && !webglRendererRef.current) {
        const renderer = new WebGLClothingRenderer();
        if (renderer.initialize(webglCanvasRef.current)) {
          webglRendererRef.current = renderer;
          setUseWebGL(true);

          if (clothingImageRef.current) {
            renderer.loadTexture(clothingImageRef.current);
          }
        } else {
          setUseWebGL(false);
        }
      } else if (!webglCanvasRef.current) {
        timeoutId = setTimeout(initWebGL, 100);
      }
    };

    timeoutId = setTimeout(initWebGL, 50);

    return () => {
      disposed = true;
      clearTimeout(timeoutId);
      if (webglRendererRef.current) {
        webglRendererRef.current.dispose();
        webglRendererRef.current = null;
      }
    };
  }, []);

  // Load clothing texture to WebGL
  useEffect(() => {
    if (imageLoaded && clothingImageRef.current && webglRendererRef.current) {
      webglRendererRef.current.loadTexture(clothingImageRef.current);
    }
  }, [imageLoaded]);

  // Load clothing image with background removal
  useEffect(() => {
    if (!currentImage) return;

    const loadImage = async () => {
      setIsProcessingImage(true);
      setImageLoaded(false);

      try {
        const response = await axios.post("/products/remove-bg", {
          imageUrl: currentImage,
        });

        const processedImageUrl = response.data?.data?.image;

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          clothingImageRef.current = img;
          setImageLoaded(true);
          setIsProcessingImage(false);
        };
        img.onerror = () => {
          loadOriginalImage();
        };
        img.src = processedImageUrl || currentImage;
      } catch (error) {
        loadOriginalImage();
      }
    };

    const loadOriginalImage = () => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        clothingImageRef.current = img;
        setImageLoaded(true);
        setIsProcessingImage(false);
      };
      img.onerror = () => {
        setImageLoaded(false);
        setIsProcessingImage(false);
      };
      img.src = currentImage!;
    };

    loadImage();

    return () => {
      clothingImageRef.current = null;
      setImageLoaded(false);
      setIsProcessingImage(false);
    };
  }, [currentImage]);

  // Handle pose results
  const handleResults = useCallback(
    (results: PoseResults) => {
      const canvas = canvasRef.current;
      const webglCanvas = webglCanvasRef.current;
      const video = webcamRef.current?.video;

      if (!canvas || !video) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const videoWidth = video.videoWidth || 640;
      const videoHeight = video.videoHeight || 480;

      canvas.width = videoWidth;
      canvas.height = videoHeight;

      if (webglCanvas) {
        webglCanvas.width = videoWidth;
        webglCanvas.height = videoHeight;
      }

      ctx.clearRect(0, 0, videoWidth, videoHeight);

      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(video, -videoWidth, 0, videoWidth, videoHeight);
      ctx.restore();

      if (results.poseLandmarks) {
        const mirroredLandmarks: NormalizedLandmark[] =
          results.poseLandmarks.map((landmark) => ({
            ...landmark,
            x: 1 - landmark.x,
          }));

        const meshCorners = calculateMeshCorners(
          { poseLandmarks: mirroredLandmarks },
          videoWidth,
          videoHeight,
        );

        let webglRendered = false;
        if (
          meshCorners &&
          clothingImageRef.current &&
          imageLoaded &&
          webglRendererRef.current &&
          useWebGL
        ) {
          try {
            webglRendererRef.current.render(
              videoWidth,
              videoHeight,
              meshCorners.topLeft,
              meshCorners.topRight,
              meshCorners.bottomLeft,
              meshCorners.bottomRight,
              0.9,
              false,
              meshCorners.leftElbow,
              meshCorners.rightElbow,
            );

            if (webglCanvas) {
              ctx.drawImage(webglCanvas, 0, 0);
              webglRendered = true;
            }
          } catch (e) {
            webglRendered = false;
          }
        }

        if (!webglRendered && clothingImageRef.current && imageLoaded) {
          const measurements = calculateBodyMeasurements(
            { poseLandmarks: mirroredLandmarks },
            videoWidth,
            videoHeight,
          );
          if (measurements) {
            drawClothingOverlay(
              ctx,
              clothingImageRef.current,
              measurements,
              videoWidth,
              videoHeight,
            );
          }
        }

        if (showLandmarks && mirroredLandmarks) {
          drawPoseLandmarks(ctx, mirroredLandmarks, videoWidth, videoHeight);
        }
      }
    },
    [imageLoaded, showLandmarks, useWebGL],
  );

  const { isLoading, isReady, error, startDetection, stopDetection } =
    usePoseDetection({
      onResults: handleResults,
      enabled: true,
    });

  useEffect(() => {
    if (isReady && webcamRef.current?.video && hasPermission) {
      startDetection(webcamRef.current.video);
    }

    return () => {
      stopDetection();
    };
  }, [isReady, hasPermission, startDetection, stopDetection]);

  const handleWebcamReady = useCallback(() => {
    setHasPermission(true);
    if (isReady && webcamRef.current?.video) {
      startDetection(webcamRef.current.video);
    }
  }, [isReady, startDetection]);

  const handleWebcamError = useCallback(() => {
    setHasPermission(false);
  }, []);

  const captureScreenshot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `virtual-try-on-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, []);

  // Handle file upload
  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setCurrentImage(dataUrl);
        setCurrentName(file.name);
      };
      reader.readAsDataURL(file);
    },
    [],
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/products">
              <Button variant="ghost" size="sm" className="gap-1.5">
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Kembali</span>
              </Button>
            </Link>
            <div className="border-l pl-3">
              <h1 className="text-base sm:text-lg font-semibold">
                Virtual Try-On
              </h1>
              {currentName && (
                <p className="text-xs text-muted-foreground line-clamp-1 max-w-[150px] sm:max-w-[250px]">
                  {currentName}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImagePlus className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Ganti Gambar</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Mode Tabs */}
          <Tabs
            value={activeMode}
            onValueChange={(value) => setActiveMode(value as "camera" | "ai")}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="camera" className="gap-2">
                <Camera className="w-4 h-4" />
                <span>Kamera Real-time</span>
              </TabsTrigger>
              <TabsTrigger value="ai" className="gap-2">
                <Sparkles className="w-4 h-4" />
                <span>Upload Foto (AI)</span>
              </TabsTrigger>
            </TabsList>

            {/* Camera Mode Content */}
            <TabsContent value="camera" className="mt-0">
              {/* Camera View */}
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                {/* Loading state */}
                {(isLoading || !isReady || isProcessingImage) &&
                  hasPermission !== false && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-10">
                      <Loader2 className="w-8 h-8 animate-spin mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {isProcessingImage
                          ? "Memproses gambar pakaian..."
                          : "Memuat model pose detection..."}
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
                  </div>
                )}

                {/* No image state */}
                {!currentImage && hasPermission !== false && !error && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-background z-10">
                    <ImagePlus className="w-12 h-12 text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground text-center max-w-md px-4 mb-4">
                      Pilih gambar pakaian untuk dicoba
                    </p>
                    <Button onClick={() => fileInputRef.current?.click()}>
                      <ImagePlus className="w-4 h-4 mr-2" />
                      Upload Gambar
                    </Button>
                  </div>
                )}

                {/* Hidden webcam */}
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

                {/* Hidden WebGL canvas */}
                <canvas
                  ref={webglCanvasRef}
                  className="absolute opacity-0 pointer-events-none"
                  width={640}
                  height={480}
                />

                {/* Main canvas */}
                <canvas ref={canvasRef} className="w-full h-full object-contain" />
              </div>

              {/* Controls */}
              <div className="mt-4 flex items-center justify-between gap-4">
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
                    disabled={!isReady || hasPermission === false || !currentImage}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Screenshot
                  </Button>
                </div>
              </div>

              {/* Instructions */}
              <div className="mt-6 p-4 bg-secondary/50 rounded-lg">
                <h3 className="font-semibold mb-2">Cara Menggunakan:</h3>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Upload gambar pakaian yang ingin dicoba</li>
                  <li>Izinkan akses kamera saat diminta</li>
                  <li>Berdiri di depan kamera dengan jarak yang cukup</li>
                  <li>Pakaian akan otomatis ditampilkan di tubuh Anda</li>
                  <li>Gunakan tombol Screenshot untuk menyimpan hasil</li>
                </ol>
              </div>
            </TabsContent>

            {/* AI Photo Mode Content */}
            <TabsContent value="ai" className="mt-0">
              {productId ? (
                <div className="rounded-lg border overflow-hidden">
                  <AiTryOnMode
                    productId={productId}
                    productName={currentName || undefined}
                    productImage={currentImage || undefined}
                    onClose={() => {}}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 bg-secondary/30 rounded-lg">
                  <Sparkles className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">AI Photo Try-On</h3>
                  <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
                    Untuk menggunakan fitur AI Photo Try-On, silakan pilih produk
                    terlebih dahulu dari halaman produk.
                  </p>
                  <Link href="/products">
                    <Button>
                      Lihat Produk
                    </Button>
                  </Link>
                </div>
              )}
              
              {/* AI Mode Instructions */}
              <div className="mt-6 p-4 bg-secondary/50 rounded-lg">
                <h3 className="font-semibold mb-2">Cara Menggunakan AI Try-On:</h3>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Upload foto selfie atau foto diri Anda</li>
                  <li>Klik tombol "Generate dengan AI"</li>
                  <li>Tunggu proses AI menghasilkan gambar</li>
                  <li>Download hasil jika sudah sesuai</li>
                </ol>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
