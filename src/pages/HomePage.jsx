import { useEffect, useMemo, useState } from "react";
import axios from "../utils/axios";
import Footer from "../components/Footer";

// если картинка в public/icons/seen-all.png -> используй "/icons/seen-all.png"
// если в src/assets -> импортируй как seenAllImg from "../assets/seen-all.png"
const seenAllImg = "/icons/noposts.png";

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

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
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await axios.get("posts");
        setPosts(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Fetch posts error:", err);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) return <div className="home-loading">Loading...</div>;

  return (
    <main className="home">
      <div className="feed">
        {posts.map((post) => {
          const id = post._id || post.id;
          const username = post.user?.username || post.author?.username || "user";
          const avatar = post.user?.avatar || post.author?.avatar;
          const image = toAbsUrl(post.image);
          const caption = post.caption ?? post.content ?? "";

          const likesCount = post.likesCount ?? post.likes?.length ?? 0;
          const commentsCount = post.commentsCount ?? post.comments?.length ?? 0;

          return (
            <article className="post-card" key={id}>
              <div className="post-header">
                {avatar ? (
                  <img className="post-avatar" src={toAbsUrl(avatar)} alt={username} />
                ) : (
                  <div className="post-avatar" />
                )}

                <span className="username">{username}</span>
              </div>

              <div className="post-media">
                {image ? <img className="post-image" src={image} alt="post" /> : null}
              </div>

              <div className="post-actions">
                <button className="icon-btn" type="button" aria-label="Like">
                  <span className="material-symbols-outlined">favorite</span>
                </button>
                <button className="icon-btn" type="button" aria-label="Comment">
                  <span className="material-symbols-outlined">chat_bubble_outline</span>
                </button>
              </div>

              <div className="post-meta">
                <div className="likes">
                  <b>{likesCount}</b> likes
                </div>

                {caption ? (
                  <div className="caption">
                    <b className="username">{username}</b> {caption}
                  </div>
                ) : null}

                <div className="comments">
                  View all comments ({commentsCount})
                </div>
              </div>
            </article>
          );
        })}

        <div className="seen-all">
          <img className="seen-all-img" src={seenAllImg} alt="" />
          <div className="seen-all-title">You've seen all the updates</div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
