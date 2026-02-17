"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, Users, Heart, Share2, BookOpen, Star, TrendingUp } from 'lucide-react'
import Image from "next/image"
import { RecipeModal } from "./recipe-modal"

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
  ingredients?: string[]
  instructions?: string[]
  servings?: number
  healthScore?: number
  mealTime?: "Breakfast" | "Lunch/Dinner" | "Dessert/Snack"
}

interface RecipeCardProps {
  recipe: Recipe
  onRecipeSelect?: (title: string) => void
  showTrendingBadge?: boolean
}

const getMealTimeBadge = (mealTime?: "Breakfast" | "Lunch/Dinner" | "Dessert/Snack") => {
  if (!mealTime) return null
  
  switch (mealTime) {
    case "Breakfast":
      return {
        label: "Breakfast",
        icon: "🥞",
        className: "bg-amber-500 text-white hover:bg-amber-600"
      }
    case "Lunch/Dinner":
      return {
        label: "Lunch/Dinner",
        icon: "🍽️",
        className: "bg-blue-500 text-white hover:bg-blue-600"
      }
    case "Dessert/Snack":
      return {
        label: "Dessert",
        icon: "🍰",
        className: "bg-pink-500 text-white hover:bg-pink-600"
      }
  }
}

export function RecipeCard({ recipe, onRecipeSelect, showTrendingBadge = false }: RecipeCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [selectedVariation, setSelectedVariation] = useState<"standard" | "dairyFree" | "vegan">("standard")
  const [isModalOpen, setIsModalOpen] = useState(false)

  const mealTimeBadge = getMealTimeBadge(recipe.mealTime)

  const handleLike = () => {
    setIsLiked(!isLiked)
  }

  const handleShare = () => {
    // Implement sharing functionality
    navigator.share?.({
      title: recipe.title,
      text: `Check out this romantic recipe: ${recipe.description}`,
      url: window.location.href,
    })
  }

  const handleViewRecipe = () => {
    onRecipeSelect?.(recipe.title)
    // Could navigate to detailed recipe view
  }

  const handleVariationClick = (variation: "standard" | "dairyFree" | "vegan") => {
    setSelectedVariation(variation)
    setIsModalOpen(true)
  }

  return (
    <>
      <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-romantic/20">
        <div className="relative overflow-hidden rounded-t-lg">
          <Image
            src={recipe.image || "/placeholder.svg"}
            alt={recipe.title}
            width={300}
            height={200}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 right-3 flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
              onClick={handleLike}
            >
              <Heart className={`h-4 w-4 ${isLiked ? "fill-romantic text-romantic" : "text-muted-foreground"}`} />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
          {showTrendingBadge && (
            <Badge className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-red-500 text-white flex items-center gap-1 animate-pulse">
              <TrendingUp className="h-3 w-3" />
              Trending
            </Badge>
          )}
          <Badge className="absolute bottom-3 left-3 bg-primary text-primary-foreground">{recipe.difficulty}</Badge>
          {recipe.healthScore && recipe.healthScore > 70 && (
            <Badge className="absolute bottom-3 right-3 bg-green-500 text-white flex items-center gap-1">
              <Star className="h-3 w-3" />
              Healthy
            </Badge>
          )}
        </div>

        <CardHeader className="pb-3">
          {mealTimeBadge && (
            <Badge className={`w-fit mb-2 ${mealTimeBadge.className}`}>
              <span className="mr-1">{mealTimeBadge.icon}</span>
              {mealTimeBadge.label}
            </Badge>
          )}
          
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg font-playfair leading-tight">{recipe.title}</CardTitle>
          </div>
          <CardDescription className="text-sm">{recipe.description}</CardDescription>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {recipe.time}
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {recipe.servings || 2} servings
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {recipe.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Recipe Variations */}
          <Tabs value={selectedVariation} onValueChange={setSelectedVariation} className="w-full">
            <TabsList className="grid w-full grid-cols-3 text-xs">
              <TabsTrigger
                value="standard"
                className="text-xs cursor-pointer"
                onClick={() => handleVariationClick("standard")}
              >
                Standard
              </TabsTrigger>
              <TabsTrigger
                value="dairyFree"
                className="text-xs cursor-pointer"
                onClick={() => handleVariationClick("dairyFree")}
              >
                Dairy-Free
              </TabsTrigger>
              <TabsTrigger
                value="vegan"
                className="text-xs cursor-pointer"
                onClick={() => handleVariationClick("vegan")}
              >
                Vegan
              </TabsTrigger>
            </TabsList>
            <TabsContent value="standard" className="mt-3">
              <p className="text-sm text-muted-foreground">{recipe.variations.standard}</p>
            </TabsContent>
            <TabsContent value="dairyFree" className="mt-3">
              <p className="text-sm text-muted-foreground">{recipe.variations.dairyFree}</p>
            </TabsContent>
            <TabsContent value="vegan" className="mt-3">
              <p className="text-sm text-muted-foreground">{recipe.variations.vegan}</p>
            </TabsContent>
          </Tabs>

          <Button className="w-full bg-primary hover:bg-primary/90" size="sm" onClick={handleViewRecipe}>
            <BookOpen className="h-4 w-4 mr-2" />
            View Full Recipe
          </Button>
        </CardContent>
      </Card>

      <RecipeModal
        recipe={{
          ...recipe,
          ingredients: recipe.ingredients || [],
          instructions: recipe.instructions || [],
          servings: recipe.servings || 2,
          healthScore: recipe.healthScore || 0,
        }}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedVariation={selectedVariation}
      />
    </>
  )
}
