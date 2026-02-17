import { type NextRequest, NextResponse } from "next/server"
import { mealDBAPI } from "@/lib/mealdb-api"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const cuisine = searchParams.get("cuisine") as "Japanese" | "Chinese" | "Thai" | "Vietnamese"

    if (!cuisine) {
      return NextResponse.json({ success: false, error: "Cuisine parameter is required" }, { status: 400 })
    }

    console.log(`[v0] Fetching ${cuisine} recipes from TheMealDB...`)

    const meals = await mealDBAPI.getAsianRecipesByCuisine(cuisine, 9)

    if (meals.length === 0) {
      return NextResponse.json({
        success: true,
        recipes: [],
        message: `No ${cuisine} recipes found`,
      })
    }

    const recipes = meals.map((meal) => {
      const ingredients: string[] = []
      for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}` as keyof typeof meal]
        const measure = meal[`strMeasure${i}` as keyof typeof meal]

        if (ingredient && ingredient.trim()) {
          ingredients.push(`${measure || ""} ${ingredient}`.trim())
        }
      }

      const instructions = meal.strInstructions
        .split(/\r?\n/)
        .filter((step) => step.trim().length > 0)
        .map((step) => step.trim())

      return {
        id: meal.idMeal,
        name: meal.strMeal,
        image: meal.strMealThumb,
        cuisine: meal.strArea,
        ingredients,
        instructions,
      }
    })

    console.log(`[v0] Successfully fetched ${recipes.length} ${cuisine} recipes`)

    return NextResponse.json({
      success: true,
      recipes,
    })
  } catch (error) {
    console.error("[v0] Error fetching Asian recipes:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch Asian recipes" }, { status: 500 })
  }
}
