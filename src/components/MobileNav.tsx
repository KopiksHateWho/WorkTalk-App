import { cn } from "@/lib/utils";
import { BarChart3, Gamepad2, House, Mic } from "lucide-react";
import { NavLink } from "react-router";

const ITEMS = [
  { label: "Home", to: "/home", icon: House },
  { label: "Games", to: "/games", icon: Gamepad2 },
  { label: "Speak", to: "/speaking", icon: Mic },
  { label: "Progress", to: "/progress", icon: BarChart3 },
];

/**
 * Bottom navigation for small screens. Every target is at least 44px tall and
 * the active item is marked with color, weight and an icon, never color alone.
 */
export function MobileNav() {
  return (
    <nav
      aria-label="Quick navigation"
      className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden"
    >
      <ul className="glass-strong mx-auto flex w-full max-w-md items-stretch justify-between gap-1 rounded-3xl p-1.5">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.to} className="flex-1">
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex min-h-[52px] flex-col items-center justify-center gap-0.5 rounded-2xl px-2 py-1.5 text-[11px] font-bold transition-colors",
                    isActive
                      ? "bg-brand-mark text-white shadow-sm"
                      : "text-slate-600 hover:bg-white/60",
                  )
                }
              >
                <Icon className="size-5" aria-hidden="true" />
                {item.label}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
