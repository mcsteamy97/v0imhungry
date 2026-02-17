"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Clock, Users, Sparkles, RefreshCw } from "lucide-react"
import { RecipeCard } from "./recipe-card"

interface TrendingRecipe {
  id: number
  title: string
  category: string
  time: string
  difficulty: string
  image: string
  description: string
  tags: string[]
  healthScore: number
}

interface TrendingSectionProps {
  onRecipeSelect?: (recipe: string) => void
}

export function TrendingSection({ onRecipeSelect }: TrendingSectionProps) {
  const [trendingRecipes, setTrendingRecipes] = useState<TrendingRecipe[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string>("")
  const [error, setError] = useState<string>("")

  const fetchTrendingRecipes = async (type: "popular" | "random" = "popular") => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/trending?limit=6&type=${type}`)
      const data = await response.json()

      if (data.success) {
        setTrendingRecipes(data.recipes)
        setLastUpdated(new Date(data.timestamp).toLocaleTimeString())
      } else {
        setError(data.error || "Failed to load trending recipes")
      }
    } catch (err) {
      setError("Something went wrong loading trending recipes")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTrendingRecipes()

    // Auto-refresh trending recipes every 5 minutes
    const interval = setInterval(
      () => {
        fetchTrendingRecipes("random")
      },
      5 * 60 * 1000,
    )

    return () => clearInterval(interval)
  }, [])

  const handleRefresh = () => {
    fetchTrendingRecipes("random")
  }

  if (error) {
    return (
      <Card className="border-romantic/20">
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => fetchTrendingRecipes()} className="mt-4" variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <section className="space-y-6">
      <Card className="border-romantic/20 shadow-lg bg-gradient-to-r from-background to-romantic/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary animate-pulse" />
              <CardTitle className="text-2xl font-playfair">Trending Now</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {lastUpdated && (
                <Badge variant="secondary" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  Updated {lastUpdated}
                </Badge>
              )}
              <Button
                onClick={handleRefresh}
                variant="ghost"
                size="sm"
                disabled={isLoading}
                className="hover:bg-romantic/10"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
          <CardDescription className="text-base">
            Discover what couples around the world are cooking this week
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-muted rounded-lg h-48 mb-4"></div>
                  <div className="bg-muted rounded h-4 mb-2"></div>
                  <div className="bg-muted rounded h-3 w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingRecipes.map((recipe, index) => (
                <div key={recipe.id} className="relative">
                  {index < 3 && (
                    <Badge className="absolute -top-2 -right-2 z-10 bg-gradient-to-r from-primary to-romantic text-white">
                      <Sparkles className="h-3 w-3 mr-1" />#{index + 1}
                    </Badge>
                  )}
                  <RecipeCard recipe={recipe} onRecipeSelect={onRecipeSelect} showTrendingBadge={true} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trending Stats */}
      {!isLoading && trendingRecipes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="text-center p-4 border-romantic/20">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="font-semibold">Most Popular</span>
            </div>
            <p className="text-sm text-muted-foreground">{trendingRecipes[0]?.title || "Loading..."}</p>
          </Card>

          <Card className="text-center p-4 border-romantic/20">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-primary" />
              <span className="font-semibold">Quickest</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {trendingRecipes.reduce((prev, current) =>
                Number.parseInt(prev.time) < Number.parseInt(current.time) ? prev : current,
              )?.time || "Loading..."}{" "}
              recipe
            </p>
          </Card>

          <Card className="text-center p-4 border-romantic/20">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-semibold">Healthiest</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {Math.max(...trendingRecipes.map((r) => r.healthScore))}% health score
            </p>
          </Card>
        </div>
      )}
    </section>
  )
}
