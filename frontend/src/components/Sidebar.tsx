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
  X,
  Download,
} from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { useState } from "react";
import ChannelDialogue from "./ChannelDialogue";
import { useUser } from "../lib/AuthContext";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const Sidebar = () => {
  const { user, logout } = useUser();
  const [isDialogueOpen, setisDialogueOpen] = useState(false);
  const [isYouTabOpen, setIsYouTabOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:block w-64 bg-background border-r border-border h-[calc(100vh-64px)] p-2 text-foreground sticky top-[64px] overflow-y-auto">
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

        <button
          onClick={() => {
            if (user) {
              setIsYouTabOpen(true);
            } else {
              router.push("/history");
            }
          }}
          className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground"
        >
          {user ? (
            <User className="w-6 h-6" />
          ) : (
            <History className="w-6 h-6" />
          )}
          <span className="text-[10px]">{user ? "You" : "History"}</span>
        </button>
      </nav>

      {user && isYouTabOpen && (
        <div className="fixed inset-0 bg-background z-100 flex flex-col md:hidden animate-in slide-in-from-right-2 duration-200 overflow-hidden">
          <div className="flex items-center p-4 border-b border-border sticky top-0 bg-background z-10 shrink-0 gap-4">
            <button
              onClick={() => setIsYouTabOpen(false)}
              className="p-1 rounded-full hover:bg-secondary"
            >
              <X className="w-6 h-6" />
            </button>
            <span className="text-xl font-bold">You</span>
          </div>

          <div className="flex-1 overflow-y-auto pb-20 p-4">
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="w-16 h-16">
                <AvatarImage src={user.image || undefined} />
                <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <h2 className="text-xl font-bold">{user.name}</h2>
                <span className="text-sm text-muted-foreground mb-1">
                  @
                  {user.channelName ||
                    user.name?.toLowerCase().replace(/\s/g, "")}
                </span>
                <button
                  onClick={() => {
                    setIsYouTabOpen(false);
                    if (user.channelName) router.push(`/channel/${user._id}`);
                    else setisDialogueOpen(true);
                  }}
                  className="text-sm text-blue-500 font-medium text-left"
                >
                  {user.channelName ? "View Channel" : "Create Channel"}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <Link href="/history" onClick={() => setIsYouTabOpen(false)}>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-12 text-base px-2"
                >
                  <History className="w-6 h-6 mr-4" /> History
                </Button>
              </Link>
              <Link href="/liked" onClick={() => setIsYouTabOpen(false)}>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-12 text-base px-2"
                >
                  <ThumbsUp className="w-6 h-6 mr-4" /> Liked Videos
                </Button>
              </Link>
              <Link href="/watch-later" onClick={() => setIsYouTabOpen(false)}>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-12 text-base px-2"
                >
                  <Clock className="w-6 h-6 mr-4" /> Watch Later
                </Button>
              </Link>
              <Link href="/downloads" onClick={() => setIsYouTabOpen(false)}>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-12 text-base px-2"
                >
                  <Download className="w-6 h-6 mr-4" /> Downloads
                </Button>
              </Link>
            </div>

            <div className="h-px bg-border my-4 w-full" />

            <Button
              variant="ghost"
              className="w-full justify-start h-12 text-base px-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={() => {
                logout();
                setIsYouTabOpen(false);
              }}
            >
              Sign Out
            </Button>
          </div>
        </div>
      )}

      <ChannelDialogue
        isopen={isDialogueOpen}
        onclose={() => setisDialogueOpen(false)}
        mode="create"
      />
    </>
  );
};

export default Sidebar;
