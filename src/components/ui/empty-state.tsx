import { cn } from "@/lib/utils";
import { LucideIcon, Search, FileX, Users, Store } from "lucide-react";
import { Button } from "@/components/ui/button";

type EmptyStateType = "search" | "no-data" | "users" | "stores" | "custom";

interface EmptyStateProps {
  type?: EmptyStateType;
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const defaultIcons: Record<EmptyStateType, LucideIcon> = {
  search: Search,
  "no-data": FileX,
  users: Users,
  stores: Store,
  custom: FileX,
};

export function EmptyState({
  type = "no-data",
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const Icon = icon || defaultIcons[type];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}
    >
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      {description && (
        <p className="text-muted-foreground text-sm max-w-md mb-6">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
