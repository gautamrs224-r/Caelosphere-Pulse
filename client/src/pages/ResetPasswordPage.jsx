import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Lock } from "lucide-react";
import AuthLayout from "../components/auth/AuthLayout.jsx";
import Input from "../components/ui/Input.jsx";
import Button from "../components/ui/Button.jsx";
import axiosInstance from "../lib/axios.js";
import toast from "react-hot-toast";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const validate = () => {
    const newErrors = {};
    if (form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      await axiosInstance.post(`/auth/reset-password/${token}`, {
        password: form.password,
      });
      toast.success("Password reset! Please log in.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset link is invalid or expired");
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
          <ShieldCheck className="w-7 h-7 text-primary-bright" />
        </div>
        <h1 className="text-2xl font-bold text-white">Reset Password</h1>
        <p className="text-textSecondary text-sm mt-1.5">
          Create a new password for your account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="New Password"
          name="password"
          type="password"
          icon={Lock}
          placeholder="Enter new password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          autoComplete="new-password"
        />

        <Input
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          icon={Lock}
          placeholder="Confirm new password"
          value={form.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          autoComplete="new-password"
        />

        <Button type="submit" size="lg" className="w-full" isLoading={isLoading}>
          Reset Password
        </Button>
      </form>

      <p className="text-center text-sm text-textSecondary mt-7">
        <Link to="/login" className="text-primary-bright font-medium hover:underline">
          Back to login
        </Link>
      </p>
    </AuthLayout>
  );
}
