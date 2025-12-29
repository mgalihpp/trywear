"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface PoseResults {
  poseLandmarks?: Array<{
    x: number;
    y: number;
    z: number;
    visibility?: number;
  }>;
}

interface UsePoseDetectionOptions {
  onResults?: (results: PoseResults) => void;
  enabled?: boolean;
}

interface UsePoseDetectionReturn {
  isLoading: boolean;
  isReady: boolean;
  error: string | null;
  startDetection: (videoElement: HTMLVideoElement) => void;
  stopDetection: () => void;
}

export function usePoseDetection(
  options: UsePoseDetectionOptions = {},
): UsePoseDetectionReturn {
  const { onResults, enabled = true } = options;

  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // biome-ignore lint/suspicious/noExplicitAny: MediaPipe types not available with dynamic import
  const poseRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isRunningRef = useRef(false);
  const onResultsRef = useRef(onResults);

  // Keep onResults ref updated
  useEffect(() => {
    onResultsRef.current = onResults;
  }, [onResults]);

  // Initialize MediaPipe Pose dynamically
  useEffect(() => {
    if (!enabled) return;

    const initPose = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Dynamic import to avoid SSR issues
        const { Pose } = await import("@mediapipe/pose");

        const pose = new Pose({
          locateFile: (file: string) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
          },
        });

        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        pose.onResults((results: PoseResults) => {
          if (onResultsRef.current) {
            onResultsRef.current(results);
          }
        });

        await pose.initialize();
        poseRef.current = pose;
        setIsReady(true);
        setIsLoading(false);
      } catch (err) {
        console.error("Error initializing pose detection:", err);
        setError("Gagal memuat model pose detection. Silakan refresh halaman.");
        setIsLoading(false);
      }
    };

    initPose();

    return () => {
      if (poseRef.current) {
        poseRef.current.close();
        poseRef.current = null;
      }
    };
  }, [enabled]);

  const startDetection = useCallback((videoElement: HTMLVideoElement) => {
    if (!poseRef.current || !videoElement || isRunningRef.current) return;

    isRunningRef.current = true;

    const processFrame = async () => {
      if (!isRunningRef.current || !poseRef.current) return;

      try {
        if (videoElement.readyState >= 2) {
          await poseRef.current.send({ image: videoElement });
        }
      } catch (err) {
        console.error("Error processing frame:", err);
      }

      if (isRunningRef.current) {
        animationFrameRef.current = requestAnimationFrame(processFrame);
      }
    };

    processFrame();
  }, []);

  const stopDetection = useCallback(() => {
    isRunningRef.current = false;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopDetection();
    };
  }, [stopDetection]);

  return {
    isLoading,
    isReady,
    error,
    startDetection,
    stopDetection,
  };
}
