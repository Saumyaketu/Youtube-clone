import SearchResult from "@/src/components/SearchResult";
import React, { Suspense } from "react";
import MobileSearchInput from "../../components/MobileSearchInput";

type PageProps = {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
};

const page = async ({ searchParams }: PageProps) => {
  const { query } = await searchParams;
  const q = typeof query === "string" ? query : "";

  return (
    <div className="flex-1 px-4 py-2">
      <div className="max-w-6xl mx-auto">
        <MobileSearchInput initialQuery={q} />

        {q ? (
          <>
            <div className="mb-6 hidden md:block">
              <h1 className="text-xl font-medium mb-4">
                Search results for "{q}"
              </h1>
            </div>
            
            <Suspense fallback={<div>Loading search results...</div>}>
              <SearchResult query={q} />
            </Suspense>
          </>
        ) : (
          <div className="text-center text-muted-foreground mt-10 md:hidden">
            Type something to search
          </div>
        )}
      </div>
    </div>
  );
};

export default page;
