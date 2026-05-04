import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";

const Index = () => {
  const user = useAuth((s) => s.user);
  return <Navigate to={user ? "/dashboard" : "/login"} replace />;
};

export default Index;
