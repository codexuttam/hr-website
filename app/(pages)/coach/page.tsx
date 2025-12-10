'use client';

// import { useChat } from '@ai-sdk/react';
// import { useRef, useEffect } from 'react';
// import ReactMarkdown from 'react-markdown';
// import {
//     FaPaperPlane,
//     FaRobot,
//     FaUser,
//     FaLightbulb,
//     FaSpinner,
//     FaEraser
// } from 'react-icons/fa';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
// import { motion, AnimatePresence } from 'framer-motion';

// // Custom Message type
// type Message = {
//     id: string;
//     role: 'system' | 'user' | 'assistant' | 'data';
//     content: string;
// };

// const SUGGESTED_PROMPTS = [
//     "How do I improve my resume for a software engineer role?",
//     "What are the most asked interview questions for T&P?",
//     "Explain Dynamic Programming with an example.",
//     "Give me a 3-month study plan for placement.",
// ];

export default function CoachPage() {
    // const {
    //     messages,
    //     input,
    //     handleInputChange,
    //     handleSubmit,
    //     isLoading,
    //     setMessages,
    //     setInput
    // } = useChat({
    //     api: '/api/chat',
    //     initialMessages: [
    //         {
    //             id: 'welcome',
    //             role: 'assistant',
    //             content:
    //                 "Hi! I'm EduMate, your personal AI Career Mentor. I can help you with placement prep, resume reviews, learning paths, and more. How can I assist you today?"
    //         }
    //     ]
    // });

    // const messagesEndRef = useRef<HTMLDivElement>(null);

    // // Ensure we always have a handler to avoid "value without onChange" warning
    // const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     if (handleInputChange) {
    //         handleInputChange(e);
    //     } else if (setInput) {
    //         setInput(e.target.value);
    //     }
    // };

    // useEffect(() => {
    //     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    // }, [messages]);

    // const handlePromptClick = (prompt: string) => {
    //     if (typeof setInput === 'function') {
    //         setInput(prompt);
    //     } else if (typeof handleInputChange === 'function') {
    //         // Fallback: simulate an event for handleInputChange
    //         handleInputChange({
    //             target: { value: prompt }
    //         } as React.ChangeEvent<HTMLInputElement>);
    //     } else {
    //         console.warn('Neither setInput nor handleInputChange is available');
    //     }
    // };

    // const clearChat = () => {
    //     setMessages([
    //         {
    //             id: 'welcome',
    //             role: 'assistant',
    //             content:
    //                 "Hi! I'm EduMate, your personal AI Career Mentor. Chat cleared! What's next?"
    //         }
    //     ]);
    // };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col">
            <Header />

            <main className="flex-grow flex flex-col max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-80px)]">
                <div className="flex-grow flex items-center justify-center bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-slate-800">
                    <div className="text-center p-8">
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">EduMate AI Coach</h1>
                        <p className="text-lg text-gray-600 dark:text-gray-300">
                            This feature is currently under maintenance. Please check back later!
                        </p>
                    </div>
                </div>
            </main>

            {/* Hidden Footer on Mobile for Space */}
            <div className="hidden sm:block">
                <Footer />
            </div>
        </div>
    );
}
