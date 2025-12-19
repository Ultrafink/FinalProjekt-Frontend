import { useCallback, useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import axios from "../utils/axios";
import Footer from "../components/Footer";
import { mediaUrl } from "../utils/mediaUrl";

export default function HomePage() {
  const outlet = useOutletContext();
  const feedRefreshKey = outlet?.feedRefreshKey ?? 0;
  const openPost = outlet?.openPost;
  const deletedPostId = outlet?.deletedPostId;
  const createdPostNonce = outlet?.createdPostEvent?.nonce;

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFeed = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("/posts/feed");
      setPosts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch feed error:", err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed, feedRefreshKey]);

  useEffect(() => {
    if (!deletedPostId && !createdPostNonce) return;
    fetchFeed();
  }, [fetchFeed, deletedPostId, createdPostNonce]);

  if (loading) return <div className="home-loading">Loading...</div>;

  return (
    <main className="home">
      <div className="feed">
        {posts.length === 0 ? (
          <div className="empty-feed">
            <img
              src="/icons/noposts.png"
              alt="No updates"
              className="empty-feed-img"
            />
            <h2>You&apos;ve seen all the updates</h2>
            <p className="empty-feed-subtext">
              You have viewed all new publications
            </p>
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <div className="post-card" key={post._id}>
                <div className="post-header">
                  <img
                    className="post-avatar"
                    src={mediaUrl(post.author?.avatar) || "/icons/profile.png"}
                    alt="avatar"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/icons/profile.png";
                    }}
                  />

                  <Link
                    to={`/profile/${post.author?.username || ""}`}
                    className="username"
                  >
                    {post.author?.username || "User"}
                  </Link>
                </div>

                {post.image && (
                  <img
                    src={mediaUrl(post.image)}
                    alt="Post"
                    className="post-image"
                    loading="lazy"
                    onClick={() => openPost?.(post._id)}
                  />
                )}

                {post.caption && <p className="post-caption">{post.caption}</p>}
              </div>
            ))}

            <div className="seen-all">
              <img className="seen-all-img" src="/icons/noposts.png" alt="" />
              <div className="seen-all-title">You&apos;ve seen all the updates</div>
            </div>
          </>
        )}
      </div>

      <Footer />
    </main>
  );
}
