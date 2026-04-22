import * as React from "react";
import { cn } from "@/lib/utils";

type WordmarkProps = React.SVGProps<SVGSVGElement>;

export function Wordmark({ className, ...props }: WordmarkProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn("text-foreground", className)}
      {...props}
    >
      <rect
        x="2.5"
        y="2.5"
        width="19"
        height="19"
        rx="4"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <rect x="8" y="8" width="8" height="8" rx="1.5" fill="currentColor" />
    </svg>
  );
}
