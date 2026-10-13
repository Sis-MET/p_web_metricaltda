import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-body font-semibold transition-[background-color,color,border-color,box-shadow,transform] duration-200 ease-out active:translate-y-px disabled:pointer-events-none disabled:opacity-60 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:transition-transform [&_svg]:duration-200",
  {
    variants: {
      variant: {
        primary:
          "bg-ink-800 text-white shadow-[0_10px_24px_-12px_rgba(0,0,0,0.7)] hover:bg-ink-700 hover:shadow-[0_14px_28px_-12px_rgba(0,0,0,0.8)] hover:[&_svg]:translate-x-0.5",
        // Amarillo Métrica: solo para las acciones destacadas (cotizar, CTA de Nosotros)
        brand:
          "bg-sun-400 text-ink-950 shadow-[0_8px_22px_-12px_rgba(249,227,0,0.7)] hover:bg-sun-300 hover:[&_svg]:translate-x-0.5",
        light:
          "bg-white text-ink-950 shadow-[0_10px_28px_-14px_rgba(0,0,0,0.6)] hover:bg-ink-50 hover:[&_svg]:translate-x-0.5",
        outline:
          "border border-neutral-300 bg-white text-ink-900 hover:border-ink-800 hover:bg-ink-50 hover:[&_svg]:translate-x-0.5",
        glass:
          "border border-white/20 bg-white/10 text-white backdrop-blur-md hover:border-white/35 hover:bg-white/20",
        // Glass sobre fondos claros
        frost:
          "border border-ink-950/10 bg-white/55 text-ink-950 backdrop-blur-md hover:border-ink-950/20 hover:bg-white/80",
        ghost: "text-ink-800 hover:bg-ink-50",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-6 text-sm",
        lg: "h-12 px-7 text-[15px]",
        icon: "size-11",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
