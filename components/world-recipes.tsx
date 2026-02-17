"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Loader2 } from "lucide-react"
import { RecipeModal } from "@/components/recipe-modal"

interface WorldRecipe {
  id: string
  name: string
  image: string
  cuisine: string
  ingredients: string[]
  instructions: string[]
}

export function WorldRecipes() {
  const [selectedCuisine, setSelectedCuisine] = useState<string>("")
  const [recipes, setRecipes] = useState<WorldRecipe[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRecipe, setSelectedRecipe] = useState<WorldRecipe | null>(null)

  const cuisines = [
    { name: "Japanese", emoji: "🍱", description: "Sushi, Ramen, Tempura" },
    { name: "Chinese", emoji: "🥟", description: "Dim Sum, Stir-fry, Noodles" },
    { name: "Thai", emoji: "🍜", description: "Curry, Pad Thai, Tom Yum" },
    { name: "Vietnamese", emoji: "🍲", description: "Pho, Spring Rolls, Banh Mi" },
    { name: "Mexican", emoji: "🌮", description: "Tacos, Enchiladas, Salsa" },
    { name: "Italian", emoji: "🍝", description: "Pasta, Pizza, Risotto" },
    { name: "American", emoji: "🍔", description: "BBQ, Burgers, Southern Soul" },
    { name: "French", emoji: "🥐", description: "Croissants, Coq au Vin, Soufflé" },
    { name: "Indian", emoji: "🍛", description: "Curry, Biryani, Tandoori" },
    { name: "Greek", emoji: "🥗", description: "Moussaka, Souvlaki, Tzatziki" },
    { name: "Spanish", emoji: "🥘", description: "Paella, Tapas, Gazpacho" },
    { name: "Moroccan", emoji: "🫔", description: "Tagine, Couscous, Harira" },
  ]

  const handleCuisineSelect = async (cuisine: string) => {
    setIsLoading(true)
    setSelectedCuisine(cuisine)
    setRecipes([])

    try {
      const response = await fetch(`/api/world-recipes?cuisine=${cuisine}`)
      const data = await response.json()

      if (data.success) {
        setRecipes(data.recipes)
      }
    } catch (error) {
      console.error("Failed to fetch world recipes:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Card className="glass-effect border-blue-200/40 shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl font-playfair">
            <Sparkles className="h-6 w-6 text-primary" />
            Explore World Cuisines
          </CardTitle>
          <CardDescription className="text-base">
            Discover authentic recipes from around the globe - all free from TheMealDB
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {cuisines.map((cuisine) => (
              <Button
                key={cuisine.name}
                variant={selectedCuisine === cuisine.name ? "default" : "outline"}
                onClick={() => handleCuisineSelect(cuisine.name)}
                disabled={isLoading}
                className="h-auto flex-col gap-2 py-4 glass-button"
              >
                <span className="text-3xl">{cuisine.emoji}</span>
                <span className="font-semibold">{cuisine.name}</span>
                <span className="text-xs opacity-70 text-balance">{cuisine.description}</span>
              </Button>
            ))}
          </div>

          {isLoading && (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Loading delicious {selectedCuisine} recipes...</p>
            </div>
          )}

          {!isLoading && recipes.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-playfair font-semibold text-center">{selectedCuisine} Recipes</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recipes.map((recipe) => (
                  <Card
                    key={recipe.id}
                    className="glass-effect border-blue-200/40 hover:shadow-lg transition-all cursor-pointer group"
                    onClick={() => setSelectedRecipe(recipe)}
                  >
                    <div className="relative aspect-video overflow-hidden rounded-t-lg">
                      <img
                        src={recipe.image || "/placeholder.svg"}
                        alt={recipe.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <CardHeader>
                      <CardTitle className="text-lg font-playfair">{recipe.name}</CardTitle>
                      <CardDescription className="text-sm">{recipe.cuisine} Cuisine</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedRecipe && (
        <RecipeModal
          isOpen={!!selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          recipe={{
            id: Number.parseInt(selectedRecipe.id),
            title: selectedRecipe.name,
            image: selectedRecipe.image,
            ingredients: selectedRecipe.ingredients,
            instructions: selectedRecipe.instructions,
            category: "world",
            time: "30-45 min",
            difficulty: "Medium",
            tags: [selectedRecipe.cuisine?.toLowerCase() || "international"],
            variations: {
              standard: "Traditional preparation with authentic ingredients",
              dairyFree: "Modified for dairy-free diets",
              vegan: "Plant-based alternative version",
            },
            servings: 2,
            healthScore: 80,
            mealTime: "Lunch/Dinner",
          }}
          variation="standard"
        />
      )}
    </>
  )
}
