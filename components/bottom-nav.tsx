"use client"

import { Compass, Sparkles, Globe } from "lucide-react"

type Tab = "discover" | "surprise" | "world"

interface BottomNavProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: "discover" as Tab, label: "Discover", icon: Compass },
    { id: "surprise" as Tab, label: "Surprise Me", icon: Sparkles },
    { id: "world" as Tab, label: "World Recipes", icon: Globe },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-bottom z-50">
      <div className="flex items-center justify-around px-4 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all tap-scale ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
              aria-label={tab.label}
            >
              <Icon className={`h-6 w-6 ${isActive ? "animate-scale-up" : ""}`} />
              <span className={`text-xs font-medium ${isActive ? "text-primary" : ""}`}>{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
