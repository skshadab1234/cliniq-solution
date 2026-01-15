import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-[3px] focus-visible:ring-offset-2 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5 focus-visible:ring-indigo-500/50",
        destructive:
          "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30 hover:-translate-y-0.5 focus-visible:ring-red-500/50",
        outline:
          "border-2 border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm hover:bg-gray-50 hover:border-gray-300 hover:shadow-md text-gray-700 focus-visible:ring-gray-500/30",
        secondary:
          "bg-gray-100 text-gray-900 shadow-sm hover:bg-gray-200 hover:shadow-md focus-visible:ring-gray-500/30",
        ghost:
          "hover:bg-gray-100 hover:text-gray-900 text-gray-600 focus-visible:ring-gray-500/30",
        link:
          "text-indigo-600 underline-offset-4 hover:underline hover:text-indigo-700",
        // Premium variants
        premium:
          "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:-translate-y-0.5 focus-visible:ring-purple-500/50 animate-gradient bg-[length:200%_200%]",
        teal:
          "bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30 hover:-translate-y-0.5 focus-visible:ring-teal-500/50",
        success:
          "bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5 focus-visible:ring-emerald-500/50",
        warning:
          "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 hover:-translate-y-0.5 focus-visible:ring-amber-500/50",
        glass:
          "bg-white/20 backdrop-blur-xl border border-white/30 text-gray-800 shadow-lg hover:bg-white/30 hover:shadow-xl focus-visible:ring-white/50",
        dark:
          "bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg shadow-gray-900/30 hover:shadow-xl hover:-translate-y-0.5 focus-visible:ring-gray-500/50",
      },
      size: {
        default: "h-10 px-5 py-2.5 has-[>svg]:px-4",
        sm: "h-9 rounded-lg gap-1.5 px-4 text-xs has-[>svg]:px-3",
        lg: "h-12 rounded-xl px-8 text-base has-[>svg]:px-6",
        xl: "h-14 rounded-2xl px-10 text-lg font-bold has-[>svg]:px-8",
        icon: "size-10 rounded-xl",
        "icon-sm": "size-8 rounded-lg",
        "icon-lg": "size-12 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
