import LikedContent from "@/src/components/LikedContent";
import React, { Suspense } from "react";

const page = () => {
  return (
    <div className="flex-1 min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <h1 className="text-2xl font-bold mb-6">Liked videos</h1>
        <Suspense fallback={<div>Loading...</div>}>
          <LikedContent />
        </Suspense>
      </div>
    </div>
  );
};

export default page;
