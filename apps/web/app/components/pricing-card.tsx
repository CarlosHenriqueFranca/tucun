import Link from "next/link";

interface PricingFeature {
  text: string;
  included: boolean;
}

interface PricingCardProps {
  title: string;
  price: string;
  priceDetail?: string;
  description: string;
  features: PricingFeature[];
  ctaLabel: string;
  ctaHref: string;
  highlighted?: boolean;
  badge?: string;
}

export default function PricingCard({
  title,
  price,
  priceDetail,
  description,
  features,
  ctaLabel,
  ctaHref,
  highlighted = false,
  badge,
}: PricingCardProps) {
  return (
    <div
      className="relative rounded-2xl p-8 flex flex-col gap-6 transition-transform hover:-translate-y-1"
      style={{
        backgroundColor: highlighted ? "#1B4332" : "#1A2744",
        border: highlighted ? "2px solid #40916C" : "1px solid #2D3748",
        boxShadow: highlighted
          ? "0 0 40px rgba(64, 145, 108, 0.2)"
          : "0 4px 24px rgba(0,0,0,0.3)",
      }}
    >
      {/* Badge */}
      {badge && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span
            className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider"
            style={{ backgroundColor: "#F77F00", color: "#fff" }}
          >
            {badge}
          </span>
        </div>
      )}

      {/* Header */}
      <div>
        <h3
          className="text-xl font-bold mb-2"
          style={{
            fontFamily: "var(--font-poppins)",
            color: "#E8F5E9",
          }}
        >
          {title}
        </h3>
        <p className="text-sm" style={{ color: "#9CA3AF" }}>
          {description}
        </p>
      </div>

      {/* Price */}
      <div>
        <div className="flex items-baseline gap-1">
          <span
            className="text-4xl font-extrabold"
            style={{
              fontFamily: "var(--font-poppins)",
              color: highlighted ? "#F77F00" : "#E8F5E9",
            }}
          >
            {price}
          </span>
        </div>
        {priceDetail && (
          <p className="text-sm mt-1" style={{ color: "#9CA3AF" }}>
            {priceDetail}
          </p>
        )}
      </div>

      {/* Features */}
      <ul className="flex flex-col gap-3 flex-1">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-3">
            <span
              className="mt-0.5 flex-shrink-0"
              style={{ color: feature.included ? "#40916C" : "#4B5563" }}
            >
              {feature.included ? (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </span>
            <span
              className="text-sm"
              style={{ color: feature.included ? "#E8F5E9" : "#6B7280" }}
            >
              {feature.text}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Link
        href={ctaHref}
        className="block text-center py-3 rounded-xl font-semibold text-sm transition-all hover:brightness-110 active:scale-95"
        style={{
          backgroundColor: highlighted ? "#F77F00" : "#40916C",
          color: "#fff",
          fontFamily: "var(--font-poppins)",
        }}
      >
        {ctaLabel}
      </Link>
    </div>
  );
}
