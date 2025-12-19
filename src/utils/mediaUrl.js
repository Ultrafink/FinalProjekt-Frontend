// src/utils/mediaUrl.js
export const mediaUrl = (value) => {
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;

  const apiBase = import.meta.env.VITE_API_URL || "";
  if (!apiBase) return value;

  const serverBase = apiBase.replace(/\/api\/?$/, "");
  return `${serverBase}${value.startsWith("/") ? "" : "/"}${value}`;
};
