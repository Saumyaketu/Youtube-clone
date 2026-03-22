import Link from "next/link";
import React from "react";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-background text-foreground">
      <svg
        className="w-20 h-20 mb-6 text-muted-foreground opacity-50"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M3 3l18 18M9 9a3 3 0 00-3 3v4a3 3 0 003 3h6a3 3 0 003-3m-6-8.99A3 3 0 0115 9m-6 3a3 3 0 116 0"
        />
      </svg>
      <h1 className="text-3xl font-bold mb-4">You are Offline</h1>
      <p className="mb-8 text-muted-foreground max-w-md">
        It looks like you've lost your internet connection. Don't worry, you can still watch your saved videos!
      </p>
      
      <a 
        href="/downloads" 
        className="px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full font-medium transition-colors"
      >
        Go to My Downloads
      </a>
    </div>
  );
}