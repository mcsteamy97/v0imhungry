import { type NextRequest, NextResponse } from "next/server"
import { recipeAPI } from "@/lib/recipe-api"
import { mealDBAPI } from "@/lib/mealdb-api"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] API route: Starting recipe generation")

    const { mood, preferences = {} } = await request.json()
    console.log("[v0] API route: Received request for mood:", mood)

    if (!mood) {
      console.log("[v0] API route: Missing mood parameter")
      return NextResponse.json({ error: "Mood is required" }, { status: 400 })
    }

    // Map moods to search parameters
    const moodToParams = {
      "Cozy & Warm": {
        query: "comfort food warm cozy",
        type: "main course",
        maxReadyTime: 60,
        cuisine: "american,italian",
      },
      "Fresh & Light": {
        query: "fresh light healthy",
        diet: "vegetarian",
        maxReadyTime: 30,
        minHealthScore: 70,
      },
      "Romantic & Intimate": {
        query: "romantic elegant date night",
        type: "main course",
        cuisine: "french,italian",
        maxReadyTime: 45,
      },
      "Quick & Fancy": {
        query: "quick elegant gourmet",
        maxReadyTime: 25,
        minHealthScore: 60,
      },
      "Comfort & Indulgent": {
        query: "comfort indulgent rich",
        type: "main course",
        maxReadyTime: 60,
      },
      "Spicy & Bold": {
        query: "spicy bold flavorful",
        cuisine: "mexican,indian,thai",
        maxReadyTime: 45,
      },
    }

    const searchParams = moodToParams[mood as keyof typeof moodToParams] || {
      query: mood.toLowerCase(),
      maxReadyTime: 45,
    }

    // Add user preferences
    if (preferences.diet) {
      searchParams.diet = preferences.diet
    }
    if (preferences.intolerances) {
      searchParams.intolerances = preferences.intolerances
    }

    console.log("[v0] API route: Fetching recipes from TheMealDB")
    
    let recipes
    let processedRecipes
    
    try {
      // Fetch meals from TheMealDB based on mood
      const mealDBRecipes = await mealDBAPI.getMealsByMood(mood, 9)
      
      if (mealDBRecipes.length > 0) {
        console.log("[v0] API route: Successfully got", mealDBRecipes.length, "recipes from TheMealDB")
        
        // Convert TheMealDB recipes to ProcessedRecipe format
        processedRecipes = mealDBRecipes.map((meal, index) => {
          // Distribute across categories
          const category = index % 3 === 0 ? "breakfast" : index % 3 === 1 ? "lunch" : "dinner"
          return mealDBAPI.convertToProcessedRecipe(meal, category)
        })
        
        console.log("[v0] API route: Successfully processed", processedRecipes.length, "TheMealDB recipes")
      } else {
        console.log("[v0] API route: TheMealDB returned no recipes, falling back to Spoonacular")
        throw new Error("No TheMealDB recipes available")
      }
    } catch (mealDBError) {
      console.log("[v0] API route: TheMealDB failed, trying Spoonacular:", mealDBError)
      
      // Fallback to Spoonacular
      try {
        recipes = await recipeAPI.searchRecipes({
          ...searchParams,
          number: 9,
        })
        console.log("[v0] API route: Successfully got", recipes.length, "recipes from Spoonacular")
        processedRecipes = recipes.map((recipe) => recipeAPI.processRecipe(recipe))
        console.log("[v0] API route: Successfully processed", processedRecipes.length, "Spoonacular recipes")
      } catch (searchError) {
        console.error("[v0] API route: Both APIs failed:", searchError)
        return NextResponse.json(
          {
            success: false,
            error: "Failed to search recipes from all sources",
            details: searchError instanceof Error ? searchError.message : "Unknown search error",
          },
          { status: 500 },
        )
      }
    }

    // Distribute recipes across categories
    const categorizedRecipes = {
      breakfast: processedRecipes.filter((r) => r.category === "breakfast").slice(0, 3),
      lunch: processedRecipes.filter((r) => r.category === "lunch").slice(0, 3),
      dinner: processedRecipes.filter((r) => r.category === "dinner").slice(0, 3),
    }

    // Ensure we have at least one recipe per category
    const allRecipes = [...categorizedRecipes.breakfast, ...categorizedRecipes.lunch, ...categorizedRecipes.dinner]

    if (categorizedRecipes.breakfast.length === 0 && allRecipes.length > 0) {
      categorizedRecipes.breakfast = [{ ...allRecipes[0], category: "breakfast" }]
    }
    if (categorizedRecipes.lunch.length === 0 && allRecipes.length > 1) {
      categorizedRecipes.lunch = [{ ...allRecipes[1], category: "lunch" }]
    }
    if (categorizedRecipes.dinner.length === 0 && allRecipes.length > 2) {
      categorizedRecipes.dinner = [{ ...allRecipes[2], category: "dinner" }]
    }

    const finalRecipes = [...categorizedRecipes.breakfast, ...categorizedRecipes.lunch, ...categorizedRecipes.dinner]

    console.log("[v0] API route: Returning", finalRecipes.length, "processed recipes")

    const response = {
      success: true,
      mood,
      recipes: finalRecipes,
      total: finalRecipes.length,
    }

    console.log("[v0] API route: About to return JSON response")
    return NextResponse.json(response)
  } catch (error) {
    console.error("[v0] API route: Unexpected error in recipe generation:", error)
    console.error("[v0] API route: Error stack:", error instanceof Error ? error.stack : "No stack trace")

    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate recipes",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
