'use client';

import { useEffect, useRef } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const errorTitleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);

    // Focus on the error title for accessibility when error occurs
    if (errorTitleRef.current) {
      errorTitleRef.current.focus();
    }
  }, [error]);

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-50 px-4"
      role="alert"
      aria-live="assertive"
    >
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 rounded-full p-4">
            <ExclamationTriangleIcon
              className="h-12 w-12 text-red-600"
              aria-hidden="true"
            />
          </div>
        </div>

        <h1
          ref={errorTitleRef}
          className="text-2xl font-bold text-gray-900 text-center mb-2"
          tabIndex={-1}
        >
          Something went wrong
        </h1>

        <p className="text-gray-600 text-center mb-6" role="status">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={reset}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Try again to recover from this error"
          >
            Try again
          </button>
          <a
            href="/"
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 text-center focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            aria-label="Go back to the home page"
          >
            Go home
          </a>
        </div>

        {process.env.NODE_ENV === 'development' && error.digest && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg" role="contentinfo">
            <p className="text-xs text-gray-500 font-mono break-all">
              Error ID: <span aria-label="Error identifier">{error.digest}</span>
            </p>
          </div>
        )}

        {process.env.NODE_ENV === 'development' && error.stack && (
          <details className="mt-4">
            <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700 focus:outline-none focus:text-blue-600">
              View technical details
            </summary>
            <pre className="mt-2 p-4 bg-gray-900 text-gray-100 text-xs rounded-lg overflow-auto max-h-64">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
