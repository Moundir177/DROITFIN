'use client';

import React, { useState, useEffect } from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export default function ErrorBoundary({ children }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Function to handle window errors
    const handleWindowError = (event: ErrorEvent) => {
      console.error('DROITFIN DEBUG - Caught window error:', event.error);
      setError(event.error);
      setHasError(true);
      
      // Prevent the error from bubbling up
      event.preventDefault();
    };

    // Function to handle unhandled rejections (promises)
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('DROITFIN DEBUG - Caught unhandled rejection:', event.reason);
      setError(new Error(String(event.reason)));
      setHasError(true);
      
      // Prevent the error from bubbling up
      event.preventDefault();
    };

    // Add event listeners
    window.addEventListener('error', handleWindowError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Cleanup event listeners
    return () => {
      window.removeEventListener('error', handleWindowError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Function to try reloading the page
  const handleRetry = () => {
    window.location.reload();
  };

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-md">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Oups, une erreur est survenue
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Nous sommes désolés pour ce désagrément. Notre équipe a été notifiée.
            </p>
            
            {process.env.NODE_ENV === 'development' && error && (
              <div className="mt-4 p-4 bg-red-50 rounded-md text-left">
                <p className="text-sm font-medium text-red-800">
                  Détails de l'erreur (visible uniquement en développement):
                </p>
                <pre className="mt-2 text-xs text-red-700 overflow-auto">
                  {error.toString()}
                  {error.stack && `\n\n${error.stack}`}
                </pre>
              </div>
            )}
            
            <div className="mt-6">
              <button
                onClick={handleRetry}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Réessayer
              </button>
              <a
                href="/"
                className="mt-3 w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Retour à l'accueil
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 