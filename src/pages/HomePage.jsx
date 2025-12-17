import { useEffect, useState } from "react";
import axios from "../utils/axios";
import Footer from "../components/Footer";

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Загружаем только посты текущего пользователя
  const fetchMyPosts = async () => {
    try {
      const res = await axios.get("/posts/me");
      setPosts(res.data);
    } catch (err) {
      console.error("Fetch my posts error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPosts();
  }, []);

  if (loading) {
    return <div className="home-loading">Loading...</div>;
  }

  return (
    <main className="home">
      <div className="feed">
        {posts.length === 0 && (
          <div className="empty-feed">
            <img
              src="/icons/noposts.png"
              alt="No updates"
              className="empty-feed-img"
            />
            <h2>You've seen all the updates</h2>
            <p className="empty-feed-subtext">
              You have viewed all new publications
            </p>
          </div>
        )}

        {posts.map((post) => (
          <div className="post-card" key={post._id}>
            <div className="post-header">
              <div className="avatar-placeholder" />
              <span className="username">{post.author.username}</span>
            </div>

            {post.image && (
              <img src={post.image} alt="Post" className="post-image" />
            )}

            {post.caption && <p className="post-caption">{post.caption}</p>}
          </div>
        ))}

        {/* Плашка после всех постов */}
        {posts.length > 0 && (
          <div className="empty-feed">
            <img
              src="/path/to/placeholder.png"
              alt="No more updates"
              className="empty-feed-img"
            />
            <h2>You've seen all the updates</h2>
            <p className="empty-feed-subtext">
              You have viewed all new publications
            </p>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
