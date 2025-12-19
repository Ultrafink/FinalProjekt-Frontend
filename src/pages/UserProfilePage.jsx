import { useCallback, useEffect, useMemo, useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import axios from "../utils/axios";
import { toggleFollow } from "../api/users";

export default function UserProfilePage() {
  const { username } = useParams();
  const outlet = useOutletContext() || {};
  const me = outlet.me;
  const setMe = outlet.setMe;
  const openPost = outlet.openPost;

  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL;

  const toAbsUrl = useMemo(() => {
    return (url) => {
      if (!url) return null;
      if (url.startsWith("http://") || url.startsWith("https://")) return url;
      const normalized = url.startsWith("/") ? url : `/${url}`;
      return `${apiUrl}${normalized}`;
    };
  }, [apiUrl]);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const [profileRes, postsRes] = await Promise.all([
        axios.get(`/users/${username}`),
        axios.get(`/posts/user/${username}`),
      ]);

      setUser(profileRes.data.user);
      setStats(profileRes.data.stats);
      setPosts(Array.isArray(postsRes.data) ? postsRes.data : []);
    } catch (err) {
      console.error("Profile load error:", err);
      setUser(null);
      setStats(null);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const isFollowing = useMemo(() => {
    if (!me?._id || !user?._id) return false;
    return (
      Array.isArray(me.following) &&
      me.following.some((id) => String(id) === String(user._id))
    );
  }, [me?._id, me?.following, user?._id]);

  const avatarSrc = toAbsUrl(user?.avatar);

  const onToggleFollow = async () => {
    if (!user?._id || followLoading) return;

    const wasFollowing = isFollowing;

    // optimistic followers count
    setStats((prev) =>
      prev
        ? {
            ...prev,
            followers: Math.max(0, (prev.followers ?? 0) + (wasFollowing ? -1 : 1)),
          }
        : prev
    );

    setFollowLoading(true);
    try {
      const updatedMe = await toggleFollow(user._id);
      setMe?.(updatedMe);

      // sync stats/user
      const profileRes = await axios.get(`/users/${username}`);
      setUser(profileRes.data.user);
      setStats(profileRes.data.stats);
    } catch (err) {
      console.error("Follow error:", err);

      // rollback optimistic
      setStats((prev) =>
        prev
          ? {
              ...prev,
              followers: Math.max(0, (prev.followers ?? 0) + (wasFollowing ? 1 : -1)),
            }
          : prev
      );

      alert(err.response?.data?.message || "Follow error");
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) return <div className="page-loading">Loading...</div>;
  if (!user) return <div>User not found</div>;

  return (
    <section className="profile" key={username}>
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

            <div className="profile-actions">
              <button
                type="button"
                className={`follow-btn ${isFollowing ? "unfollow" : ""}`}
                onClick={onToggleFollow}
                disabled={followLoading || !me?._id}
                title={!me?._id ? "Login required" : ""}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  whiteSpace: "nowrap",
                  minWidth: 110,
                  padding: "6px 12px",
                  fontSize: 12,
                  fontWeight: 500,
                  lineHeight: 1,
                }}
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </button>

              <button type="button" className="message-btn">
                Message
              </button>
            </div>
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
              onClick={() => openPost?.(post._id)}
              role="button"
              tabIndex={0}
            >
              {imgSrc ? <img src={imgSrc} alt="post" /> : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
