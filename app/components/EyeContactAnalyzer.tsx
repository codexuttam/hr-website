'use client';

import React, { useEffect, useRef, useState } from 'react';
import Script from 'next/script';

export interface EyeContactRef {
    getStats: () => { percentage: number; isLookingAtCamera: boolean };
}

const EyeContactAnalyzer = React.forwardRef<EyeContactRef, {}>((props, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isScriptLoaded, setIsScriptLoaded] = useState(false);
    const [stats, setStats] = useState({
        isLookingAtCamera: false,
        percentage: 0,
    });

    // Use refs for tracking to avoid dependency cycles in callbacks
    const trackingRef = useRef({
        totalFrames: 0,
        eyeContactFrames: 0,
    });

    React.useImperativeHandle(ref, () => ({
        getStats: () => ({
            percentage: trackingRef.current.totalFrames > 0
                ? (trackingRef.current.eyeContactFrames / trackingRef.current.totalFrames) * 100
                : 0,
            isLookingAtCamera: stats.isLookingAtCamera
        })
    }));

    useEffect(() => {
        if (!isScriptLoaded || !videoRef.current) return;

        // @ts-ignore
        const FaceMesh = window.FaceMesh;

        if (!FaceMesh) {
            console.error("FaceMesh not loaded on window");
            return;
        }

        const faceMesh = new FaceMesh({
            locateFile: (file: string) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
            },
        });

        faceMesh.setOptions({
            maxNumFaces: 1,
            refineLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
        });

        faceMesh.onResults((results: any) => {
            trackingRef.current.totalFrames += 1;

            let isLooking = false;

            if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
                const landmarks = results.multiFaceLandmarks[0];
                // 468: Left Iris Center, 473: Right Iris Center
                const leftIris = landmarks[468];
                const rightIris = landmarks[473];

                if (leftIris && rightIris) {
                    const irisAvgX = (leftIris.x + rightIris.x) / 2;

                    // Eye contact threshold: 0.43 < irisAvgX < 0.57
                    if (irisAvgX > 0.43 && irisAvgX < 0.57) {
                        isLooking = true;
                        trackingRef.current.eyeContactFrames += 1;
                    }
                }
            }

            const percentage = trackingRef.current.totalFrames > 0
                ? (trackingRef.current.eyeContactFrames / trackingRef.current.totalFrames) * 100
                : 0;

            setStats({
                isLookingAtCamera: isLooking,
                percentage: percentage,
            });
        });

        // Manual Camera Setup
        let animationFrameId: number;
        let stream: MediaStream;

        const processVideo = async () => {
            if (videoRef.current && videoRef.current.readyState >= 2) {
                try {
                    await faceMesh.send({ image: videoRef.current });
                } catch (error) {
                    console.error("FaceMesh error:", error);
                }
            }
            animationFrameId = requestAnimationFrame(processVideo);
        };

        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 640, height: 480 },
                    audio: false,
                });

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = () => {
                        videoRef.current?.play();
                        processVideo();
                    };
                }
            } catch (err) {
                console.error("Error starting camera:", err);
            }
        };

        startCamera();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            cancelAnimationFrame(animationFrameId);
            faceMesh.close();
        };
    }, [isScriptLoaded]);

    return (
        <div className="relative w-full h-full">
            <Script
                src="https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js"
                strategy="afterInteractive"
                onLoad={() => {
                    console.log("FaceMesh script loaded");
                    setIsScriptLoaded(true);
                }}
            />

            <video
                ref={videoRef}
                className="w-full h-full object-cover mirror"
                playsInline
                muted
            />

            {/* Stats Overlay */}
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md p-3 rounded-lg border border-white/10 text-white z-10 shadow-lg">
                <div className="flex items-center gap-2 mb-1">
                    <div className={`w-3 h-3 rounded-full ${stats.isLookingAtCamera ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'}`} />
                    <span className="font-semibold text-sm">
                        {stats.isLookingAtCamera ? 'Looking at camera' : 'Not looking'}
                    </span>
                </div>
                <div className="text-xs text-gray-300">
                    Eye Contact: <span className="font-mono font-bold text-white text-sm ml-1">{stats.percentage.toFixed(1)}%</span>
                </div>
            </div>

            <style jsx>{`
                .mirror {
                    transform: scaleX(-1);
                }
            `}</style>
        </div>
    );
});

EyeContactAnalyzer.displayName = 'EyeContactAnalyzer';

export default EyeContactAnalyzer;
