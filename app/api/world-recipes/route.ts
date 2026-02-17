import { NextResponse } from "next/server"
import { mealDBAPI } from "@/lib/mealdb-api"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const cuisine = searchParams.get("cuisine") || "Italian"

    console.log(`[v0] Fetching ${cuisine} recipes from TheMealDB...`)

    const rawRecipes = await mealDBAPI.getRecipesByCuisine(cuisine, 9)

    const recipes = rawRecipes.map((meal) => {
      // Extract ingredients
      const ingredients: string[] = []
      for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}` as keyof typeof meal]
        const measure = meal[`strMeasure${i}` as keyof typeof meal]

        if (ingredient && ingredient.trim()) {
          ingredients.push(`${measure || ""} ${ingredient}`.trim())
        }
      }

      // Split instructions into steps
      const instructions = meal.strInstructions
        .split(/\r?\n/)
        .filter((step: string) => step.trim().length > 0)
        .map((step: string) => step.trim())

      return {
        id: meal.idMeal,
        name: meal.strMeal,
        image: meal.strMealThumb,
        cuisine: meal.strArea,
        category: meal.strCategory,
        ingredients,
        instructions,
      }
    })

    console.log(`[v0] Successfully transformed ${recipes.length} ${cuisine} recipes`)

    return NextResponse.json({
      success: true,
      recipes,
    })
  } catch (error) {
    console.error("[v0] Error fetching world recipes:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch recipes",
        recipes: [],
      },
      { status: 500 },
    )
  }
}
