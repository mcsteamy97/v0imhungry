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
    { label: "Cozy & Warm", icon: Coffee, color: "bg-amber-100 text-amber-800 hover:bg-amber-200" },
    { label: "Fresh & Light", icon: Sun, color: "bg-green-100 text-green-800 hover:bg-green-200" },
    { label: "Romantic & Intimate", icon: Heart, color: "bg-romantic text-romantic-foreground hover:bg-romantic/80" },
    { label: "Quick & Fancy", icon: Sparkles, color: "bg-purple-100 text-purple-800 hover:bg-purple-200" },
    { label: "Comfort & Indulgent", icon: Moon, color: "bg-blue-100 text-blue-800 hover:bg-blue-200" },
    { label: "Spicy & Bold", icon: Flame, color: "bg-red-100 text-red-800 hover:bg-red-200" },
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
                className={`h-auto p-4 flex flex-col items-center gap-2 ${mood.color} border-2 transition-all duration-200 hover:scale-105`}
                onClick={() => onMoodSelect(mood.label)}
                disabled={isGenerating}
              >
                <Icon className="h-6 w-6" />
                <span className="text-sm font-medium text-center">{mood.label}</span>
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
