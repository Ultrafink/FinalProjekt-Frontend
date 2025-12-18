import { useEffect, useState } from "react";
import axios from "../utils/axios";
import { mediaUrl } from "../utils/mediaUrl";
import "../styles/explore.css";

export default function ExplorePage() {
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

  if (loading) return <div className="page-loading">Loading...</div>;

  return (
    <main className="explore-page">
      <div className="explore-grid">
        {posts.map((post, index) => {
          // каждые 6 карточек делаем одну "большую" слева (как в explore)
          const isBig = index % 6 === 0;

          return (
            <button
              key={post._id}
              type="button"
              className={`explore-tile ${isBig ? "is-big" : ""}`}
              onClick={() => console.log("OPEN POST MODAL", post._id)}
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
