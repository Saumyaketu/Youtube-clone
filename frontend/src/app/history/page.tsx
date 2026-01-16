import HistoryContent from "@/src/components/HistoryContent";
import React, { Suspense } from "react";

const page = () => {
  return (
    <div className="flex-1 p-6">
      <div className="max-w-4xl">
        <h1 className="text-2xl font-bold mb-6">Watch History</h1>
        <Suspense fallback={<div>Loading...</div>}>
          <HistoryContent />
        </Suspense>
      </div>
    </div>
  );
};

export default page;
