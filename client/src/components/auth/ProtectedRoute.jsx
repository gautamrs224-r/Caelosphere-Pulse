import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { PageLoader } from "../ui/Loader.jsx";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <PageLoader />;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
}
