import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md text-[14px] font-medium leading-none outline-none select-none",
    "transition-[background-color,color,box-shadow,transform] duration-150",
    "focus-visible:shadow-[0_0_0_2px_#0a0a0a,0_0_0_4px_hsla(212,100%,48%,1)]",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "bg-white text-black hover:bg-[#ededed] active:scale-[0.985]",
        outline:
          "bg-transparent text-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.12)] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.22)] hover:bg-white/[0.03]",
        secondary:
          "bg-white/[0.06] text-foreground hover:bg-white/[0.1]",
        ghost:
          "bg-transparent text-foreground hover:bg-white/[0.05]",
        destructive:
          "bg-[#ff5b4f]/15 text-[#ff5b4f] hover:bg-[#ff5b4f]/25"
      },
      size: {
        default: "h-9 px-3.5",
        sm: "h-8 px-3 text-[13px]",
        lg: "h-11 px-5",
        xl: "h-12 px-6 text-[15px]",
        icon: "size-9",
        "icon-sm": "size-8"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Button, buttonVariants };
