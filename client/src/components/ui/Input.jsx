import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function Input({
  label,
  icon: Icon,
  error,
  type = "text",
  className = "",
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-textPrimary mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-textSecondary pointer-events-none" />
        )}
        <input
          type={inputType}
          className={`
            w-full bg-elevated border border-border rounded-xl text-textPrimary
            placeholder:text-muted py-3 transition-colors duration-200
            focus:border-primary focus:outline-none
            ${Icon ? "pl-11" : "pl-4"}
            ${isPassword ? "pr-11" : "pr-4"}
            ${error ? "border-error" : ""}
            ${className}
          `}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-textSecondary hover:text-white transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="w-4.5 h-4.5" />
            ) : (
              <Eye className="w-4.5 h-4.5" />
            )}
          </button>
        )}
      </div>
      {error && <p className="mt-1.5 text-sm text-error">{error}</p>}
    </div>
  );
}
