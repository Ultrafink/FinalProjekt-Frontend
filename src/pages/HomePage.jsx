import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import axios from "../utils/axios";
import Footer from "../components/Footer";
import { mediaUrl } from "../utils/mediaUrl";

export default function HomePage() {
  const outlet = useOutletContext() || {};
  const feedRefreshKey = outlet.feedRefreshKey ?? 0;
  const openPost = outlet.openPost;
  const deletedPostId = outlet.deletedPostId;

  const createdPostEvent = outlet.createdPostEvent;

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ each page remembers which create-event it already applied
  const [lastSeenCreateNonce, setLastSeenCreateNonce] = useState(0);

  const fetchFeed = async () => {
    try {
      const res = await axios.get("/posts/feed");
      setPosts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch feed error:", err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchFeed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedRefreshKey]);

  // ✅ optimistic remove after delete
  useEffect(() => {
    if (!deletedPostId) return;
    setPosts((prev) => prev.filter((p) => p._id !== deletedPostId));
  }, [deletedPostId]); // filter for remove [web:1031]

  // ✅ optimistic insert after create (no refetch, no duplicates)
  useEffect(() => {
    const nonce = createdPostEvent?.nonce || 0;
    const post = createdPostEvent?.post;

    if (!nonce || nonce <= lastSeenCreateNonce) return;
    if (!post?._id) {
      setLastSeenCreateNonce(nonce);
      return;
    }

    setPosts((prev) => {
      if (prev.some((p) => p._id === post._id)) return prev;
      return [post, ...prev];
    });

    setLastSeenCreateNonce(nonce);
  }, [createdPostEvent, lastSeenCreateNonce]);

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
            <h2>You've seen all the updates</h2>
            <p className="empty-feed-subtext">You have viewed all new publications</p>
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
                  <span className="username">{post.author?.username || "User"}</span>
                </div>

                {post.image && (
                  <img
                    src={mediaUrl(post.image)}
                    alt="Post"
                    className="post-image"
                    loading="lazy"
                    onClick={() => openPost?.(post._id)}
                    style={{ cursor: "pointer" }}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                )}

                {post.caption && <p className="post-caption">{post.caption}</p>}
              </div>
            ))}
          </>
        )}
      </div>

      <Footer />
    </main>
  );
}
