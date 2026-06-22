import { Loader2 } from "lucide-react";

const VARIANTS = {
  primary:
    "bg-primary hover:bg-primary-hover text-white shadow-glowSm hover:shadow-glow",
  secondary:
    "bg-transparent border border-primary text-white hover:bg-primary/10",
  danger: "bg-error hover:bg-error/90 text-white",
  ghost: "bg-transparent text-textSecondary hover:text-white hover:bg-elevated",
};

const SIZES = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3.5 text-base",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled = false,
  className = "",
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`
        inline-flex items-center justify-center gap-2 rounded-xl font-semibold
        transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
        ${VARIANTS[variant]} ${SIZES[size]} ${className}
      `}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}
