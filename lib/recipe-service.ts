export interface RecipeGenerationRequest {
  mood: string
  preferences?: {
    diet?: string
    intolerances?: string
    maxTime?: number
  }
}

export interface RecipeGenerationResponse {
  success: boolean
  mood: string
  recipes: any[]
  total: number
  error?: string
}

class RecipeService {
  async generateRecipes(request: RecipeGenerationRequest): Promise<RecipeGenerationResponse> {
    try {
      console.log("[v0] Making request to /api/recipes/generate with:", request)

      const response = await fetch("/api/recipes/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      })

      console.log("[v0] Response status:", response.status)
      console.log("[v0] Response headers:", Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] API error response:", errorText)
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const responseText = await response.text()
        console.error("[v0] Expected JSON but got:", contentType, responseText.substring(0, 200))
        throw new Error("Server returned non-JSON response")
      }

      const data = await response.json()
      console.log("[v0] Successfully parsed JSON response:", data)
      return data
    } catch (error) {
      console.error("[v0] Recipe generation failed:", error)

      return {
        success: false,
        mood: request.mood,
        recipes: [],
        total: 0,
        error: error instanceof Error ? error.message : "Failed to generate recipes. Please try again.",
      }
    }
  }

  async getRecipeDetails(id: number) {
    try {
      const response = await fetch(`/api/recipes/${id}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Recipe fetch failed:", error)
      return {
        success: false,
        error: "Failed to fetch recipe details",
      }
    }
  }

  async searchTrendingRecipes() {
    // This would integrate with social media APIs or trending recipe sources
    try {
      const response = await fetch("/api/recipes/trending")

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Trending recipes fetch failed:", error)
      return {
        success: false,
        recipes: [],
        error: "Failed to fetch trending recipes",
      }
    }
  }
}

export const recipeService = new RecipeService()
