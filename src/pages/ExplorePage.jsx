import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import axios from "../utils/axios";
import { mediaUrl } from "../utils/mediaUrl";
import "../styles/explore.css";

export default function ExplorePage() {
  const outlet = useOutletContext() || {};
  const openPost = outlet.openPost;
  const deletedPostId = outlet.deletedPostId;

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const res = await axios.get("/posts/explore");
        const data = Array.isArray(res.data) ? res.data : [];
        if (alive) setPosts(data);
      } catch (e) {
        console.error("Explore load error:", e);
        if (alive) setPosts([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // ✅ optimistic remove after delete
  useEffect(() => {
    if (!deletedPostId) return;
    setPosts((prev) => prev.filter((p) => p._id !== deletedPostId));
  }, [deletedPostId]); // filter for remove [web:851]

  if (loading) return <div className="page-loading">Loading...</div>;

  return (
    <main className="explore-page">
      <div className="explore-grid">
        {posts.map((post, index) => {
          const isBig = index % 6 === 0;

          return (
            <button
              key={post._id}
              type="button"
              className={`explore-tile ${isBig ? "is-big" : ""}`}
              onClick={() => openPost?.(post._id)}
              aria-label="Open post"
            >
              <img
                src={mediaUrl(post.image)}
                alt="post"
                loading="lazy"
                className="explore-img"
              />
              <span className="explore-overlay" />
            </button>
          );
        })}
      </div>
    </main>
  );
}
