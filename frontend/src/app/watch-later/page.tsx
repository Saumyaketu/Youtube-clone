import WatchLaterContent from "@/src/components/WatchLaterContent";
import React, { Suspense } from "react";

const WatchLaterPage = () => {
  return (
    <div className="flex-1 p-6">
      <div className="max-w-4xl">
        <h1 className="text-2xl font-bold mb-6">Watch Later</h1>
        <Suspense fallback={<div>Loading...</div>}>
          <WatchLaterContent />
        </Suspense>
      </div>
    </div>
  );
};

export default WatchLaterPage;
