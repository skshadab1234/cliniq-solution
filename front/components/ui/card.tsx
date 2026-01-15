import * as React from "react"

import { cn } from "@/lib/utils"

function Card({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "relative overflow-hidden rounded-2xl border border-gray-100 bg-white/80 backdrop-blur-sm transition-all duration-300",
        "shadow-[0_1px_3px_rgba(0,0,0,0.02),0_4px_12px_rgba(0,0,0,0.04)]",
        "hover:shadow-[0_4px_12px_rgba(0,0,0,0.05),0_16px_32px_rgba(0,0,0,0.08)]",
        "before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/60 before:to-transparent before:pointer-events-none",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn("flex flex-col space-y-1.5 p-6 pb-4", className)}
      {...props}
    />
  )
}

function CardTitle({
  className,
  ...props
}: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="card-title"
      className={cn("text-lg font-semibold leading-none tracking-tight text-gray-900", className)}
      {...props}
    />
  )
}

function CardDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-sm text-gray-500", className)}
      {...props}
    />
  )
}

function CardContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("p-6 pt-0", className)}
      {...props}
    />
  )
}

function CardFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center p-6 pt-0", className)}
      {...props}
    />
  )
}

// Premium Stat Card - for displaying statistics with gradients
interface StatCardProps extends React.ComponentProps<"div"> {
  label: string
  value: string | number
  icon?: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  variant?: "default" | "success" | "warning" | "danger" | "info" | "teal" | "purple"
}

function StatCard({
  label,
  value,
  icon,
  trend,
  variant = "default",
  className,
  ...props
}: StatCardProps) {
  const variantStyles = {
    default: {
      bg: "bg-gradient-to-br from-gray-50 to-gray-100/50",
      iconBg: "bg-gradient-to-br from-gray-100 to-gray-200",
      iconColor: "text-gray-600",
      value: "text-gray-900",
      border: "border-gray-200/60"
    },
    success: {
      bg: "bg-gradient-to-br from-emerald-50 to-green-50",
      iconBg: "bg-gradient-to-br from-emerald-100 to-green-100",
      iconColor: "text-emerald-600",
      value: "text-emerald-700",
      border: "border-emerald-200/60"
    },
    warning: {
      bg: "bg-gradient-to-br from-amber-50 to-orange-50",
      iconBg: "bg-gradient-to-br from-amber-100 to-orange-100",
      iconColor: "text-amber-600",
      value: "text-amber-700",
      border: "border-amber-200/60"
    },
    danger: {
      bg: "bg-gradient-to-br from-red-50 to-rose-50",
      iconBg: "bg-gradient-to-br from-red-100 to-rose-100",
      iconColor: "text-red-600",
      value: "text-red-700",
      border: "border-red-200/60"
    },
    info: {
      bg: "bg-gradient-to-br from-blue-50 to-indigo-50",
      iconBg: "bg-gradient-to-br from-blue-100 to-indigo-100",
      iconColor: "text-blue-600",
      value: "text-blue-700",
      border: "border-blue-200/60"
    },
    teal: {
      bg: "bg-gradient-to-br from-teal-50 to-emerald-50",
      iconBg: "bg-gradient-to-br from-teal-100 to-emerald-100",
      iconColor: "text-teal-600",
      value: "text-teal-700",
      border: "border-teal-200/60"
    },
    purple: {
      bg: "bg-gradient-to-br from-purple-50 to-indigo-50",
      iconBg: "bg-gradient-to-br from-purple-100 to-indigo-100",
      iconColor: "text-purple-600",
      value: "text-purple-700",
      border: "border-purple-200/60"
    }
  }

  const styles = variantStyles[variant]

  return (
    <div
      data-slot="stat-card"
      className={cn(
        "relative overflow-hidden rounded-2xl border p-5 transition-all duration-300",
        "hover:-translate-y-0.5 hover:shadow-lg",
        styles.bg,
        styles.border,
        className
      )}
      {...props}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />

      <div className="relative flex items-center justify-between">
        <div className="flex-1 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
          <p className={cn("text-2xl sm:text-3xl font-bold tracking-tight", styles.value)}
             style={{ fontFeatureSettings: '"tnum"' }}>
            {value}
          </p>
          {trend && (
            <div className={cn(
              "inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full",
              trend.isPositive
                ? "text-emerald-700 bg-emerald-100"
                : "text-red-700 bg-red-100"
            )}>
              <span>{trend.isPositive ? "+" : ""}{trend.value}%</span>
              <span className="text-gray-500 font-normal">vs yesterday</span>
            </div>
          )}
        </div>
        {icon && (
          <div className={cn(
            "flex items-center justify-center h-12 w-12 rounded-xl",
            styles.iconBg,
            styles.iconColor
          )}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}

// Premium Glass Card
function GlassCard({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="glass-card"
      className={cn(
        "relative overflow-hidden rounded-2xl",
        "bg-white/60 backdrop-blur-xl border border-white/30",
        "shadow-[0_8px_32px_rgba(0,0,0,0.08)]",
        "before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/50 before:to-transparent before:pointer-events-none",
        className
      )}
      {...props}
    />
  )
}

// Premium Feature Card with gradient header
interface FeatureCardProps extends React.ComponentProps<"div"> {
  title: string
  description: string
  icon: React.ReactNode
  gradient?: "primary" | "teal" | "purple" | "warm"
}

function FeatureCard({
  title,
  description,
  icon,
  gradient = "primary",
  className,
  ...props
}: FeatureCardProps) {
  const gradients = {
    primary: "from-indigo-500 via-purple-500 to-pink-500",
    teal: "from-teal-500 via-emerald-500 to-green-500",
    purple: "from-purple-500 via-violet-500 to-indigo-500",
    warm: "from-orange-500 via-red-500 to-pink-500"
  }

  return (
    <div
      data-slot="feature-card"
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-white border border-gray-100 transition-all duration-300",
        "shadow-[0_2px_8px_rgba(0,0,0,0.04)]",
        "hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)]",
        className
      )}
      {...props}
    >
      {/* Gradient header */}
      <div className={cn(
        "h-2 bg-gradient-to-r",
        gradients[gradient]
      )} />

      <div className="p-6">
        {/* Icon with gradient background */}
        <div className={cn(
          "inline-flex items-center justify-center h-12 w-12 rounded-xl mb-4",
          "bg-gradient-to-br text-white shadow-lg",
          gradients[gradient]
        )}>
          {icon}
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
      </div>

      {/* Hover glow effect */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none",
        "bg-gradient-to-br from-transparent via-transparent to-indigo-500/5"
      )} />
    </div>
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  StatCard,
  GlassCard,
  FeatureCard,
}
