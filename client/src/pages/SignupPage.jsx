import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Check } from "lucide-react";
import AuthLayout from "../components/auth/AuthLayout.jsx";
import GoogleAuthButton from "../components/auth/GoogleAuthButton.jsx";
import Input from "../components/ui/Input.jsx";
import Button from "../components/ui/Button.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function SignupPage() {
  const navigate = useNavigate();
  const { register, isAuthenticating } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  const hasMinLength = form.password.length >= 8;
  const hasNumberOrSymbol = /[0-9!@#$%^&*(),.?":{}|<>]/.test(form.password);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Full name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    if (!hasMinLength) newErrors.password = "Password must be at least 8 characters";
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const result = await register(form);
    if (result.success) navigate("/chats");
  };

  return (
    <AuthLayout>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white">Create Account</h1>
        <p className="text-textSecondary text-sm mt-1.5">
          Join ChatSphere and start chatting
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Full Name"
          name="name"
          icon={User}
          placeholder="Enter your full name"
          value={form.name}
          onChange={handleChange}
          error={errors.name}
          autoComplete="name"
        />

        <Input
          label="Email"
          name="email"
          type="email"
          icon={Mail}
          placeholder="Enter your email"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
          autoComplete="email"
        />

        <div>
          <Input
            label="Password"
            name="password"
            type="password"
            icon={Lock}
            placeholder="Create a password"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
            autoComplete="new-password"
          />
          <div className="flex items-center gap-4 mt-2 text-xs">
            <span
              className={`flex items-center gap-1 ${
                hasMinLength ? "text-success" : "text-muted"
              }`}
            >
              <Check className="w-3.5 h-3.5" /> At least 8 characters
            </span>
            <span
              className={`flex items-center gap-1 ${
                hasNumberOrSymbol ? "text-success" : "text-muted"
              }`}
            >
              <Check className="w-3.5 h-3.5" /> Includes number or symbol
            </span>
          </div>
        </div>

        <Input
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          icon={Lock}
          placeholder="Confirm your password"
          value={form.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          autoComplete="new-password"
        />

        <Button type="submit" size="lg" className="w-full" isLoading={isAuthenticating}>
          Sign Up
        </Button>
      </form>

      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted">or continue with</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <GoogleAuthButton label="Continue with Google" />

      <p className="text-center text-sm text-textSecondary mt-7">
        Already have an account?{" "}
        <Link to="/login" className="text-primary-bright font-medium hover:underline">
          Login
        </Link>
      </p>
    </AuthLayout>
  );
}
