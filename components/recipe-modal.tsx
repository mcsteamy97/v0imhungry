"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Clock, Users, Heart, ChefHat, Lightbulb, AlertTriangle, Timer, Info } from "lucide-react"
import Image from "next/image"
import { MeasurementToggle } from "@/components/measurement-toggle"
import { convertIngredients, convertInstructions, type MeasurementSystem } from "@/lib/measurement-converter"
import { transformToBeginnerFriendly, getBeginnerIngredientTip } from "@/lib/beginner-instructions"

interface Recipe {
  id: number
  title: string
  category: string
  time: string
  difficulty: string
  image: string
  description: string
  tags: string[]
  variations: {
    standard: string
    dairyFree: string
    vegan: string
  }
  ingredients: string[]
  instructions: string[]
  servings: number
  healthScore: number
}

interface RecipeModalProps {
  recipe: Recipe | null
  isOpen: boolean
  onClose: () => void
  selectedVariation: "standard" | "dairyFree" | "vegan"
}

export function RecipeModal({ recipe, isOpen, onClose, selectedVariation }: RecipeModalProps) {
  const [measureSystem, setMeasureSystem] = useState<MeasurementSystem>("volume")

  if (!recipe) return null

  const getVariationTitle = (variation: string) => {
    switch (variation) {
      case "dairyFree":
        return "Dairy-Free"
      case "vegan":
        return "Vegan"
      default:
        return "Standard"
    }
  }

  const getVariationIngredients = (ingredients: string[], variation: string) => {
    // For demo purposes, we'll modify ingredients based on variation
    if (variation === "dairyFree") {
      return ingredients.map((ingredient) =>
        ingredient
          .replace(/\bmilk\b/gi, "plant-based milk")
          .replace(/\bbutter\b/gi, "vegan butter")
          .replace(/\bcheese\b/gi, "dairy-free cheese")
          .replace(/\bcream\b/gi, "coconut cream"),
      )
    }

    if (variation === "vegan") {
      return ingredients.map((ingredient) =>
        ingredient
          .replace(/\bmilk\b/gi, "plant-based milk")
          .replace(/\bbutter\b/gi, "vegan butter")
          .replace(/\bcheese\b/gi, "nutritional yeast")
          .replace(/\beggs?\b/gi, "flax eggs")
          .replace(/\bhoney\b/gi, "maple syrup")
          .replace(/\bchicken\b/gi, "tofu")
          .replace(/\bbeef\b/gi, "mushrooms")
          .replace(/\bfish\b/gi, "tempeh"),
      )
    }

    return ingredients
  }

  const getVariationInstructions = (instructions: string[], variation: string) => {
    // Modify instructions based on variation
    if (variation === "dairyFree" || variation === "vegan") {
      return instructions.map((instruction) => {
        let modified = instruction
        if (variation === "dairyFree") {
          modified = modified
            .replace(/\bmilk\b/gi, "plant-based milk")
            .replace(/\bbutter\b/gi, "vegan butter")
            .replace(/\bcheese\b/gi, "dairy-free cheese")
        }
        if (variation === "vegan") {
          modified = modified
            .replace(/\bmilk\b/gi, "plant-based milk")
            .replace(/\bbutter\b/gi, "vegan butter")
            .replace(/\bcheese\b/gi, "nutritional yeast")
            .replace(/\beggs?\b/gi, "flax eggs")
            .replace(/\bhoney\b/gi, "maple syrup")
        }
        return modified
      })
    }
    return instructions
  }

  const variationIngredients = convertIngredients(
    getVariationIngredients(recipe.ingredients || [], selectedVariation),
    measureSystem
  )
  const rawInstructions = convertInstructions(
    getVariationInstructions(recipe.instructions || [], selectedVariation),
    measureSystem
  )
  const beginnerSteps = transformToBeginnerFriendly(rawInstructions)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-playfair text-crimson flex items-center gap-2">
            <ChefHat className="h-6 w-6" />
            {recipe.title} - {getVariationTitle(selectedVariation)}
          </DialogTitle>
        </DialogHeader>

        {/* Large Finished Dish Image */}
        <div className="relative w-full h-72 md:h-80 rounded-2xl overflow-hidden">
          <Image
            src={recipe.image || "/placeholder.svg"}
            alt={`Finished dish: ${recipe.title}`}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <Badge className="bg-primary text-primary-foreground mb-2">{recipe.difficulty}</Badge>
            <p className="text-white text-sm font-medium">This is what your finished dish will look like!</p>
          </div>
        </div>

        {/* Quick Info Bar */}
        <div className="flex items-center justify-between flex-wrap gap-4 p-4 bg-secondary/50 rounded-2xl">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-crimson" />
              <span className="font-medium">{recipe.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-crimson" />
              <span className="font-medium">{recipe.servings} servings</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-crimson" />
              <span className="font-medium">{recipe.healthScore}% healthy</span>
            </div>
          </div>
          <MeasurementToggle system={measureSystem} onToggle={setMeasureSystem} />
        </div>

        {/* Description */}
        <p className="text-muted-foreground leading-relaxed">{recipe.description}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {recipe.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Variation Notes */}
        <div className="p-4 bg-crimson-soft rounded-2xl border border-crimson/10">
          <h4 className="font-semibold text-crimson mb-2 flex items-center gap-2">
            <Info className="h-4 w-4" />
            {getVariationTitle(selectedVariation)} Version Notes
          </h4>
          <p className="text-sm text-muted-foreground">{recipe.variations[selectedVariation]}</p>
        </div>

        <Separator />

        <div className="grid md:grid-cols-2 gap-8">
          {/* Ingredients */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-crimson flex items-center gap-2">
              <Heart className="h-5 w-5" />
              What You'll Need
            </h3>
            <p className="text-sm text-muted-foreground">Gather these ingredients before you start:</p>
            {variationIngredients.length > 0 ? (
              <ul className="space-y-3">
                {variationIngredients.map((ingredient, index) => {
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
            ) : (
              <p className="text-sm text-muted-foreground italic">No ingredients available</p>
            )}
          </div>

          {/* Step-by-Step Instructions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-crimson flex items-center gap-2">
              <ChefHat className="h-5 w-5" />
              Step-by-Step Instructions
            </h3>
            <p className="text-sm text-muted-foreground">Follow these steps carefully - you've got this!</p>
            {beginnerSteps.length > 0 ? (
              <ol className="space-y-4">
                {beginnerSteps.map((step) => (
                  <li key={step.stepNumber} className="space-y-2">
                    {/* Main instruction */}
                    <div className="flex gap-3">
                      <span className="flex-shrink-0 w-8 h-8 bg-crimson text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                        {step.stepNumber}
                      </span>
                      <p className="pt-1 text-sm leading-relaxed">{step.instruction}</p>
                    </div>
                    
                    {/* Timing badge */}
                    {step.timing && (
                      <div className="ml-11 inline-flex items-center gap-1.5 text-xs bg-secondary px-2.5 py-1 rounded-full">
                        <Timer className="h-3 w-3 text-crimson" />
                        <span className="font-medium">{step.timing}</span>
                      </div>
                    )}
                    
                    {/* Safety warning */}
                    {step.safetyNote && (
                      <div className="ml-11 flex items-start gap-2 text-xs bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 p-2.5 rounded-lg border border-red-200/50">
                        <AlertTriangle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                        <span className="font-medium">{step.safetyNote}</span>
                      </div>
                    )}
                    
                    {/* Helpful tip */}
                    {step.tip && (
                      <div className="ml-11 flex items-start gap-2 text-xs bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 p-2.5 rounded-lg border border-blue-200/50">
                        <Lightbulb className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                        <span><strong>Beginner tip:</strong> {step.tip}</span>
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-muted-foreground italic">No instructions available</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button className="bg-crimson hover:bg-crimson/90 text-primary-foreground rounded-full apple-press">
            <Heart className="h-4 w-4 mr-2" />
            Save Recipe
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
