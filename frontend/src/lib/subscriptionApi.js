import axiosInstance from "./AxiosInstance";

export const getChannelByName = async (channelName) => {
  const response = await axiosInstance.get(
    `/user/channel/${encodeURIComponent(channelName)}`,
  );
  return response.data.result;
};

export const getSubscriptions = async (userId) => {
  const response = await axiosInstance.get(`/subscription/${userId}`);
  return response.data.subscriptions;
};

export const getSubscriptionVideos = async (userId) => {
  const response = await axiosInstance.get(`/subscription/${userId}/videos`);
  return response.data.videos;
};

export const getSubscriptionStatus = async (userId, channelId) => {
  const response = await axiosInstance.get(
    `/subscription/${userId}/status/${channelId}`,
  );
  return response.data.isSubscribed;
};

export const subscribe = async (userId, channelId) => {
  const response = await axiosInstance.post(
    `/subscription/${userId}/${channelId}`,
  );
  return response.data;
};

export const unsubscribe = async (userId, channelId) => {
  const response = await axiosInstance.delete(
    `/subscription/${userId}/${channelId}`,
  );
  return response.data;
};

export const getSubscriberCount = async (channelId) => {
  const response = await axiosInstance.get(`/subscription/count/${channelId}`);
  return response.data.subscriberCount;
};