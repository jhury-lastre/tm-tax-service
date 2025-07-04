'use client';

import { useState } from 'react';

export default function Page() {
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleCallAPI = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:8000', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.text();
      setMessage(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to call API');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-24 gap-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">
          Next.js + Nest.js Demo
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Click the button below to call the hello world API from your Nest.js backend
        </p>
      </div>

      <div className="flex flex-col items-center gap-4">
        <button
          onClick={handleCallAPI}
          disabled={loading}
          className={`px-8 py-4 rounded-lg font-semibold text-white transition-colors ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
          }`}
        >
          {loading ? 'Calling API...' : 'Call Hello World API'}
        </button>

        {message && (
          <div className="mt-6 p-4 bg-green-100 border border-green-300 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">API Response:</h3>
            <p className="text-green-700">{message}</p>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-100 border border-red-300 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2">Error:</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          Make sure your Nest.js API is running on port 8000
        </p>
      </div>
    </main>
  );
}
