"use client";

import * as React from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getCountdown,
  getCountdownAccessibleLabel,
  getCountdownHeadline,
  padCountdownUnit,
  type CountdownSnapshot,
} from "@/lib/countdown";

export interface EventCountdownProps {
  startDate: string | Date;
  endDate?: string | Date | null;
  variant?: "hero" | "compact";
  className?: string;
}

function snapshotUnits(snapshot: CountdownSnapshot) {
  return [
    { key: "days", value: snapshot.days, label: "Days" },
    { key: "hours", value: snapshot.hours, label: "Hours" },
    { key: "minutes", value: snapshot.minutes, label: "Min" },
    { key: "seconds", value: snapshot.seconds, label: "Sec" },
  ] as const;
}

export function EventCountdown({
  startDate,
  endDate = null,
  variant = "hero",
  className,
}: EventCountdownProps) {
  const [now, setNow] = React.useState<number | null>(null);

  React.useEffect(() => {
    const tick = () => {
      const t = Date.now();
      setNow(t);
      return getCountdown(t, startDate, endDate).phase === "ended";
    };

    if (tick()) return;

    const id = window.setInterval(() => {
      if (tick()) window.clearInterval(id);
    }, 1000);

    return () => window.clearInterval(id);
  }, [startDate, endDate]);

  const snapshot = now === null ? null : getCountdown(now, startDate, endDate);
  const showUnits =
    snapshot !== null &&
    snapshot.phase !== "ended" &&
    !(snapshot.phase === "live" && snapshot.totalMs === 0);
  const headline = snapshot
    ? getCountdownHeadline(snapshot.phase, snapshot.phase === "live" && snapshot.totalMs > 0)
    : "Countdown";
  const accessibleLabel = snapshot ? getCountdownAccessibleLabel(snapshot) : "Event countdown";

  if (variant === "compact") {
    return (
      <div
        data-testid="event-countdown"
        data-variant="compact"
        className={cn(
          "border-border text-muted-foreground flex items-center justify-between gap-3 border-t pt-2 text-xs",
          className
        )}
        aria-label={accessibleLabel}
        role="timer"
      >
        <span className="flex items-center gap-1">
          <Clock className="text-muted-foreground size-3" aria-hidden="true" />
          <span>{headline}</span>
        </span>
        <span className="text-foreground font-mono font-semibold tabular-nums" aria-hidden="true">
          {snapshot === null
            ? "—"
            : showUnits
              ? `${padCountdownUnit(snapshot.days)}d ${padCountdownUnit(snapshot.hours)}h ${padCountdownUnit(snapshot.minutes)}m`
              : snapshot.phase === "ended"
                ? "Complete"
                : "Live"}
        </span>
      </div>
    );
  }

  return (
    <div
      data-testid="event-countdown"
      className={cn(
        "border-border bg-card flex items-start gap-3 rounded-lg border p-4",
        className
      )}
      aria-label={accessibleLabel}
      role="timer"
    >
      <div className="border-border bg-muted text-foreground rounded-md border p-2">
        <Clock className="size-4" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-muted-foreground font-mono text-xs tracking-wider uppercase">
          {headline}
        </div>
        {snapshot === null ? (
          <div className="text-muted-foreground mt-2 font-mono text-sm tabular-nums">Loading…</div>
        ) : showUnits ? (
          <div className="mt-2 flex flex-wrap gap-2" aria-hidden="true">
            {snapshotUnits(snapshot).map((unit) => (
              <div
                key={unit.key}
                className="border-border bg-muted min-w-14 rounded-md border px-2 py-1.5 text-center"
              >
                <div className="text-foreground font-mono text-lg leading-none font-semibold tabular-nums">
                  {padCountdownUnit(unit.value)}
                </div>
                <div className="text-muted-foreground mt-1 text-xs tracking-wider uppercase">
                  {unit.label}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-foreground mt-1 text-sm font-semibold">
            {snapshot.phase === "ended"
              ? "This gathering is complete."
              : "Doors are open. See you there."}
          </div>
        )}
      </div>
    </div>
  );
}
