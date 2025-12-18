import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import axios from "../utils/axios";
import CreatePostModal from "../components/CreatePostModal";

export default function MainLayout() {
  const [createOpen, setCreateOpen] = useState(false);
  const [me, setMe] = useState(null);

  useEffect(() => {
    const loadMe = async () => {
      try {
        const res = await axios.get("/users/me");
        setMe(res.data);
      } catch (e) {
  console.error(e);
}
    };
    loadMe();
  }, []);

  return (
    <div className="app-layout">
      <Sidebar onCreate={() => setCreateOpen(true)} />
      <main className="app-content">
        <Outlet />
      </main>

      <CreatePostModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        me={me}
        onCreated={() => {
          // позже можно обновить ленту/профиль
        }}
      />
    </div>
  );
}
