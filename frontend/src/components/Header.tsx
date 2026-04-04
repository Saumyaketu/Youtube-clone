"use client";
import { Bell, Menu, Mic, Search, User, VideoIcon } from "lucide-react";
import React, { FormEvent, useState } from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import ChannelDialogue from "./ChannelDialogue";
import { useRouter } from "next/navigation";
import { useUser } from "../lib/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Label } from "./ui/label";

const SOUTH_INDIAN_STATES = [
  "tamil nadu",
  "kerala",
  "karnataka",
  "andhra pradesh",
  "telangana",
];

const Header = () => {
  const {
    user,
    logout,
    handleGoogleSignIn,
    locationState,
    showOtpModal,
    setShowOtpModal,
    verifyOtpAndLogin,
    isDarkMode,
  } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogueOpen, setisDialogueOpen] = useState(false);
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState("");

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const onSignInClick = async () => {
    const isSouthIndia =
      locationState &&
      SOUTH_INDIAN_STATES.includes(locationState.toLowerCase());
    if (locationState && !isSouthIndia) {
      setIsLoginModalOpen(true);
    } else {
      setIsProcessing(true); 
      try {
        await handleGoogleSignIn();
      } finally {
        setIsProcessing(false); 
      }
    }
  };

  const submitPhoneAndContinue = async () => {
    if (phone.length !== 10) return;
    setIsProcessing(true);
    try {
      await handleGoogleSignIn(phone);
    } finally {
      setIsProcessing(false);
      setIsLoginModalOpen(false);
    }
  };

  const submitOtp = async () => {
    if (otpInput.length !== 6) return;
    const success = await verifyOtpAndLogin(otpInput);
    if (!success) {
      setOtpError("Invalid or incorrect OTP. Please try again.");
    }
  };

  return (
    <>
      {isProcessing && (
        <div className="fixed inset-0 z-100000 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center cursor-not-allowed transition-all duration-300">
          <div className="bg-background border border-border p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-5 text-center max-w-sm mx-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <div>
              <h3 className="text-lg font-bold text-foreground">
                Secure Login in Progress
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                Please complete the Google Sign-in popup. We are securely
                generating your OTP...
              </p>
            </div>
          </div>
        </div>
      )}

      <header className="flex items-center justify-between px-4 py-2 bg-background border-border border-b sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="hidden md:flex">
            <Menu className="w-6 h-6" />
          </Button>
          <Link href="/" className="flex items-center gap-1">
            <div className="bg-red-600 p-1 rounded">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill={isDarkMode ? "white" : "black"}
              >
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </div>
            <span className="text-xl font-medium dark:text-white hidden sm:block">
              YouTube
            </span>
          </Link>
        </div>

        {/* Desktop Search Bar */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex items-center gap-2 flex-1 max-w-2xl mx-4"
        >
          <div className="flex flex-1">
            <Input
              type="search"
              name="search"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-l-full border-r-0 focus-visible:ring-0"
            />
            <Button
              type="submit"
              className="rounded-r-full px-6 bg-secondary hover:bg-secondary/80 text-foreground border-border border border-l-0"
            >
              <Search className="w-5 h-5" />
            </Button>
          </div>
          <Button
            type="button"
            variant="ghost"
            className="rounded-full bg-secondary"
          >
            <Mic className="w-5 h-5" />
          </Button>
        </form>

        {/* Right Side Icons (Mobile + Desktop) */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Mobile Search Icon */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => router.push("/search")}
          >
            <Search className="w-5 h-5" />
          </Button>

          {user ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="hidden sm:inline-flex"
              >
                <VideoIcon className="w-6 h-6" />
              </Button>
              <Button variant="ghost" size="icon">
                <Bell className="w-6 h-6" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user.image || undefined}
                        alt={user.name || "User Avatar"}
                      />
                      <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  {user?.channelName ? (
                    <DropdownMenuItem asChild>
                      <Link href={`/channel/${user?._id}`}>Your Channel</Link>
                    </DropdownMenuItem>
                  ) : (
                    <div className="px-2 py-1.5">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full"
                        onClick={() => setisDialogueOpen(true)}
                      >
                        Create a channel
                      </Button>
                    </div>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/history">History</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/liked">Liked Videos</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/watch-later">Watch Later</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/downloads">Downloads</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>Sign out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button
                className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600"
                onClick={onSignInClick}
                disabled={locationState === null}
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Sign in</span>
              </Button>

              <Dialog
                open={isLoginModalOpen}
                onOpenChange={(isOpen) => {
                  if (!isProcessing) setIsLoginModalOpen(isOpen);
                }}
              >
                <DialogContent
                  className="sm:max-w-md top-[35%] translate-y-[-35%]"
                  onPointerDownOutside={(e) =>
                    isProcessing && e.preventDefault()
                  }
                  onEscapeKeyDown={(e) => isProcessing && e.preventDefault()}
                >
                  <DialogHeader>
                    <DialogTitle>Enter Mobile Number</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col gap-4 py-4">
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 p-3 rounded-lg">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200 leading-relaxed">
                        <strong className="block mb-1">
                          Free Tier Demo:
                        </strong>
                        Please enter the test number{" "}
                        <b className="tracking-wide">+91 99999 99999</b>. Real
                        numbers will fail. The OTP to use on the next screen is{" "}
                        <b>123456</b>.
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="phone">Mobile Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="9876543210"
                        value={phone}
                        onChange={(e) => {
                          const numericValue = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setPhone(numericValue);
                        }}
                        disabled={isProcessing}
                      />
                    </div>
                    <Button
                      onClick={submitPhoneAndContinue}
                      className="mt-2"
                      disabled={isProcessing || phone.length !== 10}
                    >
                      {isProcessing
                        ? "Loading..."
                        : "Continue to Google Sign-In"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog
                open={showOtpModal}
                onOpenChange={(isOpen) => {
                  if (!isOpen) {
                    sessionStorage.removeItem("pendingOtp");
                    logout();
                  }
                  setShowOtpModal(isOpen);
                }}
              >
                <DialogContent className="sm:max-w-md top-[35%] translate-y-[-35%]">
                  <DialogHeader>
                    <DialogTitle>Verify OTP</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col gap-4 py-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Enter the 6-digit OTP sent to you. (Hint: Use 123456 for
                      testing)
                    </p>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="otp">OTP Code</Label>
                      <Input
                        id="otp"
                        type="text"
                        placeholder="123456"
                        value={otpInput}
                        onChange={(e) => {
                           const numericValue = e.target.value.replace(/\D/g, '').slice(0, 6);
                           setOtpInput(numericValue);
                        }}
                      />
                      {otpError && (
                        <p className="text-xs text-red-500">{otpError}</p>
                      )}
                    </div>
                    <Button onClick={submitOtp} disabled={otpInput.length !== 6}>Verify & Login</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
        <ChannelDialogue
          isopen={isDialogueOpen}
          onclose={() => setisDialogueOpen(false)}
          mode="create"
        />
        <div id="recaptcha-container"></div>
      </header>
    </>
  );
};

export default Header;
