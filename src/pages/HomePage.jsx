import { useCallback, useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import axios from "../utils/axios";
import Footer from "../components/Footer";
import { mediaUrl } from "../utils/mediaUrl";

const seenAllImg = "/icons/noposts.png";

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
      const res = await axios.get("posts/feed");
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
            <img className="empty-feed-img" src={seenAllImg} alt="No updates" />
            <h2>You've seen all the updates</h2>
            <p className="empty-feed-subtext">You have viewed all new publications</p>
          </div>
        ) : (
          posts.map((post) => {
            const id = post.id || post._id;

            // в твоём working варианте: post.author (populate)
            const author = post.author || post.user || {};
            const username = author?.username || "User";

            const avatarSrc = mediaUrl(author?.avatar || "/icons/profile.png");
            const imgSrc = post.image ? mediaUrl(post.image) : "";

            const likesCount = post.likesCount ?? post.likes?.length ?? 0;
            const commentsCount = post.commentsCount ?? post.comments?.length ?? 0;

            return (
              <article className="post-card" key={id}>
                <div className="post-header">
                  <img
                    className="post-avatar"
                    src={avatarSrc}
                    alt="avatar"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/icons/profile.png";
                    }}
                  />

                  <Link
                    to={`/profile/${username}`}
                    className="username"
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    {username}
                  </Link>
                </div>

                <div
                  className="post-media"
                  onClick={() => (id ? openPost?.(id) : null)}
                  style={{ cursor: openPost ? "pointer" : "default" }}
                >
                  {imgSrc ? (
                    <img
                      src={imgSrc}
                      alt="Post"
                      className="post-image"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : null}
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

                  {post.caption?.trim() ? (
                    <div className="caption">
                      <b className="username">{username}</b> {post.caption}
                    </div>
                  ) : null}

                  <div className="comments">View all comments ({commentsCount})</div>
                </div>
              </article>
            );
          })
        )}

        <div className="seen-all">
          <img className="seen-all-img" src={seenAllImg} alt="" />
          <div className="seen-all-title">You've seen all the updates</div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
