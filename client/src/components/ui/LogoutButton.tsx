import { useState, useEffect, useRef } from "react";
import { LogOut } from "lucide-react";
import { TextButton } from "./TextButton";
import { SecondaryButton } from "./SecondaryButton";

interface LogoutButtonProps {
  onLogout: () => void;
  size?: "xs" | "small" | "medium" | "large";
}

export function LogoutButton({ onLogout, size = "small" }: LogoutButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!confirming) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setConfirming(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [confirming]);

  return (
    <div ref={ref} className="relative inline-block">
      <TextButton
        label="Log out"
        onClick={() => setConfirming(true)}
        size={size}
        leftIcon={<LogOut size={15} aria-hidden="true" />}
      />
      {confirming && (
        <div className="absolute top-full right-0 mt-2 bg-white border border-warm-200 rounded-xl shadow-lg p-3 flex flex-col gap-4 z-10 w-max">
          <span className="text-sm text-neutral-600 text-center whitespace-nowrap">Are you sure?</span>
          <div className="flex flex-col gap-1">
            <SecondaryButton
              label="Log out"
              onClick={onLogout}
              leftIcon={<LogOut size={13} aria-hidden="true" />}
            />
            <TextButton label="Cancel" onClick={() => setConfirming(false)} size="small" />
          </div>
        </div>
      )}
    </div>
  );
}
