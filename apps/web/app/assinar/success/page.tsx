"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function SuccessPage() {
  // Deep link back to the mobile app
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = "tucun://subscription/success";
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  function handleOpenApp() {
    window.location.href = "tucun://subscription/success";
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "#0A1628" }}
    >
      <div className="max-w-md w-full text-center flex flex-col items-center gap-8">
        {/* Success Icon */}
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center"
          style={{
            backgroundColor: "rgba(16,185,129,0.15)",
            border: "2px solid #10B981",
          }}
        >
          <svg className="w-12 h-12" fill="#10B981" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        {/* Content */}
        <div>
          <h1
            className="text-3xl sm:text-4xl font-extrabold mb-3"
            style={{ fontFamily: "var(--font-poppins)", color: "#E8F5E9" }}
          >
            Assinatura Ativada! 🎣
          </h1>
          <p className="text-base leading-relaxed" style={{ color: "#9CA3AF" }}>
            Parabéns! Sua assinatura Tucun Premium foi ativada com sucesso. Seus{" "}
            <strong style={{ color: "#40916C" }}>7 dias grátis</strong> começaram agora.
            Boas pescarias!
          </p>
        </div>

        {/* Trial info */}
        <div
          className="w-full rounded-2xl p-6 flex flex-col gap-3"
          style={{ backgroundColor: "#1A2744", border: "1px solid #2D3748" }}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏆</span>
            <div className="text-left">
              <p className="font-semibold text-sm" style={{ color: "#E8F5E9" }}>
                Trial de 7 dias ativado
              </p>
              <p className="text-xs" style={{ color: "#9CA3AF" }}>
                Acesso completo a todas as funcionalidades
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">🗺️</span>
            <div className="text-left">
              <p className="font-semibold text-sm" style={{ color: "#E8F5E9" }}>
                Mapa interativo liberado
              </p>
              <p className="text-xs" style={{ color: "#9CA3AF" }}>
                Explore 500+ pontos de pesca em Rondônia
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">💬</span>
            <div className="text-left">
              <p className="font-semibold text-sm" style={{ color: "#E8F5E9" }}>
                Comunidade desbloqueada
              </p>
              <p className="text-xs" style={{ color: "#9CA3AF" }}>
                Chat, feed social e rankings
              </p>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col w-full gap-3">
          <button
            onClick={handleOpenApp}
            className="w-full py-4 rounded-xl font-bold text-base transition-all hover:brightness-110 active:scale-95"
            style={{
              backgroundColor: "#F77F00",
              color: "#fff",
              fontFamily: "var(--font-poppins)",
              boxShadow: "0 8px 32px rgba(247,127,0,0.3)",
            }}
          >
            Abrir o App Tucun
          </button>

          <Link
            href="/"
            className="w-full py-3 rounded-xl font-semibold text-sm text-center transition-all border hover:bg-white/5"
            style={{ borderColor: "#2D3748", color: "#9CA3AF" }}
          >
            Voltar ao site
          </Link>
        </div>

        <p className="text-xs" style={{ color: "#4B5563" }}>
          Redirecionando para o app automaticamente...
        </p>
      </div>
    </main>
  );
}
