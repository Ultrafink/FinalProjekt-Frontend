import { useEffect, useMemo, useRef } from "react";
import "../styles/postActionsSheet.css";

export default function PostActionsSheet({
  open,
  onClose,

  showDelete = false,
  onDelete,

  postId,
  onEdit,
  onGoToPost,
}) {
  const boxRef = useRef(null);

  const copyLink = useMemo(() => {
    if (!postId) return window.location.href;
    return `${window.location.origin}/p/${postId}`;
  }, [postId]);

  useEffect(() => {
    if (!open) return;

    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="sheet-overlay"
      role="presentation"
      onMouseDown={() => onClose?.()} // клик по фону закрывает
    >
      <div
        className="sheet"
        ref={boxRef}
        role="dialog"
        aria-modal="true"
        onMouseDown={(e) => e.stopPropagation()} // клики внутри НЕ закрывают
      >
        {showDelete ? (
          <button
            className="sheet-item sheet-danger"
            type="button"
            onClick={async () => {
              try {
                await onDelete?.();
              } finally {
                onClose?.();
              }
            }}
          >
            Delete
          </button>
        ) : null}

        <button
          className="sheet-item"
          type="button"
          onClick={() => {
            onEdit?.();
            onClose?.();
          }}
          disabled={!onEdit}
        >
          Edit
        </button>

        <button
          className="sheet-item"
          type="button"
          onClick={() => {
            onGoToPost?.();
            onClose?.();
          }}
          disabled={!onGoToPost}
        >
          Go to post
        </button>

        <button
          className="sheet-item"
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(copyLink);
            } catch {
              // ignore
            }
            onClose?.();
          }}
        >
          Copy link
        </button>

        <button className="sheet-item" type="button" onClick={() => onClose?.()}>
          Cancel
        </button>
      </div>
    </div>
  );
}
