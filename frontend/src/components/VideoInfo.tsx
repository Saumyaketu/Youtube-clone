"use client";
import { Avatar, AvatarFallback } from "./ui/avatar";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import {
  Download,
  MoreHorizontal,
  Share,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "../lib/AuthContext";
import axiosInstance from "../lib/AxiosInstance";

const VideoInfo = ({ video }: any) => {
  const [likes, setLikes] = useState(video.Like || 0);
  const [dislikes, setDislikes] = useState(video.Dislike || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const { user } = useUser();

  useEffect(() => {
    setLikes(video.Like || 0);
    setDislikes(video.Dislike || 0);
    setIsLiked(false);
    setIsDisliked(false);

    const fetchLikeStatus = async () => {
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

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">{video.videotitle}</h1>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="w-10 h-10">
            <AvatarFallback>{video.videochannel?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{video.videochannel}</h3>
            <p className="text-sm text-gray-600">1.2M subscribers</p>
          </div>
          <Button className="ml-4">Subscribe</Button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-gray-100 rounded-full">
            <Button
              onClick={handleLike}
              variant="ghost"
              size="sm"
              className="rounded-full"
            >
              <ThumbsUp
                className={`w-5 h-5 mr-2 ${
                  isLiked ? "fill-black text-black" : ""
                }`}
              />
              {likes.toLocaleString()}
            </Button>
            <div className="w-px h-6 bg-gray-300" />
            <Button
              onClick={handleDislike}
              variant="ghost"
              size="sm"
              className="rounded-full"
            >
              <ThumbsDown
                className={`w-5 h-5 mr-2 ${
                  isDisliked ? "fill-black text-black" : ""
                }`}
              />
              {dislikes.toLocaleString()}
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="bg-gray-100 rounded-full"
          >
            <Share className="w-5 h-5 mr-2" />
            Share
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="bg-gray-100 rounded-full"
          >
            <Download className="w-5 h-5 mr-2" />
            Download
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="bg-gray-100 rounded-full"
          >
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>
      </div>
      <div className="bg-gray-100 rounded-lg p-4">
        <div className="flex gap-4 text-sm font-medium mb-2">
          <span>{video.views.toLocaleString()} views</span>
          <span>{formatDistanceToNow(new Date(video.createdAt))} ago</span>
        </div>
        <div className={`text-sm ${showFullDescription ? "" : "line-clamp-3"}`}>
          <p>
            Sample video description. This would contain the actual video
            description from the database.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 p-0 h-auto font-medium"
          onClick={() => setShowFullDescription(!showFullDescription)}
        >
          {showFullDescription ? "Show less" : "Show more"}
        </Button>
      </div>
    </div>
  );
};

export default VideoInfo;
