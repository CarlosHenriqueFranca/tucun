"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b"
      style={{
        backgroundColor: "rgba(10, 22, 40, 0.95)",
        borderColor: "#2D3748",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl">🎣</span>
            <span
              className="text-xl font-bold tracking-tight"
              style={{
                fontFamily: "var(--font-poppins)",
                color: "#E8F5E9",
              }}
            >
              Tucun
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/#funcionalidades"
              className="text-sm font-medium transition-colors hover:text-[#40916C]"
              style={{ color: "#9CA3AF" }}
            >
              Funcionalidades
            </Link>
            <Link
              href="/#precos"
              className="text-sm font-medium transition-colors hover:text-[#40916C]"
              style={{ color: "#9CA3AF" }}
            >
              Preços
            </Link>
            <Link
              href="/#download"
              className="text-sm font-medium transition-colors hover:text-[#40916C]"
              style={{ color: "#9CA3AF" }}
            >
              Download
            </Link>
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/assinar"
              className="px-5 py-2 rounded-lg text-sm font-semibold transition-all hover:brightness-110 active:scale-95"
              style={{
                backgroundColor: "#F77F00",
                color: "#fff",
                fontFamily: "var(--font-poppins)",
              }}
            >
              Assinar
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 rounded-md"
            style={{ color: "#E8F5E9" }}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Abrir menu"
          >
            {mobileOpen ? (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div
            className="md:hidden border-t py-4 flex flex-col gap-4"
            style={{ borderColor: "#2D3748" }}
          >
            <Link
              href="/#funcionalidades"
              className="text-sm font-medium px-2"
              style={{ color: "#9CA3AF" }}
              onClick={() => setMobileOpen(false)}
            >
              Funcionalidades
            </Link>
            <Link
              href="/#precos"
              className="text-sm font-medium px-2"
              style={{ color: "#9CA3AF" }}
              onClick={() => setMobileOpen(false)}
            >
              Preços
            </Link>
            <Link
              href="/#download"
              className="text-sm font-medium px-2"
              style={{ color: "#9CA3AF" }}
              onClick={() => setMobileOpen(false)}
            >
              Download
            </Link>
            <Link
              href="/assinar"
              className="mx-2 py-2.5 rounded-lg text-sm font-semibold text-center"
              style={{
                backgroundColor: "#F77F00",
                color: "#fff",
              }}
              onClick={() => setMobileOpen(false)}
            >
              Assinar
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
