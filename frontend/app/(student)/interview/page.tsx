'use client';

import React, { useState } from 'react';
import ConversationalInterviewInterface from '@/components/ConversationalInterviewInterface';
import StaticInterviewInterface from '@/components/StaticInterviewInterface';
import InterviewSetup, { InterviewConfig } from '@/components/InterviewSetup';

const InterviewPage: React.FC = () => {
    const [config, setConfig] = useState<InterviewConfig | null>(null);

    const handleExit = () => setConfig(null);

    if (config?.type === 'conversational') {
        return <ConversationalInterviewInterface config={config} onExit={handleExit} />;
    }

    if (config?.type === 'static') {
        return <StaticInterviewInterface config={config} onExit={handleExit} />;
    }

    return <InterviewSetup onStart={setConfig} />;
};

export default InterviewPage;
