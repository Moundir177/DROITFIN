'use client';

import { useEffect, useState } from 'react';
import { initializeDatabase } from '@/lib/database';
import { isProduction } from '@/lib/api';

export default function AppInitializer({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('DROITFIN DEBUG - Starting app initialization');
        setIsLoading(true);
        
        // Only initialize if localStorage is available (client-side)
        if (typeof window !== 'undefined') {
          // Check if we already have data (for development only)
          if (!isProduction() && !localStorage.getItem('page_home')) {
            console.log('DROITFIN DEBUG - Initializing database in development mode');
            await initializeDatabase();
          } else if (isProduction()) {
            // In production, we'll rely on the Cloudflare API
            console.log('DROITFIN DEBUG - Production mode, skipping local initialization');
          } else {
            console.log('DROITFIN DEBUG - Development data already initialized');
          }
          setIsInitialized(true);
        }
      } catch (err) {
        console.error('DROITFIN DEBUG - Initialization error:', err);
        setError(err instanceof Error ? err : new Error('Unknown initialization error'));
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  // Show a loading state while initializing
  if (isLoading && !isInitialized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
        <p className="mt-4 text-xl font-medium text-gray-700">Initialisation...</p>
      </div>
    );
  }

  // Show an error message if initialization failed
  if (error && !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-md">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Erreur d'initialisation
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Une erreur est survenue lors de l'initialisation de l'application.
            </p>
            
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-4 bg-red-50 rounded-md text-left">
                <p className="text-sm font-medium text-red-800">
                  Détails de l'erreur (visible uniquement en développement):
                </p>
                <pre className="mt-2 text-xs text-red-700 overflow-auto">
                  {error.message}
                  {error.stack && `\n\n${error.stack}`}
                </pre>
              </div>
            )}
            
            <div className="mt-6">
              <button
                onClick={() => window.location.reload()}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Réessayer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render children once initialized
  return <>{children}</>;
} 