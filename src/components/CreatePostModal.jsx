import { useEffect, useMemo, useRef, useState } from "react";
import { createPost } from "../api/posts";

const MAX = 2200;

const EMOJIS = [
  "😀","😁","😂","🤣","😊","😍","😘","😎","😭","😡","👍","🔥","❤️","🎉","✨","😴","🤝","🥲","🙏"
];

export default function CreatePostModal({ open, onClose, me, onCreated }) {
  const inputRef = useRef(null);
  const textareaRef = useRef(null);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [caption, setCaption] = useState("");
  const [showEmojis, setShowEmojis] = useState(false);
  const [loading, setLoading] = useState(false);

  const leftReady = !!preview;
  const canShare = leftReady && caption.length <= MAX && !loading;

  const apiBase = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
  const avatarSrc =
    me?.avatar?.startsWith("http")
      ? me.avatar
      : me?.avatar
        ? `${apiBase}${me.avatar.startsWith("/") ? "" : "/"}${me.avatar}`
        : "/icons/profile.png";

  const reset = () => {
    setFile(null);
    setPreview("");
    setCaption("");
    setShowEmojis(false);
    setLoading(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const close = () => {
    reset();
    onClose?.();
  };

  useEffect(() => {
    if (!open) return;

    const onKey = (e) => {
      if (e.key === "Escape") close();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const charsLeft = useMemo(() => MAX - caption.length, [caption]);

  if (!open) return null;

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("create-overlay")) close();
  };

  const onPickFile = () => inputRef.current?.click();

  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
  };

  const insertEmoji = (emoji) => {
    const el = textareaRef.current;

    if (!el) {
      setCaption((c) => (c + emoji).slice(0, MAX));
      return;
    }

    const start = el.selectionStart ?? caption.length;
    const end = el.selectionEnd ?? caption.length;

    const next = (caption.slice(0, start) + emoji + caption.slice(end)).slice(0, MAX);
    setCaption(next);

    requestAnimationFrame(() => {
      el.focus();
      const pos = Math.min(start + emoji.length, MAX);
      el.setSelectionRange(pos, pos);
    });
  };

  const share = async () => {
    if (!file) {
      alert("Сначала выбери картинку 🙂");
      return;
    }

    try {
      setLoading(true);
      const created = await createPost({ file, caption });
      onCreated?.(created);
      close();
    } catch (e) {
      console.error("CREATE POST ERROR:", e?.response?.status, e?.response?.data || e);
      alert(e?.response?.data?.message || "Не получилось создать пост :(");
      setLoading(false);
    }
  };

  return (
    <div className="create-overlay" onMouseDown={handleOverlayClick}>
      <div className="create-modal" role="dialog" aria-modal="true">
        <div className="create-header">
          <div />
          <div className="create-title">Create new post</div>
          <button
            className="create-share"
            onClick={share}
            disabled={!canShare}
            type="button"
          >
            {loading ? "Sharing..." : "Share"}
          </button>
        </div>

        <div className="create-body">
          <div className="create-left">
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={onFileChange}
            />

            {!preview ? (
              <button className="create-drop" onClick={onPickFile} type="button">
                <img src="/icons/upload.png" alt="upload" className="create-drop-icon" />
              </button>
            ) : (
              <div
                className="create-preview-wrap"
                onClick={onPickFile}
                role="button"
                tabIndex={0}
              >
                <img className="create-preview" src={preview} alt="preview" />
              </div>
            )}
          </div>

          <div className="create-right">
            <div className="create-user">
              <div className="create-avatar">
                <img
                  src={avatarSrc}
                  alt="avatar"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/icons/profile.png";
                  }}
                />
              </div>
              <div className="create-username">{me?.username || "username"}</div>
            </div>

            <div className="create-caption">
              <textarea
                ref={textareaRef}
                value={caption}
                onChange={(e) => setCaption(e.target.value.slice(0, MAX))}
                placeholder="Write a caption..."
                rows={8}
                style={{ fontFamily: "inherit" }}   // шрифт как в проекте
              />
            </div>

            <div className="create-footer">
              <button
                type="button"
                className="create-emoji-btn"
                onClick={() => setShowEmojis((v) => !v)}
              >
                🙂
              </button>

              <div className="create-counter">{charsLeft}</div>

              {showEmojis ? (
                <div className="create-emoji-pop">
                  {EMOJIS.map((x) => (
                    <button
                      key={x}
                      type="button"
                      className="create-emoji"
                      onClick={() => insertEmoji(x)}
                    >
                      {x}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
