"use client"

import { useState } from "react"
import { ChefHat } from "lucide-react"
import { RecipeCard } from "@/components/recipe-card"
import { RecipeModal } from "@/components/recipe-modal"
import { mealDBService } from "@/lib/mealdb-api"

const moods = [
  { emoji: "😌", label: "Comfort", color: "bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-100", categories: ["Beef", "Pasta"] },
  { emoji: "🔥", label: "Spicy", color: "bg-red-100 dark:bg-red-900/30 text-red-900 dark:text-red-100", categories: ["Chicken", "Pork"] },
  { emoji: "🌿", label: "Healthy", color: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-100", categories: ["Seafood", "Vegetarian"] },
  { emoji: "🎉", label: "Festive", color: "bg-purple-100 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100", categories: ["Lamb", "Beef"] },
  { emoji: "💕", label: "Romantic", color: "bg-pink-100 dark:bg-pink-900/30 text-pink-900 dark:text-pink-100", categories: ["Seafood", "Pasta"] },
  { emoji: "⚡", label: "Quick", color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-900 dark:text-yellow-100", categories: ["Chicken", "Pasta"] },
  { emoji: "🌙", label: "Cozy", color: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-100", categories: ["Beef", "Lamb"] },
]

export function DiscoverTab() {
  const [selectedMood, setSelectedMood] = useState<string>("")
  const [recipes, setRecipes] = useState<any[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleMoodSelect = async (moodLabel: string) => {
    setSelectedMood(moodLabel)
    setIsGenerating(true)

    try {
      const mood = moods.find(m => m.label === moodLabel)
      const category = mood?.categories[Math.floor(Math.random() * mood.categories.length)] || "Chicken"
      
      // Fetch meals from the category
      const mealList = await mealDBService.getMealsByCategory(category)
      
      // Get 6 random meals with full details
      const shuffled = mealList.sort(() => Math.random() - 0.5).slice(0, 6)
      const fullMeals = await Promise.all(
        shuffled.map(async (meal) => {
          const fullMeal = await mealDBService.getMealById(meal.idMeal)
          return fullMeal ? mealDBService.convertToProcessedRecipe(fullMeal) : null
        })
      )
      
      setRecipes(fullMeals.filter(Boolean))
    } catch (err) {
      console.error("Failed to fetch recipes:", err)
      setRecipes([])
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRecipeClick = (recipe: any) => {
    setSelectedRecipe(recipe)
    setIsModalOpen(true)
  }

  return (
    <div className="px-4 pt-6 pb-4 space-y-8 animate-fade-in-up">
      {/* Hero Section */}
      <div className="text-center space-y-3">
        <h2 className="text-3xl md:text-4xl font-playfair font-bold tracking-tight">
          What are you craving?
        </h2>
        <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto">
          Select a mood and discover recipes perfectly matched to how you're feeling
        </p>
      </div>

      {/* Horizontal Scrollable Mood Selector */}
      <div className="overflow-x-auto -mx-4 px-4 scrollbar-hide">
        <div className="flex gap-3 pb-2">
          {moods.map((mood) => (
            <button
              key={mood.label}
              onClick={() => handleMoodSelect(mood.label)}
              disabled={isGenerating}
              className={`flex-shrink-0 px-4 py-3 rounded-2xl border-2 transition-all tap-scale ${
                selectedMood === mood.label
                  ? `${mood.color} border-current shadow-sm`
                  : "bg-card border-border text-muted-foreground hover:border-primary/30"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">{mood.emoji}</span>
                <span className="text-sm font-medium whitespace-nowrap">{mood.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {isGenerating && (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="animate-spin-slow">
            <ChefHat className="h-12 w-12 text-primary" />
          </div>
          <p className="text-muted-foreground text-sm">Finding perfect recipes for you...</p>
        </div>
      )}

      {/* Recipe Grid */}
      {recipes.length > 0 && !isGenerating && (
        <div className="space-y-4">
          <h3 className="text-xl font-playfair font-semibold">
            Perfect for {selectedMood} moments
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onRecipeSelect={() => handleRecipeClick(recipe)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {recipes.length === 0 && !isGenerating && !selectedMood && (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-4">
          <div className="text-6xl animate-float">🍽️</div>
          <h3 className="text-xl font-playfair font-semibold">Ready to discover?</h3>
          <p className="text-muted-foreground text-sm max-w-sm">
            Pick a mood above to get started with personalized recipe recommendations
          </p>
        </div>
      )}

      {/* Recipe Modal */}
      {selectedRecipe && (
        <RecipeModal
          recipe={selectedRecipe}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          selectedVariation="standard"
        />
      )}
    </div>
  )
}
