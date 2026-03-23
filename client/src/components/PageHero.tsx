interface PageHeroProps {
  eyebrow?: string;
  title: string;
  highlight?: string;
  subtitle: string;
}

export function PageHero({
  eyebrow,
  title,
  highlight,
  subtitle,
}: PageHeroProps) {
  return (
    <section
      className="w-full py-16 px-4 sm:px-7"
      style={{
        background:
          "linear-gradient(135deg, #0f4c3a 0%, #0f766e 50%, #134e4a 100%)",
      }}
    >
      <div className="max-w-3xl mx-auto text-center flex flex-col gap-3">
        {eyebrow && (
          <span className="text-xs font-semibold tracking-widest uppercase text-teal-100">
            {eyebrow}
          </span>
        )}
        <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
          {title}{" "}
          {highlight && <span className="text-white">{highlight}</span>}
        </h1>
        <p className="text-base text-white/80 max-w-xl mx-auto">{subtitle}</p>
      </div>
    </section>
  );
}
