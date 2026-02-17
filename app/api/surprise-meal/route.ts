import { NextRequest, NextResponse } from "next/server"
import { mealDBAPI } from "@/lib/mealdb-api"

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Surprise meal API called")

    // Fetch a random dinner-focused meal from TheMealDB
    const meal = await mealDBAPI.getRandomDinnerMeal()

    if (!meal) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch surprise meal from TheMealDB",
        },
        { status: 500 }
      )
    }

    // Process the meal into our format
    const processedMeal = mealDBAPI.processRecipe(meal)

    console.log("[v0] Surprise meal fetched:", processedMeal.name)

    return NextResponse.json({
      success: true,
      meal: processedMeal,
    })
  } catch (error) {
    console.error("[v0] Surprise meal API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    )
  }
}
