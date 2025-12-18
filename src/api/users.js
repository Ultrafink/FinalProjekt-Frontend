import axios from "../utils/axios";

export const toggleFollow = async (userId) => {
  const res = await axios.post(`/users/u/${userId}/follow`);
  return res.data; // updated me
};
