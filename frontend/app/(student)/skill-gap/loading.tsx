"use client"
import React from 'react';

export default function Loading() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <h2 className="text-lg font-semibold text-gray-700">Analyzing your profile...</h2>
            <p className="text-gray-500 text-sm mt-2">Comparing with industry standards</p>
        </div>
    );
}
