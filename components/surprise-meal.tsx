"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Sparkles, Loader2, ChefHat } from 'lucide-react'
import Image from "next/image"
import { MeasurementToggle } from "@/components/measurement-toggle"
import { convertIngredients, convertInstructions, type MeasurementSystem } from "@/lib/measurement-converter"

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
                {/* Meal Image */}
                <div className="relative w-full h-64 rounded-lg overflow-hidden">
                  <Image src={meal.image || "/placeholder.svg"} alt={meal.name} fill className="object-cover" />
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
                <div>
                  <h3 className="text-xl font-playfair font-semibold mb-3 flex items-center gap-2">
                    <ChefHat className="h-5 w-5 text-crimson" />
                    Ingredients
                  </h3>
                  <ul className="space-y-2">
                    {convertIngredients(meal.ingredients, measureSystem).map((ingredient, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-crimson mt-1">&bull;</span>
                        <span>{ingredient}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Instructions */}
                <div>
                  <h3 className="text-xl font-playfair font-semibold mb-3">Instructions</h3>
                  <ol className="space-y-3">
                    {convertInstructions(meal.instructions, measureSystem).map((instruction, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                          {index + 1}
                        </span>
                        <span className="flex-1 pt-0.5">{instruction}</span>
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
