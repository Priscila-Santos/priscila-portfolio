import { cn } from "@/lib/utils";

type SectionProps = React.HTMLAttributes<HTMLElement>;

function Section({ className, ...props }: SectionProps) {
  return (
    <section
      data-slot="section"
      className={cn("px-page-x py-section", className)}
      {...props}
    />
  );
}

export { Section };