import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import { useAuth } from "../context/useAuth";

function PostModal({ postId, onClose, toAbsUrl }) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!postId) return;

    let alive = true;

    const load = async () => {
      setLoading(true);
      try {
        // предполагаемый эндпоинт "GET /posts/:id"
        // если у тебя другой — скажи, подстрою
        const res = await axios.get(`/posts/${postId}`);
        if (!alive) return;

        // иногда API возвращает { post: ... }
        const data = res.data?.post ?? res.data;
        setPost(data);
      } catch (e) {
        console.error("Load post error:", e);
        if (alive) setPost(null);
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();

    return () => {
      alive = false;
    };
  }, [postId]);

  // закрытие по Escape
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const imgSrc = toAbsUrl(post?.image);

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>

        {loading && <div className="modal-loading">Loading…</div>}

        {!loading && !post && (
          <div className="modal-loading">Post not found</div>
        )}

        {!loading && post && (
          <div className="modal-content">
            <div className="modal-image">
              {imgSrc ? <img src={imgSrc} alt="post" /> : null}
            </div>

            <div className="modal-side">
              <div className="modal-author">
                <b>{post.user?.username ?? post.author?.username ?? "user"}</b>
              </div>

              {post.caption && <div className="modal-text">{post.caption}</div>}
              {post.content && <div className="modal-text">{post.content}</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // модалка
  const [activePostId, setActivePostId] = useState(null);

  const isMe = authUser?.username === username;

  const apiUrl = import.meta.env.VITE_API_URL;

  const toAbsUrl = useMemo(() => {
    return (url) => {
      if (!url) return null;
      if (url.startsWith("http://") || url.startsWith("https://")) return url;
      const normalized = url.startsWith("/") ? url : `/${url}`;
      return `${apiUrl}${normalized}`;
    };
  }, [apiUrl]);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const [profileRes, postsRes] = await Promise.all([
          axios.get(`/users/${username}`),
          axios.get(`/posts/user/${username}`),
        ]);

        setUser(profileRes.data.user);
        setStats(profileRes.data.stats);

        const list = Array.isArray(postsRes.data) ? postsRes.data : [];
        setPosts(list);
      } catch (err) {
        console.error("Profile load error:", err);
        setUser(null);
        setStats(null);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  const openPost = (postId) => {
    setActivePostId(postId);
    // опционально: блокировать скролл подложки
    document.body.style.overflow = "hidden";
  };

  const closePost = () => {
    setActivePostId(null);
    document.body.style.overflow = "";
  };

  if (loading) return <div className="page-loading">Loading...</div>;
  if (!user) return <div>User not found</div>;

  const avatarSrc = toAbsUrl(user.avatar);

  return (
    <section className="profile">
      <div className="profile-top">
        <div className="profile-avatar-lg">
          {avatarSrc ? (
            <img src={avatarSrc} alt={user.username} />
          ) : (
            <div className="avatar-placeholder" />
          )}
        </div>

        <div className="profile-info">
          <div className="profile-username-row">
            <h2>{user.username}</h2>

            {isMe && (
              <button
                className="edit-profile-btn"
                onClick={() => navigate("/profile/edit")}
              >
                Edit profile
              </button>
            )}
          </div>

          <div className="profile-stats">
            <span>
              <b>{stats?.posts ?? 0}</b> posts
            </span>
            <span>
              <b>{stats?.followers ?? 0}</b> followers
            </span>
            <span>
              <b>{stats?.following ?? 0}</b> following
            </span>
          </div>

          <div className="profile-about">
            {user.about && <p>{user.about}</p>}
            {user.website && (
              <a href={user.website} target="_blank" rel="noreferrer">
                {user.website}
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="profile-posts">
        {posts.map((post) => {
          const imgSrc = toAbsUrl(post.image);
          return (
            <div
              key={post._id}
              className="profile-post"
              onClick={() => openPost(post._id)}
            >
              {imgSrc ? <img src={imgSrc} alt="post" /> : null}
            </div>
          );
        })}
      </div>

      {activePostId && (
        <PostModal postId={activePostId} onClose={closePost} toAbsUrl={toAbsUrl} />
      )}
    </section>
  );
}
