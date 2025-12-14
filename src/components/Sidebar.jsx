import React from "react";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const menuItems = [
    { title: "Home", icon: "home", path: "/home" },
    { title: "Search", icon: "search", path: "/search" },
    { title: "Explore", icon: "explore", path: "/explore" },
    { title: "Messages", icon: "chat", path: "/messages" },
    { title: "Notifications", icon: "notifications", path: "/notifications" },
    { title: "Create", icon: "add_circle", path: "/create" },
  ];

  return (
    <nav className="menu" role="navigation" aria-label="Main Menu">
      {menuItems.map((item) => (
        <NavLink to={item.path} key={item.title} className="link">
          <span className="link-icon material-symbols-rounded">{item.icon}</span>
          <span className="link-title">{item.title}</span>
        </NavLink>
      ))}

      <NavLink to="/profile" className="link profile-link">
        <img
          src="/path-to-avatar.png"
          alt="Profile"
          className="link-icon profile-icon"
        />
        <span className="link-title">Profile</span>
      </NavLink>
    </nav>
  );
}
