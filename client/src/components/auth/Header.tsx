interface ModalHeaderProps {
  logoSrc: string; // pass your actual logo import here
}

export function AuthHeader({ logoSrc }: ModalHeaderProps) {
  return (
    <div className="flex items-center gap-3 px-7 py-8 pt-6 justify-center bg-white rounded-t-2xl">
      <div className="flex items-center gap-3 border-b border-teal-500 w-full px-0 py-4 -mx-7 -mb-4">
        <img
          src={logoSrc}
          alt="Gatore"
          className="w-23.25 h-12 object-contain shrink-0"
        />
        <div>
          <p className="text-lg font-extrabold tracking-widest text-teal-800 uppercase leading-tight">
            GATORE
          </p>
          <p className="text-sm text-neutral-700 leading-snug">
            Find your game and book your table
          </p>
        </div>
      </div>
    </div>
  );
}
