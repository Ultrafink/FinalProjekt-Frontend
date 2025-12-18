import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function PublicOnlyLayout() {
  const { user, loadingMe } = useAuth();

  if (loadingMe) return <div className="page-loading">Loading...</div>;

  return user ? <Navigate to="/home" replace /> : <Outlet />;
}
