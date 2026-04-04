import { VideoOff } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-background text-foreground">
      <VideoOff className="w-16 h-16 mb-4 opacity-30" />
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