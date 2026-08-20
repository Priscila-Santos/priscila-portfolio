import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 font-code text-small font-medium transition-colors",
  {
    variants: {
      variant: {
        pink: "bg-[var(--color-soft-pink)] text-[var(--color-pop-pink)]",
        blue: "bg-[var(--color-blue-soft)] text-[var(--color-blue-accent)]",
        // Neutral: for metadata that isn't itself the highlight (e.g. tech
        // stack tags) — kept visually distinct from pink/blue so those two
        // colors stay reserved for meaningful roles (CTA vs. technical /
        // AI-role signals) instead of colliding with plain tag chips.
        neutral: "bg-muted text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "blue",
    },
  }
);

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants>;

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };