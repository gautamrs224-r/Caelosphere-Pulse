import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import AuthLayout from "../components/auth/AuthLayout.jsx";
import GoogleAuthButton from "../components/auth/GoogleAuthButton.jsx";
import Input from "../components/ui/Input.jsx";
import Button from "../components/ui/Button.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticating } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.email.trim()) newErrors.email = "Email is required";
    if (!form.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const result = await login(form);
    if (result.success) navigate("/chats");
  };

  return (
    <AuthLayout>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
        <p className="text-textSecondary text-sm mt-1.5">
          Login to continue to ChatSphere
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
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
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
            autoComplete="current-password"
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-textSecondary cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={() => setRememberMe((r) => !r)}
              className="w-4 h-4 rounded border-border bg-elevated accent-primary cursor-pointer"
            />
            Remember me
          </label>
          <Link to="/forgot-password" className="text-primary-bright hover:underline font-medium">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" size="lg" className="w-full" isLoading={isAuthenticating}>
          Login
        </Button>
      </form>

      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted">or continue with</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <GoogleAuthButton label="Continue with Google" />

      <p className="text-center text-sm text-textSecondary mt-7">
        Don't have an account?{" "}
        <Link to="/signup" className="text-primary-bright font-medium hover:underline">
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
}
