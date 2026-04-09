"use client"

import { useState } from "react"
import { Sparkles, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { mealDBService } from "@/lib/mealdb-api"
import { MeasurementToggle } from "@/components/measurement-toggle"
import { convertIngredients, convertInstructions, type MeasurementSystem } from "@/lib/measurement-converter"
import { transformToBeginnerFriendly, getBeginnerIngredientTip } from "@/lib/beginner-instructions"
import { Heart, ChefHat, Lightbulb, AlertTriangle, Timer } from "lucide-react"

export function SurpriseTab() {
  const [meal, setMeal] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [measureSystem, setMeasureSystem] = useState<MeasurementSystem>("metric")

  const fetchSurpriseMeal = async () => {
    setIsLoading(true)
    try {
      const randomMeal = await mealDBService.getRandomMeal()
      if (randomMeal) {
        setMeal(randomMeal)
        setIsModalOpen(true)
      }
    } catch (error) {
      console.error("Failed to fetch surprise meal:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const beginnerSteps = meal ? transformToBeginnerFriendly(convertInstructions(meal.instructions, measureSystem)) : []

  return (
    <div className="px-4 pt-6 pb-4 min-h-[calc(100vh-12rem)] flex flex-col items-center justify-center animate-fade-in-up">
      {/* Centered Content */}
      <div className="text-center space-y-8 max-w-md">
        {/* Animated Illustration */}
        <div className="relative w-48 h-48 mx-auto">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-9xl animate-float">🎲</div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center animate-pulse-warm opacity-50">
            <Sparkles className="h-32 w-32 text-primary" />
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-3">
          <h2 className="text-3xl md:text-4xl font-playfair font-bold tracking-tight">
            Feeling Adventurous?
          </h2>
          <p className="text-muted-foreground text-sm md:text-base">
            Let us surprise you with a random delicious recipe from around the world
          </p>
        </div>

        {/* CTA Button */}
        <Button
          onClick={fetchSurpriseMeal}
          disabled={isLoading}
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-12 py-8 text-xl font-bold shadow-2xl tap-scale animate-pulse-warm hover:shadow-primary/50 transition-all duration-300"
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-6 w-6 mr-3 animate-spin" />
              <span className="text-xl">Finding...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-6 w-6 mr-3" />
              <span className="text-xl tracking-wide">SURPRISE ME!</span>
            </>
          )}
        </Button>
      </div>

      {/* Surprise Meal Modal */}
      {meal && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-playfair text-primary flex items-center gap-2">
                <Sparkles className="h-6 w-6" />
                {meal.name}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Large Finished Dish Image */}
              <div className="relative w-full h-72 md:h-80 rounded-2xl overflow-hidden">
                <Image src={meal.image || "/placeholder.svg"} alt={`Finished dish: ${meal.name}`} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-white text-sm font-medium">This is what your finished dish will look like!</p>
                </div>
              </div>

              {/* Info Tags */}
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-terracotta-soft text-terracotta rounded-full">{meal.category}</Badge>
                <Badge className="bg-secondary text-secondary-foreground rounded-full">{meal.cuisine} Cuisine</Badge>
              </div>

              {/* Measurement Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Measurements</span>
                <MeasurementToggle system={measureSystem} onToggle={setMeasureSystem} />
              </div>

              {/* Ingredients */}
              <div className="space-y-4">
                <h3 className="text-xl font-playfair font-semibold flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  What You'll Need
                </h3>
                <p className="text-sm text-muted-foreground">Gather these ingredients before you start:</p>
                <ul className="space-y-3">
                  {convertIngredients(meal.ingredients, measureSystem).map((ingredient: string, index: number) => {
                    const tip = getBeginnerIngredientTip(ingredient)
                    return (
                      <li key={index} className="space-y-1">
                        <div className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-terracotta/10 text-primary flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </span>
                          <span className="font-medium text-sm">{ingredient}</span>
                        </div>
                        {tip && (
                          <div className="ml-9 flex items-start gap-2 text-xs text-muted-foreground bg-amber-50 dark:bg-amber-950/30 p-2 rounded-lg border border-amber-200/50">
                            <Lightbulb className="h-3.5 w-3.5 mt-0.5 text-amber-500 flex-shrink-0" />
                            <span>{tip}</span>
                          </div>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>

              {/* Step-by-Step Instructions */}
              <div className="space-y-4">
                <h3 className="text-xl font-playfair font-semibold flex items-center gap-2">
                  <ChefHat className="h-5 w-5 text-primary" />
                  Step-by-Step Instructions
                </h3>
                <p className="text-sm text-muted-foreground">Follow these steps carefully - you've got this!</p>
                <ol className="space-y-4">
                  {beginnerSteps.map((step) => (
                    <li key={step.stepNumber} className="space-y-2">
                      <div className="flex gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                          {step.stepNumber}
                        </span>
                        <p className="pt-1 text-sm leading-relaxed flex-1">{step.instruction}</p>
                      </div>
                      
                      {step.timing && (
                        <div className="ml-11 inline-flex items-center gap-1.5 text-xs bg-secondary px-2.5 py-1 rounded-full">
                          <Timer className="h-3 w-3 text-primary" />
                          <span className="font-medium">{step.timing}</span>
                        </div>
                      )}
                      
                      {step.safetyNote && (
                        <div className="ml-11 flex items-start gap-2 text-xs bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 p-2.5 rounded-lg border border-red-200/50">
                          <AlertTriangle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                          <span className="font-medium">{step.safetyNote}</span>
                        </div>
                      )}
                      
                      {step.tip && (
                        <div className="ml-11 flex items-start gap-2 text-xs bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 p-2.5 rounded-lg border border-blue-200/50">
                          <Lightbulb className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                          <span><strong>Beginner tip:</strong> {step.tip}</span>
                        </div>
                      )}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Try Another Button */}
              <Button
                onClick={() => {
                  setIsModalOpen(false)
                  setTimeout(fetchSurpriseMeal, 300)
                }}
                variant="outline"
                className="w-full rounded-full tap-scale"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Another
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
