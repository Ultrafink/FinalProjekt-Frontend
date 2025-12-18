import { useEffect, useState } from "react";
import axios from "../utils/axios";
import Footer from "../components/Footer";

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFeed = async () => {
    try {
      const res = await axios.get("/posts/feed");
      const data = Array.isArray(res.data) ? res.data : [];
      setPosts(data);
    } catch (err) {
      console.error("Fetch feed error:", err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const resolveImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    if (path.startsWith("/")) return path;
    return `/${path}`;
  };

  if (loading) {
    return <div className="home-loading">Loading...</div>;
  }

  return (
    <main className="home">
      {/* Feed */}
      <div className="feed">
        {posts.length === 0 ? (
          <div className="empty-feed">
            <img
              src="/icons/noposts.png"
              alt="No updates"
              className="empty-feed-img"
            />
            <h2>You've seen all the updates</h2>
            <p className="empty-feed-subtext">You have viewed all new publications</p>
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <div className="post-card" key={post._id}>
                <div className="post-header">
                  <div className="avatar-placeholder" />
                  <span className="username">{post.author?.username || "User"}</span>
                </div>

                {post.image && (
                  <img
                    src={resolveImageUrl(post.image)}
                    alt="Post"
                    className="post-image"
                    loading="lazy"
                  />
                )}

                {post.caption && <p className="post-caption">{post.caption}</p>}
              </div>
            ))}

            <div className="empty-feed">
              <img
                src="/icons/noposts.png"
                alt="No more updates"
                className="empty-feed-img"
              />
              <h2>You've seen all the updates</h2>
              <p className="empty-feed-subtext">You have viewed all new publications</p>
            </div>
          </>
        )}
      </div>

      <Footer />
    </main>
  );
}
