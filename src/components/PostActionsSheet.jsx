import { useEffect, useMemo, useState } from "react";

export default function PostActionsSheet({
  open,
  onClose,
  onDelete,
  onEdit,
  onGoToPost,
  postUrl,
  canEdit = false,
  canDelete = false,
}) {
  const [deleting, setDeleting] = useState(false);
  const [copyState, setCopyState] = useState("idle"); // idle | ok | error

  const showDelete = !!onDelete && canDelete;
  const showEdit = !!onEdit && canEdit;

  const canCopy = useMemo(() => typeof postUrl === "string" && postUrl.trim().length > 0, [postUrl]);

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
    if (deleting) return;
    setDeleting(false);
    setCopyState("idle");
    onClose?.();
  };

  const handleDelete = async () => {
    if (!onDelete || deleting) return;
    try {
      setDeleting(true);
      await onDelete();
      setDeleting(false);
      setCopyState("idle");
      onClose?.();
    } catch (e) {
      console.error("Delete failed:", e);
      setDeleting(false);
    }
  };

  const handleCopy = async () => {
    if (!canCopy || deleting) return;

    try {
      await navigator.clipboard.writeText(postUrl);
      setCopyState("ok");
      onClose?.();
      setTimeout(() => setCopyState("idle"), 1200);
    } catch (e) {
      console.error("Copy failed:", e);
      setCopyState("error");
      setTimeout(() => setCopyState("idle"), 1200);
    }
  };

  const handleEdit = () => {
    if (deleting) return;
    onEdit?.();
    closeIfAllowed();
  };

  const handleGoToPost = () => {
    if (deleting) return;
    onGoToPost?.();
    closeIfAllowed();
  };

  return (
    <div className="pas-overlay" onMouseDown={closeIfAllowed} role="dialog" aria-modal="true">
      <div className="pas-card" onMouseDown={(e) => e.stopPropagation()}>
        {showDelete && (
          <button className="pas-item pas-danger" onClick={handleDelete} disabled={deleting} type="button">
            {deleting ? "Deleting..." : "Delete"}
          </button>
        )}

        {showEdit && (
          <button className="pas-item" onClick={handleEdit} disabled={deleting} type="button">
            Edit
          </button>
        )}

        {!!onGoToPost && (
          <button className="pas-item" onClick={handleGoToPost} disabled={deleting} type="button">
            Go to post
          </button>
        )}

        <button
          className="pas-item"
          onClick={handleCopy}
          disabled={deleting || !canCopy}
          type="button"
          title={!canCopy ? "No link available" : "Copy link"}
        >
          {copyState === "ok" ? "Copied" : copyState === "error" ? "Copy failed" : "Copy link"}
        </button>

        <button className="pas-item pas-cancel" onClick={closeIfAllowed} disabled={deleting} type="button">
          Cancel
        </button>
      </div>
    </div>
  );
}
