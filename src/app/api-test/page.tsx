'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getData, getApiBaseUrl, apiCall } from '@/lib/api';

export default function ApiTestPage() {
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [apiBaseUrl, setApiBaseUrl] = useState<string | null>(null);

  useEffect(() => {
    // Get and display the API base URL
    setApiBaseUrl(getApiBaseUrl());

    // Test the API connection
    const testApi = async () => {
      try {
        // Direct fetch test
        const response = await fetch(`${getApiBaseUrl()}/test`);
        const data = await response.json();
        setTestResult(JSON.stringify(data, null, 2));
      } catch (error) {
        setTestError(`Error fetching API: ${error instanceof Error ? error.message : String(error)}`);
      }
    };

    testApi();
  }, []);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">API Connection Test</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">API Base URL:</h2>
        <div className="bg-gray-100 p-3 rounded">
          {apiBaseUrl || "Not available in development mode"}
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Test API Response:</h2>
        {testError ? (
          <div className="bg-red-100 text-red-700 p-4 rounded">
            {testError}
          </div>
        ) : testResult ? (
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
            {testResult}
          </pre>
        ) : (
          <div className="bg-gray-100 p-4 rounded flex items-center justify-center">
            <div className="animate-spin h-5 w-5 border-2 border-gray-500 border-t-transparent rounded-full mr-3"></div>
            Loading...
          </div>
        )}
      </div>
      
      <div className="mt-8">
        <Link 
          href="/" 
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
} 