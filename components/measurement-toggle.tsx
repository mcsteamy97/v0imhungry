"use client"

import { Button } from "@/components/ui/button"
import { Ruler, FlaskConical } from "lucide-react"
import type { MeasurementSystem } from "@/lib/measurement-converter"

interface MeasurementToggleProps {
  system: MeasurementSystem
  onToggle: (system: MeasurementSystem) => void
}

export function MeasurementToggle({ system, onToggle }: MeasurementToggleProps) {
  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted/50 p-1">
      <Button
        variant={system === "volume" ? "default" : "ghost"}
        size="sm"
        onClick={() => onToggle("volume")}
        className="h-7 gap-1.5 px-3 text-xs font-medium"
      >
        <Ruler className="h-3.5 w-3.5" />
        US Volume
      </Button>
      <Button
        variant={system === "metric" ? "default" : "ghost"}
        size="sm"
        onClick={() => onToggle("metric")}
        className="h-7 gap-1.5 px-3 text-xs font-medium"
      >
        <FlaskConical className="h-3.5 w-3.5" />
        Metric
      </Button>
    </div>
  )
}
