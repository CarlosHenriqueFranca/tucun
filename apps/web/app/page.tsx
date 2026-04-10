import Link from "next/link";
import Navbar from "./components/navbar";
import PricingCard from "./components/pricing-card";

const features = [
  {
    emoji: "🗺️",
    title: "Mapa Interativo",
    description:
      "Explore pontos de pesca marcados por pescadores locais em todo o estado de Rondônia. Filtre por tipo de peixe, profundidade e condições.",
  },
  {
    emoji: "📸",
    title: "Feed Social",
    description:
      "Compartilhe suas capturas, veja o que outros estão pescando e inspire-se com a comunidade de pescadores da região.",
  },
  {
    emoji: "🐟",
    title: "Guia de Peixes",
    description:
      "Enciclopédia completa dos peixes de Rondônia com informações sobre habitat, iscas ideais, melhor época e técnicas de pesca.",
  },
  {
    emoji: "🚨",
    title: "Alertas de Rota",
    description:
      "Receba alertas em tempo real sobre condições de rios, cheias, áreas de piracema e estradas para acesso aos pontos de pesca.",
  },
  {
    emoji: "🏆",
    title: "Gamificação",
    description:
      "Ganhe XP, suba de nível, colecione badges exclusivos e compita em rankings com pescadores de toda a região.",
  },
  {
    emoji: "💬",
    title: "Chat ao Vivo",
    description:
      "Conecte-se com outros pescadores em tempo real. Tire dúvidas, marque pescarias e troque dicas com a comunidade.",
  },
];

const pricingPlans = [
  {
    title: "Gratuito",
    price: "R$ 0",
    priceDetail: "7 dias de trial completo",
    description: "Experimente todas as funcionalidades sem compromisso.",
    features: [
      { text: "Mapa interativo básico", included: true },
      { text: "Feed social", included: true },
      { text: "Guia de peixes (limitado)", included: true },
      { text: "Alertas de rota", included: false },
      { text: "Chat ao vivo", included: false },
      { text: "Gamificação completa", included: false },
      { text: "Suporte prioritário", included: false },
    ],
    ctaLabel: "Começar Trial Grátis",
    ctaHref: "/assinar",
    highlighted: false,
    badge: undefined as string | undefined,
  },
  {
    title: "Mensal",
    price: "R$ 59,90",
    priceDetail: "por mês · cancele quando quiser",
    description: "Acesso completo a todas as funcionalidades premium.",
    features: [
      { text: "Mapa interativo completo", included: true },
      { text: "Feed social ilimitado", included: true },
      { text: "Guia de peixes completo", included: true },
      { text: "Alertas de rota em tempo real", included: true },
      { text: "Chat ao vivo", included: true },
      { text: "Gamificação completa", included: true },
      { text: "Suporte prioritário", included: true },
    ],
    ctaLabel: "Assinar Mensal",
    ctaHref: "/assinar?plan=monthly",
    highlighted: true,
    badge: "Mais Popular" as string | undefined,
  },
  {
    title: "Anual",
    price: "R$ 497",
    priceDetail: "ou 10x R$ 49,90 · economize 30%",
    description: "O melhor custo-benefício para o pescador dedicado.",
    features: [
      { text: "Tudo do plano Mensal", included: true },
      { text: "2 meses grátis", included: true },
      { text: "Badge exclusivo de membro anual", included: true },
      { text: "Acesso antecipado a novas features", included: true },
      { text: "Relatórios avançados de pesca", included: true },
      { text: "Backup de histórico ilimitado", included: true },
      { text: "Suporte VIP 24h", included: true },
    ],
    ctaLabel: "Assinar Anual",
    ctaHref: "/assinar?plan=annual",
    highlighted: false,
    badge: undefined as string | undefined,
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: "#0A1628" }}>
      <Navbar />

      {/* ─── HERO ─── */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(27,67,50,0.6) 0%, rgba(10,22,40,0) 70%), radial-gradient(ellipse 60% 40% at 30% 60%, rgba(64,145,108,0.15) 0%, transparent 60%), linear-gradient(180deg, #0A1628 0%, #0D1E35 50%, #0A1628 100%)",
        }}
      >
        {/* Decorative background */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          aria-hidden="true"
        >
          <div
            className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full opacity-20"
            style={{
              background: "radial-gradient(circle, #40916C 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute top-1/4 -right-24 w-72 h-72 rounded-full opacity-10"
            style={{
              background: "radial-gradient(circle, #1B4332 0%, transparent 70%)",
            }}
          />
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute left-1/2 -translate-x-1/2 rounded-full border opacity-5"
              style={{
                width: `${(i + 1) * 200}px`,
                height: `${(i + 1) * 60}px`,
                borderColor: "#40916C",
                bottom: `-${i * 15}px`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8 border"
            style={{
              backgroundColor: "rgba(27,67,50,0.4)",
              borderColor: "#40916C",
              color: "#40916C",
            }}
          >
            <span>🎣</span>
            <span>O App dos Pescadores de Rondônia</span>
          </div>

          <h1
            className="text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-tight mb-6"
            style={{ fontFamily: "var(--font-poppins)", color: "#E8F5E9" }}
          >
            Descubra os{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #40916C, #F77F00)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Melhores Pontos
            </span>{" "}
            de Pesca de Rondônia
          </h1>

          <p
            className="text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ color: "#9CA3AF" }}
          >
            Mapa colaborativo, feed social, guia de peixes, alertas de rota e
            muito mais. A comunidade definitiva dos pescadores rondonienses.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/assinar"
              className="px-8 py-4 rounded-xl text-lg font-bold transition-all hover:brightness-110 active:scale-95 shadow-lg"
              style={{
                backgroundColor: "#F77F00",
                color: "#fff",
                fontFamily: "var(--font-poppins)",
                boxShadow: "0 8px 32px rgba(247,127,0,0.4)",
              }}
            >
              Começar Grátis
            </Link>
            <Link
              href="/#funcionalidades"
              className="px-8 py-4 rounded-xl text-lg font-semibold transition-all border hover:bg-white/5"
              style={{ borderColor: "#2D3748", color: "#E8F5E9" }}
            >
              Ver Funcionalidades
            </Link>
          </div>

          <p className="mt-6 text-sm" style={{ color: "#6B7280" }}>
            7 dias grátis · Sem cartão de crédito necessário
          </p>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            {[
              { value: "500+", label: "Pontos de Pesca" },
              { value: "2.000+", label: "Pescadores" },
              { value: "15+", label: "Espécies Mapeadas" },
            ].map((stat) => (
              <div key={stat.label}>
                <p
                  className="text-2xl sm:text-3xl font-extrabold"
                  style={{ fontFamily: "var(--font-poppins)", color: "#40916C" }}
                >
                  {stat.value}
                </p>
                <p className="text-xs mt-1" style={{ color: "#6B7280" }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6" fill="none" stroke="#40916C" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section
        id="funcionalidades"
        className="py-24 px-4"
        style={{ backgroundColor: "#0D1E35" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p
              className="text-sm font-semibold uppercase tracking-widest mb-3"
              style={{ color: "#40916C" }}
            >
              Funcionalidades
            </p>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4"
              style={{ fontFamily: "var(--font-poppins)", color: "#E8F5E9" }}
            >
              Tudo que um pescador precisa
            </h2>
            <p className="max-w-2xl mx-auto text-lg" style={{ color: "#9CA3AF" }}>
              Desenvolvido por pescadores, para pescadores. Cada funcionalidade
              pensada para melhorar sua experiência na água.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl p-8 flex flex-col gap-4 transition-transform hover:-translate-y-1"
                style={{ backgroundColor: "#1A2744", border: "1px solid #2D3748" }}
              >
                <span className="text-4xl">{feature.emoji}</span>
                <h3
                  className="text-xl font-bold"
                  style={{ fontFamily: "var(--font-poppins)", color: "#E8F5E9" }}
                >
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "#9CA3AF" }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section
        id="precos"
        className="py-24 px-4"
        style={{ backgroundColor: "#0A1628" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p
              className="text-sm font-semibold uppercase tracking-widest mb-3"
              style={{ color: "#40916C" }}
            >
              Planos & Preços
            </p>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4"
              style={{ fontFamily: "var(--font-poppins)", color: "#E8F5E9" }}
            >
              Escolha o seu plano
            </h2>
            <p className="max-w-xl mx-auto text-lg" style={{ color: "#9CA3AF" }}>
              Comece com 7 dias grátis. Sem compromisso, cancele quando quiser.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {pricingPlans.map((plan) => (
              <PricingCard key={plan.title} {...plan} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── DOWNLOAD CTA ─── */}
      <section
        id="download"
        className="py-24 px-4"
        style={{ backgroundColor: "#0D1E35" }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-6xl block mb-6">📱</span>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4"
            style={{ fontFamily: "var(--font-poppins)", color: "#E8F5E9" }}
          >
            Baixe o App Tucun
          </h2>
          <p className="text-lg mb-10" style={{ color: "#9CA3AF" }}>
            Disponível para Android e iOS. Leve o mapa do pescador no seu bolso.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#"
              className="flex items-center gap-3 px-6 py-4 rounded-xl border transition-all hover:border-[#40916C] hover:bg-white/5"
              style={{ borderColor: "#2D3748", backgroundColor: "#1A2744" }}
            >
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="#E8F5E9">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.15-2.18 1.27-2.16 3.8.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              <div className="text-left">
                <p className="text-xs" style={{ color: "#9CA3AF" }}>
                  Baixe na
                </p>
                <p
                  className="text-base font-bold"
                  style={{ color: "#E8F5E9", fontFamily: "var(--font-poppins)" }}
                >
                  App Store
                </p>
              </div>
            </a>

            <a
              href="#"
              className="flex items-center gap-3 px-6 py-4 rounded-xl border transition-all hover:border-[#40916C] hover:bg-white/5"
              style={{ borderColor: "#2D3748", backgroundColor: "#1A2744" }}
            >
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="#E8F5E9">
                <path d="M3,20.5v-17c0-.83.94-1.3,1.6-.8l14,8.5c.6.36.6,1.24,0,1.6l-14,8.5C3.94,21.8,3,21.33,3,20.5z" />
              </svg>
              <div className="text-left">
                <p className="text-xs" style={{ color: "#9CA3AF" }}>
                  Disponível no
                </p>
                <p
                  className="text-base font-bold"
                  style={{ color: "#E8F5E9", fontFamily: "var(--font-poppins)" }}
                >
                  Google Play
                </p>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer
        className="py-12 px-4 border-t"
        style={{ backgroundColor: "#0A1628", borderColor: "#2D3748" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🎣</span>
                <span
                  className="text-xl font-bold"
                  style={{ fontFamily: "var(--font-poppins)", color: "#E8F5E9" }}
                >
                  Tucun
                </span>
              </div>
              <p
                className="text-sm leading-relaxed mb-4"
                style={{ color: "#6B7280" }}
              >
                O app dos pescadores de Rondônia. Descubra novos pontos,
                conecte-se com a comunidade e melhore suas pescarias.
              </p>
              <div className="flex items-center gap-4">
                {["Instagram", "YouTube", "WhatsApp"].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="text-sm transition-colors hover:text-[#40916C]"
                    style={{ color: "#6B7280" }}
                  >
                    {social}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-sm" style={{ color: "#E8F5E9" }}>
                Produto
              </h4>
              <ul className="flex flex-col gap-3">
                {[
                  { label: "Funcionalidades", href: "/#funcionalidades" },
                  { label: "Preços", href: "/#precos" },
                  { label: "Download", href: "/#download" },
                  { label: "Assinar", href: "/assinar" },
                ].map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm transition-colors hover:text-[#40916C]"
                      style={{ color: "#6B7280" }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-sm" style={{ color: "#E8F5E9" }}>
                Legal
              </h4>
              <ul className="flex flex-col gap-3">
                {[
                  { label: "Termos de Uso", href: "#" },
                  { label: "Privacidade", href: "#" },
                  { label: "Política de Cookies", href: "#" },
                  { label: "Contato", href: "#" },
                ].map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm transition-colors hover:text-[#40916C]"
                      style={{ color: "#6B7280" }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div
            className="pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4"
            style={{ borderColor: "#2D3748" }}
          >
            <p className="text-sm" style={{ color: "#4B5563" }}>
              © 2026 Tucun. Todos os direitos reservados.
            </p>
            <p className="text-sm" style={{ color: "#4B5563" }}>
              Feito com ❤️ em Rondônia, Brasil
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
