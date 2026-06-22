import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Lock, Mail, CheckCircle2 } from "lucide-react";
import AuthLayout from "../components/auth/AuthLayout.jsx";
import Input from "../components/ui/Input.jsx";
import Button from "../components/ui/Button.jsx";
import axiosInstance from "../lib/axios.js";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    setIsLoading(true);
    try {
      await axiosInstance.post("/auth/forgot-password", { email });
      setIsSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Link
        to="/login"
        className="inline-flex items-center gap-1.5 text-sm text-textSecondary hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center mx-auto mb-4">
          {isSent ? (
            <CheckCircle2 className="w-7 h-7 text-success" />
          ) : (
            <Lock className="w-7 h-7 text-primary-bright" />
          )}
        </div>
        <h1 className="text-2xl font-bold text-white">
          {isSent ? "Check Your Email" : "Forgot Password"}
        </h1>
        <p className="text-textSecondary text-sm mt-1.5 max-w-xs mx-auto">
          {isSent
            ? `We've sent a password reset link to ${email} if an account exists.`
            : "Enter your email and we'll send you a link to reset your password."}
        </p>
      </div>

      {!isSent && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email"
            name="email"
            type="email"
            icon={Mail}
            placeholder="Enter your email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            error={error}
            autoComplete="email"
          />

          <Button type="submit" size="lg" className="w-full" isLoading={isLoading}>
            Send Reset Link
          </Button>
        </form>
      )}

      <p className="text-center text-sm text-textSecondary mt-7">
        <Link to="/login" className="text-primary-bright font-medium hover:underline">
          Back to login
        </Link>
      </p>
    </AuthLayout>
  );
}
