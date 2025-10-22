// src/components/MobileNavigation.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface MobileNavigationProps {
  user?: {
    name?: string;
    role?: string;
  } | null;
  onLogout: () => void;
  projectId?: number;
}

export default function MobileNavigation({
  user,
  onLogout,
  projectId,
}: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  // Determine current section for active state
  const isDashboardActive = pathname === "/dashboard";
  const isProjectDetailsActive =
    pathname.includes("/projects/") &&
    !pathname.includes("/rfqs/") &&
    !pathname.includes("/requirements/");
  const isRfqActive = pathname.includes("/rfqs/");
  const isProfileActive = pathname === "/vendors/profile";

  return (
    <div className="md:hidden">
      {/* Mobile menu button */}
      <div className="flex items-center justify-between p-4 bg-white shadow">
        <div className="flex-shrink-0 flex items-center">
          <h1 className="text-xl font-bold text-gray-900">Projectile</h1>
        </div>
        <button
          onClick={toggleMenu}
          className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
          aria-expanded="false"
        >
          <span className="sr-only">Open main menu</span>
          {/* Icon when menu is closed */}
          <svg
            className={`${isOpen ? "hidden" : "block"} h-6 w-6`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
          {/* Icon when menu is open */}
          <svg
            className={`${isOpen ? "block" : "hidden"} h-6 w-6`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Mobile menu panel */}
      <div className={`${isOpen ? "block" : "hidden"} md:hidden`}>
        <div className="pt-2 pb-3 space-y-1">
          <Link
            href="/dashboard"
            className={`${
              isDashboardActive
                ? "bg-blue-50 border-blue-500 text-blue-700"
                : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
            } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
            onClick={closeMenu}
          >
            Dashboard
          </Link>

          {user?.role === "project_owner" && projectId && (
            <Link
              href={`/projects/${projectId}`}
              className={`${
                isProjectDetailsActive
                  ? "bg-blue-50 border-blue-500 text-blue-700"
                  : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
              onClick={closeMenu}
            >
              Project Details
            </Link>
          )}

          {user?.role === "vendor" && (
            <Link
              href="/vendors/profile"
              className={`${
                isProfileActive
                  ? "bg-blue-50 border-blue-500 text-blue-700"
                  : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
              onClick={closeMenu}
            >
              Profile
            </Link>
          )}
        </div>

        <div className="pt-4 pb-3 border-t border-gray-200">
          <div className="flex items-center px-4">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-800 font-medium">
                  {user?.name?.charAt(0) || "U"}
                </span>
              </div>
            </div>
            <div className="ml-3">
              <div className="text-base font-medium text-gray-800">
                {user?.name || "User"}
              </div>
              <div className="text-sm font-medium text-gray-500">
                {user?.role || "User"}
              </div>
            </div>
          </div>
          <div className="mt-3 space-y-1 px-2">
            <button
              onClick={() => {
                onLogout();
                closeMenu();
              }}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
