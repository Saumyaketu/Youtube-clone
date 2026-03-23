"use client";
import { Avatar, AvatarFallback } from "./ui/avatar";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import {
  Clock,
  Download,
  MoreHorizontal,
  Share,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "../lib/AuthContext";
import axiosInstance from "../lib/AxiosInstance";
import PremiumModal from "./PremiumModal";
import DownloadButton from "./DownloadButton";

const VideoInfo = ({ video }: any) => {
  const [likes, setLikes] = useState(video.Like || 0);
  const [dislikes, setDislikes] = useState(video.Dislike || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isWatchlater, setIsWatchlater] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const { user } = useUser();

  const viewCountedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!video?._id) return;

    if (viewCountedRef.current !== video._id) {
      viewCountedRef.current = video._id;

      const addView = async () => {
        if (!navigator.onLine) return;
        try {
          await axiosInstance.post(`/history/views/${video._id}`);
        } catch (error) {
          console.error("View count error:", error);
        }
      };
      addView();
    }
  }, [video?._id]);

  useEffect(() => {
    if (!user?._id || !video?._id) return;

    const addToHistory = async () => {
      if (!navigator.onLine) return;
      try {
        await axiosInstance.post(`/history/${video._id}`, {
          userId: user._id,
        });
      } catch (error) {
        console.error("History error:", error);
      }
    };
    addToHistory();
  }, [video?._id, user?._id]);

  useEffect(() => {
    setLikes(video.Like || 0);
    setDislikes(video.Dislike || 0);
    setIsLiked(false);
    setIsDisliked(false);

    const fetchLikeStatus = async () => {
      if (!navigator.onLine) return;
      if (!user?._id || !video?._id) return;

      try {
        const res = await axiosInstance.get(
          `/like/status/${video._id}/${user._id}`,
        );
        setIsLiked(res.data.isLiked);
        setIsDisliked(res.data.isDisliked);
        setLikes(res.data.likes);
        setDislikes(res.data.dislikes);
      } catch (error) {
        console.error("Error fetching like status", error);
      }
    };
    fetchLikeStatus();

    const fetchWatchlaterStatus = async () => {
      if (!navigator.onLine) return;
      if (!user?._id || !video?._id) return;
      try {
        const res = await axiosInstance.get(
          `/watch/status/${video._id}/${user._id}`,
        );
        setIsWatchlater(res.data.watchlater);
      } catch (error) {
        console.error("Error fetching watch-later status", error);
      }
    };
    fetchWatchlaterStatus();
  }, [video, user]);

  const handleLike = async () => {
    if (!user) return;
    try {
      const res = await axiosInstance.post(`/like/like/${video._id}`, {
        userId: user?._id,
      });
      setLikes(res.data.likeCount);
      setDislikes(res.data.dislikeCount);
      setIsLiked(res.data.liked);
      setIsDisliked(res.data.disliked);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDislike = async () => {
    if (!user) return;
    try {
      const res = await axiosInstance.post(`/like/dislike/${video._id}`, {
        userId: user?._id,
      });
      setLikes(res.data.likeCount);
      setDislikes(res.data.dislikeCount);
      setIsLiked(res.data.liked);
      setIsDisliked(res.data.disliked);
    } catch (error) {
      console.error(error);
    }
  };

  const handleWatchlater = async () => {
    if (!user) return;
    try {
      const res = await axiosInstance.post(`/watch/${video._id}`, {
        userId: user?._id,
      });
      if (res.data.watchlater) {
        setIsWatchlater(!isWatchlater);
      } else {
        setIsWatchlater(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-3 md:space-y-4 px-2 md:px-0">
      <h1 className="text-lg md:text-xl font-semibold line-clamp-2 leading-tight">
        {video.videotitle}
      </h1>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback>{video.videochannel?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-sm md:text-base line-clamp-1">
                {video.videochannel}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                1.2M subscribers
              </p>
            </div>
          </div>
          <Button className="rounded-full md:ml-6 font-medium">
            Subscribe
          </Button>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto flex-nowrap pb-2 md:pb-0 w-full md:w-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="flex items-center bg-gray-100 rounded-full dark:bg-gray-800 shrink-0">
            <Button
              onClick={handleLike}
              variant="ghost"
              size="sm"
              className="rounded-l-full rounded-r-none px-4"
            >
              <ThumbsUp
                className={`w-5 h-5 mr-2 ${
                  isLiked
                    ? "fill-black text-black dark:fill-white dark:text-white"
                    : "text-gray-600 dark:text-gray-300"
                }`}
              />
              {likes.toLocaleString()}
            </Button>
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />
            <Button
              onClick={handleDislike}
              variant="ghost"
              size="sm"
              className="rounded-r-full rounded-l-none px-4"
            >
              <ThumbsDown
                className={`w-5 h-5 ${
                  isDisliked
                    ? "fill-black text-black dark:fill-white dark:text-white"
                    : "text-gray-600 dark:text-gray-300"
                }`}
              />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className={`bg-gray-100 rounded-full dark:bg-gray-800 shrink-0 px-4 ${
              isWatchlater ? "text-primary" : ""
            }`}
            onClick={handleWatchlater}
          >
            <Clock className="w-5 h-5 mr-2" />
            {isWatchlater ? "Saved" : "Save"}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="bg-gray-100 rounded-full dark:bg-gray-800 shrink-0 px-4"
          >
            <Share className="w-5 h-5 mr-2" />
            Share
          </Button>

          <div className="shrink-0">
            <DownloadButton video={video} />
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="bg-gray-100 rounded-full dark:bg-gray-800 shrink-0"
          >
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="bg-gray-100 rounded-xl p-3 md:p-4 dark:bg-gray-800 mt-2">
        <div className="flex gap-4 text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">
          <span>{video.views.toLocaleString()} views</span>
          <span>{formatDistanceToNow(new Date(video.createdAt))} ago</span>
        </div>
        <div
          className={`text-sm text-gray-800 dark:text-gray-200 ${showFullDescription ? "" : "line-clamp-2 md:line-clamp-3"}`}
        >
          <p>
            Sample video description. This would contain the actual video
            description from the database.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="mt-1 p-0 h-auto font-bold hover:bg-transparent"
          onClick={() => setShowFullDescription(!showFullDescription)}
        >
          {showFullDescription ? "Show less" : "more"}
        </Button>
      </div>

      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
      />
    </div>
  );
};

export default VideoInfo;
