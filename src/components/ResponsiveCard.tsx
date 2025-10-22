// src/components/ResponsiveCard.tsx
import React from "react";

interface ResponsiveCardProps {
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export default function ResponsiveCard({
  title,
  children,
  actions,
  className = "",
}: ResponsiveCardProps) {
  return (
    <div className={`bg-white shadow rounded-lg overflow-hidden ${className}`}>
      <div className="px-4 py-5 sm:p-6">
        {title && (
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-4">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            {actions && <div className="flex-shrink-0">{actions}</div>}
          </div>
        )}
        <div className="mobile-card-content">{children}</div>
      </div>
    </div>
  );
}
