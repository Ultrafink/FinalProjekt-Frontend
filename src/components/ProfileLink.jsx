import { Link } from "react-router-dom";

export default function ProfileLink({ username, className, children }) {
  if (!username) return null;

  return (
    <Link to={`/profile/${username}`} className={className}>
      {children ?? username}
    </Link>
  );
}
