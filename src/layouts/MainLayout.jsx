import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import axios from "../utils/axios";
import CreatePostModal from "../components/CreatePostModal";

export default function MainLayout() {
  const [createOpen, setCreateOpen] = useState(false);
  const [me, setMe] = useState(null);
  const [feedRefreshKey, setFeedRefreshKey] = useState(0);

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

  const reloadMe = async () => {
    const res = await axios.get("/users/me");
    setMe(res.data);
  };

  return (
    <div className="app-layout">
      <Sidebar onCreate={() => setCreateOpen(true)} />

      <main className="app-content">
        <Outlet context={{ me, feedRefreshKey }} />
      </main>

      <CreatePostModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        me={me}
        onCreated={async () => {
          // обновляем профиль (если нужно)
          try {
            await reloadMe();
          } catch (e) {
            console.error(e);
          }

          // обновляем ленты
          setFeedRefreshKey((x) => x + 1);
        }}
      />
    </div>
  );
}
