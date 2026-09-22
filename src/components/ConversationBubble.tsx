import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import type { ReactNode } from "react";

export function ConversationBubble({
  role,
  text,
  children,
  className,
}: {
  role: "ai" | "user";
  text: string;
  children?: ReactNode;
  className?: string;
}) {
  const isAi = role === "ai";

  return (
    <div
      className={cn(
        "flex w-full items-end gap-2.5",
        isAi ? "justify-start" : "flex-row-reverse justify-start",
        className,
      )}
    >
      <span
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-2xl shadow-sm",
          isAi ? "bg-brand-mark text-white" : "bg-white/80 text-slate-600",
        )}
        aria-hidden="true"
      >
        {isAi ? <Bot className="size-5" /> : <User className="size-5" />}
      </span>

      <div className={cn("max-w-[85%] sm:max-w-[78%]", !isAi && "text-right")}>
        <p className="mb-1 text-[11px] font-bold tracking-[0.12em] text-slate-500 uppercase">
          {isAi ? "Coach" : "You"}
        </p>
        <div
          className={cn(
            "rounded-3xl px-4 py-3 text-left text-sm leading-6 shadow-sm backdrop-blur-md",
            isAi
              ? "glass rounded-bl-md border-white/70 bg-white/65 text-slate-800"
              : "rounded-br-md border border-indigo-500/20 bg-indigo-500/12 text-slate-800",
          )}
        >
          {text}
        </div>
        {children}
      </div>
    </div>
  );
}
