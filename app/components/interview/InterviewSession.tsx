'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FaMicrophone, FaStop, FaEye, FaVideo } from 'react-icons/fa';
import { InterviewConfig, InterviewResults } from '@/types/interview';
import VideoInterviewer from './VideoInterviewer';
import EyeContactTracker from './EyeContactTracker';
import { MurfService } from '@/services/murfService';

interface InterviewSessionProps {
    config: InterviewConfig;
    onComplete: (results: InterviewResults) => void;
}

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export default function InterviewSession({ config, onComplete }: InterviewSessionProps) {
    const router = useRouter();
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [questions, setQuestions] = useState<string[]>([]);
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState<Array<{ question: string; answer: string; timestamp: number }>>([]);
    const [currentAnswer, setCurrentAnswer] = useState('');
    const [eyeContactData, setEyeContactData] = useState<Array<{ timestamp: number; isLooking: boolean }>>([]);
    const [timeRemaining, setTimeRemaining] = useState(config.duration * 60);
    const [isInterviewerSpeaking, setIsInterviewerSpeaking] = useState(false);
    const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'processing'>('disconnected');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isSpeechSupported, setIsSpeechSupported] = useState(true);

    const startTimeRef = useRef<number>(Date.now());
    const recognitionRef = useRef<any>(null);
    const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const currentAudioRef = useRef<HTMLAudioElement | null>(null);

    // Initialize Speech Recognition
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.continuous = true;
                recognition.interimResults = true;
                recognition.lang = 'en-US';

                recognition.onresult = (event: any) => {
                    let interimTranscript = '';
                    let finalTranscript = '';

                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        if (event.results[i].isFinal) {
                            finalTranscript += event.results[i][0].transcript;
                        } else {
                            interimTranscript += event.results[i][0].transcript;
                        }
                    }

                    if (finalTranscript) {
                        setCurrentAnswer(prev => {
                            const newValue = prev + ' ' + finalTranscript;
                            // Reset silence timer on final result
                            resetSilenceTimer(newValue);
                            return newValue;
                        });
                    } else if (interimTranscript) {
                        // Update UI with interim but don't commit yet
                        // Optional: Show interim text
                    }
                };

                recognition.onerror = (event: any) => {
                    // Ignore 'no-speech' errors as they just mean silence
                    if (event.error === 'no-speech') return;

                    console.error('Speech recognition error', event.error);
                    if (event.error === 'not-allowed') {
                        alert('Please allow microphone access to continue.');
                    }
                };

                recognitionRef.current = recognition;
            } else {
                setIsSpeechSupported(false);
            }
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            if (silenceTimerRef.current) {
                clearTimeout(silenceTimerRef.current);
            }
            if (currentAudioRef.current) {
                currentAudioRef.current.pause();
                currentAudioRef.current = null;
            }
        };
    }, []);

    // Timer
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    handleEndInterview();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const hasStartedRef = useRef(false);

    // Start Interview on Mount
    useEffect(() => {
        if (!hasStartedRef.current) {
            hasStartedRef.current = true;
            startInterview();
        }
    }, []);

    const startInterview = async () => {
        setStatus('connecting');

        // Initial greeting
        const initialMessage = `Hello! I'm your AI interviewer today. We'll be discussing the ${config.role} position. Let's get started. Tell me a little about yourself.`;

        // Add initial message to state without playing audio yet
        const newMessages = [...messages, { role: 'assistant' as const, content: initialMessage }];
        setMessages(newMessages);
        setQuestions(prev => [...prev, initialMessage]);
        setCurrentQuestion(prev => prev + 1);

        await playResponseAudio(initialMessage);
        setStatus('connected');
    };

    const playResponseAudio = async (text: string) => {
        try {
            // Stop any currently playing audio immediately
            if (currentAudioRef.current) {
                currentAudioRef.current.pause();
                currentAudioRef.current.currentTime = 0;
                currentAudioRef.current = null;
            }

            // Generate audio
            const audioBlob = await MurfService.generateAudio(text, 'en-US-matthew');
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);

            currentAudioRef.current = audio;

            // Start speaking
            setIsInterviewerSpeaking(true);

            audio.onended = () => {
                setIsInterviewerSpeaking(false);
                URL.revokeObjectURL(audioUrl);
                if (currentAudioRef.current === audio) {
                    currentAudioRef.current = null;
                }
                startListening();
            };

            audio.onerror = (e) => {
                console.error("Audio playback error:", e);
                setIsInterviewerSpeaking(false);
                startListening();
            };

            await audio.play();
        } catch (error) {
            console.error('Failed to play audio:', error);
            setIsInterviewerSpeaking(false);
            startListening();
        }
    };

    const processAIResponse = async (text: string) => {
        // Prevent processing if already processing
        if (status === 'processing' && isInterviewerSpeaking) return;

        setStatus('processing');
        setIsListening(false);
        stopListening();

        // Add to messages
        const newMessages = [...messages, { role: 'assistant' as const, content: text }];
        setMessages(newMessages);
        setQuestions(prev => [...prev, text]);
        setCurrentQuestion(prev => prev + 1);

        await playResponseAudio(text);
        setStatus('connected');
    };

    const startListening = () => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.start();
                setIsListening(true);
                setCurrentAnswer('');
            } catch (e) {
                // Already started
            }
        }
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    };

    const resetSilenceTimer = (currentText: string) => {
        if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
        }

        // Wait 2 seconds of silence before submitting answer
        silenceTimerRef.current = setTimeout(() => {
            submitAnswer(currentText);
        }, 2000);
    };

    const submitAnswer = async (answer: string) => {
        if (status === 'processing') return;
        stopListening();
        if (!answer.trim()) return;

        // Add to transcript
        setTranscript(prev => [
            ...prev,
            {
                question: questions[questions.length - 1] || '...',
                answer: answer,
                timestamp: Date.now() - startTimeRef.current
            }
        ]);

        // Add to messages
        const updatedMessages = [...messages, { role: 'user' as const, content: answer }];
        setMessages(updatedMessages);

        // Get AI response
        setStatus('processing');
        try {
            const response = await fetch('/api/interview/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: updatedMessages,
                    config
                })
            });

            const data = await response.json();
            if (data.response) {
                await processAIResponse(data.response);
            }
        } catch (error) {
            console.error('Failed to get AI response:', error);
            setStatus('connected');
            try {
                await playResponseAudio("I'm sorry, I'm having trouble connecting. Could you please repeat that?");
            } catch (e) {
                console.error('Failed to play error message:', e);
            }
        }
    };

    const handleEyeContactUpdate = (isLooking: boolean) => {
        setEyeContactData(prev => [...prev, {
            timestamp: Date.now() - startTimeRef.current,
            isLooking
        }]);
    };

    const handleEndInterview = () => {
        stopListening();

        // Calculate scores
        const eyeContactScore = calculateEyeContactScore();
        const speechClarity = 85; // Placeholder
        const responseQuality = 80; // Placeholder
        const overallScore = (eyeContactScore + speechClarity + responseQuality) / 3;

        const results: InterviewResults = {
            overallScore,
            eyeContactScore,
            speechClarity,
            responseQuality,
            transcript,
            eyeContactData,
            recommendations: generateRecommendations(eyeContactScore, speechClarity, responseQuality)
        };

        onComplete(results);
    };

    const calculateEyeContactScore = () => {
        if (eyeContactData.length === 0) return 0;

        const lookingCount = eyeContactData.filter(d => d.isLooking).length;
        return Math.round((lookingCount / eyeContactData.length) * 100);
    };

    const generateRecommendations = (eyeContact: number, speech: number, quality: number) => {
        const recommendations: string[] = [];

        if (eyeContact < 70) {
            recommendations.push('Practice maintaining eye contact with the camera during responses');
        }
        if (speech < 75) {
            recommendations.push('Work on speaking more clearly and at a steady pace');
        }
        if (quality < 75) {
            recommendations.push('Provide more specific examples and details in your answers');
        }

        return recommendations;
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!isSpeechSupported) {
        return (
            <div className="fixed inset-0 bg-[#0a0e27] flex items-center justify-center text-white p-8 text-center">
                <div className="max-w-md bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-purple-500/30">
                    <h2 className="text-2xl font-bold mb-4 text-red-400">Browser Not Supported</h2>
                    <p className="text-gray-300 mb-6">
                        Your browser does not support the Speech Recognition API required for this interview.
                        Please use Google Chrome, Microsoft Edge, or Safari.
                    </p>
                    <button
                        onClick={() => router.push('/')}
                        className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all"
                    >
                        Return Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-[#0a0e27] flex flex-col">
            {/* Top Header Bar */}
            <div className="bg-[#0d1129] border-b border-gray-800 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                        <span className="text-white font-semibold text-sm">
                            {status === 'connected' ? 'LIVE INTERVIEW' : status.toUpperCase()}
                        </span>
                    </div>
                    <div className="text-gray-400 text-sm">
                        Question {currentQuestion}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-white font-mono text-sm">
                        {formatTime(timeRemaining)}
                    </div>
                    <button
                        onClick={handleEndInterview}
                        className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded text-sm font-semibold transition-all"
                    >
                        End Interview
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Side - Interviewer */}
                <div className="flex-1 relative bg-black">
                    <VideoInterviewer
                        isSpeaking={isInterviewerSpeaking}
                        isThinking={status === 'processing'}
                        currentQuestion={questions[questions.length - 1] || "Connecting to interviewer..."}
                    />
                    <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${isInterviewerSpeaking ? 'bg-cyan-400 animate-pulse' : 'bg-gray-500'}`} />
                            <span className="text-white text-sm font-medium">Interviewer (AI)</span>
                        </div>
                    </div>
                </div>

                {/* Right Side - Candidate */}
                <div className="flex-1 relative bg-black border-l border-gray-800">
                    <EyeContactTracker
                        isActive={true}
                        onEyeContactUpdate={handleEyeContactUpdate}
                    />
                    <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
                            <span className="text-white text-sm font-medium">You (Candidate)</span>
                        </div>
                    </div>

                    {/* Current Answer Preview */}
                    {isListening && currentAnswer && (
                        <div className="absolute bottom-20 left-4 right-4 bg-black/50 backdrop-blur-md p-4 rounded-xl border border-white/10">
                            <p className="text-white/80 text-lg">{currentAnswer}</p>
                        </div>
                    )}
                </div>

                {/* Transcript Sidebar */}
                <div className="w-80 bg-[#0d1129] border-l border-gray-800 flex flex-col">
                    <div className="px-4 py-3 border-b border-gray-800">
                        <h3 className="text-white font-semibold text-sm">TRANSCRIPT</h3>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {transcript.length === 0 && !currentAnswer && (
                            <p className="text-gray-500 text-sm italic text-center mt-8">
                                {status === 'connecting' ? 'Connecting to AI interviewer...' : 'Waiting for conversation to start...'}
                            </p>
                        )}

                        {transcript.map((item, index) => (
                            <div key={index} className="space-y-2">
                                <div className="bg-cyan-500/10 rounded-lg p-3">
                                    <div className="text-cyan-400 text-xs font-semibold mb-1">INTERVIEWER</div>
                                    <p className="text-gray-300 text-sm">{item.question}</p>
                                </div>
                                <div className="bg-green-500/10 rounded-lg p-3">
                                    <div className="text-green-400 text-xs font-semibold mb-1">YOU</div>
                                    <p className="text-gray-300 text-sm">{item.answer}</p>
                                </div>
                            </div>
                        ))}

                        {/* Current Question */}
                        {questions.length > transcript.length && (
                            <div className="bg-cyan-500/10 rounded-lg p-3">
                                <div className="text-cyan-400 text-xs font-semibold mb-1">INTERVIEWER</div>
                                <p className="text-gray-300 text-sm">{questions[questions.length - 1]}</p>
                            </div>
                        )}
                    </div>

                    {/* Status Footer */}
                    <div className="border-t border-gray-800 p-4">
                        <div className="bg-black/30 rounded-lg p-3 mb-3">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-gray-400 text-xs font-semibold">STATUS</span>
                                <div className={`flex items-center gap-2 text-xs ${status === 'connected' ? 'text-green-400' : 'text-yellow-500'}`}>
                                    <div className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-green-400 animate-pulse' : 'bg-yellow-500'}`} />
                                    {status === 'connected' ? 'Live' : status}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
