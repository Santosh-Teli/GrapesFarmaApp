"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Next.js Error Boundary caught an error:", error);
  }, [error]);

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-red-50 p-4">
      <h2 className="text-xl font-bold text-red-600 mb-4">Something went wrong!</h2>
      <p className="text-red-800 bg-red-100 p-4 rounded-md mb-4 font-mono text-sm max-w-2xl overflow-auto">
        {error.message || "Unknown error occurred"}
      </p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
      >
        Try again
      </button>
    </div>
  );
}
