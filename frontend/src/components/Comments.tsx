"use client";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import React, { useEffect, useState } from "react";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "../lib/AuthContext";
import axiosInstance from "../lib/AxiosInstance";
import { getUserLocation } from "../lib/location";
import {
  MapPin,
  Globe,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface Comment {
  _id: string;
  videoid: string;
  userid: string;
  commentbody: string;
  usercommented: string;
  commentedon: string;
  city?: string;
  likes: number;
  dislikes: number;
}
const LANGUAGES = [
  { code: "af", name: "Afrikaans" },
  { code: "sq", name: "Albanian" },
  { code: "am", name: "Amharic" },
  { code: "ar", name: "Arabic" },
  { code: "hy", name: "Armenian" },
  { code: "az", name: "Azerbaijani" },
  { code: "eu", name: "Basque" },
  { code: "be", name: "Belarusian" },
  { code: "bn", name: "Bengali" },
  { code: "bs", name: "Bosnian" },
  { code: "bg", name: "Bulgarian" },
  { code: "ca", name: "Catalan" },
  { code: "ceb", name: "Cebuano" },
  { code: "ny", name: "Chichewa" },
  { code: "zh", name: "Chinese (Simplified)" },
  { code: "zh-TW", name: "Chinese (Traditional)" },
  { code: "co", name: "Corsican" },
  { code: "hr", name: "Croatian" },
  { code: "cs", name: "Czech" },
  { code: "da", name: "Danish" },
  { code: "nl", name: "Dutch" },
  { code: "en", name: "English" },
  { code: "eo", name: "Esperanto" },
  { code: "et", name: "Estonian" },
  { code: "tl", name: "Filipino" },
  { code: "fi", name: "Finnish" },
  { code: "fr", name: "French" },
  { code: "fy", name: "Frisian" },
  { code: "gl", name: "Galician" },
  { code: "ka", name: "Georgian" },
  { code: "de", name: "German" },
  { code: "el", name: "Greek" },
  { code: "gu", name: "Gujarati" },
  { code: "ht", name: "Haitian Creole" },
  { code: "ha", name: "Hausa" },
  { code: "haw", name: "Hawaiian" },
  { code: "iw", name: "Hebrew" },
  { code: "hi", name: "Hindi" },
  { code: "hmn", name: "Hmong" },
  { code: "hu", name: "Hungarian" },
  { code: "is", name: "Icelandic" },
  { code: "ig", name: "Igbo" },
  { code: "id", name: "Indonesian" },
  { code: "ga", name: "Irish" },
  { code: "it", name: "Italian" },
  { code: "ja", name: "Japanese" },
  { code: "jw", name: "Javanese" },
  { code: "kn", name: "Kannada" },
  { code: "kk", name: "Kazakh" },
  { code: "km", name: "Khmer" },
  { code: "rw", name: "Kinyarwanda" },
  { code: "ko", name: "Korean" },
  { code: "ku", name: "Kurdish (Kurmanji)" },
  { code: "ky", name: "Kyrgyz" },
  { code: "lo", name: "Lao" },
  { code: "la", name: "Latin" },
  { code: "lv", name: "Latvian" },
  { code: "lt", name: "Lithuanian" },
  { code: "lb", name: "Luxembourgish" },
  { code: "mk", name: "Macedonian" },
  { code: "mg", name: "Malagasy" },
  { code: "ms", name: "Malay" },
  { code: "ml", name: "Malayalam" },
  { code: "mt", name: "Maltese" },
  { code: "mi", name: "Maori" },
  { code: "mr", name: "Marathi" },
  { code: "mn", name: "Mongolian" },
  { code: "my", name: "Myanmar (Burmese)" },
  { code: "ne", name: "Nepali" },
  { code: "no", name: "Norwegian" },
  { code: "or", name: "Odia (Oriya)" },
  { code: "ps", name: "Pashto" },
  { code: "fa", name: "Persian" },
  { code: "pl", name: "Polish" },
  { code: "pt", name: "Portuguese" },
  { code: "pa", name: "Punjabi" },
  { code: "ro", name: "Romanian" },
  { code: "ru", name: "Russian" },
  { code: "sm", name: "Samoan" },
  { code: "gd", name: "Scots Gaelic" },
  { code: "sr", name: "Serbian" },
  { code: "st", name: "Sesotho" },
  { code: "sn", name: "Shona" },
  { code: "sd", name: "Sindhi" },
  { code: "si", name: "Sinhala" },
  { code: "sk", name: "Slovak" },
  { code: "sl", name: "Slovenian" },
  { code: "so", name: "Somali" },
  { code: "es", name: "Spanish" },
  { code: "su", name: "Sundanese" },
  { code: "sw", name: "Swahili" },
  { code: "sv", name: "Swedish" },
  { code: "tg", name: "Tajik" },
  { code: "ta", name: "Tamil" },
  { code: "tt", name: "Tatar" },
  { code: "te", name: "Telugu" },
  { code: "th", name: "Thai" },
  { code: "tr", name: "Turkish" },
  { code: "tk", name: "Turkmen" },
  { code: "uk", name: "Ukrainian" },
  { code: "ur", name: "Urdu" },
  { code: "ug", name: "Uyghur" },
  { code: "uz", name: "Uzbek" },
  { code: "vi", name: "Vietnamese" },
  { code: "cy", name: "Welsh" },
  { code: "xh", name: "Xhosa" },
  { code: "yi", name: "Yiddish" },
  { code: "yo", name: "Yoruba" },
  { code: "zu", name: "Zulu" },
];

const Comments = ({ videoId }: any) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [userCity, setUserCity] = useState("Unknown Location");
  const [translatedComments, setTranslatedComments] = useState<{
    [key: string]: string;
  }>({});
  const [translatingId, setTranslatingId] = useState<string | null>(null);
  const [targetLang, setTargetLang] = useState("en");

  useEffect(() => {
    loadComments();
    const initLocation = async () => {
      const { city } = await getUserLocation();
      setUserCity(city);
    };
    initLocation();
  }, [videoId]);

  const loadComments = async () => {
    try {
      const res = await axiosInstance.get(`/comment/${videoId}`);
      setComments(res.data.commentVideo);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const validateComment = (text: string) => {
    const regex = /[^\p{L}\p{M}\p{N}\s.,!?'"|¿¡。-]/u;
    return !regex.test(text);
  };

  const handleSubmitComment = async () => {
    if (!user || !newComment.trim()) return;

    if (!validateComment(newComment)) {
      toast.error("Comments cannot contain special characters (@, #, $, etc).");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await axiosInstance.post("/comment/postComment", {
        videoid: videoId,
        userid: user._id,
        commentbody: newComment,
        usercommented: user.name,
        city: userCity,
      });
      if (res.data.comment && res.data.newComment) {
        setComments([res.data.newComment, ...comments]);
      }
      setNewComment("");
    } catch (error: any) {
      console.error("Error adding comment:", error);
      toast.error(error.response?.data?.message || "Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (comment: Comment) => {
    setEditingCommentId(comment._id);
    setEditText(comment.commentbody || "");
  };

  const handleUpdateComment = async () => {
    if (!editText.trim()) return;

    if (!validateComment(editText)) {
      toast.error("Comments cannot contain special characters (@, #, $, etc).");
      return;
    }

    try {
      const res = await axiosInstance.post(
        `/comment/editComment/${editingCommentId}`,
        { commentbody: editText },
      );
      if (res.data.comment) {
        setComments((prev) =>
          prev.map((c) =>
            c._id === editingCommentId ? { ...c, commentbody: editText } : c,
          ),
        );
        setEditingCommentId(null);
        setEditText("");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update comment");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await axiosInstance.delete(`/comment/deleteComment/${id}`);
      if (res.data.comment) {
        setComments((prev) => prev.filter((c) => c._id !== id));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleTranslate = async (commentId: string, text: string) => {
    if (translatedComments[commentId]) {
      const newTranslations = { ...translatedComments };
      delete newTranslations[commentId];
      setTranslatedComments(newTranslations);
      return;
    }

    setTranslatingId(commentId);
    try {
      const res = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=Autodetect|${targetLang}`,
      );
      const data = await res.json();
      if (data.responseData && data.responseData.translatedText) {
        setTranslatedComments((prev) => ({
          ...prev,
          [commentId]: data.responseData.translatedText,
        }));
      } else {
        toast.error("Could not translate this comment.");
      }
    } catch (error) {
      console.error("Translation error:", error);
      toast.error("Translation failed");
    } finally {
      setTranslatingId(null);
    }
  };

  const handleLike = async (commentId: string) => {
    if (!user) return toast.error("Please login to like");
    try {
      const res = await axiosInstance.put(`/comment/like/${commentId}`, {
        userId: user._id,
      });
      if (res.data.updatedComment) {
        setComments((prev) =>
          prev.map((c) => (c._id === commentId ? res.data.updatedComment : c)),
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDislike = async (commentId: string) => {
    if (!user) return toast.error("Please login to dislike");
    try {
      const res = await axiosInstance.put(`/comment/dislike/${commentId}`, {
        userId: user._id,
      });

      if (res.data.commentDeleted) {
        setComments((prev) => prev.filter((c) => c._id !== commentId));
        toast.info("Comment removed due to excessive dislikes");
      } else if (res.data.updatedComment) {
        setComments((prev) =>
          prev.map((c) => (c._id === commentId ? res.data.updatedComment : c)),
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return <div>Loading comments...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold dark:text-white">{comments.length} Comments</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex gap-2">
              <Globe className="w-4 h-4" />
              Translate to: {LANGUAGES.find((l) => l.code === targetLang)?.name}
              <ChevronDown className="w-3 h-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="dark:bg-gray-800 dark:text-gray-100">
            {LANGUAGES.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => {
                  setTargetLang(lang.code);
                  setTranslatedComments({});
                }}
              >
                {lang.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {user && (
        <div className="flex gap-4">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user.image || ""} />
            <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
              <MapPin className="w-3 h-3" />
              <span>Posting from: {userCity}</span>
            </div>
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e: any) => setNewComment(e.target.value)}
              className="min-h-20 resize-none border-0 border-b-2 rounded-none focus-visible:ring-0"
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="ghost"
                onClick={() => setNewComment("")}
                disabled={!newComment.trim()}
              >
                Cancel
              </Button>
              <Button
                variant="ghost"
                className="bg-blue-300 hover:bg-blue-400 dark:bg-blue-600 dark:hover:bg-blue-500"
                size="sm"
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || isSubmitting}
              >
                Comment
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
              No comments yet. Be the first to comment!
            </p>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="flex gap-4">
              <Avatar className="w-10 h-10">
                <AvatarImage src="/placeholder.svg?height=40&width=40" />
                <AvatarFallback>{comment.usercommented[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">
                    {comment.usercommented}
                  </span>
                  {comment.city && (
                    <span className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-900 px-2 py-0.5 rounded-full">
                      <MapPin className="w-3 h-3" />
                      {comment.city}
                    </span>
                  )}
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {formatDistanceToNow(new Date(comment.commentedon))} ago
                  </span>
                </div>

                {editingCommentId === comment._id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                    />
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        className="bg-blue-300 hover:bg-blue-400"
                        size="sm"
                        onClick={handleUpdateComment}
                        disabled={!editText || !editText.trim()}
                      >
                        Save
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setEditingCommentId(null);
                          setEditText("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm">{comment.commentbody}</p>

                    {translatedComments[comment._id] && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-1">
                          <Globe className="w-3 h-3" />
                          <span>Translated to {LANGUAGES.find((l) => l.code === targetLang)?.name}:</span>
                        </div>
                        <p>{translatedComments[comment._id]}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-4 mt-2">
                      <button
                        onClick={() => handleLike(comment._id)}
                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        {comment.likes || 0}
                      </button>
                      <button
                        onClick={() => handleDislike(comment._id)}
                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900"
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                        {comment.dislikes || 0}
                      </button>

                      <button
                        onClick={() =>
                          handleTranslate(comment._id, comment.commentbody)
                        }
                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600"
                        disabled={translatingId === comment._id}
                      >
                        <Globe className="w-3.5 h-3.5" />
                        {translatingId === comment._id
                          ? "Translating..."
                          : translatedComments[comment._id]
                            ? "Show Original"
                            : `Translate to ${LANGUAGES.find((l) => l.code === targetLang)?.name}`}
                      </button>

                      {comment.userid === user?._id && (
                        <div className="flex gap-2 mt-2 text-sm text-gray-500">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(comment)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            size="sm"
                            onClick={() => handleDelete(comment._id)}
                          >
                            Delete
                          </Button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Comments;
