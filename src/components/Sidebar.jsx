import { NavLink } from "react-router-dom";

export default function Sidebar({ onCreate }) {
  return (
    <aside className="sidebar">
      <nav className="sidebar-menu">
        {/* Основные пункты меню */}
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

        {/* CREATE — теперь кнопка, не NavLink */}
        <button
          type="button"
          className="sidebar-item sidebar-create"
          onClick={() => onCreate?.()}
        >
          <img src="/icons/create.png" alt="Create" className="sidebar-icon" />
          <span className="sidebar-text">Create</span>
        </button>

        {/* Отделяем пункт профиля внизу */}
        <div className="sidebar-spacer" />

        <NavLink to="/profile" className="sidebar-item sidebar-profile">
          <img src="/icons/profile.png" alt="Profile" className="sidebar-icon" />
          <span className="sidebar-text">Profile</span>
        </NavLink>
      </nav>
    </aside>
  );
}
