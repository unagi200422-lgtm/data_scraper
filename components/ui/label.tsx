"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { createVariants, type VariantProps } from "@/lib/variants"
import { cn } from "@/lib/utils"

const labelVariants = createVariants(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
  {
    variants: {},
    defaultVariants: {},
  },
)

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root ref={ref} className={cn(labelVariants(), className)} {...props} />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
