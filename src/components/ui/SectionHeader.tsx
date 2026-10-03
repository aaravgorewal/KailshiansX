import * as React from "react";
import { Badge, type BadgeProps } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export interface SectionHeaderProps {
  badge?: string | React.ReactNode;
  badgeVariant?: BadgeProps["variant"];
  title: string;
  highlight?: string;
  description?: string | React.ReactNode;
  align?: "left" | "center" | "right";
  action?: React.ReactNode;
  size?: "sm" | "default" | "lg";
  as?: "h1" | "h2" | "h3";
  className?: string;
}

export function SectionHeader({
  badge,
  badgeVariant = "brand",
  title,
  highlight,
  description,
  align = "center",
  action,
  size = "default",
  as: Component = "h2",
  className,
}: SectionHeaderProps) {
  const alignmentClass = {
    left: "text-left items-start",
    center: "text-center items-center mx-auto",
    right: "text-right items-end ml-auto",
  }[align];

  const sizeHeadingClass = {
    sm: "text-2xl sm:text-3xl tracking-tight",
    default: "text-3xl sm:text-4xl md:text-5xl tracking-tight",
    lg: "text-4xl sm:text-5xl md:text-6xl tracking-tighter",
  }[size];

  // Helper to highlight parts of the title if highlight is provided and exists in title
  const renderTitle = () => {
    if (!highlight) {
      return title;
    }
    const parts = title.split(highlight);
    if (parts.length <= 1) {
      return (
        <>
          {title} <span className="gradient-text">{highlight}</span>
        </>
      );
    }
    return (
      <>
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            {part}
            {index < parts.length - 1 && <span className="gradient-text">{highlight}</span>}
          </React.Fragment>
        ))}
      </>
    );
  };

  return (
    <div className={cn("flex max-w-3xl flex-col gap-3", alignmentClass, className)}>
      {badge && (
        <div>
          {typeof badge === "string" ? (
            <Badge variant={badgeVariant} dot size="default">
              {badge}
            </Badge>
          ) : (
            badge
          )}
        </div>
      )}

      <Component
        className={cn("text-surface-50 font-sans leading-[1.15] font-bold", sizeHeadingClass)}
      >
        {renderTitle()}
      </Component>

      {description && (
        <p className="text-surface-300 max-w-2xl text-base leading-relaxed sm:text-lg">
          {description}
        </p>
      )}

      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
