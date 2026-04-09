"use client"

import { useState } from "react"
import { ThemeToggle } from "@/components/theme-toggle"
import { BottomNav } from "@/components/bottom-nav"
import { DiscoverTab } from "@/components/discover-tab"
import { SurpriseTab } from "@/components/surprise-tab"
import { WorldTab } from "@/components/world-tab"

type Tab = "discover" | "surprise" | "world"

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<Tab>("discover")

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Sticky Header */}
      <header className="sticky-header px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-playfair font-bold text-gradient tracking-tight">
            HUNGRY
          </h1>
          <ThemeToggle />
        </div>
      </header>

      {/* Tab Content with Smooth Transitions */}
      <main className="max-w-7xl mx-auto">
        <div className={`${activeTab === "discover" ? "block" : "hidden"}`}>
          <DiscoverTab />
        </div>
        <div className={`${activeTab === "surprise" ? "block" : "hidden"}`}>
          <SurpriseTab />
        </div>
        <div className={`${activeTab === "world" ? "block" : "hidden"}`}>
          <WorldTab />
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
