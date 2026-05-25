'use client';

import { useEffect, useRef, useState } from 'react';
import { FaEye, FaEyeSlash, FaVideo } from 'react-icons/fa';

interface EyeContactTrackerProps {
    isActive: boolean;
    onEyeContactUpdate: (isLooking: boolean) => void;
}

export default function EyeContactTracker({ isActive, onEyeContactUpdate }: EyeContactTrackerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isLooking, setIsLooking] = useState(false);
    const [eyeContactPercentage, setEyeContactPercentage] = useState(0);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const lookingCountRef = useRef(0);
    const totalCountRef = useRef(0);

    useEffect(() => {
        startCamera();
        return () => {
            stopCamera();
        };
    }, []);

    useEffect(() => {
        if (isActive) {
            startEyeTracking();
        } else {
            stopEyeTracking();
        }
    }, [isActive]);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480, facingMode: 'user' },
                audio: false
            });

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                setStream(mediaStream);
            }
        } catch (error) {
            console.error('Error accessing camera:', error);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        if (detectionIntervalRef.current) {
            clearInterval(detectionIntervalRef.current);
        }
    };

    const startEyeTracking = () => {
        if (detectionIntervalRef.current) {
            clearInterval(detectionIntervalRef.current);
        }

        // Simulate eye tracking (in production, use MediaPipe Face Mesh or similar)
        detectionIntervalRef.current = setInterval(() => {
            const looking = detectEyeContact();
            setIsLooking(looking);
            onEyeContactUpdate(looking);

            // Update statistics
            totalCountRef.current++;
            if (looking) {
                lookingCountRef.current++;
            }

            const percentage = (lookingCountRef.current / totalCountRef.current) * 100;
            setEyeContactPercentage(Math.round(percentage));
        }, 500);
    };

    const stopEyeTracking = () => {
        if (detectionIntervalRef.current) {
            clearInterval(detectionIntervalRef.current);
            detectionIntervalRef.current = null;
        }
    };

    const detectEyeContact = (): boolean => {
        // This is a simplified simulation
        // In production, implement actual face mesh detection using MediaPipe
        // For now, we'll use a random simulation with bias towards looking
        return Math.random() > 0.3;
    };

    const drawFaceOverlay = () => {
        const canvas = canvasRef.current;
        const video = videoRef.current;

        if (!canvas || !video) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (isActive && isLooking) {
            // Draw eye contact indicator
            ctx.strokeStyle = '#22c55e';
            ctx.lineWidth = 3;
            ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

            // Draw eye indicators
            ctx.fillStyle = '#22c55e';
            ctx.font = '16px Arial';
            ctx.fillText('✓ Good Eye Contact', 20, 30);
        } else if (isActive) {
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 3;
            ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

            ctx.fillStyle = '#ef4444';
            ctx.font = '16px Arial';
            ctx.fillText('⚠ Look at Camera', 20, 30);
        }
    };

    useEffect(() => {
        const interval = setInterval(drawFaceOverlay, 100);
        return () => clearInterval(interval);
    }, [isActive, isLooking]);

    return (
        <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold flex items-center gap-2">
                    <FaVideo className="text-purple-400" />
                    Your Video
                </h3>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${isLooking
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                    {isLooking ? <FaEye /> : <FaEyeSlash />}
                    {isLooking ? 'Good Contact' : 'Look Here'}
                </div>
            </div>

            <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover mirror"
                />
                <canvas
                    ref={canvasRef}
                    width={640}
                    height={480}
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                />

                {/* Eye contact indicator overlay */}
                {isActive && (
                    <div className="absolute top-4 left-4 right-4">
                        <div className="bg-black/60 backdrop-blur-sm rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-white text-sm font-medium">Eye Contact</span>
                                <span className={`text-sm font-bold ${eyeContactPercentage >= 70 ? 'text-green-400' :
                                        eyeContactPercentage >= 50 ? 'text-yellow-400' :
                                            'text-red-400'
                                    }`}>
                                    {eyeContactPercentage}%
                                </span>
                            </div>
                            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-300 ${eyeContactPercentage >= 70 ? 'bg-green-500' :
                                            eyeContactPercentage >= 50 ? 'bg-yellow-500' :
                                                'bg-red-500'
                                        }`}
                                    style={{ width: `${eyeContactPercentage}%` }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Center crosshair to help with eye contact */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                    <div className="w-8 h-8 border-2 border-purple-400 rounded-full opacity-30" />
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-purple-400 rounded-full opacity-50" />
                </div>
            </div>

            {/* Tips */}
            <div className="mt-4 text-xs text-purple-300">
                <p>💡 Tip: Look directly at the camera lens for best eye contact</p>
            </div>

            <style jsx>{`
        .mirror {
          transform: scaleX(-1);
        }
      `}</style>
        </div>
    );
}
