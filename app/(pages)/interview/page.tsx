'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import VapiInterviewInterface from '@/components/VapiInterviewInterface';
import InterviewSetup from '@/components/InterviewSetup';

const InterviewPage: React.FC = () => {
    const router = useRouter();
    const [config, setConfig] = useState<{
        role: string;
        experience: string;
        techStack: string;
        duration: number;
    } | null>(null);

    const handleStart = (newConfig: { role: string; experience: string; techStack: string; duration: number }) => {
        setConfig(newConfig);
    };

    const handleExit = () => {
        router.push('/dashboard');
    };

    if (config) {
        return (
            <VapiInterviewInterface
                config={config}
                onExit={handleExit}
            />
        );
    }

    return <InterviewSetup onStart={handleStart} />;
};

export default InterviewPage;
