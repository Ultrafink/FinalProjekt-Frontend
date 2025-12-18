import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function ProtectedLayout() {
  const { user, loadingMe } = useAuth();

  if (loadingMe) return <div className="page-loading">Loading...</div>;

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
