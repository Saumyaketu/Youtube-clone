"use client";
import Link from "next/link";
import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { formatDistanceToNow } from "date-fns";
import axiosInstance from "../lib/AxiosInstance";

const formatDuration = (duration: any) => {
  const seconds = parseFloat(duration);
  if (isNaN(seconds) || seconds <= 0) return "00:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const VideoCard = ({ video, isOwner = false, onUpdate }: any) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(video?.videotitle || "");
  const [draftDescription, setDraftDescription] = useState(video?.description || "");
  const [isSaving, setIsSaving] = useState(false);

  if (!video) return null;

  const isCloudinary = video?.filepath?.startsWith("http");
  const thumbnailUrl = isCloudinary
    ? video.filepath.replace(/\.(mp4|mkv|webm|avi)$/i, ".jpg")
    : "/file.svg";

  const handleSave = async () => {
    if (!video?._id) return;

    try {
      setIsSaving(true);
      const response = await axiosInstance.patch(`/video/${video._id}`, {
        videotitle: draftTitle,
        description: draftDescription,
      });

      const updatedVideo = response?.data?.updatedVideo ?? response?.data;
      if (updatedVideo) {
        onUpdate?.(updatedVideo);
      }
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating video:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="group relative">
        {isOwner && (
          <Button
            variant="outline"
            size="sm"
            className="absolute right-2 top-2 z-10 bg-white/90 dark:bg-gray-900/80"
            onClick={() => {
              setDraftTitle(video.videotitle || "");
              setDraftDescription(video.description || "");
              setIsEditing(true);
            }}
          >
            Edit
          </Button>
        )}

        <Link href={`/watch/${video._id}`} className="block">
          <div className="space-y-2 md:space-y-3">
            <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
              <img
                src={thumbnailUrl}
                alt={video.videotitle}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
              <div className="absolute bottom-1 right-1 md:bottom-2 md:right-2 bg-black/80 text-white text-[10px] md:text-xs px-1 rounded">
                {formatDuration(video.duration)}
              </div>
            </div>

            <div className="flex gap-2 md:gap-3">
              <Avatar className="w-8 h-8 md:w-9 md:h-9 shrink-0">
                <AvatarImage />
                <AvatarFallback className="dark:text-white text-xs md:text-sm">
                  {video.videochannel?.[0] || "U"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm leading-tight line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {video.videotitle}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
                  {video.videochannel}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  {video.views?.toLocaleString()} views •{" "}
                  {video.createdAt
                    ? `${formatDistanceToNow(new Date(video.createdAt))} ago`
                    : "Just now"}
                </p>
              </div>
            </div>
          </div>
        </Link>
      </div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-lg dark:bg-gray-900 dark:text-gray-100">
          <DialogHeader>
            <DialogTitle>Edit video</DialogTitle>
            <DialogDescription>
              Update the title and description for this video.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="video-title">Title</Label>
              <Input
                id="video-title"
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="video-description">Description</Label>
              <Textarea
                id="video-description"
                value={draftDescription}
                onChange={(e) => setDraftDescription(e.target.value)}
                className="min-h-[110px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VideoCard;