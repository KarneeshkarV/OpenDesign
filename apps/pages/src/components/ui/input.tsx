import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.ComponentProps<"input">;

export function Input({ className, type = "text", ...props }: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-11 w-full rounded-lg bg-transparent px-3.5 text-[15px] text-foreground outline-none transition-[box-shadow] duration-150",
        "shadow-[0_0_0_1px_rgba(255,255,255,0.08)]",
        "placeholder:text-[#666]",
        "hover:shadow-[0_0_0_1px_rgba(255,255,255,0.14)]",
        "focus-visible:shadow-[0_0_0_1px_rgba(255,255,255,0.22),0_0_0_4px_rgba(10,114,239,0.22)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}
