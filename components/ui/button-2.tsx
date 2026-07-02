import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 will-change-transform duration-200",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
        blue: "bg-blue-600 text-white border border-blue-800 shadow-[0_1.50px_0_0_rgba(255,255,255,0.20)_inset] hover:bg-blue-700",
        destructive: "bg-red-500 text-white hover:bg-red-600",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        white: "bg-white border border-gray-200 text-gray-900 hover:bg-gray-50",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        gray: "bg-zinc-100 border border-zinc-200 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100",
        dark: "bg-zinc-900 text-zinc-50 hover:bg-zinc-900/90 dark:bg-zinc-50 dark:text-zinc-900",
        darkgradient: "bg-gradient-to-t from-[#0f0f0f] to-[#404040] shadow-[0_0_0_1px_#383838] text-gray-50 hover:brightness-110",
        radialblue: "text-gray-50 [background:radial-gradient(90%_100%_at_15%_12%,#9BC4FF_0%,#3588FF_100%)] shadow-[0_0_0_1px_rgba(53,136,255,1)] hover:opacity-90",
        premium: "bg-gradient-to-b from-violet-500 to-violet-600 text-white shadow-dzenn hover:from-violet-400 hover:to-violet-500",
      },
      size: {
        xs: "h-7 px-2 text-[10px]",
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 py-2 text-sm",
        lg: "h-11 px-8 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

interface Button2Props extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button2 = React.forwardRef<HTMLButtonElement, Button2Props>(({ className, variant, size, ...props }, ref) => {
  return <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});
Button2.displayName = "Button2";

export { Button2 };
