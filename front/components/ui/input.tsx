import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Base styles
        "flex h-11 w-full min-w-0 rounded-xl border-2 bg-white/50 px-4 py-2.5 text-base transition-all duration-200 outline-none",
        // Border and shadow
        "border-gray-200 shadow-sm",
        // Placeholder
        "placeholder:text-gray-400",
        // Focus state with premium ring
        "focus:border-indigo-500 focus:bg-white focus:shadow-md focus:ring-4 focus:ring-indigo-500/10",
        // Hover state
        "hover:border-gray-300 hover:bg-white",
        // Invalid state
        "aria-invalid:border-red-500 aria-invalid:ring-4 aria-invalid:ring-red-500/10",
        // Disabled state
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
        // File input styles
        "file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 file:cursor-pointer",
        // Selection color
        "selection:bg-indigo-100 selection:text-indigo-900",
        // Responsive text
        "md:text-sm",
        className
      )}
      {...props}
    />
  )
}

// Premium search input with icon support
interface SearchInputProps extends React.ComponentProps<"input"> {
  icon?: React.ReactNode
}

function SearchInput({ className, icon, ...props }: SearchInputProps) {
  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          {icon}
        </div>
      )}
      <input
        data-slot="search-input"
        className={cn(
          // Base styles
          "flex h-12 w-full min-w-0 rounded-xl border-2 bg-gray-50/50 text-base transition-all duration-200 outline-none",
          // Padding based on icon
          icon ? "pl-12 pr-4" : "px-4",
          // Border and shadow
          "border-gray-200",
          // Placeholder
          "placeholder:text-gray-400",
          // Focus state
          "focus:border-indigo-500 focus:bg-white focus:shadow-lg focus:shadow-indigo-500/10 focus:ring-4 focus:ring-indigo-500/10",
          // Hover state
          "hover:border-gray-300 hover:bg-gray-50",
          // Responsive text
          "md:text-sm",
          className
        )}
        {...props}
      />
    </div>
  )
}

// Floating label input
interface FloatingInputProps extends React.ComponentProps<"input"> {
  label: string
}

function FloatingInput({ className, label, id, ...props }: FloatingInputProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="relative">
      <input
        id={inputId}
        data-slot="floating-input"
        placeholder=" "
        className={cn(
          // Base styles
          "peer flex h-14 w-full min-w-0 rounded-xl border-2 bg-white/50 px-4 pt-5 pb-2 text-base transition-all duration-200 outline-none",
          // Border
          "border-gray-200",
          // Focus state
          "focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10",
          // Hover
          "hover:border-gray-300",
          // Invalid
          "aria-invalid:border-red-500",
          // Responsive
          "md:text-sm",
          className
        )}
        {...props}
      />
      <label
        htmlFor={inputId}
        className={cn(
          "absolute left-4 top-4 text-gray-500 transition-all duration-200 pointer-events-none origin-left",
          // Floating state
          "peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100",
          "peer-focus:-translate-y-2.5 peer-focus:scale-[0.85] peer-focus:text-indigo-600",
          "peer-[:not(:placeholder-shown)]:-translate-y-2.5 peer-[:not(:placeholder-shown)]:scale-[0.85] peer-[:not(:placeholder-shown)]:text-gray-600"
        )}
      >
        {label}
      </label>
    </div>
  )
}

export { Input, SearchInput, FloatingInput }
