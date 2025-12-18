// src/components/Sidebar.jsx
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function Sidebar({ onCreate }) {
  const { user } = useAuth();
  const apiUrl = import.meta.env.VITE_API_URL;

  const toAbsUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const normalized = url.startsWith("/") ? url : `/${url}`;
    return `${apiUrl}${normalized}`;
  };

  const profileTo = user?.username ? `/profile/${user.username}` : "/login";
  const avatarSrc = toAbsUrl(user?.avatar) || "/icons/profile.png";

  return (
    <aside className="sidebar">
      <nav className="sidebar-menu">
        <NavLink to="/home" className="sidebar-item">
          <img src="/icons/home.png" alt="Home" className="sidebar-icon" />
          <span className="sidebar-text">Home</span>
        </NavLink>

        <NavLink to="/search" className="sidebar-item">
          <img src="/icons/search.png" alt="Search" className="sidebar-icon" />
          <span className="sidebar-text">Search</span>
        </NavLink>

        <NavLink to="/explore" className="sidebar-item">
          <img src="/icons/explore.png" alt="Explore" className="sidebar-icon" />
          <span className="sidebar-text">Explore</span>
        </NavLink>

        <NavLink to="/messages" className="sidebar-item">
          <img src="/icons/messages.png" alt="Messages" className="sidebar-icon" />
          <span className="sidebar-text">Messages</span>
        </NavLink>

        <NavLink to="/notifications" className="sidebar-item">
          <img
            src="/icons/notifications.png"
            alt="Notifications"
            className="sidebar-icon"
          />
          <span className="sidebar-text">Notifications</span>
        </NavLink>

        <button
          type="button"
          className="sidebar-item sidebar-create"
          onClick={() => onCreate?.()}
        >
          <img src="/icons/create.png" alt="Create" className="sidebar-icon" />
          <span className="sidebar-text">Create</span>
        </button>

        <div className="sidebar-spacer" />

        <NavLink to={profileTo} className="sidebar-item sidebar-profile">
          <img
            src={avatarSrc}
            alt="Profile"
            className="sidebar-icon"
            style={{ borderRadius: "50%", objectFit: "cover" }}
            onError={(e) => {
              // если URL битый — подставляем дефолтную иконку
              e.currentTarget.src = "/icons/profile.png";
            }}
          />
          <span className="sidebar-text">Profile</span>
        </NavLink>
      </nav>
    </aside>
  );
}
