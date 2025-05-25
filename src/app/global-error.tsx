'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('DROITFIN DEBUG - Global Error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-md">
            <div className="text-center">
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Erreur Critique
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Une erreur critique est survenue. Nous travaillons à résoudre ce problème.
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
                  onClick={() => reset()}
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
      </body>
    </html>
  );
} 