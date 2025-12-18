import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../utils/axios";

export default function ProfilePage() {
  const { username } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
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
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  if (loading) return <div className="page-loading">Loading...</div>;
  if (!user) return <div>User not found</div>;

  return (
    <section className="profile">
      {/* 🔹 HEADER */}
      <div className="profile-top">
        <div className="profile-avatar-lg">
          {user.avatar ? (
            <img src={user.avatar} alt={user.username} />
          ) : (
            <div className="avatar-placeholder" />
          )}
        </div>

        <div className="profile-info">
          <div className="profile-username-row">
            <h2>{user.username}</h2>

            {user.isMe && (
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
              <a
                href={user.website}
                target="_blank"
                rel="noreferrer"
              >
                {user.website}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* 🔹 POSTS GRID */}
      <div className="profile-posts">
        {posts.map((post) => (
          <div
            key={post._id}
            className="profile-post"
            onClick={() => console.log("OPEN MODAL", post._id)}
          >
            <img src={post.image} alt="post" />
          </div>
        ))}
      </div>
    </section>
  );
}
