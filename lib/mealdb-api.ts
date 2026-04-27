// TheMealDB API integration for surprise random meals
export interface MealDBRecipe {
  idMeal: string
  strMeal: string
  strCategory: string
  strArea: string
  strInstructions: string
  strMealThumb: string
  strTags: string | null
  strIngredient1?: string
  strIngredient2?: string
  strIngredient3?: string
  strIngredient4?: string
  strIngredient5?: string
  strIngredient6?: string
  strIngredient7?: string
  strIngredient8?: string
  strIngredient9?: string
  strIngredient10?: string
  strIngredient11?: string
  strIngredient12?: string
  strIngredient13?: string
  strIngredient14?: string
  strIngredient15?: string
  strIngredient16?: string
  strIngredient17?: string
  strIngredient18?: string
  strIngredient19?: string
  strIngredient20?: string
  strMeasure1?: string
  strMeasure2?: string
  strMeasure3?: string
  strMeasure4?: string
  strMeasure5?: string
  strMeasure6?: string
  strMeasure7?: string
  strMeasure8?: string
  strMeasure9?: string
  strMeasure10?: string
  strMeasure11?: string
  strMeasure12?: string
  strMeasure13?: string
  strMeasure14?: string
  strMeasure15?: string
  strMeasure16?: string
  strMeasure17?: string
  strMeasure18?: string
  strMeasure19?: string
  strMeasure20?: string
}

export interface ProcessedMealDBRecipe {
  id: string
  name: string
  description: string
  image: string
  category: string
  cuisine: string
  tags: string[]
  ingredients: string[]
  instructions: string[]
}

class MealDBAPIService {
  private baseURL = "https://www.themealdb.com/api/json/v1/1"

  // Get a random meal
  async getRandomMeal(): Promise<MealDBRecipe | null> {
    try {
      const response = await fetch(`${this.baseURL}/random.php`)
      if (!response.ok) {
        throw new Error(`MealDB API error: ${response.status}`)
      }
      const data = await response.json()
      return data.meals?.[0] || null
    } catch (error) {
      console.error("Failed to fetch random meal:", error)
      return null
    }
  }

  // Filter meals by category (e.g., Beef, Chicken, Seafood, Pasta)
  async getMealsByCategory(category: string): Promise<{ idMeal: string; strMeal: string; strMealThumb: string }[]> {
    try {
      const response = await fetch(`${this.baseURL}/filter.php?c=${category}`)
      if (!response.ok) {
        throw new Error(`MealDB API error: ${response.status}`)
      }
      const data = await response.json()
      return data.meals || []
    } catch (error) {
      console.error(`Failed to fetch ${category} meals:`, error)
      return []
    }
  }

  // Get full meal details by ID
  async getMealById(id: string): Promise<MealDBRecipe | null> {
    try {
      const response = await fetch(`${this.baseURL}/lookup.php?i=${id}`)
      if (!response.ok) {
        throw new Error(`MealDB API error: ${response.status}`)
      }
      const data = await response.json()
      return data.meals?.[0] || null
    } catch (error) {
      console.error(`Failed to fetch meal ${id}:`, error)
      return null
    }
  }

  // Get random meal from specific categories (dinner-focused)
  async getRandomDinnerMeal(): Promise<MealDBRecipe | null> {
    const dinnerCategories = ["Beef", "Chicken", "Lamb", "Pork", "Seafood", "Pasta"]
    const randomCategory = dinnerCategories[Math.floor(Math.random() * dinnerCategories.length)]

    try {
      const meals = await this.getMealsByCategory(randomCategory)
      if (meals.length === 0) {
        // Fallback to completely random meal
        return await this.getRandomMeal()
      }

      // Pick a random meal from the category
      const randomMeal = meals[Math.floor(Math.random() * meals.length)]
      return await this.getMealById(randomMeal.idMeal)
    } catch (error) {
      console.error("Failed to fetch random dinner meal:", error)
      return await this.getRandomMeal() // Fallback
    }
  }

  // Process raw MealDB recipe into our format
  processRecipe(meal: MealDBRecipe): ProcessedMealDBRecipe {
    // Extract ingredients and measures
    const ingredients: string[] = []
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}` as keyof MealDBRecipe]
      const measure = meal[`strMeasure${i}` as keyof MealDBRecipe]

      if (ingredient && ingredient.trim()) {
        ingredients.push(`${measure || ""} ${ingredient}`.trim())
      }
    }

    // Split instructions into steps
    const instructions = meal.strInstructions
      .split(/\r?\n/)
      .filter((step) => step.trim().length > 0)
      .map((step) => step.trim())

    return {
      id: meal.idMeal,
      name: meal.strMeal,
      description: `A delicious ${meal.strCategory.toLowerCase()} dish from ${meal.strArea}`,
      image: meal.strMealThumb,
      category: meal.strCategory,
      cuisine: meal.strArea,
      tags: meal.strTags ? meal.strTags.split(",").map((tag) => tag.trim()) : [],
      ingredients,
      instructions,
    }
  }

  async getMealsByMood(mood: string, limit = 9): Promise<MealDBRecipe[]> {
    const moodToCategories: Record<string, string[]> = {
      "Cozy & Warm": ["Beef", "Chicken", "Pasta"],
      "Fresh & Light": ["Seafood", "Vegetarian"],
      "Romantic & Intimate": ["Lamb", "Seafood", "Pasta"],
      "Quick & Fancy": ["Chicken", "Seafood"],
      "Comfort & Indulgent": ["Beef", "Pork", "Pasta"],
      "Spicy & Bold": ["Chicken", "Pork"],
    }

    const categories = moodToCategories[mood] || ["Beef", "Chicken", "Seafood"]
    const allMeals: MealDBRecipe[] = []

    try {
      // Fetch meals from multiple categories
      for (const category of categories) {
        const meals = await this.getMealsByCategory(category)

        // Get full details for random meals from this category
        const randomMeals = meals.sort(() => Math.random() - 0.5).slice(0, Math.ceil(limit / categories.length))

        for (const meal of randomMeals) {
          const fullMeal = await this.getMealById(meal.idMeal)
          if (fullMeal) {
            allMeals.push(fullMeal)
          }
        }
      }

      // Shuffle and limit results
      return allMeals.sort(() => Math.random() - 0.5).slice(0, limit)
    } catch (error) {
      console.error(`Failed to fetch meals for mood ${mood}:`, error)
      return []
    }
  }

  convertToProcessedRecipe(meal: MealDBRecipe, category = "dinner"): any {
    // Extract ingredients and measures
    const ingredients: string[] = []
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}` as keyof MealDBRecipe]
      const measure = meal[`strMeasure${i}` as keyof MealDBRecipe]

      if (ingredient && ingredient.trim()) {
        ingredients.push(`${measure || ""} ${ingredient}`.trim())
      }
    }

    // Split instructions into steps
    const instructions = meal.strInstructions
      .split(/\r?\n/)
      .filter((step) => step.trim().length > 0)
      .map((step) => step.trim())

    // Determine difficulty based on ingredients and instructions
    const difficulty =
      ingredients.length <= 5 && instructions.length <= 3
        ? "Easy"
        : ingredients.length <= 10 && instructions.length <= 6
          ? "Medium"
          : "Hard"

    // Generate dietary variations
    const variations = {
      standard: "Classic preparation with traditional ingredients",
      dairyFree: "Substitute dairy products with plant-based alternatives like coconut milk or vegan cheese",
      vegan: "Replace all animal products with plant-based options like tofu, tempeh, or legumes",
    }

    // Parse tags
    const tags = meal.strTags ? meal.strTags.split(",").map((tag) => tag.trim().toLowerCase()) : []

    const mealTime = this.classifyMealTime(meal.strCategory)

    return {
      id: Number.parseInt(meal.idMeal),
      title: meal.strMeal,
      category,
      time: "30-45 min", // TheMealDB doesn't provide time, so estimate
      difficulty,
      image: meal.strMealThumb,
      description: `A delicious ${meal.strCategory.toLowerCase()} dish from ${meal.strArea}, perfect for romantic dining`,
      tags: [...tags, meal.strCategory.toLowerCase(), meal.strArea.toLowerCase()],
      variations,
      ingredients,
      instructions,
      servings: 2, // Default for romantic meals
      healthScore: 75, // Default score
      mealTime, // Adding mealTime to the response
    }
  }

  private classifyMealTime(category: string): "Breakfast" | "Lunch/Dinner" | "Dessert/Snack" {
    const normalizedCategory = category.toLowerCase()

    // Breakfast categories
    if (normalizedCategory.includes("breakfast")) {
      return "Breakfast"
    }

    // Dessert/Snack categories
    if (normalizedCategory.includes("dessert") || normalizedCategory.includes("starter")) {
      return "Dessert/Snack"
    }

    // All other categories (Beef, Chicken, Lamb, Pork, Seafood, Pasta, Vegetarian, etc.) are Lunch/Dinner
    return "Lunch/Dinner"
  }

  async getMealsByMealTime(
    mealTime: "Breakfast" | "Lunch/Dinner" | "Dessert/Snack",
    limit = 9,
  ): Promise<MealDBRecipe[]> {
    let categories: string[] = []

    switch (mealTime) {
      case "Breakfast":
        categories = ["Breakfast"]
        break
      case "Dessert/Snack":
        categories = ["Dessert", "Starter"]
        break
      case "Lunch/Dinner":
        categories = ["Beef", "Chicken", "Lamb", "Pork", "Seafood", "Pasta", "Vegetarian"]
        break
    }

    const allMeals: MealDBRecipe[] = []

    try {
      // Fetch meals from multiple categories
      for (const category of categories) {
        const meals = await this.getMealsByCategory(category)

        // Get full details for random meals from this category
        const randomMeals = meals.sort(() => Math.random() - 0.5).slice(0, Math.ceil(limit / categories.length))

        for (const meal of randomMeals) {
          const fullMeal = await this.getMealById(meal.idMeal)
          if (fullMeal) {
            allMeals.push(fullMeal)
          }
        }
      }

      // Shuffle and limit results
      return allMeals.sort(() => Math.random() - 0.5).slice(0, limit)
    } catch (error) {
      console.error(`Failed to fetch meals for meal time ${mealTime}:`, error)
      return []
    }
  }

  // Filter meals by area/cuisine (Japanese, Chinese, Thai, etc.)
  async getMealsByArea(area: string): Promise<{ idMeal: string; strMeal: string; strMealThumb: string }[]> {
    try {
      const response = await fetch(`${this.baseURL}/filter.php?a=${area}`)
      if (!response.ok) {
        throw new Error(`MealDB API error: ${response.status}`)
      }
      const data = await response.json()
      return data.meals || []
    } catch (error) {
      console.error(`Failed to fetch ${area} meals:`, error)
      return []
    }
  }

  // Get random Asian recipes
  async getRandomAsianMeal(): Promise<MealDBRecipe | null> {
    const asianCuisines = ["Japanese", "Chinese", "Thai", "Vietnamese"]
    const randomCuisine = asianCuisines[Math.floor(Math.random() * asianCuisines.length)]

    try {
      const meals = await this.getMealsByArea(randomCuisine)
      if (meals.length === 0) {
        // Fallback to completely random meal
        return await this.getRandomMeal()
      }

      // Pick a random meal from the cuisine
      const randomMeal = meals[Math.floor(Math.random() * meals.length)]
      return await this.getMealById(randomMeal.idMeal)
    } catch (error) {
      console.error("Failed to fetch random Asian meal:", error)
      return await this.getRandomMeal() // Fallback
    }
  }

  // Get Asian recipes by specific cuisine
  async getAsianRecipesByCuisine(
    cuisine: "Japanese" | "Chinese" | "Thai" | "Vietnamese",
    limit = 9,
  ): Promise<MealDBRecipe[]> {
    const allMeals: MealDBRecipe[] = []

    try {
      const meals = await this.getMealsByArea(cuisine)

      // Get full details for random meals from this cuisine
      const randomMeals = meals.sort(() => Math.random() - 0.5).slice(0, limit)

      for (const meal of randomMeals) {
        const fullMeal = await this.getMealById(meal.idMeal)
        if (fullMeal) {
          allMeals.push(fullMeal)
        }
      }

      return allMeals
    } catch (error) {
      console.error(`Failed to fetch ${cuisine} recipes:`, error)
      return []
    }
  }

  async getRecipesByCuisine(cuisine: string, limit = 9): Promise<MealDBRecipe[]> {
    const allMeals: MealDBRecipe[] = []

    try {
      const meals = await this.getMealsByArea(cuisine)

      // Get full details for random meals from this cuisine
      const randomMeals = meals.sort(() => Math.random() - 0.5).slice(0, limit)

      for (const meal of randomMeals) {
        const fullMeal = await this.getMealById(meal.idMeal)
        if (fullMeal) {
          allMeals.push(fullMeal)
        }
      }

      return allMeals
    } catch (error) {
      console.error(`Failed to fetch ${cuisine} recipes:`, error)
      return []
    }
  }
}

export const mealDBAPI = new MealDBAPIService()
export const mealDBService = mealDBAPI
