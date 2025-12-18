import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import axios from "../utils/axios";
import CreatePostModal from "../components/CreatePostModal";
import PostModal from "../components/PostModal";
import EditPostModal from "../components/EditPostModal";
import PostActionsSheet from "../components/PostActionsSheet";

export default function MainLayout() {
  const navigate = useNavigate();

  const [createOpen, setCreateOpen] = useState(false);

  const [me, setMe] = useState(null);
  const [feedRefreshKey, setFeedRefreshKey] = useState(0);

  // Post modal
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [activePostId, setActivePostId] = useState(null);

  // signal for optimistic delete in pages
  const [deletedPostId, setDeletedPostId] = useState(null);

  // ✅ optimistic create event (safe for multiple pages)
  const [createdPostEvent, setCreatedPostEvent] = useState(null);
  // shape: { nonce: number, post: object }

  // Global Actions dialog (center)
  const [actionsOpen, setActionsOpen] = useState(false);
  const [actionsPost, setActionsPost] = useState(null);

  // Global Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editPost, setEditPost] = useState(null);

  const openPost = (id) => {
    if (!id) return;
    setActivePostId(id);
    setPostModalOpen(true);
  };

  const closePost = () => {
    setPostModalOpen(false);
    setActivePostId(null);
  };

  const openPostActions = (post) => {
    if (!post) return;
    setActionsPost(post);
    setActionsOpen(true);
  };

  const openEditPost = (post) => {
    if (!post) return;
    setEditPost(post);
    setEditOpen(true);
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
            closePost,

            // global dialogs openers
            openPostActions,
            openEditPost,

            deletedPostId,
            setDeletedPostId,

            // ✅ optimistic create
            createdPostEvent,
            setCreatedPostEvent,
          }}
        />
      </main>

      <CreatePostModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        me={me}
        onCreated={(post) => {
          setCreatedPostEvent({
            nonce: Date.now(),
            post,
          });
        }}
      />

      <PostModal
        open={postModalOpen}
        postId={activePostId}
        me={me}
        onClose={closePost}
        onDeleted={(id) => {
          setDeletedPostId(id);
          setFeedRefreshKey((x) => x + 1);
        }}
      />

      {/* Center actions dialog (как на картинке) */}
      <PostActionsSheet
        open={actionsOpen}
        onClose={() => setActionsOpen(false)}
        postUrl={actionsPost?.id ? `${window.location.origin}/posts/${actionsPost.id}` : ""}
        canEdit={true}
        canDelete={true}
        onGoToPost={() => {
          if (!actionsPost?.id) return;
          // если у тебя нет отдельной страницы поста — замени на openPost(actionsPost.id)
          navigate(`/posts/${actionsPost.id}`);
        }}
        onEdit={() => {
          setActionsOpen(false);
          openEditPost(actionsPost);
        }}
        onDelete={async () => {
          if (!actionsPost?.id) return;
          await axios.delete(`/posts/${actionsPost.id}`);
          setActionsOpen(false);

          // сигнал страницам для оптимистичного удаления
          setDeletedPostId(actionsPost.id);
          // fallback refetch
          setFeedRefreshKey((x) => x + 1);
        }}
      />

      {/* Edit caption modal */}
      <EditPostModal
        open={editOpen}
        post={editPost}
        onClose={() => setEditOpen(false)}
        onUpdated={() => {
          // универсальный fallback
          setFeedRefreshKey((x) => x + 1);
        }}
      />
    </div>
  );
}
