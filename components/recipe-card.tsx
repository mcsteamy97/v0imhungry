"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Heart, Bookmark } from 'lucide-react'
import Image from "next/image"
import { useBookmarks } from "@/lib/bookmarks-context"

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
  onRecipeSelect?: () => void
}

export function RecipeCard({ recipe, onRecipeSelect }: RecipeCardProps) {
  const { isBookmarked, toggleBookmark } = useBookmarks()
  const bookmarked = isBookmarked(recipe.id.toString())

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleBookmark(recipe.id.toString())
  }

  return (
    <Card
      onClick={onRecipeSelect}
      className="editorial-card rounded-2xl overflow-hidden cursor-pointer"
    >
      <div className="relative h-48">
        <Image
          src={recipe.image || "/placeholder.svg"}
          alt={recipe.title}
          fill
          className="object-cover"
          loading="lazy"
        />
        <button
          onClick={handleBookmark}
          className="absolute top-3 right-3 w-9 h-9 bg-card/95 backdrop-blur-sm rounded-full flex items-center justify-center tap-scale shadow-sm"
          aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}
        >
          <Bookmark
            className={`h-4 w-4 ${
              bookmarked ? "fill-primary text-primary" : "text-muted-foreground"
            }`}
          />
        </button>
        <Badge className="absolute bottom-3 left-3 bg-primary/90 text-primary-foreground backdrop-blur-sm">
          {recipe.difficulty}
        </Badge>
      </div>

      <div className="p-4 space-y-2">
        <h4 className="font-playfair font-semibold text-base line-clamp-2 leading-tight">
          {recipe.title}
        </h4>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {recipe.description}
        </p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {recipe.time}
          </div>
          <div className="flex items-center gap-1">
            <Heart className="h-3.5 w-3.5" />
            {recipe.category}
          </div>
        </div>
      </div>
    </Card>
  )
}
