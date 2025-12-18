// src/utils/mediaUrl.js
export const mediaUrl = (value) => {
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;

  const base = import.meta.env.VITE_API_URL || "";
  if (!base) return value;

  return `${base}${value.startsWith("/") ? "" : "/"}${value}`;
};
