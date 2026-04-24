import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  title: string
  description?: string
  icon?: any
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({
  title,
  description,
  icon: Icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center animate-in fade-in zoom-in duration-300",
        className
      )}
    >
      <div className="flex size-20 items-center justify-center rounded-full bg-muted">
        {Icon ? (
          <Icon className="size-10 text-muted-foreground" />
        ) : (
          <div className="size-10 rounded-lg bg-muted-foreground/20" />
        )}
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      {description && (
        <p className="mt-2 mb-6 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick} className="mt-4">
          <Plus className="mr-2 size-4" />
          {action.label}
        </Button>
      )}
    </div>
  )
}
