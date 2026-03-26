import { useRef, useEffect, useState, type ReactNode } from "react";
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
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node))
        setOpen(false);
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
    backgroundColor: "#FFFFFF",
    borderRadius: "8px",
    border: "1px solid #E8D4C4",
    boxShadow: "0 4px 12px 0 rgba(0,0,0,0.10)",
    ...(fullWidth ? { width: "100%" } : { minWidth: "180px" }),
    padding: "4px 0",
    position: "absolute",
    ...(dropUp
      ? { bottom: "calc(100% + 6px)" }
      : { top: "calc(100% + 6px)" }),
    zIndex: 50,
    ...(align === "right" ? { right: 0 } : { left: 0 }),
  };

  return (
    <div
      ref={containerRef}
      style={{ position: "relative", display: fullWidth ? "block" : "inline-block", width: fullWidth ? "100%" : undefined }}
    >
      {/* Trigger */}
      {trigger === "kebab" ? (
        <button
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
            color: "#57534E",
            transition: "background 150ms",
          }}
          className="bg-transparent hover:bg-[#FEF7F0]"
        >
          <MoreVertical size={16} />
        </button>
      ) : (
        <button
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={open}
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
          className={`hover:bg-[#FEF7F0] ${triggerClassName || "bg-white"}`}
        >
          {triggerIcon && (
            <span style={{ display: "flex", alignItems: "center", color: "#57534E", flexShrink: 0 }}>
              {triggerIcon}
            </span>
          )}
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 16,
              fontWeight: 400,
              color: isPlaceholder ? "#78716C" : "#292524",
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
            color="#57534E"
            style={{
              transition: "transform 200ms",
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
              flexShrink: 0,
            }}
          />
        </button>
      )}

      {/* Menu */}
      {open && (
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
                  color: item.danger ? "#EF4444" : "#292524",
                }}
                className={item.danger ? "bg-transparent hover:bg-[#FEF2F2]" : "bg-transparent hover:bg-[#FEF7F0]"}
              >
                {item.icon && (
                  <span style={{ display: "flex", alignItems: "center", color: item.danger ? "#EF4444" : "#57534E", flexShrink: 0 }}>
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
        </div>
      )}
    </div>
  );
}
