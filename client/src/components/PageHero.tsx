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
    <section className="w-full bg-teal-700 py-16 px-7">
      <div className="max-w-3xl mx-auto text-center flex flex-col gap-3">
        {eyebrow && (
          <span className="text-xs font-semibold tracking-widest uppercase text-teal-300">
            {eyebrow}
          </span>
        )}
        <h1 className="text-4xl font-bold text-white leading-tight">
          {title}{" "}
          {highlight && <span className="text-teal-300">{highlight}</span>}
        </h1>
        <p className="text-base text-teal-100 max-w-xl mx-auto">{subtitle}</p>
      </div>
    </section>
  );
}
