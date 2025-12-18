import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
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

  // optimistic create event
  const [createdPostEvent, setCreatedPostEvent] = useState(null);
  // shape: { nonce: number, post: object }

  // Global Post actions dialog
  const [actionsOpen, setActionsOpen] = useState(false);
  const [actionsPost, setActionsPost] = useState(null);

  // Global Edit post modal
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

  // called from any page (via Outlet context)
  const openPostActions = (post) => {
    if (!post) return;
    setActionsPost(post);
    setActionsOpen(true);
  };

  // called from any page (via Outlet context)
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

  // --- Нормализуем id'шники (Mongo: _id) ---
  const myId = useMemo(() => me?._id || me?.id || null, [me]);

  const actionsPostId = useMemo(
    () => actionsPost?._id || actionsPost?.id || null,
    [actionsPost]
  );

  const actionsAuthorId = useMemo(() => {
    const a = actionsPost?.author;
    return a?._id || a?.id || a || null;
  }, [actionsPost]);

  const canEditDelete = useMemo(() => {
    if (!myId || !actionsAuthorId) return false;
    return String(myId) === String(actionsAuthorId);
  }, [myId, actionsAuthorId]);

  const postUrl = useMemo(() => {
    if (!actionsPostId) return "";
    return `${window.location.origin}/posts/${actionsPostId}`;
  }, [actionsPostId]);

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

            // Post modal
            openPost,
            closePost,

            // Global dialogs
            openPostActions,
            openEditPost,

            // optimistic delete signal
            deletedPostId,
            setDeletedPostId,

            // optimistic create
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
      
console.log("meId", me?._id || me?.id);
console.log("actionsPost", actionsPost);

      <PostActionsSheet
        open={actionsOpen}
        onClose={() => setActionsOpen(false)}
        postUrl={postUrl}
        canEdit={canEditDelete}
        canDelete={canEditDelete}
        onGoToPost={() => {
          if (!actionsPostId) return;
          navigate(`/posts/${actionsPostId}`);
        }}
        onEdit={() => {
          setActionsOpen(false);
          openEditPost(actionsPost);
        }}
        onDelete={async () => {
          if (!actionsPostId) return;

          await axios.delete(`/posts/${actionsPostId}`);

          setActionsOpen(false);

          setDeletedPostId(actionsPostId);
          setFeedRefreshKey((x) => x + 1);
        }}
      />

      <EditPostModal
        open={editOpen}
        post={editPost}
        onClose={() => setEditOpen(false)}
        onUpdated={() => {
          setFeedRefreshKey((x) => x + 1);
        }}
      />
    </div>
  );
}
