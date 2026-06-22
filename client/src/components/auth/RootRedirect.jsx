import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { PageLoader } from "../ui/Loader.jsx";

export default function RootRedirect() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <PageLoader />;

  return <Navigate to={isAuthenticated ? "/chats" : "/login"} replace />;
}
