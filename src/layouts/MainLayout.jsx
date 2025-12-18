import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import axios from "../utils/axios";
import CreatePostModal from "../components/CreatePostModal";
import PostModal from "../components/PostModal";

export default function MainLayout() {
  const [createOpen, setCreateOpen] = useState(false);

  const [me, setMe] = useState(null);
  const [feedRefreshKey, setFeedRefreshKey] = useState(0);

  // Post modal
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [activePostId, setActivePostId] = useState(null);

  // signal for optimistic delete in pages
  const [deletedPostId, setDeletedPostId] = useState(null);

  const openPost = (id) => {
    if (!id) return;
    setActivePostId(id);
    setPostModalOpen(true);
  };

  const closePost = () => {
    setPostModalOpen(false);
    setActivePostId(null);
  };

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const res = await axios.get("/users/me");
        if (alive) setMe(res.data);
      } catch (e) {
        console.error(e);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="app-layout">
      <Sidebar me={me} onCreate={() => setCreateOpen(true)} />

      <main className="app-content">
        <Outlet
          context={{
            me,
            setMe,
            feedRefreshKey,
            setFeedRefreshKey,
            openPost,
            deletedPostId,       // <- NEW
            setDeletedPostId,    // <- NEW (если надо вручную)
          }}
        />
      </main>

      <CreatePostModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        me={me}
        onCreated={() => {
          setFeedRefreshKey((x) => x + 1);
        }}
      />

      <PostModal
        open={postModalOpen}
        postId={activePostId}
        me={me}
        onClose={closePost}
        onDeleted={(id) => {
          // 1) сигнал страницам: убрать из массива сразу
          setDeletedPostId(id);
          // 2) на всякий: обновить ленты, если где-то ещё нужно
          setFeedRefreshKey((x) => x + 1);
        }}
      />
    </div>
  );
}
