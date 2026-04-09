"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { Toaster } from "./ui/sonner";

export default function ClientShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const overlayMode =
    !!pathname &&
    (pathname.startsWith("/watch/") ||
      pathname.startsWith("/video-call") ||
      pathname.startsWith("/room/"));

  const [isSidebarHidden, setIsSidebarHidden] = useState<boolean>(overlayMode ? true : false);

  const prevNonOverlayHiddenRef = useRef<boolean | null>(null);

  const compactMode = isSidebarHidden && !overlayMode;

  useEffect(() => {
    if (overlayMode) {
      if (prevNonOverlayHiddenRef.current === null) prevNonOverlayHiddenRef.current = isSidebarHidden;
      setIsSidebarHidden(true);
    } else {
      if (prevNonOverlayHiddenRef.current !== null) {
        setIsSidebarHidden(prevNonOverlayHiddenRef.current);
        prevNonOverlayHiddenRef.current = null;
      }
    }
  }, [overlayMode]);

  return (
    <>
      <Header
        onToggleSidebar={() => setIsSidebarHidden((s) => !s)}
        sidebarHidden={isSidebarHidden}
      />
      <Toaster />
      <div className={`flex relative ${overlayMode ? "sidebar-hidden" : ""}`}>
        <Sidebar
          compact={compactMode}
          overlay={overlayMode}
          overlayOpen={overlayMode && !isSidebarHidden}
          onOverlayClose={() => setIsSidebarHidden(true)}
        />

        <main className="flex-1 pb-16 md:pb-0 w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </>
  );
}
