"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Heart, Coffee, Sun, Moon, Sparkles, Flame } from "lucide-react"

interface MoodSelectorProps {
  onMoodSelect: (mood: string) => void
  isGenerating: boolean
}

export function MoodSelector({ onMoodSelect, isGenerating }: MoodSelectorProps) {
  const [customMood, setCustomMood] = useState("")

  const predefinedMoods = [
    { label: "Cozy & Warm", icon: Coffee, color: "bg-amber-50 text-amber-900 hover:bg-amber-100 border-amber-200" },
    { label: "Fresh & Light", icon: Sun, color: "bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border-emerald-200" },
    { label: "Romantic & Intimate", icon: Heart, color: "bg-crimson-soft text-crimson hover:bg-crimson/10 border-crimson/20" },
    { label: "Quick & Fancy", icon: Sparkles, color: "bg-violet-50 text-violet-900 hover:bg-violet-100 border-violet-200" },
    { label: "Comfort & Indulgent", icon: Moon, color: "bg-sky-50 text-sky-900 hover:bg-sky-100 border-sky-200" },
    { label: "Spicy & Bold", icon: Flame, color: "bg-red-50 text-red-900 hover:bg-red-100 border-red-200" },
  ]

  const handleCustomMoodSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (customMood.trim()) {
      onMoodSelect(customMood.trim())
      setCustomMood("")
    }
  }

  return (
    <div className="space-y-6">
      {/* Predefined Moods */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-center">Choose Your Vibe</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {predefinedMoods.map((mood) => {
            const Icon = mood.icon
            return (
              <Button
                key={mood.label}
                variant="outline"
                className={`h-auto p-5 flex flex-col items-center gap-3 ${mood.color} border rounded-2xl transition-all duration-300 apple-press`}
                onClick={() => onMoodSelect(mood.label)}
                disabled={isGenerating}
              >
                <Icon className="h-7 w-7" />
                <span className="text-sm font-medium text-center leading-tight">{mood.label}</span>
              </Button>
            )
          })}
        </div>
      </div>

      {/* Custom Mood Input */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4 text-center">Or Describe Your Own Mood</h3>
        <form onSubmit={handleCustomMoodSubmit} className="flex gap-2">
          <Input
            placeholder="e.g., something exotic and adventurous..."
            value={customMood}
            onChange={(e) => setCustomMood(e.target.value)}
            disabled={isGenerating}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={!customMood.trim() || isGenerating}
            className="bg-primary hover:bg-primary/90"
          >
            Generate
          </Button>
        </form>
      </div>
    </div>
  )
}
