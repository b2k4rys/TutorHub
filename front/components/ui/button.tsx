import React from "react"

const Button = React.forwardRef(
  ({ className = "", variant = "default", size = "default", children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"

    const variants = {
      default: "bg-black text-white hover:bg-gray-800 focus:ring-black",
      outline: "border border-black text-black bg-transparent hover:bg-black hover:text-white focus:ring-black",
      ghost: "text-black hover:bg-gray-100 focus:ring-black",
    }

    const sizes = {
      default: "px-4 py-2 text-sm",
      sm: "px-3 py-1.5 text-xs",
      lg: "px-6 py-3 text-base",
    }

    const variantStyles = variants[variant] || variants.default
    const sizeStyles = sizes[size] || sizes.default

    return (
      <button className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`} ref={ref} {...props}>
        {children}
      </button>
    )
  },
)

Button.displayName = "Button"

export { Button }
