import { cn } from "@/lib/utils"

type VariantConfig = {
  variants: Record<string, Record<string, string>>
  defaultVariants?: Record<string, string>
}

export function createVariants(baseClasses: string, config: VariantConfig) {
  return (props: Record<string, string | undefined> = {}) => {
    const classes = [baseClasses]

    // Apply variant classes
    Object.entries(config.variants).forEach(([key, variants]) => {
      const value = props[key] || config.defaultVariants?.[key]
      if (value && variants[value]) {
        classes.push(variants[value])
      }
    })

    return cn(...classes)
  }
}

// Simple type helper for variant props
export type VariantProps<T extends (...args: any) => any> = {
  [K in keyof Parameters<T>[0]]?: Parameters<T>[0][K]
}
