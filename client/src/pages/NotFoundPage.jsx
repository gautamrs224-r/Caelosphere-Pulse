import { Link } from "react-router-dom";
import { MessageCircleOff } from "lucide-react";
import Button from "../components/ui/Button.jsx";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-elevated flex items-center justify-center mb-5">
        <MessageCircleOff className="w-7 h-7 text-primary-bright" />
      </div>
      <h1 className="text-3xl font-bold text-white">Page not found</h1>
      <p className="text-textSecondary mt-2 max-w-sm">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="mt-6">
        <Button variant="primary" size="lg">
          Back to home
        </Button>
      </Link>
    </div>
  );
}
