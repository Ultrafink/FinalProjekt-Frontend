import { ModalCtx } from "./modalContext";
import { useMemo, useState } from "react";
import EditPostModal from "./EditPostModal";
import PostActionsSheet from "./PostActionsSheet";

export default function ModalProvider({ children }) {
  const [edit, setEdit] = useState({ open: false, post: null });
  const [actions, setActions] = useState({ open: false, post: null });

  const api = useMemo(
    () => ({
      openEditPost(post) {
        setEdit({ open: true, post });
      },
      closeEditPost() {
        setEdit({ open: false, post: null });
      },
      openPostActions(post) {
        setActions({ open: true, post });
      },
      closePostActions() {
        setActions({ open: false, post: null });
      },
    }),
    []
  );

  return (
    <ModalCtx.Provider value={api}>
      {children}

      <EditPostModal
        open={edit.open}
        post={edit.post}
        onClose={api.closeEditPost}
        onUpdated={() => {}}
      />

      <PostActionsSheet
        open={actions.open}
        onClose={api.closePostActions}
        postUrl={actions.post?.id ? `${window.location.origin}/posts/${actions.post.id}` : ""}
        canEdit={true}
        canDelete={true}
        onGoToPost={() => {}}
        onEdit={() => api.openEditPost(actions.post)}
        onDelete={async () => {}}
      />
    </ModalCtx.Provider>
  );
}
