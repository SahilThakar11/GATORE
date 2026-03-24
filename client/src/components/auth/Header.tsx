interface ModalHeaderProps {
  logoSrc: string; // pass your actual logo import here
}

export function AuthHeader({ logoSrc }: ModalHeaderProps) {
  return (
    <div className="flex items-center gap-3 px-7 py-8 pt-6 justify-center bg-white rounded-t-2xl">
      <div className="flex items-center gap-5 border-b border-teal-500 w-full px-0 py-4 -mx-7 -mb-4">
        <img
          src={logoSrc}
          alt="Gatore"
          className="w-16 h-8 sm:w-23.25 sm:h-12 object-contain shrink-0"
        />
        <div>
          <p className="text-[18px] sm:text-[24px] font-bold tracking-wide text-teal-800 uppercase leading-tight">
            Gatore
          </p>
          <p className="text-xs sm:text-sm text-neutral-500 leading-snug">
            Find your game and book your table
          </p>
        </div>
      </div>
    </div>
  );
}
