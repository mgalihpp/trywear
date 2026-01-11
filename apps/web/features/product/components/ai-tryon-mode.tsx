"use client";

import { Button } from "@repo/ui/components/button";
import {
  AlertCircle,
  ArrowRight,
  Camera,
  CheckCircle2,
  Download,
  ImagePlus,
  Loader2,
  RotateCcw,
  Sparkles,
  SwitchCamera,
  Upload,
  Wand2,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import Webcam from "react-webcam";

// Direct API instance to bypass Next.js proxy timeout for long-running AI requests
const directApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_API_URL || "http://localhost:5000/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 300000, // 5 minutes
});

interface AiTryOnModeProps {
  productId: string;
  productName?: string;
  productImage?: string;
  onClose: () => void;
}

interface GenerationResult {
  image: string;
  productName: string;
}

// Loading steps for informative progress
const LOADING_STEPS = [
  { id: 1, text: "Menganalisis foto...", duration: 3000 },
  { id: 2, text: "Memproses gambar pakaian...", duration: 5000 },
  { id: 3, text: "AI sedang membuat virtual try-on...", duration: 20000 },
  { id: 4, text: "Menyempurnakan hasil...", duration: 15000 },
  { id: 5, text: "Hampir selesai...", duration: 30000 },
];

type InputMode = "upload" | "camera";

export default function AiTryOnMode({
  productId,
  productName,
  productImage,
  onClose,
}: AiTryOnModeProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const webcamRef = useRef<Webcam>(null);

  const [inputMode, setInputMode] = useState<InputMode>("upload");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] =
    useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Camera state
  const [cameraReady, setCameraReady] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  
  // Loading progress state
  const [currentStep, setCurrentStep] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Loading timer effect
  useEffect(() => {
    if (!isGenerating) {
      setCurrentStep(0);
      setElapsedTime(0);
      return;
    }

    // Update elapsed time every second
    const timerInterval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    // Progress through loading steps
    let stepTimeouts: NodeJS.Timeout[] = [];
    let cumulativeTime = 0;
    
    LOADING_STEPS.forEach((step, index) => {
      const timeout = setTimeout(() => {
        setCurrentStep(index + 1);
      }, cumulativeTime);
      stepTimeouts.push(timeout);
      cumulativeTime += step.duration;
    });

    return () => {
      clearInterval(timerInterval);
      stepTimeouts.forEach((t) => clearTimeout(t));
    };
  }, [isGenerating]);

  // Handle file selection
  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Silakan pilih file gambar (JPG, PNG, dll.)");
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError("Ukuran file maksimal 10MB");
        return;
      }

      // Read file as base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setUploadedImage(base64);
        setError(null);
        setGeneratedResult(null);
      };
      reader.onerror = () => {
        setError("Gagal membaca file gambar");
      };
      reader.readAsDataURL(file);
    },
    [],
  );

  // Trigger file input click
  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Handle drag and drop
  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const file = event.dataTransfer.files?.[0];
    if (!file) return;

    // Validate and process
    if (!file.type.startsWith("image/")) {
      setError("Silakan pilih file gambar (JPG, PNG, dll.)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Ukuran file maksimal 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setUploadedImage(base64);
      setError(null);
      setGeneratedResult(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
    },
    [],
  );

  // Capture photo from camera
  const handleCapturePhoto = useCallback(() => {
    if (!webcamRef.current) return;
    
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      setUploadedImage(imageSrc);
      setError(null);
      setGeneratedResult(null);
    }
  }, []);

  // Switch camera (front/back)
  const handleSwitchCamera = useCallback(() => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  }, []);

  // Generate AI try-on
  const handleGenerate = useCallback(async () => {
    if (!uploadedImage) {
      setError("Silakan upload atau ambil foto terlebih dahulu");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Use direct API call to bypass Next.js proxy timeout
      const response = await directApi.post("/tryon/ai-generate", {
        personImage: uploadedImage,
        productId: productId,
      });

      if (response.data?.success && response.data?.data) {
        setGeneratedResult(response.data.data);
      } else {
        setError(response.data?.message || "Gagal generate gambar");
      }
    } catch (err: unknown) {
      console.error("AI try-on generation error:", err);
      if (
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof (err as { response?: { data?: { message?: string } } })
          .response === "object"
      ) {
        const errorMessage = (
          err as { response?: { data?: { message?: string } } }
        ).response?.data?.message;
        setError(errorMessage || "Gagal generate gambar. Silakan coba lagi.");
      } else {
        setError("Gagal generate gambar. Silakan coba lagi.");
      }
    } finally {
      setIsGenerating(false);
    }
  }, [uploadedImage, productId]);

  // Reset and try again
  const handleReset = useCallback(() => {
    setUploadedImage(null);
    setGeneratedResult(null);
    setError(null);
    setCameraReady(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  // Download generated image
  const handleDownload = useCallback(() => {
    if (!generatedResult?.image) return;

    const link = document.createElement("a");
    link.download = `trywear-${productName || "tryon"}-${Date.now()}.png`;
    link.href = generatedResult.image;
    link.click();
  }, [generatedResult, productName]);

  // Format elapsed time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Main content area */}
      <div className="relative bg-gradient-to-br from-muted/30 to-muted/50 min-h-[400px] w-full flex items-center justify-center">
        {/* Error state */}
        {error && (
          <div className="absolute top-4 left-4 right-4 z-10">
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Show before/after comparison */}
        {generatedResult && uploadedImage ? (
          <div className="w-full h-full p-4">
            <div className="flex flex-col lg:flex-row items-center justify-center gap-4 h-full">
              {/* Before - Original Photo */}
              <div className="relative flex-1 flex flex-col items-center max-w-[400px]">
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 px-3 py-1 bg-muted rounded-full text-xs font-medium z-10 shadow-sm">
                  Sebelum
                </div>
                <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden shadow-lg border-2 border-muted">
                  <img
                    src={uploadedImage}
                    alt="Foto Asli"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Arrow indicator */}
              <div className="flex items-center justify-center p-2">
                <div className="p-3 rounded-full bg-primary/10 text-primary">
                  <ArrowRight className="w-6 h-6 lg:rotate-0 rotate-90" />
                </div>
              </div>

              {/* After - AI Generated */}
              <div className="relative flex-1 flex flex-col items-center max-w-[400px]">
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground rounded-full text-xs font-medium z-10 shadow-sm flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Sesudah (AI)
                </div>
                <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden shadow-lg border-2 border-primary/30 ring-2 ring-primary/20">
                  <img
                    src={generatedResult.image}
                    alt="AI Generated Try-On"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
            
            {/* Product name badge */}
            <div className="flex justify-center mt-4">
              <div className="px-4 py-2 bg-background/80 backdrop-blur-sm rounded-full text-sm text-muted-foreground border shadow-sm">
                <span className="font-medium text-foreground">{generatedResult.productName}</span> - Virtual Try-On dengan AI
              </div>
            </div>
          </div>
        ) : /* Show uploaded image preview with product image */ uploadedImage ? (
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <div className="flex flex-col lg:flex-row items-center justify-center gap-6 w-full">
              {/* Uploaded Selfie */}
              <div className="relative flex-1 flex flex-col items-center max-w-[300px]">
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground rounded-full text-xs font-medium z-10 shadow-sm">
                  Foto Anda
                </div>
                <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden shadow-lg border-2 border-primary/30">
                  <img
                    src={uploadedImage}
                    alt="Foto Anda"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Plus icon */}
              <div className="flex items-center justify-center">
                <div className="p-2 rounded-full bg-muted text-muted-foreground">
                  <span className="text-xl font-bold">+</span>
                </div>
              </div>

              {/* Product/Clothing Image */}
              {productImage && (
                <div className="relative flex-1 flex flex-col items-center max-w-[300px]">
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 px-3 py-1 bg-muted rounded-full text-xs font-medium z-10 shadow-sm">
                    Pakaian
                  </div>
                  <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden shadow-lg border-2 border-muted">
                    <img
                      src={productImage}
                      alt={productName || "Pakaian"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {productName && (
                    <p className="mt-2 text-xs text-muted-foreground text-center truncate max-w-full">
                      {productName}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Enhanced generating overlay */}
            {isGenerating && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-6 max-w-sm px-6">
                  {/* Animated icon */}
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                      <Wand2 className="w-10 h-10 text-primary animate-pulse" />
                    </div>
                    <div className="absolute -inset-2 rounded-full border-2 border-primary/30 animate-ping" />
                    <div className="absolute -inset-4 rounded-full border border-primary/20 animate-pulse" />
                  </div>

                  {/* Progress steps */}
                  <div className="w-full space-y-3">
                    {LOADING_STEPS.slice(0, Math.max(currentStep + 1, 1)).map((step, index) => (
                      <div
                        key={step.id}
                        className={`flex items-center gap-3 transition-all duration-300 ${
                          index < currentStep
                            ? "text-muted-foreground"
                            : index === currentStep
                            ? "text-primary font-medium"
                            : "text-muted-foreground/50"
                        }`}
                      >
                        {index < currentStep ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                        ) : index === currentStep ? (
                          <Loader2 className="w-5 h-5 animate-spin shrink-0" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-current shrink-0" />
                        )}
                        <span className="text-sm">{step.text}</span>
                      </div>
                    ))}
                  </div>

                  {/* Timer and message */}
                  <div className="text-center space-y-2 pt-2 border-t w-full">
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Waktu berlalu: <span className="font-mono font-medium text-foreground">{formatTime(elapsedTime)}</span></span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Proses biasanya membutuhkan 30-60 detik
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : inputMode === "camera" ? (
          /* Camera mode */
          <div className="w-full h-full flex flex-col items-center justify-center p-4">
            <div className="relative w-full max-w-md aspect-[3/4] rounded-lg overflow-hidden bg-black shadow-lg">
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  facingMode: facingMode,
                  aspectRatio: 3 / 4,
                }}
                onUserMedia={() => setCameraReady(true)}
                onUserMediaError={() => {
                  setError("Tidak dapat mengakses kamera. Pastikan izin kamera diberikan.");
                  setInputMode("upload");
                }}
                className="w-full h-full object-cover"
                mirrored={facingMode === "user"}
              />
              
              {/* Camera loading */}
              {!cameraReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                  <div className="flex flex-col items-center gap-3 text-white">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <span className="text-sm">Memuat kamera...</span>
                  </div>
                </div>
              )}

              {/* Camera controls overlay */}
              {cameraReady && (
                <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-4">
                  {/* Switch camera button */}
                  <Button
                    variant="secondary"
                    size="icon"
                    className="rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                    onClick={handleSwitchCamera}
                  >
                    <SwitchCamera className="w-5 h-5 text-white" />
                  </Button>

                  {/* Capture button */}
                  <Button
                    size="lg"
                    className="rounded-full w-16 h-16 bg-white hover:bg-white/90 text-primary"
                    onClick={handleCapturePhoto}
                  >
                    <Camera className="w-8 h-8" />
                  </Button>

                  {/* Placeholder for symmetry */}
                  <div className="w-10 h-10" />
                </div>
              )}
            </div>

            {/* Product preview below camera */}
            {productImage && (
              <div className="mt-4 flex items-center gap-3 px-4 py-2 bg-background/80 backdrop-blur-sm rounded-lg border">
                <img
                  src={productImage}
                  alt={productName || "Pakaian"}
                  className="w-12 h-12 object-cover rounded"
                />
                <div>
                  <p className="text-xs text-muted-foreground">Pakaian yang akan dicoba:</p>
                  <p className="text-sm font-medium truncate max-w-[200px]">{productName}</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Upload/Camera selection */
          <div className="flex flex-col items-center justify-center gap-6 p-8">
            <div className="text-center mb-2">
              <p className="font-medium text-lg">Pilih Metode Input</p>
              <p className="text-sm text-muted-foreground mt-1">
                Upload foto yang sudah ada atau ambil foto langsung
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Upload option */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={handleUploadClick}
                className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all w-48"
              >
                <div className="p-4 rounded-full bg-primary/10 text-primary">
                  <ImagePlus className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <p className="font-medium">Upload Foto</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    JPG, PNG, WEBP
                  </p>
                </div>
              </div>

              <div className="text-muted-foreground text-sm">atau</div>

              {/* Camera option */}
              <div
                onClick={() => setInputMode("camera")}
                className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all w-48"
              >
                <div className="p-4 rounded-full bg-secondary text-secondary-foreground">
                  <Camera className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <p className="font-medium">Ambil Foto</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Gunakan kamera
                  </p>
                </div>
              </div>
            </div>

            {/* Product preview */}
            {productImage && (
              <div className="mt-4 flex items-center gap-3 px-4 py-2 bg-muted/50 rounded-lg">
                <img
                  src={productImage}
                  alt={productName || "Pakaian"}
                  className="w-12 h-12 object-cover rounded"
                />
                <div>
                  <p className="text-xs text-muted-foreground">Pakaian yang akan dicoba:</p>
                  <p className="text-sm font-medium truncate max-w-[200px]">{productName}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-4 flex items-center justify-between gap-4 border-t">
        <div className="flex items-center gap-2">
          {(uploadedImage || generatedResult || inputMode === "camera") && (
            <Button variant="outline" size="sm" onClick={() => {
              handleReset();
              setInputMode("upload");
            }}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {generatedResult ? (
            <>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button size="sm" onClick={onClose}>
                Selesai
              </Button>
            </>
          ) : uploadedImage ? (
            <>
              <Button
                size="sm"
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate dengan AI
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={onClose}>
              Tutup
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
