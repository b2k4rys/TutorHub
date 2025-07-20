import React from "react"
import { cva } from "class-variance-authority"
import { cn } from '../../lib/utils'

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 pr-6 [&>svg~*]:pl-7 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-blue-600",
  {
    variants: {
      variant: {
        default: "bg-blue-50 border-blue-200 text-blue-700",
        destructive: "bg-red-50 border-red-300 text-red-700 [&>svg]:text-red-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div className={cn("text-sm [&_p]:leading-relaxed", className)} ref={ref} {...props} />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
