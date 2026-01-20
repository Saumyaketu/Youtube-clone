import SearchResult from "@/src/components/SearchResult";
import React, { Suspense } from "react";

type PageProps = {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
};

const page = async ({ searchParams }: PageProps) => {
  const { query } = await searchParams;
  const q = typeof query === "string" ? query : "";

  return (
    <div className="flex-1 px-4">
      <div className="max-w-6xl">
        {q && (
          <div className="mb-6">
            <h1 className="text-xl font-medium mb-4">
              Search results for "{q}"
            </h1>
          </div>
        )}
        <Suspense fallback={<div>Loading search results...</div>}>
          <SearchResult query={q} />
        </Suspense>
      </div>
    </div>
  );
};

export default page;
