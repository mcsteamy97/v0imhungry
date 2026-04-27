"use client"

import { useState } from "react"
import { Globe, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { RecipeModal } from "@/components/recipe-modal"
import Image from "next/image"
import { mealDBService } from "@/lib/mealdb-api"

const cuisines = [
  { name: "Italian", flag: "🇮🇹", color: "bg-green-100 dark:bg-green-900/30" },
  { name: "Mexican", flag: "🇲🇽", color: "bg-red-100 dark:bg-red-900/30" },
  { name: "Chinese", flag: "🇨🇳", color: "bg-yellow-100 dark:bg-yellow-900/30" },
  { name: "Japanese", flag: "🇯🇵", color: "bg-pink-100 dark:bg-pink-900/30" },
  { name: "Indian", flag: "🇮🇳", color: "bg-orange-100 dark:bg-orange-900/30" },
  { name: "French", flag: "🇫🇷", color: "bg-blue-100 dark:bg-blue-900/30" },
  { name: "Thai", flag: "🇹🇭", color: "bg-purple-100 dark:bg-purple-900/30" },
  { name: "Greek", flag: "🇬🇷", color: "bg-cyan-100 dark:bg-cyan-900/30" },
  { name: "American", flag: "🇺🇸", color: "bg-indigo-100 dark:bg-indigo-900/30" },
  { name: "British", flag: "🇬🇧", color: "bg-rose-100 dark:bg-rose-900/30" },
  { name: "Spanish", flag: "🇪🇸", color: "bg-amber-100 dark:bg-amber-900/30" },
  { name: "Moroccan", flag: "🇲🇦", color: "bg-teal-100 dark:bg-teal-900/30" },
]

export function WorldTab() {
  const [selectedCuisine, setSelectedCuisine] = useState<string>("")
  const [recipes, setRecipes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleCuisineSelect = async (cuisine: string) => {
    setSelectedCuisine(cuisine)
    setIsLoading(true)
    try {
      const meals = await mealDBService.getRecipesByCuisine(cuisine, 9)
      // Convert to processed format for RecipeModal
      const processedMeals = meals.map(meal => mealDBService.convertToProcessedRecipe(meal))
      setRecipes(processedMeals)
    } catch (error) {
      console.error("Failed to fetch meals:", error)
      setRecipes([])
    } finally {
      setIsLoading(false)
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
        <div className="flex items-center justify-center gap-2 mb-2">
          <Globe className="h-8 w-8 text-primary animate-spin-slow" />
        </div>
        <h2 className="text-3xl md:text-4xl font-playfair font-bold tracking-tight">
          Explore World Cuisines
        </h2>
        <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto">
          Discover authentic recipes from around the globe
        </p>
      </div>

      {/* Cuisine Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {cuisines.map((cuisine) => (
          <button
            key={cuisine.name}
            onClick={() => handleCuisineSelect(cuisine.name)}
            disabled={isLoading}
            className={`p-4 rounded-2xl border-2 transition-all tap-scale ${
              selectedCuisine === cuisine.name
                ? `${cuisine.color} border-current shadow-md`
                : "bg-card border-border hover:border-primary/30"
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <span className="text-4xl">{cuisine.flag}</span>
              <span className="text-sm font-medium">{cuisine.name}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <p className="text-muted-foreground text-sm">Loading {selectedCuisine} recipes...</p>
        </div>
      )}

      {/* Recipe Grid */}
      {recipes.length > 0 && !isLoading && (
        <div className="space-y-4">
          <h3 className="text-xl font-playfair font-semibold">
            {selectedCuisine} Recipes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recipes.map((recipe) => (
              <Card
                key={recipe.id}
                onClick={() => handleRecipeClick(recipe)}
                className="editorial-card rounded-2xl overflow-hidden cursor-pointer"
              >
                <div className="relative h-48">
                  <Image
                    src={recipe.image || "/placeholder.svg"}
                    alt={recipe.title || recipe.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-sm line-clamp-2">{recipe.title || recipe.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{recipe.category}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {recipes.length === 0 && !isLoading && !selectedCuisine && (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-4">
          <div className="text-6xl animate-float">🗺️</div>
          <h3 className="text-xl font-playfair font-semibold">Choose a destination</h3>
          <p className="text-muted-foreground text-sm max-w-sm">
            Select a cuisine above to explore authentic recipes from that region
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
