import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import axios from "../utils/axios";
import { useAuth } from "../context/useAuth";

export default function ProfilePage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  // ✅ контекст из MainLayout
  const outlet = useOutletContext() || {};
  const openPost = outlet.openPost;

  const deletedPostId = outlet.deletedPostId;
  const setDeletedPostId = outlet.setDeletedPostId;

  const createdPostEvent = outlet.createdPostEvent;
  // const setCreatedPostEvent = outlet.setCreatedPostEvent; // не обязателен

  const me = outlet.me; // текущий пользователь (из /users/me), может быть null

  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // initial load
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

        // на всякий случай синхронизируем posts count с реальным
        setStats((prev) => (prev ? { ...prev, posts: list.length } : prev));
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

  // ✅ optimistic delete from PostModal in MainLayout
  useEffect(() => {
    if (!deletedPostId) return;

    setPosts((prev) => prev.filter((p) => String(p._id) !== String(deletedPostId)));
    setStats((prev) =>
      prev ? { ...prev, posts: Math.max(0, (prev.posts ?? 0) - 1) } : prev
    );

    // сбрасываем, чтобы событие не применялось снова
    setDeletedPostId?.(null);
  }, [deletedPostId, setDeletedPostId]);

  // ✅ optimistic create from CreatePostModal in MainLayout
  useEffect(() => {
    if (!createdPostEvent?.post) return;

    // добавляем только если это МОЙ профиль (username в url == мой username)
    const myUsername = me?.username || authUser?.username;
    if (!myUsername || myUsername !== username) return;

    const newPost = createdPostEvent.post;

    setPosts((prev) => {
      // защита от дублей
      if (prev.some((p) => String(p._id) === String(newPost._id))) return prev;
      return [newPost, ...prev];
    });

    setStats((prev) => (prev ? { ...prev, posts: (prev.posts ?? 0) + 1 } : prev));
  }, [createdPostEvent?.nonce, createdPostEvent?.post, username, me?.username, authUser?.username]);

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
              <b>{stats?.posts ?? posts.length ?? 0}</b> posts
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
              onClick={() => openPost?.(post._id)}
              style={{ cursor: "pointer" }}
            >
              {imgSrc ? <img src={imgSrc} alt="post" /> : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
