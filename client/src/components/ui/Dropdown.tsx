import { useRef, useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, MoreVertical } from "lucide-react";

export interface DropdownItem {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  danger?: boolean;
  dividerBefore?: boolean;
}

interface DropdownProps {
  trigger: "kebab" | "label";
  triggerLabel?: string;
  triggerIcon?: ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
  fullWidth?: boolean;
  isPlaceholder?: boolean;
  triggerClassName?: string;
  dropUp?: boolean;
  triggerAriaLabel?: string;
  /** The background colour the dropdown sits on. Controls trigger bg for contrast. Defaults to "white". */
  onBackground?: "white" | "warm";
}

export function Dropdown({
  trigger,
  triggerLabel,
  triggerIcon,
  items,
  align = trigger === "kebab" ? "right" : "left",
  fullWidth = false,
  isPlaceholder = false,
  triggerClassName = "",
  dropUp = false,
  triggerAriaLabel,
  onBackground = "white",
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top?: number; bottom?: number; left?: number; right?: number; width?: number }>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Calculate portal position when opening
  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const estimatedMenuHeight = items.length * 44 + 8;
    const spaceBelow = window.innerHeight - rect.bottom;
    const shouldFlipUp = !dropUp && spaceBelow < estimatedMenuHeight + 8;
    setMenuPos({
      ...(dropUp || shouldFlipUp
        ? { bottom: window.innerHeight - rect.top + 6 }
        : { top: rect.bottom + 6 }),
      ...(align === "right"
        ? { right: window.innerWidth - rect.right }
        : { left: rect.left }),
      ...(fullWidth ? { width: rect.width } : {}),
    });
  }, [open, dropUp, align, fullWidth, items.length]);

  // Close on outside click (check both container and portal menu)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current && !containerRef.current.contains(e.target as Node) &&
        menuRef.current && !menuRef.current.contains(e.target as Node)
      ) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Trap focus when open
  useEffect(() => {
    if (!open) return;
    const focusable = menuRef.current?.querySelectorAll<HTMLElement>('button, [role="menuitem"]');
    if (focusable?.length) focusable[0].focus();

    const handleKey = (e: KeyboardEvent) => {
      if (!focusable?.length) return;
      const els = Array.from(focusable);
      const idx = els.indexOf(document.activeElement as HTMLElement);
      if (e.key === "ArrowDown") { e.preventDefault(); els[(idx + 1) % els.length].focus(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); els[(idx - 1 + els.length) % els.length].focus(); }
      else if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  const menuStyle: React.CSSProperties = {
    position: "fixed",
    ...menuPos,
    minWidth: fullWidth ? undefined : "180px",
    backgroundColor: "#FFFFFF",
    borderRadius: "8px",
    border: "1px solid #E8D4C4",
    boxShadow: "0 4px 12px 0 rgba(0,0,0,0.10)",
    padding: "4px 0",
    zIndex: 9999,
  };

  return (
    <div
      ref={containerRef}
      style={{ position: "relative", display: fullWidth ? "block" : "inline-block", width: fullWidth ? "100%" : undefined }}
    >
      {/* Trigger */}
      {trigger === "kebab" ? (
        <button
          ref={triggerRef}
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={open}
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            border: "none",
            color: "var(--color-neutral-600)",
            transition: "background 150ms",
          }}
          className="bg-transparent hover:bg-warm-100"
        >
          <MoreVertical size={16} />
        </button>
      ) : (
        <button
          ref={triggerRef}
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={triggerAriaLabel}
          style={{
            width: fullWidth ? "100%" : undefined,
            border: "1px solid #E8D4C4",
            borderRadius: 8,
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            gap: 6,
            cursor: "pointer",
            transition: "background 150ms",
          }}
          className={`hover:bg-warm-100 ${triggerClassName || (onBackground === "warm" ? "bg-white" : "bg-warm-50")}`}
        >
          {triggerIcon && (
            <span style={{ display: "flex", alignItems: "center", color: "var(--color-neutral-600)", flexShrink: 0 }}>
              {triggerIcon}
            </span>
          )}
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 16,
              fontWeight: 400,
              color: isPlaceholder ? "var(--color-neutral-600)" : "var(--color-neutral-800)",
              flex: 1,
              textAlign: "left",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {triggerLabel}
          </span>
          <ChevronDown
            size={15}
            color="var(--color-neutral-600)"
            aria-hidden="true"
            style={{
              transition: "transform 200ms",
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
              flexShrink: 0,
            }}
          />
        </button>
      )}

      {/* Menu rendered via portal to escape overflow clipping */}
      {open && createPortal(
        <div ref={menuRef} style={menuStyle} role="menu">
          {items.map((item, i) => (
            <div key={i}>
              {item.dividerBefore && (
                <div style={{ height: 1, backgroundColor: "#E8D4C4", margin: "4px 0" }} />
              )}
              <button
                role="menuitem"
                onClick={() => { setOpen(false); item.onClick(); }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 16px",
                  cursor: "pointer",
                  border: "none",
                  textAlign: "left",
                  transition: "background 150ms",
                  color: item.danger ? "var(--color-error)" : "var(--color-neutral-800)",
                }}
                className={item.danger ? "bg-transparent hover:bg-error-light" : "bg-transparent hover:bg-warm-100"}
              >
                {item.icon && (
                  <span style={{ display: "flex", alignItems: "center", color: item.danger ? "var(--color-error)" : "var(--color-neutral-600)", flexShrink: 0 }}>
                    {item.icon}
                  </span>
                )}
                <span
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 14,
                    fontWeight: 400,
                  }}
                >
                  {item.label}
                </span>
              </button>
            </div>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}
