import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/lib/auth";

const ProtectedRoute = () => {
  const user = useAuth((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
};

export default ProtectedRoute;
