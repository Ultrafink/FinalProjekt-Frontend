import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import { useAuth } from "../context/useAuth";

export default function ProfilePage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

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
        setPosts(Array.isArray(postsRes.data) ? postsRes.data : []);
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
              onClick={() => console.log("OPEN MODAL", post._id)}
            >
              {imgSrc ? <img src={imgSrc} alt="post" /> : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
