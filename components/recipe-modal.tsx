"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Clock, Users, Heart, ChefHat } from "lucide-react"
import Image from "next/image"
import { MeasurementToggle } from "@/components/measurement-toggle"
import { convertIngredients, convertInstructions, type MeasurementSystem } from "@/lib/measurement-converter"

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
  const variationInstructions = convertInstructions(
    getVariationInstructions(recipe.instructions || [], selectedVariation),
    measureSystem
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-playfair text-romantic flex items-center gap-2">
            <ChefHat className="h-6 w-6" />
            {recipe.title} - {getVariationTitle(selectedVariation)}
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Measurements</span>
          <MeasurementToggle system={measureSystem} onToggle={setMeasureSystem} />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Recipe Image and Info */}
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-lg">
              <Image
                src={recipe.image || "/placeholder.svg"}
                alt={recipe.title}
                width={400}
                height={300}
                className="w-full h-64 object-cover"
              />
              <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">{recipe.difficulty}</Badge>
            </div>

            <div className="space-y-3">
              <p className="text-muted-foreground">{recipe.description}</p>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-romantic" />
                  {recipe.time}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-romantic" />
                  {recipe.servings} servings
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4 text-romantic" />
                  {recipe.healthScore}% healthy
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {recipe.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="p-4 bg-romantic/5 rounded-lg border border-romantic/20">
                <h4 className="font-semibold text-romantic mb-2">{getVariationTitle(selectedVariation)} Notes:</h4>
                <p className="text-sm text-muted-foreground">{recipe.variations[selectedVariation]}</p>
              </div>
            </div>
          </div>

          {/* Ingredients and Instructions */}
          <div className="space-y-6">
            {/* Ingredients */}
            <div>
              <h3 className="text-lg font-semibold text-romantic mb-3 flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Ingredients ({getVariationTitle(selectedVariation)})
              </h3>
              {variationIngredients.length > 0 ? (
                <ul className="space-y-2">
                  {variationIngredients.map((ingredient, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-romantic mt-1">•</span>
                      <span>{ingredient}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground italic">No ingredients available</p>
              )}
            </div>

            <Separator />

            {/* Instructions */}
            <div>
              <h3 className="text-lg font-semibold text-romantic mb-3 flex items-center gap-2">
                <ChefHat className="h-5 w-5" />
                Instructions
              </h3>
              {variationInstructions.length > 0 ? (
                <ol className="space-y-3">
                  {variationInstructions.map((instruction, index) => (
                    <li key={index} className="flex gap-3 text-sm">
                      <span className="flex-shrink-0 w-6 h-6 bg-romantic text-white rounded-full flex items-center justify-center text-xs font-semibold">
                        {index + 1}
                      </span>
                      <span className="pt-0.5">{instruction}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-muted-foreground italic">No instructions available</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button className="bg-romantic hover:bg-romantic/90">
            <Heart className="h-4 w-4 mr-2" />
            Save Recipe
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
