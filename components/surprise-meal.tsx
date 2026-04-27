"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Sparkles, Loader2, ChefHat, Lightbulb, AlertTriangle, Timer, Heart } from 'lucide-react'
import Image from "next/image"
import { MeasurementToggle } from "@/components/measurement-toggle"
import { convertIngredients, convertInstructions, type MeasurementSystem } from "@/lib/measurement-converter"
import { transformToBeginnerFriendly, getBeginnerIngredientTip } from "@/lib/beginner-instructions"

interface SurpriseMeal {
  id: string
  name: string
  description: string
  image: string
  category: string
  cuisine: string
  tags: string[]
  ingredients: string[]
  instructions: string[]
}

export function SurpriseMeal() {
  const [meal, setMeal] = useState<SurpriseMeal | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<string>("")
  const [measureSystem, setMeasureSystem] = useState<MeasurementSystem>("volume")

  const fetchSurpriseMeal = async () => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/surprise-meal")
      const data = await response.json()

      if (data.success) {
        setMeal(data.meal)
        setIsOpen(true)
      } else {
        setError(data.error || "Failed to fetch surprise meal")
      }
    } catch (err) {
      setError("Something went wrong. Please try again.")
      console.error("Surprise meal error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Card className="glass-card rounded-3xl overflow-hidden">
        <CardHeader className="text-center px-8 pt-10 pb-6">
          <CardTitle className="flex items-center justify-center gap-3 text-2xl font-playfair tracking-tight">
            <Sparkles className="h-6 w-6 text-crimson" />
            Surprise Me!
          </CardTitle>
          <CardDescription className="text-base mt-2 leading-relaxed">
            Feeling adventurous? Let us pick a random dinner recipe for you
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 px-8 pb-10">
          <Button
            onClick={fetchSurpriseMeal}
            disabled={isLoading}
            size="lg"
            className="bg-crimson hover:bg-crimson/90 text-primary-foreground rounded-full px-8 apple-press"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Finding Your Surprise...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Surprise Me!
              </>
            )}
          </Button>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl">
          {meal && (
            <>
              <DialogHeader>
                <DialogTitle className="text-3xl font-playfair text-gradient">{meal.name}</DialogTitle>
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

                {/* Meal Info */}
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-crimson-soft text-crimson rounded-full text-sm font-medium">
                    {meal.category}
                  </span>
                  <span className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm font-medium">
                    {meal.cuisine} Cuisine
                  </span>
                  {meal.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>

                <p className="text-muted-foreground">{meal.description}</p>

                {/* Measurement Toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Measurements</span>
                  <MeasurementToggle system={measureSystem} onToggle={setMeasureSystem} />
                </div>

                {/* Ingredients */}
                <div className="space-y-4">
                  <h3 className="text-xl font-playfair font-semibold flex items-center gap-2">
                    <Heart className="h-5 w-5 text-crimson" />
                    What You'll Need
                  </h3>
                  <p className="text-sm text-muted-foreground">Gather these ingredients before you start:</p>
                  <ul className="space-y-3">
                    {convertIngredients(meal.ingredients, measureSystem).map((ingredient, index) => {
                      const tip = getBeginnerIngredientTip(ingredient)
                      return (
                        <li key={index} className="space-y-1">
                          <div className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-crimson/10 text-crimson flex items-center justify-center text-xs font-medium">
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
                    <ChefHat className="h-5 w-5 text-crimson" />
                    Step-by-Step Instructions
                  </h3>
                  <p className="text-sm text-muted-foreground">Follow these steps carefully - you've got this!</p>
                  <ol className="space-y-4">
                    {transformToBeginnerFriendly(convertInstructions(meal.instructions, measureSystem)).map((step) => (
                      <li key={step.stepNumber} className="space-y-2">
                        <div className="flex gap-3">
                          <span className="flex-shrink-0 w-8 h-8 bg-crimson text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                            {step.stepNumber}
                          </span>
                          <p className="pt-1 text-sm leading-relaxed flex-1">{step.instruction}</p>
                        </div>
                        
                        {step.timing && (
                          <div className="ml-11 inline-flex items-center gap-1.5 text-xs bg-secondary px-2.5 py-1 rounded-full">
                            <Timer className="h-3 w-3 text-crimson" />
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
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
