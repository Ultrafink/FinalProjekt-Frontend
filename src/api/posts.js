import axios from "../utils/axios";

export const createPost = async ({ file, caption }) => {
  const fd = new FormData();
  fd.append("image", file);      // имя поля должно совпасть с multer на бэке
  fd.append("caption", caption);

  const res = await axios.post("/posts", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
};
