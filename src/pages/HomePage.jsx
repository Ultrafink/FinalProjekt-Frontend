import { useEffect, useState } from "react";
import axios from "../utils/axios";
import "../styles/home.css";

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  // Функция загрузки постов
  const fetchPosts = async () => {
    try {
      const res = await axios.get("/posts");
      setPosts(res.data);
    } catch (err) {
      console.error("Fetch posts error:", err);
    }
  };

  // Загружаем посты при загрузке страницы — корректная форма
  useEffect(() => {
    const load = async () => {
      await fetchPosts();
    };
    load();
  }, []);

  // Создание поста
  const createPost = async (e) => {
    e.preventDefault();

    if (!content.trim()) return;

    setLoading(true);

    try {
      await axios.post("/posts", { content });
      setContent("");
      await fetchPosts(); // обновляем ленту
    } catch (err) {
      console.error("Create post error:", err);
    }

    setLoading(false);
  };

  return (
    <div className="home-container">
      <div className="create-post">
        <form onSubmit={createPost}>
          <textarea
            placeholder="Что нового?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Публикация..." : "Опубликовать"}
          </button>
        </form>
      </div>

      <div className="feed">
        {posts.map((post) => (
          <div className="post-card" key={post._id}>
            <div className="post-header">
              <div className="avatar-placeholder"></div>
              <span className="username">{post.user?.username}</span>
            </div>

            <div className="post-content">
              <p>{post.content}</p>
            </div>

            <div className="post-date">
              {new Date(post.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
