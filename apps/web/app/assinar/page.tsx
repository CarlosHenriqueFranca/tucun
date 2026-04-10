"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

type Plan = "monthly" | "annual";
type PaymentMethod = "pix" | "card";

function AsideInfo() {
  return (
    <div
      className="rounded-2xl p-6 flex flex-col gap-4"
      style={{ backgroundColor: "#1A2744", border: "1px solid #2D3748" }}
    >
      <div className="flex items-center gap-3">
        <span className="text-3xl">🎣</span>
        <div>
          <p
            className="font-bold text-lg"
            style={{ fontFamily: "var(--font-poppins)", color: "#E8F5E9" }}
          >
            Tucun Premium
          </p>
          <p className="text-sm" style={{ color: "#9CA3AF" }}>
            7 dias grátis incluídos
          </p>
        </div>
      </div>

      <div
        className="rounded-xl p-4 flex items-center gap-3"
        style={{ backgroundColor: "rgba(64,145,108,0.15)", border: "1px solid #40916C" }}
      >
        <span className="text-2xl">🎁</span>
        <div>
          <p className="font-semibold text-sm" style={{ color: "#40916C" }}>
            7 dias completamente grátis
          </p>
          <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>
            Cancele a qualquer momento durante o trial sem ser cobrado.
          </p>
        </div>
      </div>

      <ul className="flex flex-col gap-3">
        {[
          "Mapa interativo completo",
          "Feed social ilimitado",
          "Guia de peixes completo",
          "Alertas de rota em tempo real",
          "Chat ao vivo com a comunidade",
          "Gamificação e rankings",
          "Suporte prioritário",
        ].map((feature) => (
          <li key={feature} className="flex items-center gap-3">
            <svg
              className="w-4 h-4 flex-shrink-0"
              fill="#40916C"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm" style={{ color: "#E8F5E9" }}>
              {feature}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CheckoutForm() {
  const searchParams = useSearchParams();
  const initialPlan = (searchParams.get("plan") as Plan) || "monthly";

  const [plan, setPlan] = useState<Plan>(initialPlan);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [form, setForm] = useState({ name: "", email: "", cpf: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const planInfo = {
    monthly: { label: "Mensal", price: "R$ 59,90/mês", value: "monthly" },
    annual: {
      label: "Anual",
      price: "R$ 497 (ou 10x R$ 49,90)",
      value: "annual",
    },
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          paymentMethod,
          ...form,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Erro ao processar assinatura.");
      }

      window.location.href = "/assinar/success";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Plan Selector */}
      <div>
        <label
          className="block text-sm font-semibold mb-3"
          style={{ color: "#E8F5E9" }}
        >
          Escolha o plano
        </label>
        <div className="grid grid-cols-2 gap-3">
          {(["monthly", "annual"] as Plan[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPlan(p)}
              className="rounded-xl p-4 text-left transition-all"
              style={{
                backgroundColor:
                  plan === p ? "rgba(27,67,50,0.6)" : "#1A2744",
                border:
                  plan === p ? "2px solid #40916C" : "1px solid #2D3748",
              }}
            >
              <p
                className="font-semibold text-sm"
                style={{ color: "#E8F5E9" }}
              >
                {planInfo[p].label}
              </p>
              <p className="text-xs mt-1" style={{ color: "#9CA3AF" }}>
                {planInfo[p].price}
              </p>
              {p === "annual" && (
                <span
                  className="inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-bold"
                  style={{ backgroundColor: "#F77F00", color: "#fff" }}
                >
                  -30%
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Payment Method */}
      <div>
        <label
          className="block text-sm font-semibold mb-3"
          style={{ color: "#E8F5E9" }}
        >
          Forma de pagamento
        </label>
        <div className="grid grid-cols-2 gap-3">
          {([
            { id: "pix", label: "PIX", emoji: "⚡" },
            { id: "card", label: "Cartão de Crédito", emoji: "💳" },
          ] as { id: PaymentMethod; label: string; emoji: string }[]).map(
            (method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => setPaymentMethod(method.id)}
                className="rounded-xl p-4 flex items-center gap-3 transition-all"
                style={{
                  backgroundColor:
                    paymentMethod === method.id
                      ? "rgba(27,67,50,0.6)"
                      : "#1A2744",
                  border:
                    paymentMethod === method.id
                      ? "2px solid #40916C"
                      : "1px solid #2D3748",
                }}
              >
                <span className="text-xl">{method.emoji}</span>
                <span
                  className="text-sm font-semibold"
                  style={{ color: "#E8F5E9" }}
                >
                  {method.label}
                </span>
              </button>
            )
          )}
        </div>
      </div>

      {/* PIX QR Code area */}
      {paymentMethod === "pix" && (
        <div
          className="rounded-xl p-6 flex flex-col items-center gap-3"
          style={{ backgroundColor: "#1A2744", border: "1px solid #2D3748" }}
        >
          <div
            className="w-40 h-40 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "#0A1628", border: "1px dashed #2D3748" }}
          >
            <div className="text-center">
              <span className="text-4xl block mb-2">⚡</span>
              <p className="text-xs" style={{ color: "#9CA3AF" }}>
                QR Code PIX
              </p>
              <p className="text-xs" style={{ color: "#6B7280" }}>
                gerado após cadastro
              </p>
            </div>
          </div>
          <p className="text-xs text-center" style={{ color: "#9CA3AF" }}>
            Após clicar em Assinar, o QR Code PIX será gerado. O acesso é
            liberado em até 2 minutos após a confirmação.
          </p>
        </div>
      )}

      {/* Form Fields */}
      <div className="flex flex-col gap-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium mb-1.5"
            style={{ color: "#9CA3AF" }}
          >
            Nome completo
          </label>
          <input
            id="name"
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Seu nome"
            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
            style={{
              backgroundColor: "#1A2744",
              border: "1px solid #2D3748",
              color: "#E8F5E9",
            }}
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium mb-1.5"
            style={{ color: "#9CA3AF" }}
          >
            E-mail
          </label>
          <input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="seu@email.com"
            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
            style={{
              backgroundColor: "#1A2744",
              border: "1px solid #2D3748",
              color: "#E8F5E9",
            }}
          />
        </div>

        <div>
          <label
            htmlFor="cpf"
            className="block text-sm font-medium mb-1.5"
            style={{ color: "#9CA3AF" }}
          >
            CPF{" "}
            <span className="text-xs" style={{ color: "#6B7280" }}>
              (opcional)
            </span>
          </label>
          <input
            id="cpf"
            type="text"
            value={form.cpf}
            onChange={(e) => setForm({ ...form, cpf: e.target.value })}
            placeholder="000.000.000-00"
            maxLength={14}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
            style={{
              backgroundColor: "#1A2744",
              border: "1px solid #2D3748",
              color: "#E8F5E9",
            }}
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          className="rounded-xl px-4 py-3 text-sm"
          style={{ backgroundColor: "rgba(239,68,68,0.15)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.3)" }}
        >
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 rounded-xl font-bold text-base transition-all hover:brightness-110 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
        style={{
          backgroundColor: "#F77F00",
          color: "#fff",
          fontFamily: "var(--font-poppins)",
          boxShadow: "0 8px 32px rgba(247,127,0,0.3)",
        }}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
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
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
            Processando...
          </span>
        ) : (
          "Assinar Agora — 7 dias grátis"
        )}
      </button>

      <p className="text-xs text-center" style={{ color: "#6B7280" }}>
        Ao assinar, você concorda com os Termos de Uso e Política de
        Privacidade do Tucun. Você pode cancelar a qualquer momento.
      </p>
    </form>
  );
}

export default function AsinarPage() {
  return (
    <main
      className="min-h-screen py-8 px-4"
      style={{ backgroundColor: "#0A1628" }}
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <a
            href="/"
            className="inline-flex items-center gap-2 mb-6 transition-opacity hover:opacity-80"
          >
            <span className="text-2xl">🎣</span>
            <span
              className="text-xl font-bold"
              style={{ fontFamily: "var(--font-poppins)", color: "#E8F5E9" }}
            >
              Tucun
            </span>
          </a>
          <h1
            className="text-2xl sm:text-3xl font-extrabold mb-2"
            style={{ fontFamily: "var(--font-poppins)", color: "#E8F5E9" }}
          >
            Comece sua assinatura
          </h1>
          <p className="text-sm" style={{ color: "#9CA3AF" }}>
            7 dias grátis · Cancele quando quiser
          </p>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-6">
          <AsideInfo />

          <div
            className="rounded-2xl p-6"
            style={{ backgroundColor: "#1A2744", border: "1px solid #2D3748" }}
          >
            <Suspense fallback={<div className="text-center py-8" style={{ color: "#9CA3AF" }}>Carregando...</div>}>
              <CheckoutForm />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  );
}
