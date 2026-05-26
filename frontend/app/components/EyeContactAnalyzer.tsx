'use client';

import React, { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { Target, Eye, EyeOff } from 'lucide-react';

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
                    setIsScriptLoaded(true);
                }}
            />

            <video
                ref={videoRef}
                className="w-full h-full object-cover mirror"
                playsInline
                muted
            />

            {/* Premium Stats Overlay */}
            <div className="absolute top-6 left-6 flex flex-col gap-2 z-10">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md border transition-all duration-300 ${
                    stats.isLookingAtCamera 
                    ? 'bg-black/10 border-black/30 text-black' 
                    : 'bg-black/10 border-black/30 text-black'
                }`}>
                    {stats.isLookingAtCamera ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                        {stats.isLookingAtCamera ? 'Focus Locked' : 'Focus Lost'}
                    </span>
                </div>
                
                <div className="bg-black/80 backdrop-blur-xl/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-3">
                    <Target className="h-4 w-4 text-gray-500" />
                    <div>
                        <div className="text-[8px] font-bold text-neutral-400 uppercase tracking-widest leading-none mb-1">Attention Score</div>
                        <div className="text-sm font-black text-white font-mono leading-none">{stats.percentage.toFixed(1)}%</div>
                    </div>
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
