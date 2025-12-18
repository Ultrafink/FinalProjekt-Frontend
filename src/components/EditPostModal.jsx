import { useEffect, useMemo, useState } from "react";
import axios from "../utils/axios";

export default function EditPostModal({ open, post, onClose, onUpdated }) {
  const postId = post?.id ?? null;
  const initialCaption = useMemo(() => post?.caption ?? "", [post?.caption]);

  // draft: null => показываем initialCaption (не нужен эффект-ресет)
  const [draft, setDraft] = useState(null); // string | null
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const caption = draft === null ? initialCaption : draft;

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const closeIfAllowed = () => {
    if (saving) return;
    setDraft(null);
    setError("");
    setSaving(false);
    onClose?.();
  };

  const handleSave = async () => {
    if (!postId) return;
    if (saving) return;

    setSaving(true);
    setError("");

    try {
      const res = await axios.put(`/posts/${postId}/caption`, {
        caption: caption.trim(),
      });

      onUpdated?.(res.data);

      setDraft(null);
      setSaving(false);
      setError("");
      onClose?.();
    } catch (e) {
      console.error("Edit caption error:", e);
      setError("Не удалось сохранить.");
      setSaving(false);
    }
  };

  return (
    <div className="cpm-overlay" onMouseDown={closeIfAllowed} role="dialog" aria-modal="true">
      <div className="cpm-card" onMouseDown={(e) => e.stopPropagation()}>
        <div className="cpm-header">
          <button className="cpm-header-btn" onClick={closeIfAllowed} disabled={saving} type="button">
            Cancel
          </button>

          <div className="cpm-title">Edit info</div>

          <button className="cpm-header-btn cpm-primary" onClick={handleSave} disabled={saving} type="button">
            {saving ? "Saving..." : "Save"}
          </button>
        </div>

        <div className="cpm-body">
          <textarea
            className="cpm-textarea"
            value={caption}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Write a caption..."
            rows={6}
            disabled={saving}
            autoFocus
          />
          {error && <div className="cpm-error">{error}</div>}
        </div>
      </div>
    </div>
  );
}
