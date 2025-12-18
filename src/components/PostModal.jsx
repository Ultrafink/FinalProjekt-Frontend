import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import {
  addComment,
  deletePost,
  getPostById,
  toggleLike,
  toggleCommentLike,
} from "../api/posts";
import { mediaUrl } from "../utils/mediaUrl";
import PostActionsSheet from "./PostActionsSheet";
import "../styles/postModal.css";

export default function PostModal({ open, postId, onClose, me, onDeleted }) {
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);

  const [commentText, setCommentText] = useState("");
  const [sending, setSending] = useState(false);
  const [liking, setLiking] = useState(false);

  const [likingCommentId, setLikingCommentId] = useState(null);

  const isMine = !!(post?.author?._id && me?._id && post.author._id === me._id);

  const likedByMe = useMemo(() => {
    const myId = me?._id;
    if (!myId || !post?.likes) return false;
    return post.likes.some((id) => String(id) === String(myId));
  }, [post?.likes, me?._id]);

  useEffect(() => {
    if (!open) return;

    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !postId) return;

    let alive = true;
    setLoading(true);
    setCommentText("");
    setActionsOpen(false);

    (async () => {
      try {
        const data = await getPostById(postId);
        if (alive) setPost(data);
      } catch (e) {
        console.error("Load post error:", e);
        if (alive) setPost(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [open, postId]);

  if (!open) return null;

  const onOverlayMouseDown = (e) => {
    if (e.target.classList.contains("post-overlay")) onClose?.();
  };

  const handleDelete = async () => {
    if (!post?._id) return;
    try {
      await deletePost(post._id);
      setActionsOpen(false);
      onClose?.();
      onDeleted?.(post._id);
    } catch (e) {
      console.error("Delete post error:", e);
      alert(e?.response?.data?.message || "Не получилось удалить пост");
    }
  };

  const handleToggleLike = async () => {
    if (!post?._id || liking) return;
    setLiking(true);
    try {
      const updated = await toggleLike(post._id);
      setPost(updated);
    } catch (e) {
      console.error("Like error:", e);
      alert(e?.response?.data?.message || "Не получилось поставить лайк");
    } finally {
      setLiking(false);
    }
  };

  const handleSendComment = async () => {
    const text = commentText.trim();
    if (!post?._id || !text || sending) return;

    setSending(true);
    try {
      const updated = await addComment(post._id, text);
      setPost(updated);
      setCommentText("");
    } catch (e) {
      console.error("Add comment error:", e);
      alert(e?.response?.data?.message || "Не получилось добавить комментарий");
    } finally {
      setSending(false);
    }
  };

  const handleToggleCommentLike = async (commentId) => {
    if (!post?._id || !commentId || likingCommentId) return;
    setLikingCommentId(commentId);

    try {
      const updated = await toggleCommentLike(post._id, commentId);
      setPost(updated);
    } catch (e) {
      console.error("Comment like error:", e);
      alert(e?.response?.data?.message || "Не получилось поставить лайк на комментарий");
    } finally {
      setLikingCommentId(null);
    }
  };

  // Заглушка для Edit, чтобы кнопка была "живой".
  // Если у вас есть EditModal/страница редактирования — поменяй реализацию тут.
  const handleEdit = () => {
    alert("Edit: пока не реализовано (нужен экран/модалка редактирования)");
  };

  const handleGoToPost = () => {
    if (!post?._id) return;
    setActionsOpen(false);
    onClose?.();
    navigate(`/p/${post._id}`);
  };

  return (
    <div className="post-overlay" onMouseDown={onOverlayMouseDown}>
      <div className="post-modal" role="dialog" aria-modal="true">
        {loading || !post ? (
          <div className="post-loading">Loading...</div>
        ) : (
          <div className="post-content">
            <div className="post-left">
              <img className="post-media" src={mediaUrl(post.image)} alt="post" />
            </div>

            <div className="post-right">
              <div className="post-topbar">
                <div className="post-author">
                  <img
                    className="post-author-avatar"
                    src={mediaUrl(post.author?.avatar) || "/icons/profile.png"}
                    alt="avatar"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/icons/profile.png";
                    }}
                  />
                  <div className="post-author-name">{post.author?.username || "user"}</div>
                </div>

                <button
                  type="button"
                  className="post-more"
                  onClick={() => setActionsOpen(true)}
                  aria-label="More"
                >
                  ⋯
                </button>
              </div>

              <div className="post-divider" />

              <div className="post-scroll">
                {post.caption ? (
                  <div className="post-caption-row">
                    <img
                      className="post-author-avatar"
                      src={mediaUrl(post.author?.avatar) || "/icons/profile.png"}
                      alt="avatar"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/icons/profile.png";
                      }}
                    />
                    <div className="post-caption-text">
                      <span className="post-bold">{post.author?.username || "user"}</span>{" "}
                      {post.caption}
                    </div>
                  </div>
                ) : null}

                {Array.isArray(post.comments) && post.comments.length > 0 ? (
                  <div className="post-comments">
                    {post.comments.map((c) => {
                      const myId = me?._id;
                      const likedCommentByMe =
                        !!myId &&
                        Array.isArray(c.likes) &&
                        c.likes.some((id) => String(id) === String(myId));

                      return (
                        <div className="post-comment-row" key={c._id}>
                          <img
                            className="post-author-avatar"
                            src={mediaUrl(c.author?.avatar) || "/icons/profile.png"}
                            alt="avatar"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = "/icons/profile.png";
                            }}
                          />

                          <div className="post-caption-text">
                            <span className="post-bold">{c.author?.username || "user"}</span>{" "}
                            {c.text}
                          </div>

                          <button
                            type="button"
                            className="post-icon-btn post-comment-like"
                            aria-label="Like comment"
                            title="Like"
                            onClick={() => handleToggleCommentLike(c._id)}
                            disabled={likingCommentId === c._id}
                          >
                            {likedCommentByMe ? (
                              <FaHeart className="post-heart post-heart--active" />
                            ) : (
                              <FaRegHeart className="post-heart" />
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>

              <div className="post-divider" />

              <div className="post-bottom">
                <div className="post-actions-row">
                  <button
                    type="button"
                    className="post-icon-btn"
                    aria-label="Like"
                    onClick={handleToggleLike}
                    disabled={liking}
                    title="Like"
                  >
                    {likedByMe ? (
                      <FaHeart className="post-heart post-heart--active" />
                    ) : (
                      <FaRegHeart className="post-heart" />
                    )}
                  </button>
                </div>

                <div className="post-likes">{Array.isArray(post.likes) ? post.likes.length : 0} likes</div>

                <div className="post-add-comment">
                  <input
                    className="post-comment-input"
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSendComment();
                      }
                    }}
                  />
                  <button
                    className="post-send"
                    type="button"
                    onClick={handleSendComment}
                    disabled={sending || !commentText.trim()}
                  >
                    Send
                  </button>
                </div>
              </div>

              <PostActionsSheet
                open={actionsOpen}
                onClose={() => setActionsOpen(false)}
                showDelete={isMine}
                onDelete={handleDelete}
                postId={post?._id}
                onEdit={handleEdit}
                onGoToPost={handleGoToPost}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
