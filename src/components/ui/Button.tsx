import React from "react";

// Variants disponibles
type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  // Classes de base communes
  const baseClasses =
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";

  // Tailles (mobile-first : on commence par sm, puis md, puis lg)
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm md:text-base",
    lg: "px-6 py-3 text-base md:text-lg",
  };

  // Variants de couleur en utilisant nos tokens Tailwind définis dans @theme
  const variantClasses = {
    primary:
      "bg-primary text-white hover:bg-primary-dark focus:ring-primary/50",
    secondary:
      "bg-secondary text-white hover:bg-emerald-700 focus:ring-secondary/50",
    danger: "bg-danger text-white hover:bg-red-700 focus:ring-danger/50",
    ghost:
      "bg-transparent text-text-primary hover:bg-gray-100 focus:ring-gray-400",
    outline:
      "border border-primary text-primary bg-transparent hover:bg-primary/10 focus:ring-primary/50",
  };

  // Gestion du loading
  const loadingIcon = loading ? (
    <svg
      className="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  ) : null;

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? loadingIcon : icon}
      {children}
    </button>
  );
}
