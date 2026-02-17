import { NextResponse } from "next/server"
import { recipeAPI } from "@/lib/recipe-api"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "6")
    const type = searchParams.get("type") || "popular" // 'popular' or 'random'

    let recipes
    if (type === "random") {
      recipes = await recipeAPI.getRandomPopularRecipes("romantic,dinner", limit)
    } else {
      recipes = await recipeAPI.getTrendingRecipes(limit)
    }

    const processedRecipes = recipes.map((recipe) => recipeAPI.processRecipe(recipe))

    return NextResponse.json({
      success: true,
      recipes: processedRecipes,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Trending API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch trending recipes",
        recipes: [],
      },
      { status: 500 },
    )
  }
}
