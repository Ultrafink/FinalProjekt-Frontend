import { useCallback, useEffect, useMemo, useState } from "react";

export default function PostActionsSheet({
  open,
  onClose,

  onDelete,
  onEdit,
  onGoToPost,

  postUrl,

  canEdit = false,
  canDelete = false,

  showGoToPost = true,
  showCopyLink = true,
}) {
  const [deleting, setDeleting] = useState(false);
  const [copyState, setCopyState] = useState("idle"); // idle | ok | error

  const canCopy = useMemo(
    () => typeof postUrl === "string" && postUrl.trim().length > 0,
    [postUrl]
  );

  const closeIfAllowed = useCallback(() => {
    if (deleting) return;
    setDeleting(false);
    setCopyState("idle");
    onClose?.();
  }, [deleting, onClose]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") closeIfAllowed();
    };

    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, closeIfAllowed]);

  const handleDelete = useCallback(async () => {
    if (!canDelete || typeof onDelete !== "function") return;
    if (deleting) return;

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
  }, [canDelete, deleting, onClose, onDelete]);

  const handleEdit = useCallback(() => {
    if (!canEdit || typeof onEdit !== "function") return;
    if (deleting) return;

    onEdit();
    onClose?.();
  }, [canEdit, deleting, onClose, onEdit]);

  const handleGoToPost = useCallback(() => {
    if (!showGoToPost || typeof onGoToPost !== "function") return;
    if (deleting) return;

    onGoToPost();
    onClose?.();
  }, [deleting, onClose, onGoToPost, showGoToPost]);

  const handleCopy = useCallback(async () => {
    if (!showCopyLink) return;
    if (deleting || !canCopy) return;

    try {
      await navigator.clipboard.writeText(postUrl);
      setCopyState("ok");
      setTimeout(() => setCopyState("idle"), 1200);
      onClose?.();
    } catch (e) {
      console.error("Copy failed:", e);
      setCopyState("error");
      setTimeout(() => setCopyState("idle"), 1200);
      // не закрываем сразу, чтобы было видно "Copy failed"
    }
  }, [canCopy, deleting, onClose, postUrl, showCopyLink]);

  const items = useMemo(() => {
    const list = [];

    if (canDelete && typeof onDelete === "function") {
      list.push({
        key: "delete",
        label: deleting ? "Deleting..." : "Delete",
        className: "pas-danger",
        disabled: deleting,
        onClick: handleDelete,
      });
    }

    if (canEdit && typeof onEdit === "function") {
      list.push({
        key: "edit",
        label: "Edit",
        disabled: deleting,
        onClick: handleEdit,
      });
    }

    if (showGoToPost && typeof onGoToPost === "function") {
      list.push({
        key: "goto",
        label: "Go to post",
        disabled: deleting,
        onClick: handleGoToPost,
      });
    }

    if (showCopyLink) {
      list.push({
        key: "copy",
        label:
          copyState === "ok"
            ? "Copied"
            : copyState === "error"
              ? "Copy failed"
              : "Copy link",
        disabled: deleting || !canCopy,
        onClick: handleCopy,
      });
    }

    list.push({
      key: "cancel",
      label: "Cancel",
      className: "pas-cancel",
      disabled: deleting,
      onClick: closeIfAllowed,
    });

    return list;
  }, [
    canCopy,
    canDelete,
    canEdit,
    closeIfAllowed,
    copyState,
    deleting,
    handleCopy,
    handleDelete,
    handleEdit,
    handleGoToPost,
    onDelete,
    onEdit,
    onGoToPost,
    showCopyLink,
    showGoToPost,
  ]);

  console.log("PAS props", { open, canEdit, canDelete, showGoToPost, showCopyLink, postUrl });

  if (!open) return null;

  return (
    <div
      className="pas-overlay"
      onClick={closeIfAllowed}
      role="dialog"
      aria-modal="true"
    >
      <div className="pas-card" onClick={(e) => e.stopPropagation()}>
        {items.map((it) => (
          <button
            key={it.key}
            className={`pas-item ${it.className || ""}`}
            onClick={it.onClick}
            disabled={it.disabled}
            type="button"
          >
            {it.label}
          </button>
        ))}
      </div>
    </div>
  );
}
