'use client';
import React, { useState } from 'react';
import { SupabaseATSService } from '@/backend/services/supabaseATSService';

const ATSDebugPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  const runDiagnostics = async () => {
    setTesting(true);
    const info: any = {
      timestamp: new Date().toISOString(),
      environment: {
        hasHFApiKey: !!process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY,
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        userAgent: navigator.userAgent,
        online: navigator.onLine
      },
      tests: {}
    };

    // Test API connection
    try {
      const apiTest = await SupabaseATSService.testAPIConnection();
      info.tests.apiConnection = apiTest;
    } catch (error) {
      info.tests.apiConnection = {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        error: error
      };
    }

    // Test network connectivity
    try {
      const networkTest = await fetch('https://httpbin.org/get', {
        method: 'GET',
        mode: 'cors'
      });
      info.tests.networkConnectivity = {
        success: networkTest.ok,
        status: networkTest.status,
        message: networkTest.ok ? 'Network connectivity OK' : 'Network issues detected'
      };
    } catch (error) {
      info.tests.networkConnectivity = {
        success: false,
        message: 'Network connectivity failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    setDebugInfo(info);
    setTesting(false);
  };

  const copyToClipboard = () => {
    if (debugInfo) {
      navigator.clipboard.writeText(JSON.stringify(debugInfo, null, 2));
      alert('Debug information copied to clipboard');
    }
  };

  if (process.env.NODE_ENV !== 'development') {
    return null; // Only show in development
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-800 text-white px-3 py-2 rounded-lg text-sm hover:bg-gray-700 transition-colors"
      >
        🔧 Debug ATS
      </button>

      {isOpen && (
        <div className="absolute bottom-12 left-0 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-4 w-96 max-h-96 overflow-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">ATS Debug Panel</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3">
            <button
              onClick={runDiagnostics}
              disabled={testing}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testing ? '🔄 Running Diagnostics...' : '🔍 Run Diagnostics'}
            </button>

            {debugInfo && (
              <>
                <div className="border-t pt-3">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Environment</h4>
                  <div className="text-xs space-y-1">
                    <div className={`${debugInfo.environment.hasHFApiKey ? 'text-green-600' : 'text-red-600'}`}>
                      HF API Key: {debugInfo.environment.hasHFApiKey ? '✅ Present' : '❌ Missing'}
                    </div>
                    <div className={`${debugInfo.environment.hasSupabaseUrl ? 'text-green-600' : 'text-red-600'}`}>
                      Supabase URL: {debugInfo.environment.hasSupabaseUrl ? '✅ Present' : '❌ Missing'}
                    </div>
                    <div className={`${debugInfo.environment.online ? 'text-green-600' : 'text-red-600'}`}>
                      Network: {debugInfo.environment.online ? '✅ Online' : '❌ Offline'}
                    </div>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">API Tests</h4>
                  <div className="text-xs space-y-1">
                    <div className={`${debugInfo.tests.apiConnection?.success ? 'text-green-600' : 'text-red-600'}`}>
                      ResumeATS API: {debugInfo.tests.apiConnection?.success ? '✅' : '❌'} {debugInfo.tests.apiConnection?.message}
                    </div>
                    <div className={`${debugInfo.tests.networkConnectivity?.success ? 'text-green-600' : 'text-red-600'}`}>
                      Network Test: {debugInfo.tests.networkConnectivity?.success ? '✅' : '❌'} {debugInfo.tests.networkConnectivity?.message}
                    </div>
                  </div>
                </div>

                <button
                  onClick={copyToClipboard}
                  className="w-full bg-gray-600 text-white px-4 py-1 rounded-md hover:bg-gray-700 text-xs"
                >
                  📋 Copy Debug Info
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ATSDebugPanel;