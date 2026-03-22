"use client";
import React, { useState, FormEvent, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowLeft } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

export default function MobileSearchInput({ initialQuery }: { initialQuery: string }) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!initialQuery && inputRef.current) {
      inputRef.current.focus();
    }
  }, [initialQuery]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?query=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="md:hidden flex items-center gap-2 mb-4 mt-2">
      <Button type="button" variant="ghost" size="icon" onClick={() => router.back()} className="shrink-0">
         <ArrowLeft className="w-6 h-6" />
      </Button>

      <div className="flex flex-1 items-center bg-secondary rounded-full overflow-hidden px-2">
        <Input
          ref={inputRef}
          type="search"
          placeholder="Search YouTube"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="bg-transparent border-none focus-visible:ring-0 shadow-none px-2 h-10"
        />
      </div>

      <Button type="submit" variant="ghost" size="icon" className="shrink-0 bg-secondary rounded-full w-10 h-10">
        <Search className="w-5 h-5" />
      </Button>
    </form>
  );
}