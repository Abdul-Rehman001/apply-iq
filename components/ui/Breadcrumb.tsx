"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav className={cn("flex items-center gap-1.5 text-sm", className)}>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-text-tertiary" />}
          {item.href ? (
            <Link
              href={item.href}
              className="font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="font-semibold text-text-primary truncate max-w-[250px]">
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
