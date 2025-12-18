import { useEffect, useMemo, useRef, useState } from "react";
import axios from "../utils/axios";
import Footer from "../components/Footer";

import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

const MAX_CAPTION = 2200;

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // create post state
  const [caption, setCaption] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // emoji picker state
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [emojiAlign, setEmojiAlign] = useState("left"); // left | right

  const fileRef = useRef(null);
  const captionRef = useRef(null);

  const emojiWrapRef = useRef(null);
  const emojiPopoverRef = useRef(null);

  const remaining = useMemo(() => MAX_CAPTION - caption.length, [caption]);

  const fetchFeed = async () => {
    try {
      const res = await axios.get("/posts/feed");
      const data = Array.isArray(res.data) ? res.data : [];
      setPosts(data);
    } catch (err) {
      console.error("Fetch feed error:", err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  // очищаем blob url (preview), чтобы не текла память
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  // закрытие emoji-picker по клику вне
  useEffect(() => {
    const onDocMouseDown = (e) => {
      if (!emojiOpen) return;
      const wrap = emojiWrapRef.current;
      if (!wrap) return;
      if (!wrap.contains(e.target)) setEmojiOpen(false);
    };

    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [emojiOpen]);

  // закрытие по Esc
  useEffect(() => {
    const onKeyDown = (e) => {
      if (!emojiOpen) return;
      if (e.key === "Escape") setEmojiOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [emojiOpen]);

  // “умное” позиционирование поповера: если справа нет места — открываем влево
  useEffect(() => {
    if (!emojiOpen) return;

    const compute = () => {
      const wrap = emojiWrapRef.current;
      const pop = emojiPopoverRef.current;
      if (!wrap || !pop) return;

      const wrapRect = wrap.getBoundingClientRect();
      const popRect = pop.getBoundingClientRect();

      const viewportW = window.innerWidth || document.documentElement.clientWidth;
      const spaceRight = viewportW - wrapRect.left;
      const canOpenRight = popRect.width <= spaceRight;

      setEmojiAlign(canOpenRight ? "left" : "right");
    };

    // сначала дать поповеру отрендериться
    requestAnimationFrame(() => compute());

    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, [emojiOpen]);

  const onCaptionChange = (e) => {
    const next = e.target.value ?? "";
    setCaption(next.length <= MAX_CAPTION ? next : next.slice(0, MAX_CAPTION));
  };

  const onPickImage = () => fileRef.current?.click();

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please select an image file.");
      return;
    }

    setErrorMsg("");

    if (imagePreview) URL.revokeObjectURL(imagePreview);

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview("");
    setImageFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const insertEmoji = (emoji) => {
    // emoji-mart отдаёт объект, где emoji.native — unicode emoji [web:22]
    const value = caption;
    const el = captionRef.current;

    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;

    const next = value.slice(0, start) + (emoji?.native || "") + value.slice(end);
    if (next.length > MAX_CAPTION) return;

    setCaption(next);

    requestAnimationFrame(() => {
      if (!el) return;
      const pos = start + (emoji?.native ? emoji.native.length : 0);
      el.focus();
      el.setSelectionRange(pos, pos);
    });
  };

  const createPost = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!imageFile) {
      setErrorMsg("Image is required.");
      return;
    }

    try {
      setSubmitting(true);

      // backend ждёт upload.single("image") и caption в req.body
      const fd = new FormData();
      fd.append("image", imageFile);
      fd.append("caption", caption);

      await axios.post("/posts", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setCaption("");
      setEmojiOpen(false);
      removeImage();
      await fetchFeed();
    } catch (err) {
      console.error("Create post error:", err);
      setErrorMsg(err?.response?.data?.message || "Failed to create post.");
    } finally {
      setSubmitting(false);
    }
  };

  const resolveImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    if (path.startsWith("/")) return path;
    return `/${path}`;
  };

  if (loading) {
    return <div className="home-loading">Loading...</div>;
  }

  return (
    <main className="home">
      {/* Create post */}
      <section className="create-post">
        <form onSubmit={createPost}>
          <div className="create-top">
            <button type="button" className="photo-btn" onClick={onPickImage}>
              Select photo
            </button>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={onFileChange}
              className="file-input"
            />

            <button
              type="submit"
              className="share-btn"
              disabled={submitting || !imageFile}
              title={!imageFile ? "Select an image first" : "Share"}
            >
              {submitting ? "Publishing..." : "Share"}
            </button>
          </div>

          {imagePreview && (
            <div className="preview">
              <img src={imagePreview} alt="Preview" className="preview-img" />
              <button
                type="button"
                className="preview-remove"
                onClick={removeImage}
                aria-label="Remove image"
                title="Remove"
              >
                ×
              </button>
            </div>
          )}

          <textarea
            ref={captionRef}
            placeholder="Write a caption..."
            value={caption}
            onChange={onCaptionChange}
          />

          <div className="create-post-meta">
            <div className="emoji-area" ref={emojiWrapRef}>
              <button
                type="button"
                className="emoji-btn"
                aria-label="Emoji"
                onClick={() => setEmojiOpen((v) => !v)}
                title="Emoji"
              >
                🙂
              </button>

              {emojiOpen && (
                <div
                  ref={emojiPopoverRef}
                  className={`emoji-popover ${emojiAlign === "right" ? "is-right" : "is-left"}`}
                >
                  <Picker
                    data={data}
                    onEmojiSelect={insertEmoji}
                    theme="light"
                    previewPosition="none"
                    skinTonePosition="none"
                  />
                </div>
              )}
            </div>

            <span className={`char-counter ${remaining < 0 ? "is-over" : ""}`}>
              {caption.length}/{MAX_CAPTION}
            </span>
          </div>

          {errorMsg && <div className="create-post-error">{errorMsg}</div>}
        </form>
      </section>

      {/* Feed */}
      <div className="feed">
        {posts.length === 0 ? (
          <div className="empty-feed">
            <img
              src="/icons/noposts.png"
              alt="No updates"
              className="empty-feed-img"
            />
            <h2>You've seen all the updates</h2>
            <p className="empty-feed-subtext">You have viewed all new publications</p>
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <div className="post-card" key={post._id}>
                <div className="post-header">
                  <div className="avatar-placeholder" />
                  <span className="username">{post.author?.username || "User"}</span>
                </div>

                {post.image && (
                  <img
                    src={resolveImageUrl(post.image)}
                    alt="Post"
                    className="post-image"
                    loading="lazy"
                  />
                )}

                {post.caption && <p className="post-caption">{post.caption}</p>}
              </div>
            ))}

            <div className="empty-feed">
              <img
                src="/icons/noposts.png"
                alt="No more updates"
                className="empty-feed-img"
              />
              <h2>You've seen all the updates</h2>
              <p className="empty-feed-subtext">You have viewed all new publications</p>
            </div>
          </>
        )}
      </div>

      <Footer />
    </main>
  );
}
