"use client";
import {
  Home,
  Compass,
  PlaySquare,
  Clock,
  ThumbsUp,
  History,
  User,
  PlusCircle,
  Video,
} from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { useState } from "react";
import ChannelDialogue from "./ChannelDialogue";
import { useUser } from "../lib/AuthContext";

const Sidebar = () => {
  const { user } = useUser();
  const [isDialogueOpen, setisDialogueOpen] = useState(false);

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:block w-64 bg-background border-r border-border min-h-[calc(100vh-64px)] p-2 text-foreground sticky top-0 overflow-y-auto">
        <nav className="space-y-1">
          <Link href="/">
            <Button variant="ghost" className="w-full justify-start">
              <Home className="w-5 h-5 mr-3" />
              Home
            </Button>
          </Link>
          <Link href="/explore">
            <Button variant="ghost" className="w-full justify-start">
              <Compass className="w-5 h-5 mr-3" />
              Explore
            </Button>
          </Link>
          <Link href="/subscriptions">
            <Button variant="ghost" className="w-full justify-start">
              <PlaySquare className="w-5 h-5 mr-3" />
              Subscriptions
            </Button>
          </Link>
          <Link href="/video-call">
            <Button variant="ghost" className="w-full justify-start">
              <Video className="w-5 h-5 mr-3" />
              Video Call
            </Button>
          </Link>

          {user && (
            <div className="border-t pt-2 mt-2">
              <Link href="/history">
                <Button variant="ghost" className="w-full justify-start">
                  <History className="w-5 h-5 mr-3" />
                  History
                </Button>
              </Link>
              <Link href="/liked">
                <Button variant="ghost" className="w-full justify-start">
                  <ThumbsUp className="w-5 h-5 mr-3" />
                  Liked videos
                </Button>
              </Link>
              <Link href="/watch-later">
                <Button variant="ghost" className="w-full justify-start">
                  <Clock className="w-5 h-5 mr-3" />
                  Watch later
                </Button>
              </Link>
              <Link href="/downloads">
                <Button variant="ghost" className="w-full justify-start">
                  <Clock className="w-5 h-5 mr-3" />
                  Downloads
                </Button>
              </Link>
              {user?.channelName ? (
                <Link href={`/channel/${user._id}`}>
                  <Button variant="ghost" className="w-full justify-start">
                    <User className="w-5 h-5 mr-3" />
                    Your channel
                  </Button>
                </Link>
              ) : (
                <div className="px-2 py-1.5">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={() => setisDialogueOpen(true)}
                  >
                    Create Channel
                  </Button>
                </div>
              )}
            </div>
          )}
        </nav>
      </aside>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border flex items-center justify-around py-2 px-1 z-50">
        <Link
          href="/"
          className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground"
        >
          <Home className="w-6 h-6" />
          <span className="text-[10px]">Home</span>
        </Link>

        <Link
          href="/explore"
          className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground"
        >
          <Compass className="w-6 h-6" />
          <span className="text-[10px]">Explore</span>
        </Link>

        {/* Create Button */}
        {user && !user?.channelName ? (
          <button
            onClick={() => setisDialogueOpen(true)}
            className="flex flex-col items-center justify-center -mt-4 bg-background rounded-full p-1"
          >
            <PlusCircle
              className="w-10 h-10 text-foreground"
              strokeWidth={1.5}
            />
          </button>
        ) : user?.channelName ? (
          <Link
            href={`/channel/${user._id}`}
            className="flex flex-col items-center justify-center -mt-4 bg-background rounded-full p-1"
          >
            <PlusCircle
              className="w-10 h-10 text-foreground"
              strokeWidth={1.5}
            />
          </Link>
        ) : null}

        <Link
          href="/subscriptions"
          className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground"
        >
          <PlaySquare className="w-6 h-6" />
          <span className="text-[10px]">Subs</span>
        </Link>

        <Link
          href={user ? "/history" : "/"}
          className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground"
        >
          {user ? (
            <User className="w-6 h-6" />
          ) : (
            <History className="w-6 h-6" />
          )}
          <span className="text-[10px]">{user ? "You" : "History"}</span>
        </Link>
      </nav>

      <ChannelDialogue
        isopen={isDialogueOpen}
        onclose={() => setisDialogueOpen(false)}
        mode="create"
      />
    </>
  );
};

export default Sidebar;
