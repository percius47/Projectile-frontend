// src/components/ResponsiveButton.tsx
import React from "react";

interface ResponsiveButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: "primary" | "secondary" | "danger" | "success";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
  fullWidth?: boolean;
}

export default function ResponsiveButton({
  children,
  onClick,
  href,
  variant = "primary",
  size = "medium",
  disabled = false,
  className = "",
  type = "button",
  fullWidth = false,
}: ResponsiveButtonProps) {
  const baseClasses =
    "inline-flex items-center border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200";

  const variantClasses = {
    primary:
      "border-transparent text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 active:bg-blue-800",
    secondary:
      "border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-500 active:bg-gray-100",
    danger:
      "border-transparent text-white bg-red-600 hover:bg-red-700 focus:ring-red-500 active:bg-red-800",
    success:
      "border-transparent text-white bg-green-600 hover:bg-green-700 focus:ring-green-500 active:bg-green-800",
  };

  const sizeClasses = {
    small: "px-3 py-2 text-xs min-h-[44px] min-w-[44px]", // Minimum touch target size
    medium: "px-4 py-2.5 text-sm min-h-[44px] min-w-[44px]", // Minimum touch target size
    large: "px-6 py-3 text-base min-h-[48px] min-w-[48px]", // Larger touch target size
  };

  const widthClass = fullWidth ? "w-full justify-center" : "";

  const disabledClass = disabled ? "opacity-50 cursor-not-allowed" : "";

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${disabledClass} ${className}`;

  if (href) {
    return (
      <a href={href} className={classes} onClick={onClick}>
        {children}
      </a>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
