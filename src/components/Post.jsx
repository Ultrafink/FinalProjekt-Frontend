import React from "react";

export default function Post({ post }) {
  return (
    <div className="post-card">
      <div className="post-header">
        <img src={post.avatar} alt={post.username} className="post-avatar" />
        <span className="post-username">{post.username}</span>
      </div>
      <div className="post-content">
        {post.content}
      </div>
    </div>
  );
}
