import axios from "../utils/axios";

export const createPost = async ({ file, caption }) => {
  const fd = new FormData();
  fd.append("image", file);
  fd.append("caption", caption);

  const res = await axios.post("/posts", fd);
  return res.data;
};

export const getPostById = async (id) => {
  const res = await axios.get(`/posts/${id}`);
  return res.data;
};

export const deletePost = async (id) => {
  const res = await axios.delete(`/posts/${id}`);
  return res.data;
};

export const toggleLike = async (id) => {
  const res = await axios.post(`/posts/${id}/like`);
  return res.data;
};

export const addComment = async (id, text) => {
  const res = await axios.post(`/posts/${id}/comments`, { text });
  return res.data;
};

export const toggleCommentLike = async (postId, commentId) => {
  const res = await axios.post(`/posts/${postId}/comments/${commentId}/like`);
  return res.data;
};
