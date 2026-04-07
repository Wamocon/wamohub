"use client";

import { cn } from "@/lib/data";
import type { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes } from "react";

// ---------------------------------------------------------------------------
// Badge
// ---------------------------------------------------------------------------
const badgeColors: Record<string, string> = {
  red: "bg-red-900 text-red-300 border border-red-700",
  green: "bg-green-900 text-green-300 border border-green-700",
  blue: "bg-blue-900 text-blue-300 border border-blue-700",
  gray: "bg-gray-800 text-gray-300 border border-gray-600",
  yellow: "bg-yellow-900 text-yellow-300 border border-yellow-700",
};

export function Badge({
  children,
  color = "red",
}: {
  children: ReactNode;
  color?: string;
}) {
  return (
    <span
      className={cn(
        "px-2 py-0.5 text-xs rounded-full font-medium",
        badgeColors[color] ?? badgeColors.red,
      )}
    >
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Button
// ---------------------------------------------------------------------------
const btnStyles: Record<string, string> = {
  primary:
    "bg-linear-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 shadow-lg",
  ghost: "bg-transparent text-gray-300 hover:bg-gray-800 hover:text-white",
  outline:
    "border border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white",
};

export function Button({
  children,
  variant = "primary",
  className,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline";
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center gap-2 px-3 py-2 rounded-2xl text-sm transition focus:outline-none disabled:opacity-50",
        btnStyles[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------
export function Input({
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full px-3 py-2 rounded-xl border border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500",
        className,
      )}
      {...rest}
    />
  );
}

// ---------------------------------------------------------------------------
// Textarea
// ---------------------------------------------------------------------------
export function Textarea({
  className,
  rows = 4,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      rows={rows}
      className={cn(
        "w-full px-3 py-2 rounded-xl border border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500",
        className,
      )}
      {...rest}
    />
  );
}

// ---------------------------------------------------------------------------
// SectionCard
// ---------------------------------------------------------------------------
export function SectionCard({
  title,
  icon: Icon,
  actions,
  children,
  className,
}: {
  title: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-700",
        className,
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {Icon && <Icon size={20} className="text-red-500" />}
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        <div className="flex gap-2">{actions}</div>
      </div>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Modal
// ---------------------------------------------------------------------------
export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} role="presentation" />
      <div className="relative bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>
        <div className="max-h-[60vh] overflow-auto pr-1">{children}</div>
        {footer && <div className="mt-4 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tile (navigation card)
// ---------------------------------------------------------------------------
export function Tile({
  icon: Icon,
  title,
  subtitle,
  onClick,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  subtitle: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="p-6 bg-gray-900 rounded-2xl border border-gray-700 shadow-lg text-left relative overflow-hidden group hover:shadow-2xl hover:border-red-500/50 transition-all duration-300"
    >
      <div className="relative flex items-center gap-4">
        <div className="p-3 rounded-xl bg-gray-800 text-gray-400 shadow-lg">
          <Icon size={20} />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-white text-lg mb-1 group-hover:text-red-400 transition-colors duration-300">
            {title}
          </div>
          <div className="text-sm text-gray-400 truncate max-w-[18rem] group-hover:text-gray-300 transition-colors duration-300">
            {subtitle}
          </div>
        </div>
      </div>
    </button>
  );
}
