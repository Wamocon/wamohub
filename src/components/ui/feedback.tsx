import type { ComponentType, ReactNode } from "react";
import { Inbox } from "lucide-react";

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-gray-800/60 ${className}`}
      aria-hidden="true"
    />
  );
}

export function SkeletonRows({ rows = 3, height = "h-4" }: { rows?: number; height?: string }) {
  return (
    <div className="space-y-2" data-testid="skeleton">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className={`${height} w-full`} />
      ))}
    </div>
  );
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
}: {
  icon?: ComponentType<{ size?: number; className?: string }>;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center py-10 px-4 border border-dashed border-gray-700 rounded-2xl bg-gray-900/40"
      data-testid="empty-state"
    >
      <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mb-3 text-gray-400">
        <Icon size={24} />
      </div>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      {description && <p className="text-xs text-gray-400 mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
