import { type NextRequest, NextResponse } from "next/server"
import { recipeAPI } from "@/lib/recipe-api"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const recipeId = Number.parseInt(params.id)

    if (isNaN(recipeId)) {
      return NextResponse.json({ error: "Invalid recipe ID" }, { status: 400 })
    }

    const recipe = await recipeAPI.getRecipeById(recipeId)

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 })
    }

    const processedRecipe = recipeAPI.processRecipe(recipe)

    return NextResponse.json({
      success: true,
      recipe: processedRecipe,
    })
  } catch (error) {
    console.error("Recipe fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch recipe" }, { status: 500 })
  }
}
