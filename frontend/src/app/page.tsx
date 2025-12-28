import { Suspense } from "react";
import CategoryTabs from "../components/CategoryTabs";
import VideoGrid from "../components/VideoGrid";

export default function Home() {
  return (
    <main className="flex-1 p-4">
      <CategoryTabs/>
      <Suspense fallback={<div>Loading videos...</div>}>
        <VideoGrid />
      </Suspense>
    </main>
  )
}
