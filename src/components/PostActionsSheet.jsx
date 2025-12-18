import { useEffect, useRef } from "react";
import "../styles/postActionsSheet.css";

export default function PostActionsSheet({ open, onClose, showDelete, onDelete }) {
  const boxRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    const onMouseDown = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) onClose?.();
    };

    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onMouseDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onMouseDown);
    };
  }, [open, onClose]); // click-outside + esc [web:682][web:716]

  if (!open) return null;

  return (
    <div className="sheet-overlay">
      <div className="sheet" ref={boxRef} role="dialog" aria-modal="true">
        {showDelete ? (
          <button className="sheet-item sheet-danger" type="button" onClick={onDelete}>
            Delete
          </button>
        ) : null}

        <button className="sheet-item" type="button" disabled>
          Edit
        </button>

        <button className="sheet-item" type="button" disabled>
          Go to post
        </button>

        <button
          className="sheet-item"
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(window.location.href);
            } catch {
              // ignore
            }
            onClose?.();
          }}
        >
          Copy link
        </button>

        <button className="sheet-item" type="button" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}
