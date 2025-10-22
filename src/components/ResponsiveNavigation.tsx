// src/components/ResponsiveNavigation.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import MobileDrawer from "@/components/MobileDrawer";

interface NavigationItem {
  name: string;
  href: string;
  current: boolean;
}

interface ResponsiveNavigationProps {
  user?: {
    name?: string;
    role?: string;
  } | null;
  onLogout: () => void;
  navigationItems: NavigationItem[];
}

export default function ResponsiveNavigation({
  user,
  onLogout,
  navigationItems,
}: ResponsiveNavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="relative">
      {/* Mobile navigation */}
      <div className="md:hidden">
        <div className="flex items-center justify-between p-4 bg-white shadow">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">Projectile</h1>
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            onClick={toggleMobileMenu}
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Mobile Drawer */}
        <MobileDrawer
          isOpen={mobileMenuOpen}
          onClose={closeMobileMenu}
          user={user}
          onLogout={onLogout}
          navigationItems={navigationItems}
        />
      </div>

      {/* Desktop navigation */}
      <nav className="hidden md:block bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <h1 className="text-xl font-bold text-gray-900">Projectile</h1>
              </div>
              <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
                {navigationItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      item.current
                        ? "border-blue-500 text-gray-900"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    } inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <div className="ml-3 relative">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-700">{user?.name}</span>
                  <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {user?.role}
                  </span>
                  <button
                    onClick={onLogout}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
