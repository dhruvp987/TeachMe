"use client";

import { ReactNode } from "react";

interface CollapsibleSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function CollapsibleSidebar({
  isOpen,
  onClose,
  children,
}: CollapsibleSidebarProps) {
  return (
    <>
      {/* Sidebar Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:bg-opacity-30"
          onClick={onClose}
        />
      )}

      {/* Left Sidebar - Chat History */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-lg z-40 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } pt-16`}
      >
        <div className="h-full overflow-y-auto p-4 lg:p-6">{children}</div>
      </div>
    </>
  );
}

// Export a toggle button component for use in the header
export function SidebarToggleButton({
  isOpen,
  onToggle,
}: {
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      aria-label="Toggle sidebar"
    >
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        {isOpen ? (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        ) : (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        )}
      </svg>
    </button>
  );
}
