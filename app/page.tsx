"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UtensilsCrossed, ChefHat, Sparkles, AlertCircle, Coffee, Cake } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RecipeCard } from "@/components/recipe-card"
import { MoodSelector } from "@/components/mood-selector"
import { CookbookSection } from "@/components/cookbook-section"
import { SurpriseMeal } from "@/components/surprise-meal"
import { WorldRecipes } from "@/components/world-recipes"
import { recipeService } from "@/lib/recipe-service"

type MealTime = "all" | "Breakfast" | "Lunch/Dinner" | "Dessert/Snack"

export default function HomePage() {
  const [selectedMood, setSelectedMood] = useState<string>("")
  const [recipes, setRecipes] = useState<any[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string>("")
  const [currentRecipe, setCurrentRecipe] = useState<string>("")
  const [mealTimeFilter, setMealTimeFilter] = useState<MealTime>("all")

  const handleGenerateRecipes = async (mood: string) => {
    setIsGenerating(true)
    setSelectedMood(mood)
    setError("")

    try {
      const response = await recipeService.generateRecipes({
        mood,
        preferences: {
          // Could be extended with user preferences
        },
      })

      if (response.success) {
        setRecipes(response.recipes)
      } else {
        setError(response.error || "Failed to generate recipes")
        setRecipes([])
      }
    } catch (err) {
      setError("Something went wrong. Please try again.")
      setRecipes([])
    } finally {
      setIsGenerating(false)
    }
  }

  const filteredRecipes = mealTimeFilter === "all" ? recipes : recipes.filter((r) => r.mealTime === mealTimeFilter)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-50/30 to-blue-100/20">
      {/* Header */}
      <header className="container mx-auto px-4 py-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <UtensilsCrossed className="h-10 w-10 text-primary animate-pulse-glow" />
            <h1 className="text-4xl md:text-6xl font-playfair font-bold text-gradient">I'm Hungry</h1>
            <ChefHat className="h-10 w-10 text-primary animate-pulse-glow" />
          </div>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            Discover your perfect meal based on your mood with AI-powered recipe recommendations
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-16">
        {/* Cookbook Section */}
        <section className="mb-12">
          <CookbookSection />
        </section>

        {/* Surprise Meal Section */}
        <section className="mb-12">
          <SurpriseMeal />
        </section>

        {/* World Recipes Section */}
        <section className="mb-12">
          <WorldRecipes />
        </section>

        {/* Mood Selection */}
        <section className="mb-12">
          <Card className="glass-effect border-blue-200/40 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl font-playfair">
                <Sparkles className="h-6 w-6 text-primary" />
                What's Your Culinary Mood?
              </CardTitle>
              <CardDescription className="text-base">
                Tell us how you're feeling, and we'll create the perfect meal ideas for you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MoodSelector onMoodSelect={handleGenerateRecipes} isGenerating={isGenerating} />
            </CardContent>
          </Card>
        </section>

        {/* Error State */}
        {error && (
          <section className="mb-8">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </section>
        )}

        {/* Recipe Results */}
        {recipes.length > 0 && (
          <section className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-playfair font-bold mb-2">Perfect for "{selectedMood}" Moments</h2>
              <p className="text-muted-foreground">Each recipe comes with standard, dairy-free, and vegan variations</p>

              <div className="flex items-center justify-center gap-2 flex-wrap">
                <Button
                  variant={mealTimeFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMealTimeFilter("all")}
                  className="gap-2"
                >
                  All Meals
                </Button>
                <Button
                  variant={mealTimeFilter === "Breakfast" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMealTimeFilter("Breakfast")}
                  className="gap-2"
                >
                  <Coffee className="h-4 w-4" />🥞 Breakfast
                </Button>
                <Button
                  variant={mealTimeFilter === "Lunch/Dinner" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMealTimeFilter("Lunch/Dinner")}
                  className="gap-2"
                >
                  <UtensilsCrossed className="h-4 w-4" />
                  🍽️ Lunch/Dinner
                </Button>
                <Button
                  variant={mealTimeFilter === "Dessert/Snack" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMealTimeFilter("Dessert/Snack")}
                  className="gap-2"
                >
                  <Cake className="h-4 w-4" />🍰 Dessert
                </Button>
              </div>
            </div>

            {/* Recipe Categories */}
            {["breakfast", "lunch", "dinner"].map((category) => {
              const categoryRecipes = filteredRecipes.filter((r) => r.category === category)
              if (categoryRecipes.length === 0) return null

              return (
                <div key={category} className="space-y-4">
                  <h3 className="text-2xl font-playfair font-semibold capitalize flex items-center gap-2">
                    <ChefHat className="h-6 w-6 text-primary" />
                    {category}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categoryRecipes.map((recipe) => (
                      <RecipeCard key={recipe.id} recipe={recipe} onRecipeSelect={setCurrentRecipe} />
                    ))}
                  </div>
                </div>
              )
            })}

            {filteredRecipes.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No {mealTimeFilter !== "all" ? mealTimeFilter : ""} recipes found for this mood. Try a different
                  filter!
                </p>
              </div>
            )}
          </section>
        )}

        {/* Empty State */}
        {recipes.length === 0 && !isGenerating && !error && (
          <section className="text-center py-16">
            <div className="animate-float mb-8">
              <UtensilsCrossed className="h-24 w-24 text-primary/40 mx-auto" />
            </div>
            <h2 className="text-2xl font-playfair font-bold mb-4">Ready to Find Your Perfect Meal?</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Select your mood above and let our AI chef create personalized recipes just for you
            </p>
          </section>
        )}

        {/* Loading State */}
        {isGenerating && (
          <section className="text-center py-16">
            <div className="animate-spin mb-8">
              <ChefHat className="h-16 w-16 text-primary mx-auto" />
            </div>
            <h2 className="text-2xl font-playfair font-bold mb-4">Cooking Up Something Special...</h2>
            <p className="text-muted-foreground">Our AI chef is crafting the perfect recipes for you</p>
          </section>
        )}
      </main>
    </div>
  )
}
